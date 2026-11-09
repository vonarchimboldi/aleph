(() => {
 'use strict';
 const day=location.pathname.match(/day-(\d+)\.html$/)?.[1];
 const fields=[...document.querySelectorAll('[data-answer],[data-support]')];
 let userId='guest';
 try{userId=JSON.parse(localStorage.getItem('learning-studio-data-v2'))?.user?.id||'guest';}catch{}
 const key=`aleph-calculus-refresher-v1:${userId}:${day}`;
 const status=document.querySelector('#save-status');
 const fieldKey=f=>`${f.dataset.answer?'answer':'support'}:${f.dataset.answer||f.dataset.support}`;
 if(day){
  try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const f of fields)if(typeof saved[fieldKey(f)]==='string')f.value=saved[fieldKey(f)];}
  catch{if(status){status.textContent='Local recovery could not be read. Export your work before leaving.';status.classList.add('save-warning');}}
  for(const f of fields)f.addEventListener('input',()=>{
   try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(fields.map(f=>[fieldKey(f),f.value]))));if(status)status.textContent='Scratchpad saved on this browser only. Export a copy, then upload in the Aleph calculus subject to submit.';}
   catch{if(status){status.textContent='Local saving failed. Export a copy before leaving this page.';status.classList.add('save-warning');}}
  });
  for(const detail of document.querySelectorAll('details.solution'))detail.addEventListener('toggle',()=>{
   if(!detail.open)return;
   const id=detail.closest('[data-problem]')?.dataset.problem;
   const select=fields.find(f=>f.dataset.support===id);
   if(select&&['Not recorded','Independent'].includes(select.value)){select.value='Solution consulted';select.dispatchEvent(new Event('input'));}
  });
  document.querySelector('#export-work')?.addEventListener('click',()=>{
   const text=[`Calculus refresher: Day ${day}`,`Exported: ${new Date().toISOString()}`,'Opening and exit checks are separate from supported practice.','This export is not an Aleph submission.',...fields.map(f=>`${fieldKey(f)}\n${f.value||'(not recorded)'}`)].join('\n\n');
   const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`calculus-day-${day}-responses.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
 }
 let previouslyOpen=[];
 addEventListener('beforeprint',()=>{previouslyOpen=[...document.querySelectorAll('details[open]')];document.querySelectorAll('details').forEach(d=>d.open=true);});
 addEventListener('afterprint',()=>document.querySelectorAll('details').forEach(d=>d.open=previouslyOpen.includes(d)));
})();
