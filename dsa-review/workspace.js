(()=>{
 'use strict';
 const config=window.REVIEW_CONFIG||{storagePrefix:'aleph-skiena-review-v1',title:'Skiena DSA review',exportPrefix:'skiena',uploadLabel:'Aleph DSA review subject'};
 const day=location.pathname.match(/day-(\d+)\.html$/)?.[1];if(!day)return;
 let user='guest';try{user=JSON.parse(localStorage.getItem('learning-studio-data-v2'))?.user?.id||'guest';}catch{}
 const key=`${config.storagePrefix}:${user}:${day}`;
 const fields=[...document.querySelectorAll('[data-answer],[data-attempt],[data-confidence],[data-help],[data-option],[data-correction]')];
 const status=document.querySelector('#status'),button=document.querySelector('#record-attempt');
 const fk=f=>f.dataset.option?`option:${f.dataset.option}:${f.value}`:Object.entries(f.dataset).map(([k,v])=>`${k}:${v}`).join(':');
 let data={draft:{},original:null};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object'&&saved.draft&&typeof saved.draft==='object')data=saved;}catch{status.textContent='Local recovery could not be read. Keep an exported copy of your work.';}
 for(const f of fields){const saved=data.draft[fk(f)];if(f.type==='checkbox')f.checked=Boolean(saved);else if(typeof saved==='string')f.value=saved;}
 function gather(){return Object.fromEntries(fields.map(f=>[fk(f),f.type==='checkbox'?f.checked:f.value]));}
 function save(){data.draft=gather();try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{status.textContent='Local saving failed. Export before leaving; no attempt has been submitted to Aleph.';return false;}}
 function show(){
  const complete=Boolean(data.original);document.querySelector('#feedback').hidden=!complete;document.querySelector('#big-picture').hidden=!complete;
  if(complete){button.disabled=true;button.textContent='Original attempt recorded';status.textContent=`Original attempt is frozen on this browser. Later edits are corrections. Export and upload through the ${config.uploadLabel} to submit.`;
   let points=0;for(const q of document.querySelectorAll('[data-question]')){const id=q.dataset.question;const correct=(window.REVIEW_KEYS||window.DSA_KEYS)?.[id];if(!correct)continue;const got=Object.keys(data.original.responses).filter(k=>k.startsWith(`option:${id}:`)&&data.original.responses[k]).map(k=>k.split(':').pop()).sort();if(JSON.stringify(got)===JSON.stringify([...correct].sort())&&data.original.responses[`attempt:${id}`]==='Attempted')points+=2;}
   document.querySelector('#mcq-result').textContent=`Multi-select score from the original attempt: ${points}/4. Review the three short responses separately, up to 6 more points.`;
  }
 }
 for(const f of fields)f.addEventListener('input',save);
 button.addEventListener('click',()=>{
  if(data.original)return;
  if(!document.querySelector('#confirm-attempt').checked){status.textContent='Confirm that your attempt is recorded before opening feedback.';return;}
  for(const q of document.querySelectorAll('[data-question]')){
   const id=q.dataset.question,attempt=q.querySelector('[data-attempt]').value;
   if(!attempt){status.textContent=`Choose an attempt status for ${id}.`;return;}
   if(attempt==='Attempted'){
    const reasoning=q.querySelector('[data-answer]').value.trim(),selected=[...q.querySelectorAll('[data-option]:checked')].length;
    if(!reasoning&&!selected){status.textContent=`Add a response for ${id}, or honestly mark it not attempted/not reached.`;return;}
   }
  }
  data.original={recordedAt:new Date().toISOString(),responses:gather()};
  if(!save()){data.original=null;return;}show();
 });
 document.querySelector('#export').addEventListener('click',()=>{
  data.draft=gather();const lines=[`${config.title} · Day ${day}`,`Exported ${new Date().toISOString()}`,`Browser-local record; upload in the ${config.uploadLabel} to submit.`,'ORIGINAL ATTEMPT',data.original?JSON.stringify(data.original,null,2):'Not recorded','LATEST WORK / CORRECTIONS',JSON.stringify(data.draft,null,2)].join('\n\n');
  const url=URL.createObjectURL(new Blob([lines],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`${config.exportPrefix}-day-${day}-responses.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });show();
})();
