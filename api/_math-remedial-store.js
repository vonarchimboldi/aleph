import {createHash} from 'node:crypto';
import {kvCommand,savePlatinumSubmissionRecord} from './_platinum-progress-store.js';
import {assertStore,validateIdentity,loadProgress} from './_math-diagnostic-store.js';
import {COURSE_VERSION,course} from './_math-remedial-content.js';
const PREFIX='aleph:math-remedial:'+COURSE_VERSION+':';
const key=(learner,day)=>PREFIX+encodeURIComponent(learner)+':day:'+day;
const CAS="local v=redis.call('GET',KEYS[1]); local rev=0; if v then rev=cjson.decode(v).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
const error=(message,status=400)=>Object.assign(Error(message),{status});
const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
export async function loadRemedialDay(learner,day){const raw=await kvCommand(['GET',key(learner,day)]);return raw?(typeof raw==='string'?JSON.parse(raw):raw):null;}
export async function remedialRecords(learner){return (await Promise.all(course.map(d=>loadRemedialDay(learner,d.day)))).filter(Boolean);}
export async function diagnosticComplete(learner){return (await loadProgress(learner)).completed.length===10;}
async function access(learner,day){assertStore();validateIdentity(learner,day);if(!await diagnosticComplete(learner))throw error('Complete all ten diagnostic submissions before beginning remediation.',403);if(day>1&&!(await loadRemedialDay(learner,day-1))?.submittedAt)throw error('Submit the previous remedial day first.',403);}
export async function remedialState(learner,day){
 assertStore();validateIdentity(learner,day);
 const complete=await diagnosticComplete(learner),records=await remedialRecords(learner);
 const summaries=course.map(d=>({day:d.day,title:d.title,submittedAt:records.find(r=>r.day===d.day)?.submittedAt||null,available:complete&&(d.day===1||Boolean(records.find(r=>r.day===d.day-1)?.submittedAt))}));
 const available=summaries.find(d=>d.day===day).available;
 if(!available)return {version:COURSE_VERSION,diagnosticComplete:complete,days:summaries,day,available:false};
 const record=records.find(r=>r.day===day)||null,content=course[day-1];
 // No lesson, example or hints are returned until the retrieval attempt is recorded.
 return {version:COURSE_VERSION,diagnosticComplete:complete,days:summaries,day,available:true,record,content:record?.baseline?content:{day,title:content.title,minutes:90,retrieval:content.blocks.repair.questions[0]}};
}
function normalizeAnswers(day,answers={}){
 if(!answers||typeof answers!=='object'||Array.isArray(answers))throw error('Invalid responses.');
 const allowed=new Set(Object.values(course[day-1].blocks).flatMap(b=>b.questions.map(q=>q.id))),result={};
 for(const [id,value] of Object.entries(answers)){
  if(!allowed.has(id)||!value||typeof value!=='object'||Array.isArray(value))throw error('A response does not belong to this day.');
  const status=text(value.attemptStatus,30);
  if(!['','attempted','not attempted','not reached'].includes(status))throw error('Invalid attempt status.');
  result[id]={answer:text(value.answer,12000),attemptStatus:status,hintUsed:text(value.hintUsed,100),exposure:text(value.exposure,500)};
 }
 return result;
}
async function attachment(learner,day,file){
 const match=typeof file?.dataUrl==='string'&&file.dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
 if(!match)throw error('Choose a PDF, PNG, JPEG or WebP.');
 const bytes=Buffer.from(match[2],'base64');if(!bytes.length||bytes.length>3*1024*1024)throw error('Attachment limit is 3 MB.',413);
 const type=match[1],valid=type==='application/pdf'?bytes.subarray(0,5).toString()==='%PDF-':type==='image/png'?bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a':type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!valid)throw error('Attachment content does not match its type.');
 const id=createHash('sha256').update(bytes).digest('hex'),chunks=[];for(let i=0;i<file.dataUrl.length;i+=96000)chunks.push(file.dataUrl.slice(i,i+96000));
 await Promise.all(chunks.map((chunk,i)=>kvCommand(['SET',key(learner,day)+':file:'+id+':'+i,chunk])));
 return {id,name:text(file.name,200)||'Working',type,size:bytes.length,chunks:chunks.length};
}
export async function remedialAttachment(learner,day,id){await access(learner,day);const r=await loadRemedialDay(learner,day),f=[r?.draft?.attachment,r?.submitted?.attachment].find(f=>f?.id===id);if(!f)throw error('Attachment not found.',404);const chunks=await Promise.all(Array.from({length:f.chunks},(_,i)=>kvCommand(['GET',key(learner,day)+':file:'+id+':'+i])));if(chunks.some(c=>typeof c!=='string'))throw error('Attachment is temporarily unavailable.',502);return {...f,dataUrl:chunks.join('')};}
export async function saveRemedial({learner,day,expectedRevision,action='save',data={},file}){
 await access(learner,day);
 if(!['baseline','save','submit'].includes(action)||!Number.isInteger(expectedRevision)||expectedRevision<0)throw error('Invalid save request.');
 const old=await loadRemedialDay(learner,day);if((old?.revision||0)!==expectedRevision)throw error('A newer version exists. Reload before saving; copy your unsaved text first.',409);
 if(!data||typeof data!=='object'||Array.isArray(data))throw error('Invalid day data.');
 const answers=normalizeAnswers(day,data.answers),retrieval=course[day-1].retrievalId||course[day-1].blocks.repair.questions[0].id;
 let baseline=old?.baseline||null;
 if(action==='baseline'){
  if(baseline)throw error('The original retrieval attempt is already recorded.',409);
  const answer=answers[retrieval];if(!answer||(!answer.answer.trim()&&!['not attempted','not reached'].includes(answer.attemptStatus)))throw error('Record an answer or an honest attempt status before opening the lesson.');
  baseline={questionId:retrieval,response:answer,recordedAt:new Date().toISOString()};
 }else if(!baseline)throw error('Record the opening retrieval attempt before continuing.',409);
 const draft={answers,notes:text(data.notes,5000),attachment:old?.draft?.attachment||null};
 if(file)draft.attachment=await attachment(learner,day,file);
 if(action==='submit'&&!draft.attachment&&!draft.notes.trim()&&!Object.values(answers).some(a=>a.answer.trim()||a.attemptStatus))throw error('Record your work or an attempt status before submitting.');
 const now=new Date().toISOString(),record={learner,day,version:COURSE_VERSION,revision:expectedRevision+1,baseline,draft,submitted:action==='submit'?{...draft,baseline}:old?.submitted||null,submittedAt:old?.submittedAt||(action==='submit'?now:null),lastSubmittedAt:action==='submit'?now:old?.lastSubmittedAt||null,updatedAt:now};
 if(Number(await kvCommand(['EVAL',CAS,1,key(learner,day),String(expectedRevision),JSON.stringify(record)]))!==1)throw error('A newer save won the conflict. Copy unsaved text and reload.',409);
 if(action==='submit')await savePlatinumSubmissionRecord({userId:learner,materialId:`math-remedial-day-${String(day).padStart(2,'0')}`,materialTitle:`Mathematics remediation · Day ${day}`,materialUrl:`math-remedial/?learner=${encodeURIComponent(learner)}&day=${day}`,subjectId:'subject-platinum-math-remedial',subjectTitle:'Mathematics foundations and remediation',submittedAt:record.submittedAt,date:now.slice(0,10),fileName:draft.attachment?.name||'',fileType:draft.attachment?.type||'',fileSize:draft.attachment?.size||null,status:'submitted'});
 return record;
}
