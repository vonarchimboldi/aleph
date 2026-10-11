import {emptyProgress,validateProgress,eligible,reviewQueue,rateCard,ankiTsv,adaptiveEvidence} from './review-core.mjs';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
let appUser=null;
try { appUser=JSON.parse(localStorage.getItem('learning-studio-data-v2'))?.user; } catch {}
const learner=params.get('learner')||appUser?.id||'standalone';
const key='aleph-dbms-review-v1:'+learner;
const [deck,pack]=await Promise.all([fetch('cards.json').then(r=>{if(!r.ok)throw Error('Cards failed to load');return r.json()}),fetch('pack.json').then(r=>r.json())]);
let progress=emptyProgress();
try { const saved=localStorage.getItem(key);if(saved)progress=validateProgress(JSON.parse(saved),deck); } catch { $('#message').textContent='Saved progress could not be read. Export or restore a valid backup before continuing; no saved data has been overwritten.'; }
let revealed=false;
let generating=false;
const allCards=()=>[...deck,...progress.generatedCards];
const requested=Number(params.get('chapter'));
let target=Number.isInteger(requested)&&requested>=1&&requested<=8?requested:Array.from({length:8},(_,i)=>i+1).find(n=>!progress.completed.includes(n))||8;
function save(){ try{localStorage.setItem(key,JSON.stringify(progress));return true;}catch{$('#message').textContent='Browser storage is unavailable or full. Export a backup before closing this page.';return false;} }
function chapterOptions(){return pack.chapters.map(c=>`<option value="${c.number}">${c.number}. ${esc(c.title)}</option>`).join('')}
$('#learner').textContent='Learner: '+(learner===appUser?.id?(appUser.displayName||appUser.name||learner):learner==='standalone'?'this browser':learner);
$('#feedback-chapter').innerHTML=chapterOptions();
$('#feedback-chapter').value=target;
function render(){
 const available=eligible(progress.generatedCards,progress),due=available.filter(c=>progress.cards[c.id]?.due<=Date.now()).length,fresh=available.filter(c=>!progress.cards[c.id]).length;
 $('#dashboard').innerHTML=`<h2>Your next session</h2><p>${progress.completed.length}/8 chapters completed · ${due} cards due · ${fresh} generated cards not yet attempted</p><label>Study chapter <select id="target">${chapterOptions()}</select></label><div class="actions"><button id="start" class="primary" ${progress.activeSession||generating?'disabled':''}>${generating?'Generating and checking your review…':progress.completed.includes(1)?'Generate my session review':'Open chapter 1 — recall starts afterwards'}</button>${progress.activeSession?'<button id="resume">Resume review</button>':''}</div><p class="small">Write a short answer first. Your answers, ratings and feedback shape three new cards each session. Due cards return too, up to ten cards total. Only completed chapters are tested.</p><details><summary>Chapter completion</summary><p class="small">Mark a chapter complete after reading it, attempting its practice and checking the solutions. Completion enables questions on its concepts; it does not certify mastery.</p><div class="chapters">${pack.chapters.map(c=>`<label class="chapter"><input type="checkbox" data-chapter="${c.number}" ${progress.completed.includes(c.number)?'checked':''}>${c.number}. ${esc(c.title)}</label>`).join('')}</div></details>`;
 $('#target').value=target;$('#target').onchange=e=>{target=Number(e.target.value);$('#feedback-chapter').value=target};
 $('#start').onclick=start;$('#resume')?.addEventListener('click',showCard);
 document.querySelectorAll('[data-chapter]').forEach(input=>input.onchange=()=>{
  if(progress.activeSession||generating){input.checked=!input.checked;$('#message').textContent='Finish the current review before changing chapter completion.';return;}
  const n=Number(input.dataset.chapter);progress.completed=input.checked?[...new Set([...progress.completed,n])].sort((a,b)=>a-b):progress.completed.filter(x=>x!==n);
  save();render();
 });
 $('#history').innerHTML=progress.sessions.length?`<ul>${progress.sessions.slice(-8).reverse().map(s=>`<li>${esc(new Date(s.finished).toLocaleString())} · Chapter ${s.chapter} · ${s.reviewed} ratings${s.skipped?' · ended early':''}</li>`).join('')}</ul>`:'<p>No sessions completed yet.</p>';
 const weak=allCards().filter(c=>['again','hard'].includes(progress.cards[c.id]?.lastRating));
 if(weak.length)$('#history').innerHTML+=`<h3>Revisit these ideas</h3><p class="small">Your latest rating was Again or Hard. These are recall signals, not a test score.</p><ul>${weak.map(c=>`<li>Chapter ${c.chapter} · ${esc(c.recipe)}: ${esc(c.front)}</li>`).join('')}</ul>`;
 const latest=progress.generations.at(-1);
 if(latest)$('#history').innerHTML+=`<h3>Why this review was chosen</h3><p>${esc(latest.summary)}</p><ul>${latest.diagnoses.map(d=>`<li><strong>${esc(d.recipe)} · ${esc(d.status)}</strong>: ${esc(d.evidence)}<br>${esc(d.nextStep)}</li>`).join('')}</ul><p class="small">Automated diagnosis from your responses. Correct it in feedback if it misunderstood your reasoning.</p>`;
 if(progress.reviews.some(r=>r.answer))$('#history').innerHTML+=`<details><summary>Recent written responses</summary><ul>${progress.reviews.filter(r=>r.answer).slice(-10).reverse().map(r=>`<li><strong>${esc(r.recipe)} · ${esc(r.rating)}</strong><br>${esc(r.answer)}</li>`).join('')}</ul></details>`;
 $('#feedback-list').innerHTML=progress.feedback.length?`<h3>Saved notes (${progress.feedback.length})</h3><ul>${progress.feedback.slice(-10).reverse().map(f=>`<li><strong>Chapter ${f.chapter} · ${esc(f.type)}${f.reference?' · '+esc(f.reference):''}</strong><br>${esc(f.note)}<br><span class="small">${esc(new Date(f.time).toLocaleString())}</span></li>`).join('')}</ul>`:'';
}
function pdf(chapter){return `chapters/chapter-${String(chapter).padStart(2,'0')}-notes.pdf`}
async function start(){
 if(!progress.completed.includes(1)){location.href=pdf(1);return;}
 if(generating||progress.activeSession)return;
 generating=true;render();$('#message').textContent='Reading your responses and creating new checks…';
 let queue=reviewQueue(progress.generatedCards,progress,Date.now(),7);
 try {
  const response=await fetch('/api/dbms-review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(adaptiveEvidence(deck,progress)),signal:AbortSignal.timeout(115000)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Review generation failed.');
  if(!result.checked||!Array.isArray(result.cards)||result.cards.length!==3)throw Error('Generated review did not pass validation.');
  const candidate={...progress,generatedCards:[...progress.generatedCards,...result.cards]};validateProgress(candidate,deck);
  progress.generatedCards=candidate.generatedCards;
  progress.generations.push({time:Date.now(),summary:result.summary,diagnoses:result.diagnoses,cardIds:result.cards.map(c=>c.id),model:result.model});
  queue=[...queue,...result.cards];$('#message').textContent='New cards generated from your evidence and checked.';
 }catch(error){$('#message').textContent=(error.name==='TimeoutError'?'Generation timed out.':error.message)+(queue.length?' Reviewing previously generated cards instead.':' You can retry, or open the chapter PDF from the books page.');}
 finally{generating=false;}
 if(!queue.length){render();return;}
 progress.activeSession={id:crypto.randomUUID(),chapter:target,started:Date.now(),ids:queue.map(c=>c.id),index:0,reviewed:0,drafts:{}};save();render();showCard();
}
function showCard(){
 const session=progress.activeSession;if(!session)return;
 $('#review').hidden=false;revealed=false;
 if(session.index>=session.ids.length){finish(false);return;}
 const card=allCards().find(c=>c.id===session.ids[session.index]);
 $('#review').innerHTML=`<p class="eyebrow">Card ${session.index+1} of ${session.ids.length} · Chapter ${card.chapter} · ${esc(card.recipe)}</p><h2 class="prompt">${esc(card.front)}</h2><p class="small">${esc(card.reason||'Recall check')}</p><label>Your answer and reasoning<textarea id="response" maxlength="2000" rows="3" placeholder="A few words or a small calculation is enough.">${esc(session.drafts?.[card.id]||'')}</textarea></label><div class="actions"><button id="reveal" class="primary">Save response and show answer</button><button id="unknown">I don't know yet</button></div><div id="answer" class="answer" hidden>${esc(card.back)}<p><a href="${pdf(card.chapter)}" target="_blank" rel="noopener">Check chapter ${card.chapter}</a></p></div><div id="ratings" class="actions" hidden><button data-rate="again">Again · 1 min</button><button data-rate="hard">Hard</button><button data-rate="good">Good</button><button data-rate="easy">Easy</button></div><div class="actions"><button id="flag">Note a problem with this card</button><button id="end">End review and study</button></div>`;
 $('#response').oninput=()=>{session.drafts=session.drafts||{};session.drafts[card.id]=$('#response').value;save()};
 $('#reveal').onclick=()=>{const answer=$('#response').value.trim();if(!answer){$('#message').textContent='Write your answer, or choose “I don’t know yet”.';$('#response').focus();return;}session.drafts=session.drafts||{};session.drafts[card.id]=answer;save();revealed=true;$('#response').disabled=true;$('#answer').hidden=false;$('#ratings').hidden=false;$('#reveal').hidden=true;$('#unknown').hidden=true};
 $('#unknown').onclick=()=>{$('#response').value="I don't know yet";$('#reveal').click()};
 document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{
  if(!revealed)return;
  const now=Date.now(),rating=b.dataset.rate;
  progress.cards[card.id]=rateCard(progress.cards[card.id],rating,now);
  progress.reviews.push({cardId:card.id,chapter:card.chapter,recipe:card.recipe,answer:session.drafts?.[card.id]||'',rating,time:now,sessionId:session.id});
  session.index++;session.reviewed++;save();showCard();
 });
 $('#flag').onclick=()=>{$('#feedback-chapter').value=card.chapter;$('#feedback-reference').value=card.id;$('#feedback-note').focus()};
 $('#end').onclick=()=>finish(true);
 $('#review').scrollIntoView({behavior:'smooth',block:'start'});
}
function finish(skipped){
 const s=progress.activeSession;progress.sessions.push({id:s.id,chapter:s.chapter,started:s.started,finished:Date.now(),reviewed:s.reviewed,skipped});delete progress.activeSession;save();render();
 $('#review').hidden=false;$('#review').innerHTML=`<h2>${s.reviewed?'Recall saved.':'Ready to study.'}</h2><p>${s.reviewed} cards rated. Cards rated Again are due again after one minute; other cards return on their scheduled day.</p><div class="actions"><a class="primary" href="${pdf(s.chapter)}">Continue to chapter ${s.chapter}</a><button id="another">Review any cards now due</button></div><p>After studying, mark the chapter complete and record what was unclear or what improved.</p>`;
 $('#another').onclick=start;
}
$('#feedback-form').onsubmit=e=>{e.preventDefault();const note=$('#feedback-note').value.trim();if(!note)return;progress.feedback.push({id:crypto.randomUUID(),chapter:Number($('#feedback-chapter').value),type:$('#feedback-type').value,reference:$('#feedback-reference').value.trim(),note,time:Date.now(),sessionId:progress.activeSession?.id||null});save();$('#feedback-note').value='';render();$('#message').textContent='Feedback saved in this browser. Include it in your export to share it.'};
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('#export').onclick=()=>download('dbms-review-backup.json',JSON.stringify({learner,exportedAt:new Date().toISOString(),progress},null,2),'application/json');
$('#anki').onclick=()=>{if(!progress.generatedCards.length){$('#message').textContent='Generate your first session review before exporting cards.';return;}download('aleph-dbms-anki.tsv',ankiTsv(progress.generatedCards),'text/tab-separated-values')};
$('#import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>5*1024*1024)throw Error('Backup exceeds 5 MB.');const parsed=JSON.parse(await file.text());const restored=validateProgress(parsed.progress,deck);if(parsed.learner!==learner)throw Error('This backup belongs to a different learner. Open their review page to restore it.');if(!confirm('Replace this learner’s current review progress with the backup?'))return;progress=restored;save();render();$('#review').hidden=true;$('#message').textContent='Backup restored.';}catch(error){$('#message').textContent=error.message}finally{e.target.value=''}};
render();
if(progress.activeSession)showCard();
