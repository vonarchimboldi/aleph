import {isStudyAction,applyStudyAction,guardStudyMutation,syncStudyPlans,studyView,studyNotifications,studyDigest} from './_study-workflow.js';
import {randomUUID,createHash,verify} from 'node:crypto';
import {kvCommand,loadPlatinumSubmissionsLedger} from './_platinum-progress-store.js';
import {assertStore,validateIdentity} from './_math-diagnostic-store.js';
import {REVIEW_PUBLIC_KEY} from './_feedback-review-key.js';
const PREFIX='aleph:material-tracker:v1:';
const CAS="local v=redis.call('GET',KEYS[1]); local rev=0; if v then rev=cjson.decode(v).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const key=learner=>PREFIX+'learner:'+encodeURIComponent(learner);
export const TRACKER_TIMEZONE='America/Toronto';
export function trackerDay(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:TRACKER_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));}
async function get(k){const raw=await kvCommand(['GET',k]);return raw?(typeof raw==='string'?JSON.parse(raw):raw):null;}
async function cas(k,old,next){return Number(await kvCommand(['EVAL',CAS,1,k,String(old?.revision||0),JSON.stringify(next)]))===1;}
export async function loadTracker(learner){assertStore();validateIdentity(learner);return await get(key(learner))||{revision:0,learner,assignments:[],config:{enabled:false}};}
async function register(learner){
 for(let n=0;n<8;n++){const k=PREFIX+'index',old=await get(k);if(old?.learners?.includes(learner))return;const next={revision:(old?.revision||0)+1,learners:[...(old?.learners||[]),learner]};if(await cas(k,old,next))return;}
 throw fail('Assignment saved, but reminder registration needs a retry.',503);
}
function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T12:00:00Z'))||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw fail('Choose a valid due date.');return value;}
function text(value,max){if(typeof value!=='string'||!value.trim()||value.length>max)throw fail('Material title and identifier are required.');return value.replace(/[\r\n]/g,' ').trim();}
export function localMaterialUrl(value){
 if(typeof value!=='string'||value.length>600)throw fail('Choose a valid Aleph material link.');
 let url;try{url=new URL(value,'https://aleph-alpha.io/');}catch{throw fail('Choose a valid Aleph material link.');}if(url.origin!=='https://aleph-alpha.io'||!/^\/(?:calculus-review|dsa-review|dbms-review|math-remedial|math-diagnostic|psets|gate-da-dbms|DSA%20For%20GATE%20practice)\//.test(url.pathname))throw fail('Choose a published Aleph material.');
 return url.pathname+url.search+url.hash;
}
export async function mutateTracker(input,now=new Date(),publicKey=REVIEW_PUBLIC_KEY){
 const {learner,expectedRevision,action}=input;const old=await loadTracker(learner);
 if(!Number.isInteger(expectedRevision)||expectedRevision!==old.revision)throw fail('Assignments changed on another device. Refresh and try again.',409);
 const next=structuredClone(old),stamp=new Date(now).toISOString();
 guardStudyMutation(old,input,now,publicKey);
 if(isStudyAction(action)){
  const ledger=action==='study-reflect'?await loadPlatinumSubmissionsLedger():{submissions:[]};
  applyStudyAction(next,{...input,resolvedAssignments:resolvedAssignments(old,ledger.submissions||[],now,{includeCancelled:true})},now,publicKey);
 }else if(action==='assign'){
  if(next.assignments.filter(a=>!a.cancelledAt).length>=250)throw fail('This tracker already has 250 active assignments.');
  const dueDate=date(input.dueDate),materialId=text(input.materialId,150);
  if(next.assignments.some(a=>!a.cancelledAt&&a.materialId===materialId&&a.dueDate===dueDate))throw fail('That material is already assigned for this day.',409);
  next.assignments.push({id:randomUUID(),materialId,title:text(input.title,240),subject:String(input.subject||'').slice(0,160),href:localMaterialUrl(input.href),dueDate,minutes:Number.isInteger(input.minutes)&&input.minutes>0&&input.minutes<=480?input.minutes:90,createdAt:stamp,updatedAt:stamp,completedAt:null,cancelledAt:null});
 }else if(['complete','reopen','reschedule','cancel'].includes(action)){
  const a=next.assignments.find(a=>a.id===input.id&&!a.cancelledAt);if(!a)throw fail('Assignment not found.',404);
  if(action==='complete')a.completedAt=a.completedAt||stamp;
  if(action==='reopen')a.completedAt=null;
  if(action==='reschedule'){
   const dueDate=date(input.dueDate);if(next.assignments.some(other=>other.id!==a.id&&!other.cancelledAt&&other.materialId===a.materialId&&other.dueDate===dueDate))throw fail('This material already has an assignment on that day.',409);a.dueDate=dueDate;
  }
  if(action==='cancel')a.cancelledAt=stamp;
  a.updatedAt=stamp;
 }else if(action==='configure'){
  // Email destination changes require a short-lived, purpose-bound operator signature.
  const {payload,signature}=input;
  if(typeof payload!=='string'||payload.length>3000||typeof signature!=='string'||!verify(null,Buffer.from(payload),publicKey,Buffer.from(signature,'base64')))throw fail('Operator signature required for email configuration.',401);
  let config;try{config=JSON.parse(payload);}catch{throw fail('Invalid email configuration.');}
  if(config.purpose!=='aleph-material-tracker-config-v1'||config.learner!==learner||config.expectedRevision!==expectedRevision||!Number.isFinite(config.expiresAt)||config.expiresAt<new Date(now).getTime()||config.expiresAt>new Date(now).getTime()+300000)throw fail('Email configuration signature expired or does not match.',401);
  if(typeof config.enabled!=='boolean'||typeof config.email!=='string'||!/^\S+@[^\s@]+\.[^\s@]+$/.test(config.email)||config.email.length>254)throw fail('A valid monitor email is required.');
  next.config={enabled:config.enabled,email:config.email.trim().toLowerCase(),configuredAt:stamp};
 }else throw fail('Unknown tracker action.');
 if(!isStudyAction(action)&&next.study&&['assign','reschedule','cancel'].includes(action)){syncStudyPlans(next,now,input.reason);next.study.events.push({type:action,at:stamp,assignmentId:input.id||next.assignments.at(-1)?.id,reason:input.reason});}
 if(next.study&&['complete','reopen'].includes(action))next.study.events.push({type:action,at:stamp,assignmentId:input.id,previousCompletedAt:old.assignments.find(a=>a.id===input.id)?.completedAt||null});
 next.revision=old.revision+1;next.updatedAt=stamp;
 await register(learner);
 if(!await cas(key(learner),old,next))throw fail('A newer assignment change won the conflict. Refresh before trying again.',409);
 return next;
}
export function resolvedAssignments(record,submissions=[],now=new Date(),{includeCancelled=false}={}){
 const today=trackerDay(now),receipts=new Map(submissions.filter(s=>s.userId===record.learner&&s.submittedAt).map(s=>[s.materialId,s]));
 return record.assignments.filter(a=>includeCancelled||!a.cancelledAt).map(a=>{
  const receipt=receipts.get(a.materialId),submittedAt=receipt?.submittedAt>=a.createdAt?receipt.submittedAt:null,completedAt=submittedAt||a.completedAt;
  return {...a,submittedAt,completedAt,completedLate:Boolean(completedAt&&trackerDay(completedAt)>a.dueDate),completionSource:submittedAt?'submission':a.completedAt?'reported':null,status:completedAt?'completed':a.dueDate<today?'overdue':a.dueDate===today?'due-today':'upcoming'};
 }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.createdAt.localeCompare(b.createdAt));
}
function emailConfig(record,env=process.env){return {email:record.config?.email||env.PLATINUM_MONITOR_EMAIL||'',enabled:Boolean(record.config?.enabled),providerConfigured:Boolean(env.RESEND_API_KEY&&env.FROM_EMAIL),cronConfigured:Boolean(env.CRON_SECRET)};}
export async function trackerState(learner,now=new Date()){
 const [record,ledger]=await Promise.all([loadTracker(learner),loadPlatinumSubmissionsLedger()]);const email=emailConfig(record);
 const assignments=resolvedAssignments(record,ledger.submissions||[],now);
 const at=email.email.lastIndexOf('@');const masked=email.email?email.email[0]+'***'+email.email.slice(at):'';
 return {learner,revision:record.revision,today:trackerDay(now),timeZone:TRACKER_TIMEZONE,assignments,study:studyView(record,resolvedAssignments(record,ledger.submissions||[],now,{includeCancelled:true}),now),alerts:{enabled:email.enabled,recipientConfigured:Boolean(email.email),recipient:masked,providerConfigured:email.providerConfigured,cronConfigured:email.cronConfigured,ready:email.enabled&&Boolean(email.email)&&email.providerConfigured&&email.cronConfigured},counts:{today:assignments.filter(a=>a.dueDate===trackerDay(now)).length,overdue:assignments.filter(a=>a.status==='overdue').length,completed:assignments.filter(a=>a.status==='completed').length}};
}
function overdueStart(dueDate){
 const next=new Date(dueDate+'T00:00:00Z');next.setUTCDate(next.getUTCDate()+1);const day=next.toISOString().slice(0,10);next.setUTCHours(6);while(trackerDay(new Date(next.getTime()-3600000))===day)next.setTime(next.getTime()-3600000);return next.toISOString();
}
export async function materialTrackerNotifications(learner,now=new Date()){
 const target=learner==='user-reviewer'?'user-priyanka':learner;
 const state=await trackerState(target,now),record=await loadTracker(target);
 const workflow=studyNotifications(record,state.assignments,learner,now,state.study);
 return [...workflow,...state.assignments.filter(a=>a.status!=='completed').sort((a,b)=>(b.status==='overdue')-(a.status==='overdue')||a.dueDate.localeCompare(b.dueDate)).slice(0,100).map(a=>({id:`material-${a.status==='overdue'?'overdue':'assigned'}-${a.id}`,version:a.dueDate,type:'material-assignment',title:a.status==='overdue'?'Overdue: '+a.title:'Assigned: '+a.title,description:`${a.minutes}-minute session · Due ${a.dueDate} (${TRACKER_TIMEZONE}).${a.status==='overdue'?' No completion or submission is recorded.':''}`,href:a.href,generatedAt:a.status==='overdue'?overdueStart(a.dueDate):a.createdAt}))];
}
function digest(record,items,day,studyLines=[]){return {from:null,to:null,subject:record.study?`Aleph: daily study update · ${day}`:`Aleph: ${items.length} unfinished material assignment${items.length===1?'':'s'}`,text:[`Daily Aleph material check · ${day} (${TRACKER_TIMEZONE})`,'','These dated assignments have no completion or submission recorded:',...items.map(a=>`- ${a.title} · due ${a.dueDate} · ${a.minutes} minutes\n  https://aleph-alpha.io${a.href}`),'','Open the dashboard to review, complete, or reschedule: https://aleph-alpha.io/','Completion reflects a submission or an explicit completion report; it is not a mastery assessment.',...studyLines].join('\n')};}
export async function checkTrackerReminders({now=new Date(),fetcher=fetch,env=process.env}={}){
 assertStore();const registry=await get(PREFIX+'index');const result=[];
 for(const learner of registry?.learners||[]){
  const record=await loadTracker(learner),config=emailConfig(record,env);
  if(!config.enabled||!config.email||!config.providerConfigured){result.push({learner,sent:false,reason:!config.enabled?'disabled':!config.email?'recipient_missing':'email_not_configured'});continue;}
  const ledger=await loadPlatinumSubmissionsLedger(),resolved=resolvedAssignments(record,ledger.submissions||[],now,{includeCancelled:true}),overdue=resolved.filter(a=>!a.cancelledAt&&a.status==='overdue'),studyLines=studyDigest(record,resolved,now);
  if(!overdue.length&&!studyLines.length){result.push({learner,sent:false,reason:'nothing_overdue'});continue;}
  const day=trackerDay(now),jobKey=PREFIX+'email:'+encodeURIComponent(learner)+':'+day,old=await get(jobKey),ms=new Date(now).getTime();
  if(old?.sentAt){result.push({learner,sent:false,reason:'already_sent'});continue;}
  if(old?.leaseUntil>ms){result.push({learner,sent:false,reason:'in_progress'});continue;}
  if(old?.body&&(old.body.to!==config.email||old.body.from!==env.FROM_EMAIL)){result.push({learner,sent:false,reason:'delivery_configuration_changed_needs_review'});continue;}
  // Keep a frozen body across ambiguous provider retries; same idempotency key/body.
  const body=old?.body||{...digest(record,overdue,day,studyLines),from:env.FROM_EMAIL,to:config.email};
  const job={...old,revision:(old?.revision||0)+1,body,firstAttemptAt:old?.firstAttemptAt||ms,leaseUntil:ms+120000,attempt:randomUUID()};
  if(ms-job.firstAttemptAt>=23*3600000){result.push({learner,sent:false,reason:'delivery_uncertain_needs_review'});continue;}
  if(!await cas(jobKey,old,job)){result.push({learner,sent:false,reason:'in_progress'});continue;}
  try{
   const idempotency='aleph-materials/'+createHash('sha256').update(learner+':'+day).digest('hex');
   const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':idempotency},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('Email provider rejected the digest.');
   const receipt=await response.json();const sent={...job,revision:job.revision+1,leaseUntil:0,sentAt:new Date(now).toISOString(),providerId:receipt.id||null};
   if(!await cas(jobKey,job,sent))throw Error('Delivery acknowledgement needs reconciliation.');
   result.push({learner,sent:true,count:overdue.length});
  }catch{
   await cas(jobKey,job,{...job,revision:job.revision+1,leaseUntil:0,lastErrorAt:new Date(now).toISOString()});result.push({learner,sent:false,reason:'delivery_retry_needed'});
  }
 }
 return {checkedAt:new Date(now).toISOString(),timeZone:TRACKER_TIMEZONE,results:result};
}
