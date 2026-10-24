import {createHash} from 'node:crypto';
import {kvCommand,loadPlatinumSubmissionsLedger} from './_platinum-progress-store.js';
import {assertStore,loadProgress,loadAttachment,validateIdentity} from './_math-diagnostic-store.js';
import {FEEDBACK_VERSION,generateDiagnosticReport,buildFeedbackInput,validateReport} from './_diagnostic-feedback-model.js';

const PREFIX='aleph:diagnostic-feedback:v1:';
const CAS="local v=redis.call('GET',KEYS[1]); local rev=0; if v then rev=cjson.decode(v).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
const key=(learner,day)=>PREFIX+encodeURIComponent(learner)+':'+day;
const contextOf=records=>records.filter(r=>r.submitted).sort((a,b)=>a.day-b.day);
export function feedbackVersion(records){return createHash('sha256').update(JSON.stringify([FEEDBACK_VERSION,contextOf(records).map(r=>({day:r.day,submitted:r.submitted,lastSubmittedAt:r.lastSubmittedAt}))])).digest('hex')}
async function loadJob(learner,day){const raw=await kvCommand(['GET',key(learner,day)]);return raw?(typeof raw==='string'?JSON.parse(raw):raw):null}
async function replaceJob(learner,day,old,next){return Number(await kvCommand(['EVAL',CAS,1,key(learner,day),String(old?.revision||0),JSON.stringify({...next,revision:(old?.revision||0)+1})]))===1}
const notificationIdentity=(day,job)=>({id:`diagnostic-feedback-day-${day}`,version:`${job.version}:${job.generatedAt}`});

export async function diagnosticFeedbackNotifications(learner){
  assertStore();validateIdentity(learner);
  const {records}=await loadProgress(learner),version=feedbackVersion(records);
  const notices=await Promise.all(contextOf(records).map(async record=>{
    const job=await loadJob(learner,record.day);
    if(job?.status!=='ready'||job.version!==version||!job.generatedAt)return null;
    return {...notificationIdentity(record.day,job),type:'diagnostic-feedback',day:record.day,title:`Your Day ${record.day} feedback is ready`,description:'Review your answers, strengths and next steps.',generatedAt:job.generatedAt,href:`/math-diagnostic/?learner=${encodeURIComponent(learner)}&day=${record.day}#feedback`};
  }));
  return notices.filter(Boolean).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt)||b.day-a.day);
}

export async function feedbackStatus(learner,day){
  assertStore();validateIdentity(learner,day);
  const {records}=await loadProgress(learner),record=records.find(r=>r.day===day);
  if(!record?.submitted)return {status:'not submitted'};
  const version=feedbackVersion(records),job=await loadJob(learner,day);
  if(!job||job.version!==version)return {status:'queued',previousReport:job?.report||null};
  if(job.status==='generating'&&job.leaseUntil<=Date.now())return {status:'queued'};
  return {status:job.status,report:job.status==='ready'?job.report:null,notification:job.status==='ready'?notificationIdentity(day,job):null,generatedAt:job.generatedAt||null,retryAt:job.retryAt||null,failureCode:job.status==='failed'?job.failureCode||null:null,message:job.status==='failed'?'Your submission is safe. Feedback will be retried.':null};
}

// Called only after the review endpoint verifies the operator's signature.
export async function publishReviewedFeedback({learner,day,expectedGeneratedAt,report}){
  assertStore();validateIdentity(learner,day);
  const {records}=await loadProgress(learner),record=records.find(r=>r.day===day);
  if(!record?.submitted)throw Object.assign(Error('Day is not submitted.'),{status:409});
  const version=feedbackVersion(records),old=await loadJob(learner,day);
  if(!old||old.version!==version||old.generatedAt!==expectedGeneratedAt)throw Object.assign(Error('Feedback or submitted evidence changed; review again.'),{status:409});
  const {ids,comparisons}=await buildFeedbackInput(record,contextOf(records),null);
  const allowed=new Set(records.filter(r=>r.submitted).flatMap(r=>Object.keys(r.submitted.answers)));
  validateReport(report,ids,allowed,comparisons);
  const archiveKey=key(learner,day)+':review-history:'+old.revision;
  await kvCommand(['SET',archiveKey,JSON.stringify(old)]);
  if(feedbackVersion((await loadProgress(learner)).records)!==version)throw Object.assign(Error('Submitted evidence changed; review again.'),{status:409});
  const generatedAt=new Date().toISOString();
  if(!await replaceJob(learner,day,old,{version,status:'ready',report,model:'operator-reviewed',generatedAt,attempts:old.attempts||0,previousReportKey:archiveKey}))throw Object.assign(Error('Feedback changed; review again.'),{status:409});
  return {status:'ready',generatedAt};
}

