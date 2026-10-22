import {escapeText as esc,math} from './core.mjs';

const paragraph=(label,value)=>value?`<p><strong>${esc(label)}</strong> ${math(value)}</p>`:'';
const list=values=>`<ul>${values.map(v=>`<li>${math(v)}</li>`).join('')}</ul>`;
const skillCards=skills=>skills.map(s=>`<article><h4>${esc(s.skill)} · ${esc(s.status)}</h4>${list(s.evidence)}<p>${math(s.explanation)}</p>${paragraph('Next step:',s.nextStep)}</article>`).join('');
export function renderFeedback(report){
  return `<h3>${esc(report.headline)}</h3><p>${math(report.overall)}</p><h3>Your answers, question by question</h3>${report.questions.map(q=>`<details><summary>${esc(q.id)} · ${esc(q.status)}</summary>${paragraph('Your work:',q.evidence)}${paragraph('What you got right:',q.whatYouGotRight)}${paragraph('What needs attention:',q.issue)}${paragraph('The mathematical idea:',q.teaching)}${paragraph('Try next:',q.nextStep)}</details>`).join('')}<h3>Specific mathematical skills</h3>${skillCards(report.specificSkills)}<h3>The bigger habits of mathematics</h3>${skillCards(report.higherLevelSkills)}<h3>How your understanding fits across days</h3>${(report.crossDayChecks||[]).map(c=>`<article><h4>${esc(c.skill)}</h4>${list(c.evidence.map(e=>`Day ${e.day} · ${e.id}: ${e.observation}`))}<p>${math(c.conclusion)}</p>${paragraph("What to check next:",c.nextCheck)}</article>`).join('')}<h3>Patterns across your submitted days</h3>${report.patterns.map(p=>`<article><h4>${esc(p.observation)}</h4>${list(p.evidence)}<p>${math(p.interpretation)}</p>${paragraph('How to check:',p.check)}</article>`).join('')}<h3>${esc(report.bigPictureLesson.title)}</h3><p>${math(report.bigPictureLesson.explanation)}</p><p class="answer">${math(report.bigPictureLesson.workedExample)}</p><p>${math(report.bigPictureLesson.connectionToYourWork)}</p><h3>What to work on next</h3><ol>${report.nextSteps.map(s=>`<li><strong>${esc(s.task)}</strong><p>${math(s.why)}</p>${paragraph('You will know it is working when:',s.successCriterion)}</li>`).join('')}</ol><p>${math(report.encouragement)}</p>${report.evidenceLimitations.length?'<h3>What we cannot conclude yet</h3>'+list(report.evidenceLimitations):''}<p class="small">AI tutor feedback on your submitted work. You can discuss or challenge any assessment with your tutor. This is not an overall ability score.</p>`;
}

export function createFeedbackPanel({element,learner,fetcher=fetch}){
  let activeDay=null,activeSubmitted=false,epoch=0,timer,started=false;
  const url=day=>`/api/math-diagnostic-feedback?learner=${encodeURIComponent(learner)}&day=${day}`;
  async function check(day,token){
    if(token!==epoch)return;
    try{
      const response=await fetcher(url(day),{cache:'no-store'});
      if(!response.ok)throw Error('Feedback could not be loaded.');
      const data=await response.json();if(token!==epoch)return;
      if(data.status==='ready'){
        element.innerHTML=`<h2>Feedback · Day ${day}</h2><p class="small">Updated ${esc(new Date(data.generatedAt).toLocaleString())}. Based on submitted work; unsubmitted draft changes are not included.</p>${renderFeedback(data.report)}`;return;
      }
      const messages={'queued':'Your feedback is queued. It will appear here when ready. You can leave this page and return later.','generating':'Your tutor feedback is being prepared. You can continue with your next session.','failed':'Your submission is safe. Feedback could not be prepared yet and will be retried.','not submitted':'Submit this day to receive feedback on your answers and reasoning.'};
      element.innerHTML=`<h2>Feedback · Day ${day}</h2><p role="status">${esc(messages[data.status]||'Checking feedback…')}</p>`;
      if(!started&&(data.status==='queued'||(data.status==='failed'&&data.retryAt<=Date.now()))){
        started=true;
        // Separate request: submitting/unlocking never waits for model generation.
        fetcher('/api/math-diagnostic-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learner,day})}).catch(()=>{}).finally(()=>{if(token===epoch){started=false;clearTimeout(timer);timer=setTimeout(()=>check(day,token),2000)}});
      }
      if(data.status!=='not submitted')timer=setTimeout(()=>check(day,token),10000);
    }catch{
      if(token!==epoch)return;
      element.innerHTML=`<h2>Feedback · Day ${day}</h2><p role="status">Feedback is temporarily unavailable. Your submitted work is safe. Retrying…</p>`;
      timer=setTimeout(()=>check(day,token),30000);
    }
  }
  return {open(day,{submitted=false}={}){
    if(day===activeDay&&submitted===activeSubmitted)return;
    activeDay=day;activeSubmitted=submitted;const token=++epoch;clearTimeout(timer);started=false;
    element.hidden=false;element.innerHTML=`<h2>Feedback · Day ${day}</h2><p>Checking feedback…</p>`;check(day,token);
  }};
}
