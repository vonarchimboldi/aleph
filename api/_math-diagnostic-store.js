import {createHash} from 'node:crypto';
import {dayItems} from './_math-diagnostic-items.js';
import {kvCommand,platinumProgressStoreStatus,savePlatinumSubmissionRecord} from './_platinum-progress-store.js';
const PREFIX='aleph:math-diagnostic:v1:';
const CAS="local v=redis.call('GET',KEYS[1]); local rev=0; if v then rev=cjson.decode(v).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
function key(learner,day){return PREFIX+encodeURIComponent(learner)+':day:'+day}
function fileKey(learner,day,id){return key(learner,day)+':file:'+id}
export function assertStore(){if(platinumProgressStoreStatus()!=='kv'&&process.env.ALEPH_DIAGNOSTIC_MEMORY!=='1')throw Object.assign(Error('Durable diagnostic storage is not configured.'),{status:503})}
export function validateIdentity(learner,day){if(typeof learner!=='string'||!learner.trim()||learner.length>160)throw Object.assign(Error('A learner identifier is required.'),{status:400});if(day!==undefined&&(!Number.isInteger(day)||day<1||day>10))throw Object.assign(Error('Day must be from 1 to 10.'),{status:400})}
export async function loadDay(learner,day){const raw=await kvCommand(['GET',key(learner,day)]);return raw?(typeof raw==='string'?JSON.parse(raw):raw):null}
export async function loadProgress(learner){const records=(await Promise.all(Array.from({length:10},(_,i)=>loadDay(learner,i+1)))).filter(Boolean);return {records,completed:records.filter(r=>r.submittedAt).map(r=>r.day)}}
const text=(v,max=12000)=>typeof v==='string'?v.slice(0,max):'';
export function normalizeDay(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input)||!input.answers||typeof input.answers!=='object'||Array.isArray(input.answers))throw Object.assign(Error('A day response record is required.'),{status:400});
 const answers={};for(const [id,a] of Object.entries(input.answers)){if(!/^[A-Z0-9-]{1,30}$/.test(id)||!a||typeof a!=='object')throw Object.assign(Error('Invalid question response.'),{status:400});answers[id]=Object.fromEntries(['answer','confidence','familiarity','attemptStatus','minutes','outcome','reasoning','execution','credit','tutorNotes'].filter(k=>typeof a[k]==='string').map(k=>[k,text(a[k])]))}
 const selected=Array.isArray(input.selected)?[...new Set(input.selected)]:[];if(selected.length>2||selected.some(id=>typeof id!=='string'||!/^[A-Z0-9-]{1,30}$/.test(id)))throw Object.assign(Error('Choose at most two valid follow-ups.'),{status:400});
 return {answers,selected,notes:text(input.notes,5000),conditions:text(input.conditions,3000),branchReason:text(input.branchReason,3000),started:Number.isFinite(input.started)?input.started:null,finished:Number.isFinite(input.finished)?input.finished:null,status:text(input.status,30)};
}
export async function storeAttachment(learner,day,file){
 const match=typeof file?.dataUrl==='string'&&file.dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
 if(!match)throw Object.assign(Error('Upload a PDF, PNG, JPEG or WebP file.'),{status:400});
 const bytes=Buffer.from(match[2],'base64');if(!bytes.length||bytes.length>3*1024*1024)throw Object.assign(Error('The file must be at most 3 MB.'),{status:413});
 const type=match[1],valid=type==='application/pdf'?bytes.subarray(0,5).toString()==='%PDF-':type==='image/png'?bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a':type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!valid)throw Object.assign(Error('The file content does not match its PDF/image type.'),{status:400});
 const id=createHash('sha256').update(bytes).digest('hex'),data=file.dataUrl,chunks=[];
 for(let i=0;i<data.length;i+=96000)chunks.push(data.slice(i,i+96000));
 await Promise.all(chunks.map((chunk,i)=>kvCommand(['SET',fileKey(learner,day,id)+':'+i,chunk])));
 return {id,name:text(file.name,200)||'Working',type,size:bytes.length,chunks:chunks.length};
}
export async function loadAttachment(learner,day,id){const record=await loadDay(learner,day);const file=[record?.draft?.attachment,record?.submitted?.attachment].find(f=>f?.id===id);if(!file)throw Object.assign(Error('Attachment not found.'),{status:404});const chunks=await Promise.all(Array.from({length:file.chunks},(_,i)=>kvCommand(['GET',fileKey(learner,day,id)+':'+i])));if(chunks.some(x=>typeof x!=='string'))throw Object.assign(Error('An attachment chunk could not be loaded.'),{status:502});return {...file,dataUrl:chunks.join('')}}
export async function saveDay({learner,day,expectedRevision,data,action='save',file,learnerName=''}){
 validateIdentity(learner,day);if(!Number.isInteger(expectedRevision)||expectedRevision<0)throw Object.assign(Error('A valid record revision is required.'),{status:400});if(!['save','submit'].includes(action))throw Object.assign(Error('Unknown diagnostic action.'),{status:400});
 const old=await loadDay(learner,day);if((old?.revision||0)!==expectedRevision)throw Object.assign(Error('This day changed on another device. Refresh or resolve the draft conflict before saving.'),{status:409,current:old});
 if(day>1&&!(await loadDay(learner,day-1))?.submittedAt)throw Object.assign(Error('Submit the previous day before saving this day.'),{status:409});
 const draft=normalizeDay(data);
 const allowed=new Set([...dayItems[day].core,...dayItems[day].branches]);
 if(Object.keys(draft.answers).some(id=>!allowed.has(id))||draft.selected.some(id=>!dayItems[day].branches.includes(id)))throw Object.assign(Error('A response or follow-up does not belong to this day.'),{status:400});
 if(file)draft.attachment=await storeAttachment(learner,day,file);
 else if(old?.draft?.attachment)draft.attachment=old.draft.attachment;
 const hasWork=Boolean(draft.attachment||draft.notes.trim()||Object.values(draft.answers).some(a=>a.answer?.trim()||a.attemptStatus));
 if(action==='submit'&&!hasWork)throw Object.assign(Error('Add responses, an attempt-status record, a session note or a PDF/image before submitting.'),{status:400});
 const now=new Date().toISOString(),record={learner,learnerName:text(learnerName,160),day,revision:expectedRevision+1,draft,submitted:action==='submit'?draft:old?.submitted||null,submittedAt:old?.submittedAt||(action==='submit'?now:null),lastSubmittedAt:action==='submit'?now:old?.lastSubmittedAt||null,updatedAt:now};
 const applied=await kvCommand(['EVAL',CAS,1,key(learner,day),String(expectedRevision),JSON.stringify(record)]);
 if(Number(applied)!==1)throw Object.assign(Error('A newer day record was saved. Your local work has been retained.'),{status:409,current:await loadDay(learner,day)});
 if(action==='submit')await savePlatinumSubmissionRecord({userId:learner,learnerName:record.learnerName,materialId:`math-diagnostic-day-${String(day).padStart(2,'0')}`,materialTitle:`Mathematics diagnostic · Day ${day}`,materialUrl:`math-diagnostic/?learner=${encodeURIComponent(learner)}&day=${day}`,subjectId:'subject-platinum-math-diagnostic',subjectTitle:'High-school Mathematics Diagnostic',submittedAt:record.submittedAt,date:now.slice(0,10),fileName:draft.attachment?.name||'',fileType:draft.attachment?.type||'',fileSize:draft.attachment?.size||null,status:'submitted'});
 return record;
}