// Submitted snapshots are the durable queue. Missing/stale reports are discoverable
// even when the browser closes before its optional early-generation request finishes.
export async function processFeedback(learner,day,{generate=generateDiagnosticReport,now=()=>Date.now()}={}){
  assertStore();validateIdentity(learner,day);
  const {records}=await loadProgress(learner),record=records.find(r=>r.day===day);
  if(!record?.submitted)return {status:'not submitted'};
  const version=feedbackVersion(records),old=await loadJob(learner,day),time=now();
  if(old?.version===version){
    if(old.status==='ready')return {status:'ready'};
    if(old.status==='generating'&&old.leaseUntil>time)return {status:'generating'};
    if(old.status==='failed'&&old.retryAt>time)return {status:'failed'};
  }
  const claim={version,status:'generating',leaseUntil:time+210000,attempts:old?.version===version?(old.attempts||0)+1:1};
  if(!await replaceJob(learner,day,old,claim))return {status:'generating'};
  const held={...claim,revision:(old?.revision||0)+1};
  try{
    const attachment=record.submitted.attachment?await loadAttachment(learner,day,record.submitted.attachment.id):null;
    const result=await generate(record,contextOf(records),attachment);
    // A new submission changes the cross-day evidence; never publish obsolete feedback.
    if(feedbackVersion((await loadProgress(learner)).records)!==version){await replaceJob(learner,day,held,{...claim,status:'queued',leaseUntil:0});return {status:'queued'}}
    const saved=await replaceJob(learner,day,held,{version,status:'ready',report:result.report,model:result.model,generatedAt:new Date(now()).toISOString(),attempts:claim.attempts});
    return {status:saved?'ready':'generating'};
  }catch(error){
    // Provider output and learner content are intentionally not stored in error text.
    const message=String(error.message||'');
    const failureCode=error.name==='TimeoutError'?'provider_timeout':error instanceof SyntaxError?'provider_json':message.includes('reconcile all')?'cross_day_coverage':message.includes('day-specific')?'cross_day_evidence':message.includes('every submitted question')?'question_coverage':message.includes('unassessed diagnostic item')?'unassessed_reference':message.includes('report format')?'report_format':message.includes('too many next steps')?'next_steps_limit':message.includes('not configured')?'not_configured':message.includes('provider failed')?'provider_http':error.code==='ENOENT'?'rubric_file_missing':'generation_error';
    await replaceJob(learner,day,held,{version,status:'failed',attempts:claim.attempts,retryAt:now()+Math.min(3600000,60000*2**Math.min(claim.attempts,6)),failureCode,error:'Feedback generation failed.'});
    return {status:'failed'};
  }
}

export async function drainFeedback({limit=2,generate,now}={}){
  assertStore();
  const ledger=await loadPlatinumSubmissionsLedger();
  const entries=[...new Map((ledger.submissions||[]).filter(s=>/^math-diagnostic-day-\d{2}$/.test(s.materialId||'')&&s.userId).map(s=>[s.userId+':'+s.materialId,{learner:s.userId,day:Number(s.materialId.slice(-2)),submittedAt:s.updatedAt||s.submittedAt||''}])).values()].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)||b.day-a.day);
  const results=[];
  for(const entry of entries){
    const status=await feedbackStatus(entry.learner,entry.day);
    if(['ready','not submitted','generating'].includes(status.status)||(status.status==='failed'&&status.retryAt>(now?now():Date.now())))continue;
    const result=await processFeedback(entry.learner,entry.day,{generate,now});
    results.push({day:entry.day,status:result.status});if(results.length>=limit)break;
  }
  return results;
}
