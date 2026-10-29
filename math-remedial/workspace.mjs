const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
let account={};try{account=JSON.parse(localStorage.getItem('learning-studio-data-v2'))?.user||{};}catch{}
const learner=params.get('learner')||account.id;
let day=Number(params.get('day'))||1,state=null,revision=0,answers={},notes='',dirty=false,busy=false,autosave,conflict=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message=t=>{$('#message').textContent=t;};
async function request(url,options){const r=await fetch(url,{cache:'no-store',...options}),data=await r.json();if(!r.ok){const e=Error(data.error||'Request failed');e.status=r.status;throw e;}return data;}
const endpoint=()=>`/api/math-remedial?learner=${encodeURIComponent(learner)}&day=${day}`;
function fields(q){const a=answers[q.id]||{};return `<article class="question"><h3>${esc(q.id)} · ${q.minutes} minutes</h3><p>${esc(q.prompt)}</p><label>Your reasoning, or a reference to uploaded working<textarea data-q="${esc(q.id)}" data-field="answer">${esc(a.answer)}</textarea></label><label>Attempt status<select data-q="${esc(q.id)}" data-field="attemptStatus">${['','attempted','not attempted','not reached'].map(s=>`<option ${a.attemptStatus===s?'selected':''} value="${s}">${s||'Not recorded'}</option>`).join('')}</select></label><label>Hints or support used<input data-q="${esc(q.id)}" data-field="hintUsed" value="${esc(a.hintUsed)}"></label><label>Prior exposure / notes<input data-q="${esc(q.id)}" data-field="exposure" value="${esc(a.exposure)}"></label></article>`;}
function render(){
 $('#days').innerHTML=state.days.map(d=>`<button data-day="${d.day}" ${!d.available||busy?'disabled':''} class="${d.day===day?'active':''}" title="${esc(d.title)}">Day ${d.day}${d.submittedAt?' ✓':''}</button>`).join('');
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>switchDay(Number(b.dataset.day)));
 if(!state.available){$('#session').innerHTML=`<section class="card"><h2>${state.diagnosticComplete?'Submit the previous day first':'Complete your diagnostic first'}</h2><p>${state.diagnosticComplete?'Later teaching material stays on the server until the previous day has a submission receipt.':'All ten diagnostic submissions are needed before beginning this programme.'}</p><a href="/math-diagnostic/?learner=${encodeURIComponent(learner)}">Open diagnostic</a></section>`;return;}
 const c=state.content,record=state.record;
 if(!record?.baseline){
  $('#session').innerHTML=`<section class="card"><h2>Day ${day}: ${esc(c.title)}</h2><h3>First:5 minutes of retrieval</h3><p>Attempt this before opening today’s teaching. If this repeats an earlier taught skill, record that exposure. This is not a new untouched diagnostic baseline.</p>${fields(c.retrieval)}<button id="baseline">Record retrieval and open lesson</button><p class="small">An honest not-attempted/not-reached status is valid. No lesson or worked example is downloaded before this record is saved.</p></section>`;
  bind();$('#baseline').onclick=()=>save('baseline');return;
 }
 let body=`<section class="card"><h2>Day ${day}: ${esc(c.title)}</h2><p class="notice">90-minute budget: the opening5 minutes counted toward repair. Now45 minutes foundations, then40 minutes repair. Stop at90; record unfinished items rather than extending the session silently.</p><p class="small">Draft revision ${revision}. ${record.submittedAt?'Submitted: '+esc(new Date(record.submittedAt).toLocaleString())+'. Further edits remain drafts until resubmitted.':'Not submitted yet.'}</p><details><summary>Opening retrieval attempt (original record)</summary><p>${esc(record.baseline.response.answer||record.baseline.response.attemptStatus)}</p><p class="small">Recorded before today’s teaching at ${esc(new Date(record.baseline.recordedAt).toLocaleString())}. This original record is retained.</p></details><details><summary>Notation and reading guide</summary><ul>${c.glossary.map(([s,t])=>`<li><b>${esc(s)}</b> — ${esc(t)}</li>`).join('')}</ul></details></section>`;
 for(const name of ['foundations','repair']){
  const b=c.blocks[name];body+=`<section class="card"><h2>${name==='foundations'?'Foundations —45 minutes':'Repair —40 minutes remaining'}</h2><p>${name==='foundations'?'8 explanation +7 worked example +10 first question +10 second question +8 exit +2 log.':'10 explanation/example +15 guided question +10 exit check(s) +5 log. Day10 splits the exit into two5-minute checks.'}</p><p>${esc(b.explanation)}</p><h3>Worked example</h3><div class="answer">${esc(b.workedExample)}</div><p class="small">If a prerequisite is insecure, use hints within the existing budget: supported work replaces part of the next question. Record remaining parts as not reached. If the retrieval concerns a different earlier skill, use its own relevant hint, not an unrelated current-topic hint.</p></section>`;
  for(const q of b.questions)if(q.id!==c.retrievalId)body+=fields(q);
 }
 const file=record.draft?.attachment;
 body+=`<section class="card"><h2>Session notes and submission</h2><label>What helped, difficulties, hints and next checks<textarea id="notes">${esc(notes)}</textarea></label><label>Attach working (PDF/image, up to3 MB)<input type="file" id="working" accept="application/pdf,image/png,image/jpeg,image/webp"></label>${file?`<p>${esc(file.name)} <button id="download">Download saved working</button></p>`:''}<div class="controls"><button id="save">Save draft</button><button id="print">Print this day</button><button id="export">Export my saved record</button></div><label><input type="checkbox" id="confirm"> My attempt is recorded, including anything I did not reach.</label><button id="submit">Submit Day ${day}${record.submittedAt?' again':' and open the next day'}</button><p class="small">Submission saves work for review. This course does not yet generate automatic remedial feedback. Your tutor can review the submitted text and attachment; no mastery is inferred from submission.</p><p class="small">Timing is provisional and not piloted. Some late-topic retention remains unconfirmed until a later check. No extra homework is automatically assigned.</p></section>`;
 $('#session').innerHTML=body;bind();$('#notes').oninput=e=>{notes=e.target.value;changed();};$('#save').onclick=()=>save('save');$('#submit').onclick=()=>{if(!$('#confirm').checked)return message('Confirm your attempt is recorded before submitting.');save('submit');};$('#print').onclick=()=>{document.querySelectorAll('details').forEach(d=>d.open=true);window.print();};$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({learner,day,record:state.record},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`math-remedial-day-${day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('#working').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>3*1024*1024)return message('Choose working no larger than3 MB.');try{const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f);});await save('save',{name:f.name,dataUrl});}catch(e){message(e.message);}};
 $('#download')?.addEventListener('click',async()=>{try{const {attachment}=await request(endpoint()+'&attachment='+file.id);const a=document.createElement('a');a.href=attachment.dataUrl;a.download=attachment.name;a.click();}catch(e){message(e.message);}});
}
function bind(){document.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{answers[el.dataset.q]||={};answers[el.dataset.q][el.dataset.field]=el.value;changed();});}
function changed(){dirty=true;clearTimeout(autosave);if(state.record?.baseline&&!conflict)autosave=setTimeout(()=>save('save'),1800);message('Unsaved changes.');}
async function load(){
 if(!learner){$('#session').innerHTML='<section class="card">Open this course from your signed-in Aleph subject so your learner record is linked.</section>';return;}
 const data=await request(endpoint());state=data;revision=data.record?.revision||0;answers=structuredClone(data.record?.draft?.answers||{});notes=data.record?.draft?.notes||'';dirty=false;conflict=false;render();
}
async function save(action,file){
 if(busy||conflict)return;busy=true;clearTimeout(autosave);const captured=JSON.stringify({answers,notes});
 document.querySelectorAll('#save,#submit,#baseline,[data-day]').forEach(b=>b.disabled=true);
 if(action!=='save'||file)document.querySelectorAll('textarea,input,select').forEach(el=>el.disabled=true);
 try{
  const {record}=await request('/api/math-remedial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learner,day,expectedRevision:revision,action,data:{answers,notes},...(file?{file}:{})})});
  revision=record.revision;state.record=record;
  dirty=JSON.stringify({answers,notes})!==captured;
  message(action==='submit'?'Submission saved on Aleph. Your tutor can review it.':'Saved on Aleph.');
  if(action!=='save'&&!dirty)await load();
  else if(file&&!dirty){render();message('Working uploaded and draft saved.');}
  if(dirty&&!conflict)autosave=setTimeout(()=>save('save'),1800);
 }catch(e){if(e.status===409)conflict=true;message(e.message+' Your unsaved text remains in this page. Copy it before reloading.');}
 finally{busy=false;document.querySelectorAll('textarea,input,select').forEach(el=>el.disabled=false);document.querySelectorAll('#save,#submit,#baseline').forEach(b=>b.disabled=conflict);document.querySelectorAll('[data-day]').forEach(b=>b.disabled=!state.days.find(d=>d.day===Number(b.dataset.day))?.available);}
}
async function switchDay(next){if(busy)return;if(dirty&&!confirm('You have unsaved changes. Copy them or save before changing days. Discard and continue?'))return;clearTimeout(autosave);day=next;history.replaceState(null,'','?learner='+encodeURIComponent(learner)+'&day='+day);try{await load();}catch(e){message(e.message);}}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
load().catch(e=>message(e.message));
