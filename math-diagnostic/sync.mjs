export function hasWork(d){return Boolean(d&&(d.attachment||d.notes?.trim()||Object.values(d.answers||{}).some(a=>a.answer?.trim()||a.attemptStatus)))}
const copy=x=>JSON.parse(JSON.stringify(x));
const content=d=>JSON.stringify({answers:d.answers||{},selected:d.selected||[],notes:d.notes||'',conditions:d.conditions||'',branchReason:d.branchReason||'',attachment:d.attachment?.id||''});
export function createSync({learner,learnerName,progress,persist,notify=()=>{},fetcher=fetch}){
 let ready=false,confirmed=[],tail=Promise.resolve();const revisions={};
 progress.dirtyDays||={};progress.localRecovery||={};
 function enqueue(fn){const task=tail.then(fn,fn);tail=task.catch(()=>{});return task}
 async function request(path,options){const res=await fetcher(path,{...options,cache:'no-store',signal:AbortSignal.timeout(60000)});let data;try{data=await res.json()}catch{throw Error('The diagnostic server did not return a usable response. Your browser copy is retained.')}if(!res.ok)throw Object.assign(Error(data.error||'Diagnostic sync failed.'),{status:res.status,current:data.current});return data}
 function accept(record){revisions[record.day]=record.revision;progress.remoteRevisions||={};progress.remoteRevisions[record.day]=record.revision;if(record.submittedAt&&!confirmed.includes(record.day))confirmed.push(record.day);confirmed.sort((a,b)=>a-b);progress.completed=[...confirmed];progress.serverReceipts||={};progress.serverReceipts[record.day]={submittedAt:record.submittedAt,lastSubmittedAt:record.lastSubmittedAt,updatedAt:record.updatedAt,revision:record.revision};persist()}
 async function send(n,action,file){
  if(!ready)throw Error('Connect to the diagnostic server before saving or submitting. Your work is retained in this browser.');
  const snapshot=copy(progress.days[n]),stamp=progress.dirtyDays[n];
  try{
   const result=await request('/api/math-diagnostic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learner,learnerName,day:n,expectedRevision:revisions[n]||0,data:snapshot,action,...(file?{file}:{})})});
   accept(result.record);if(action==='submit')progress.pendingSubmissions=(progress.pendingSubmissions||[]).filter(x=>x!==n);if(result.record.draft.attachment)progress.days[n].attachment=result.record.draft.attachment;
   if(progress.dirtyDays[n]===stamp)delete progress.dirtyDays[n];persist();notify(action==='submit'?`Day ${n} submitted to Aleph at ${new Date(result.record.lastSubmittedAt).toLocaleString()}.`:`Day ${n} draft saved to Aleph.`,'success');return result.record;
  }catch(error){if(error.current){progress.conflicts||={};progress.conflicts[n]=error.current;persist()}notify(error.message,'error');throw error}
 }
 async function hydrate(){
  const legacyCompleted=[...new Set([...(progress.completed||[]),...(progress.pendingSubmissions||[])])];progress.pendingSubmissions=legacyCompleted.filter(n=>!progress.serverReceipts?.[n]?.submittedAt);persist();ready=false;
  try{
   const data=await request('/api/math-diagnostic?learner='+encodeURIComponent(learner));confirmed=[...data.completed];const blocked=new Set();
   for(const record of data.records){
    const n=record.day,local=progress.days[n],known=progress.remoteRevisions?.[n];
    const localDirty=Boolean(progress.dirtyDays[n]);
    if(localDirty&&known===record.revision){/* keep a newer local draft based on this revision */}
    else{
     if(local&&hasWork(local)&&content(local)!==content(record.draft)){
      if(!hasWork(record.draft)){progress.dirtyDays[n]=Date.now();revisions[n]=record.revision;progress.remoteRevisions||={};progress.remoteRevisions[n]=record.revision;continue;}
      progress.localRecovery[n]=copy(local);blocked.add(n);notify(`Day ${n} differs from the server copy. The server copy is displayed; your browser draft is preserved in the export under localRecovery.`,'error');
     }
     progress.days[n]=copy(record.draft);delete progress.dirtyDays[n];
    }
    accept(record);
   }
   progress.completed=[...confirmed];ready=true;persist();
   for(const n of legacyCompleted.sort((a,b)=>a-b)){
    if(confirmed.includes(n)||blocked.has(n)||!hasWork(progress.days[n]))continue;
    if(n>1&&!confirmed.includes(n-1))break;
    await enqueue(()=>send(n,'submit'));
   }
   for(const [n,d] of Object.entries(progress.days))if(hasWork(d)&&!legacyCompleted.includes(Number(n))&&(Number(n)===1||confirmed.includes(Number(n)-1))&&(progress.dirtyDays[n]||!revisions[n]))await enqueue(()=>send(Number(n),'save'));
   notify('Connected to Aleph. '+(confirmed.length?`Submitted days: ${confirmed.join(', ')}.`:'No submitted days yet.'),'success');return data;
  }catch(error){notify(error.message,'error');throw error}
 }
 return {hydrate,isReady:()=>ready,completed:()=>[...confirmed],save:n=>enqueue(()=>send(n,'save')),submit:(n,file)=>enqueue(()=>send(n,'submit',file)),upload:(n,file)=>enqueue(()=>send(n,'save',file)),async attachment(n,id){return (await request(`/api/math-diagnostic?learner=${encodeURIComponent(learner)}&day=${n}&attachment=${encodeURIComponent(id)}`)).attachment},async resolve(n,keepLocal){const remote=progress.conflicts?.[n];if(!remote)throw Error('No saved conflict to resolve.');if(!keepLocal)progress.days[n]=copy(remote.draft);else{progress.localRecovery[n]=copy(remote.draft);progress.dirtyDays[n]=Date.now()}accept(remote);delete progress.conflicts[n];persist();if(keepLocal)return enqueue(()=>send(n,'save'));return remote}};
}
