import {randomUUID,verify} from 'node:crypto';
const ZONE='America/Toronto';
const failure=(message,status=400)=>Object.assign(Error(message),{status});
export const studyDay=now=>new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
const stamp=now=>new Date(now).toISOString();
function words(value,label,min=20,max=4000){if(typeof value!=='string'||value.trim().length<min||value.length>max)throw failure(`${label}: give a specific explanation (${min}–${max} characters).`);return value.trim();}
function minutes(value,label,max=900,min=0){if(!Number.isInteger(value)||value<min||value>max)throw failure(`${label} must be ${min}–${max} whole minutes.`);return value;}
function rating(value,label){if(!Number.isInteger(value)||value<1||value>5)throw failure(label+' must be a whole number from 1 to 5.');return value;}
function validDay(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T12:00:00Z'))||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw failure('Choose a valid date.');return value;}
const plusDays=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
export function requireStudyAdmin(input,learner,now,publicKey){
 try{const [payload,signature,...extra]=String(input.adminToken||'').split('.');if(extra.length||!payload||!signature)throw Error();const raw=Buffer.from(payload,'base64url');if(!verify(null,raw,publicKey,Buffer.from(signature,'base64url')))throw Error();const grant=JSON.parse(raw);const time=new Date(now).getTime();if(grant.purpose!=='aleph-study-admin-v1'||grant.learner!==learner||!Number.isFinite(grant.issuedAt)||!Number.isFinite(grant.expiresAt)||grant.issuedAt>time||grant.expiresAt<=time||grant.expiresAt-grant.issuedAt>86400000)throw Error();return true;}catch{throw failure('Authorize admin actions with a valid admin access file.',401);}
}
export const isStudyAction=action=>typeof action==='string'&&action.startsWith('study-');
function assignmentsFor(record,day){return record.assignments.filter(a=>!a.cancelledAt&&a.dueDate===day).map(a=>({id:a.id,materialId:a.materialId,title:a.title,subject:a.subject,minutes:a.minutes,dueDate:a.dueDate,scope:a.scope||'Complete the published material'}));}
function newPlan(record,day,now){return {day,version:1,assignments:assignmentsFor(record,day),proposedAt:stamp(now),adminAgreedAt:stamp(now),learnerAgreedAt:null,estimates:[],revisions:[]};}
function asOfPlan(s,day,today){const p=s.plans.find(p=>p.day===day);if(!p||day>=today)return p;return [...p.revisions,p].filter(r=>studyDay(r.proposedAt)<=day).sort((a,b)=>b.version-a.version)[0]||null;}
export function syncStudyPlans(record,now,reason='Admin changed the plan'){
 const s=record.study;if(!s)return;
 for(let day=s.startDate;day<=s.endDate;day=plusDays(day,1)){
  const items=assignmentsFor(record,day);let p=s.plans.find(p=>p.day===day);
  if(!p){if(items.length)s.plans.push(newPlan(record,day,now));continue;}
  if(JSON.stringify(items)!==JSON.stringify(p.assignments)){
   const {revisions,...snapshot}=p;p.revisions.push({...snapshot,changedAt:stamp(now),changeReason:reason});p.version++;p.assignments=items;p.proposedAt=stamp(now);p.adminAgreedAt=stamp(now);p.learnerAgreedAt=null;p.estimates=[];
  }
 }
}
export function guardStudyMutation(record,input,now,publicKey){
 if(!record.study)return;
 if(['assign','reschedule','cancel'].includes(input.action)){requireStudyAdmin(input,record.learner,now,publicKey);words(input.reason,'Reason for changing the plan');}
 if(input.action==='complete'){
  const logs=record.study.logs.filter(l=>l.assignmentId===input.id&&l.minutes>0);
  if(!logs.length)throw failure('Record time spent and specific work done before marking this assignment complete.');
 }
}
function range(s,day,now,{future=false}={}){validDay(day);if(day<s.startDate||day>s.endDate)throw failure('Choose a day in the two-week agreement.');if(!future&&day>studyDay(now))throw failure('A future day cannot be reported as already completed.');return day;}
function item(record,id){const a=record.assignments.find(a=>a.id===id&&!a.cancelledAt);if(!a)throw failure('Assignment not found.',404);return a;}
function audit(s,type,now,detail){s.events.push({id:randomUUID(),type,at:stamp(now),...detail});}
function saveVersion(list,record,match){const old=list.find(match);if(old){const {history,...snapshot}=old;Object.assign(old,record,{version:old.version+1,history:[...(old.history||[]),snapshot]});return old;}const next={...record,version:1,history:[]};list.push(next);return next;}
export function applyStudyAction(record,input,now,publicKey){
 const at=stamp(now),today=studyDay(now),{action}=input;
 if(action==='study-start'){
  requireStudyAdmin(input,record.learner,now,publicKey);if(record.study)throw failure('A study agreement already exists.',409);
  const startDate=validDay(input.startDate||today);if(startDate<today)throw failure('The agreement cannot create retrospective obligations.');
  record.study={version:'1',startDate,endDate:plusDays(startDate,13),startedAt:at,termsAcceptedAt:null,plans:[],issues:[],requests:[],logs:[],reflections:[],weeklyReviews:[],commitments:[],events:[]};syncStudyPlans(record,now,'Two-week trial begins');audit(record.study,action,now,{startDate});return;
 }
 const s=record.study;if(!s)throw failure('The two-week study agreement has not started.',409);
 if(action==='study-accept'){
  const day=range(s,input.day,now,{future:true});const p=s.plans.find(p=>p.day===day);if(!p||!p.assignments.length)throw failure('No proposed assignments for that day.');
  if(day<today)throw failure('Past plans cannot be retroactively accepted. Submit an honest late check-in instead.');
  if(p.learnerAgreedAt)throw failure('This plan is already accepted. Request a change to revise it.',409);
  if(input.planVersion!==p.version)throw failure('The proposed plan changed. Review it before agreeing.',409);
  if(input.termsAccepted!==true)throw failure('Confirm that you understand the agreement.');
  if(s.issues.some(i=>i.day===day&&i.category==='question'&&!i.response))throw failure('An unanswered question is still open. Discuss it before agreeing.');
  const availableMinutes=minutes(input.availableMinutes,'Available study time',900,1);
  const estimates=p.assignments.map(a=>{const e=input.estimates?.find(e=>e.assignmentId===a.id);if(!e)throw failure('Estimate the time for every assignment.');return {assignmentId:a.id,minutes:minutes(e.minutes,'Time estimate',480,1),confidence:rating(e.confidence,'Predicted understanding')};});
  if(estimates.reduce((n,e)=>n+e.minutes,0)>availableMinutes)throw failure('Your estimates exceed available time. Report the workload problem before committing.');
  Object.assign(p,{availableMinutes,estimates,purpose:words(input.purpose,'Explain the purpose in your own words'),startCue:words(input.startCue,'When and where will you start?',15,1000),firstStep:words(input.firstStep,'First concrete action',15,1000),learnerAgreedAt:at});s.termsAcceptedAt ||= at;s.commitments ||= [];for(const a of p.assignments)s.commitments.push({assignmentId:a.id,dueDate:day,agreedAt:at,minutes:a.minutes,planVersion:p.version});audit(s,action,now,{day,planVersion:p.version});
 }else if(action==='study-raise'){
  const day=range(s,input.day,now,{future:true});if(!['question','workload','blocker','feedback'].includes(input.category))throw failure('Choose a problem category.');
  const a=input.assignmentId?item(record,input.assignmentId):null;
  const issue={id:randomUUID(),day,assignmentId:a?.id||null,category:input.category,createdAt:at,problem:words(input.problem,'What exactly is unclear or difficult?'),tried:words(input.tried,'What have you tried or checked?'),helpNeeded:words(input.helpNeeded,'What response or feedback do you need?'),response:null};
  s.issues.push(issue);audit(s,action,now,{id:issue.id,day});
 }else if(action==='study-respond'){
  requireStudyAdmin(input,record.learner,now,publicKey);const issue=s.issues.find(i=>i.id===input.id);if(!issue)throw failure('Question or problem report not found.',404);
  if(issue.response)throw failure('This report has already been answered.',409);
  issue.response={at,text:words(input.response,'Mentor response')};audit(s,action,now,{id:issue.id});
 }else if(action==='study-request'){
  const a=item(record,input.assignmentId);if(s.requests.some(r=>r.assignmentId===a.id&&r.status==='pending'))throw failure('An open change request already exists for this assignment.',409);
  if(!['reschedule','reduce','cancel'].includes(input.kind))throw failure('Choose a change type.');
  const proposedDate=input.kind==='reschedule'?range(s,input.newDueDate,now,{future:true}):a.dueDate;if(input.kind==='reschedule'&&proposedDate===a.dueDate)throw failure('Choose a different date for a reschedule.');
  if(input.kind==='reschedule'&&proposedDate<today)throw failure('Choose today or a future date.');
  const proposedMinutes=input.kind==='reduce'?minutes(input.newMinutes,'Requested session length',480,1):a.minutes;
  if(input.kind==='reduce'&&proposedMinutes>=a.minutes)throw failure('A reduction must be shorter than the current session.');
  const proposedScope=input.kind==='reduce'?words(input.scope,'Specify the reduced scope: what is included and what remains'):a.scope||'Complete the published material';
  const r={id:randomUUID(),proposedScope,assignmentId:a.id,title:a.title,kind:input.kind,originalDueDate:a.dueDate,originalMinutes:a.minutes,newDueDate:proposedDate,newMinutes:proposedMinutes,reason:words(input.reason,'Why is this change needed and what is your proposed trade-off?'),createdAt:at,status:'pending'};s.requests.push(r);audit(s,action,now,{id:r.id});
 }else if(action==='study-decide'){
  requireStudyAdmin(input,record.learner,now,publicKey);const r=s.requests.find(r=>r.id===input.id&&r.status==='pending');if(!r)throw failure('Pending change request not found.',409);
  if(!['approve','reject'].includes(input.decision))throw failure('Choose approve or reject.');
  const response=words(input.response,'Decision and feedback');
  if(input.decision==='approve'){
   const a=item(record,r.assignmentId);if(a.dueDate!==r.originalDueDate||a.minutes!==r.originalMinutes)throw failure('The assignment changed since this request. Reject it and request an updated proposal.',409);
   if(r.kind!=='cancel'&&record.assignments.some(other=>other.id!==a.id&&!other.cancelledAt&&other.materialId===a.materialId&&other.dueDate===r.newDueDate))throw failure('This would duplicate an assignment on the requested day.',409);
   for(const c of s.commitments||[])if(c.assignmentId===a.id&&c.dueDate===a.dueDate&&!c.releasedAt){c.releasedAt=at;c.releaseReason=r.reason;}
   a.originalDueDate ||= a.dueDate;if(r.kind==='cancel')a.cancelledAt=at;else{a.dueDate=r.newDueDate;a.minutes=r.newMinutes;a.scope=r.proposedScope;}a.updatedAt=at;
   syncStudyPlans(record,now,'Approved change: '+r.reason);
  }
  Object.assign(r,{status:input.decision==='approve'?'approved':'rejected',decidedAt:at,response});audit(s,action,now,{id:r.id,decision:r.status});
 }else if(action==='study-log'){
  const a=item(record,input.assignmentId),day=range(s,input.day,now),spent=minutes(input.minutes,'Actual time',720);
  const detail=spent?words(input.detail,'Name the questions, steps, or concepts you actually worked on'):String(input.detail||'').slice(0,4000);
  const others=s.logs.filter(l=>l.day===day&&l.assignmentId!==a.id).reduce((n,l)=>n+l.minutes,0);if(others+spent>1440)throw failure('Daily work logs cannot exceed 24 hours.');
  saveVersion(s.logs,{assignmentId:a.id,day,minutes:spent,detail,recordedAt:at},l=>l.assignmentId===a.id&&l.day===day);audit(s,action,now,{assignmentId:a.id,day});
 }else if(action==='study-reflect'){
  const day=range(s,input.day,now),p=asOfPlan(s,day,today);if(!p?.assignments.length&&!s.logs.some(l=>l.day===day))throw failure('No planned or logged work for this day.');
  const snapshot=(p?.assignments||[]).map(a=>{
   const assignment=record.assignments.find(x=>x.id===a.id);const completion=input.resolvedAssignments?.find(x=>x.id===a.id)?.completedAt;
   const completedByDay=Boolean(completion&&studyDay(completion)<=day);const log=s.logs.find(l=>l.day===day&&l.assignmentId===a.id);
   const reason=completedByDay?'':words(input.unfinished?.find(x=>x.assignmentId===a.id)?.reason,'Explain the unfinished work: '+a.title);
   if(completedByDay&&!log?.minutes)throw failure('Record actual time for completed work before submitting the check-in.');
   const understanding=rating(input.understanding?.find(x=>x.assignmentId===a.id)?.score,'Understanding after work');
   return {...a,understanding,completedByDay,completedAt:completion||null,actualMinutes:log?.minutes||0,workDone:log?.detail||'',unfinishedReason:reason,cancelledAt:assignment?.cancelledAt||null};
  });
  const previous=s.reflections.find(r=>r.day===day);
  const reflection={...(previous?.mentorResponse?{mentorResponse:previous.mentorResponse}:{}),...(previous?.feedbackFollowup?{feedbackFollowup:previous.feedbackFollowup}:{}),day,submittedAt:at,planVersion:p?.version||null,snapshot,workDone:words(input.workDone,'What did you do? Give a concrete example.',30),easy:words(input.easy,'What felt easy, and what evidence shows you understood it?'),hard:words(input.hard,'Where exactly did you struggle? What did you try?'),evidence:words(input.evidence,'What can you now explain or solve without help?'),nextStep:words(input.nextStep,'What will you do differently next time?'),mentorFeedback:words(input.mentorFeedback,'What specific feedback do you want from your mentor?'),tomorrowProposal:words(input.tomorrowProposal,'What should stay or change in tomorrow’s plan?')};
  saveVersion(s.reflections,reflection,r=>r.day===day);audit(s,action,now,{day});
 }else if(action==='study-reflection-feedback'){
  requireStudyAdmin(input,record.learner,now,publicKey);const r=s.reflections.find(r=>r.day===input.day);if(!r)throw failure('Daily reflection not found.',404);if(r.mentorResponse)throw failure('Feedback has already been supplied for this reflection.',409);
  r.mentorResponse={at,reflectionVersion:r.version,feedback:words(input.feedback,'Specific mentor feedback'),nextAction:words(input.nextAction,'Agreed action to try')};audit(s,action,now,{day:r.day});
 }else if(action==='study-feedback-followup'){
  const r=s.reflections.find(r=>r.day===input.day);if(!r?.mentorResponse)throw failure('No mentor feedback to respond to.');if(r.feedbackFollowup)throw failure('This feedback follow-up is already recorded.',409);
  r.feedbackFollowup={at,whatChanged:words(input.whatChanged,'How did you use the feedback?'),evidence:words(input.evidence,'What happened when you tried it?')};audit(s,action,now,{day:r.day});
 }else if(action==='study-weekly'){
  const weekEnd=range(s,input.weekEnd,now,{future:true});if(new Date(weekEnd+'T12:00:00Z').getUTCDay()!==0)throw failure('Choose the Sunday review date.');
  const previous=s.weeklyReviews.find(w=>w.weekEnd===weekEnd);if(previous?.reviewedAt)throw failure('This review is already held. Its agreed record cannot be overwritten.',409);
  saveVersion(s.weeklyReviews,{weekEnd,preparedAt:at,assessment:words(input.assessment,'Assess the week with examples',30),strengths:words(input.strengths,'Strengths: cite specific evidence'),weaknesses:words(input.weaknesses,'Gaps: cite specific evidence'),estimationLessons:words(input.estimationLessons,'Compare estimates with actual time'),relationship:words(input.relationship,'What mentor support helped or needs to change?'),nextWeekPlan:words(input.nextWeekPlan,'Propose next week’s priorities and realistic workload',30)},r=>r.weekEnd===weekEnd);audit(s,action,now,{weekEnd});
 }else if(action==='study-weekly-review'){
  requireStudyAdmin(input,record.learner,now,publicKey);const review=s.weeklyReviews.find(w=>w.weekEnd===input.weekEnd);if(!review)throw failure('The learner must prepare the review first.');if(input.weekEnd>today)throw failure('A future conversation cannot be recorded as held.');if(review.reviewedAt)throw failure('This review is already recorded.',409);
  Object.assign(review,{reviewedAt:at,mentorFeedback:words(input.mentorFeedback,'Mentor feedback'),agreedNextWeek:words(input.agreedNextWeek,'Agreed next steps'),reviewMinutes:minutes(input.reviewMinutes,'Review duration',120,1)});audit(s,action,now,{weekEnd:review.weekEnd});
 }else throw failure('Unknown study action.');
 s.updatedAt=at;
}
function communicated(s,id,dueDate){const records=[...s.issues.filter(i=>['workload','blocker'].includes(i.category)&&(i.assignmentId===id||(!i.assignmentId&&i.day===dueDate))),...s.requests.filter(r=>r.assignmentId===id)];return records.some(r=>studyDay(r.createdAt)<=dueDate)?'before-deadline':records.length?'after-deadline':'none';}
export function studyView(record,resolved,now){
 const s=record.study;if(!s)return null;const today=studyDay(now);
 const days=[];
 for(let day=s.startDate;day<=s.endDate;day=plusDays(day,1)){
  const p=asOfPlan(s,day,today),reflection=s.reflections.find(r=>r.day===day),logs=s.logs.filter(l=>l.day===day);
  const metrics=(p?.assignments||[]).map(a=>{const current=resolved.find(x=>x.id===a.id),done=current?.completedAt;return {...a,estimateMinutes:p.estimates.find(e=>e.assignmentId===a.id)?.minutes??a.minutes,predictedUnderstanding:p.estimates.find(e=>e.assignmentId===a.id)?.confidence||null,assessedUnderstanding:reflection?.snapshot.find(x=>x.id===a.id)?.understanding||null,actualMinutes:s.logs.filter(l=>l.assignmentId===a.id).reduce((n,l)=>n+l.minutes,0),completedAt:done||null,late:Boolean(done&&studyDay(done)>day),communication:communicated(s,a.id,day)};});
  const accepted=a=>(s.commitments||[]).some(c=>c.assignmentId===a.id&&c.dueDate===day&&studyDay(c.agreedAt)<=day&&(!c.releasedAt||studyDay(c.releasedAt)>day));
  days.push({day,plan:p||null,assignments:metrics,loggedMinutes:logs.reduce((n,l)=>n+l.minutes,0),reflectionSubmittedAt:reflection?.submittedAt||null,reflectionLate:Boolean(reflection&&studyDay(reflection.history?.[0]?.submittedAt||reflection.submittedAt)>day),missingCheckIn:day<today&&Boolean(p?.assignments.length)&&!reflection,uncommunicatedMisses:day<today?metrics.filter(a=>accepted(a)&&(!a.completedAt||a.late)&&a.communication!=='before-deadline').length:0});
 }
 const sundays=days.filter(d=>new Date(d.day+'T12:00:00Z').getUTCDay()===0).map(d=>({day:d.day,review:s.weeklyReviews.find(w=>w.weekEnd===d.day)||null}));
 return {...s,days,sundays,summary:{uncommunicatedMisses:days.reduce((n,d)=>n+d.uncommunicatedMisses,0),missingCheckIns:days.filter(d=>d.missingCheckIn).length,lateCompletions:days.flatMap(d=>d.assignments).filter(a=>a.late).length,pendingChanges:s.requests.filter(r=>r.status==='pending').length,unansweredIssues:s.issues.filter(i=>!i.response).length}};
}
export function studyNotifications(record,resolved,viewer,now,precomputed=null){
 const s=precomputed||studyView(record,resolved,now);if(!s)return [];const admin=viewer==='user-reviewer',today=studyDay(now),notes=[];
 const push=(id,version,title,description,generatedAt)=>notes.push({id,version,type:'study-workflow',title,description,href:'/',generatedAt});
 const todayPlan=s.days.find(d=>d.day===today)?.plan;
 if(!admin&&todayPlan?.assignments.length&&!todayPlan.learnerAgreedAt)push('study-agree-'+today,String(todayPlan.version),'Review and agree on today’s plan','Check the workload, estimate your time, explain the purpose and ask questions before committing.',todayPlan.proposedAt);
 for(const d of s.days.filter(d=>d.missingCheckIn))push('study-checkin-'+d.day,'1','Missing daily reflection: '+d.day,'Report the work, actual time, what was easy or hard, and proposed changes. A late check-in stays labelled late.',record.study.startedAt);
 if(!admin&&todayPlan?.assignments.length&&!s.reflections.some(r=>r.day===today)&&Number(new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,hour:'2-digit',hourCycle:'h23'}).format(new Date(now)))>=21)push('study-evening-'+today,'1','Time for your daily reflection','Spend five minutes reviewing your work and asking for specific feedback.',todayPlan.proposedAt);
 if(!admin)for(const a of resolved.filter(a=>!a.completedAt&&!a.cancelledAt)){const spent=s.logs.filter(l=>l.assignmentId===a.id).reduce((n,l)=>n+l.minutes,0),p=s.plans.find(p=>p.day===a.dueDate),estimate=p?.estimates.find(e=>e.assignmentId===a.id)?.minutes||a.minutes;if(spent>=estimate)push('study-estimate-'+a.id,a.dueDate,'Your time estimate has been reached',a.title+': report the exact difficulty and a proposed next step if you cannot finish as planned.',s.logs.filter(l=>l.assignmentId===a.id).at(-1)?.recordedAt||s.startedAt);}
 if(admin){
  for(const r of s.reflections.filter(r=>r.feedbackFollowup))push('study-followup-'+r.day,'1','Feedback follow-up received: '+r.day,'The learner recorded how she used your feedback and what happened.',r.feedbackFollowup.at);
  for(const w of s.weeklyReviews)push('study-prepared-'+w.weekEnd,String(w.version),'Sunday review prepared: '+w.weekEnd,'Read the learner’s assessment, evidence, timing lessons and next-week proposal.',w.preparedAt);
  for(const issue of s.issues.filter(i=>!i.response))push('study-issue-'+issue.id,'1','Learner raised a '+issue.category,'A specific difficulty and feedback request is waiting in the study agreement.',issue.createdAt);
  for(const r of s.requests.filter(r=>r.status==='pending'))push('study-change-'+r.id,'1','Schedule change needs approval','Review the proposed change and reason. The existing assignment date is still in effect.',r.createdAt);
  for(const r of s.reflections)push('study-reflection-'+r.day,String(r.version),'Daily reflection received: '+r.day,'Review planned versus completed work, actual time, understanding and feedback needs.',r.submittedAt);
 }else{
  for(const r of s.requests.filter(r=>r.status!=='pending'))push('study-decision-'+r.id,'1','Schedule request '+r.status,'Read your mentor’s response and review the updated plan.',r.decidedAt);
  for(const r of s.reflections.filter(r=>r.mentorResponse))push('study-feedback-'+r.day,'1','Mentor feedback on your daily reflection','Read the specific feedback, try the next action, and record what happened.',r.mentorResponse.at);
  for(const i of s.issues.filter(i=>i.response))push('study-answer-'+i.id,'1','Mentor replied to your '+i.category,'Read the feedback in your problem report and decide your next action.',i.response.at);
 }
 for(const sunday of s.sundays)if(sunday.day<=today&&!sunday.review?.reviewedAt)push('study-sunday-'+sunday.day,'1','Sunday review: '+sunday.day,'Prepare your own assessment, evidence of strengths and gaps, and next week’s proposal. Review together for 15–20 minutes.',record.study.startedAt);
 return notes;
}
export function studyDigest(record,resolved,now){
 const s=studyView(record,resolved,now);if(!s)return [];
 const yesterday=plusDays(studyDay(now),-1);if(yesterday<s.startDate||yesterday>s.endDate)return [];
 const reflection=s.reflections.find(r=>r.day===yesterday),day=s.days.find(d=>d.day===yesterday);
 if(!day?.assignments.length&&!reflection)return [];
 return ['',`Study check-in for ${yesterday}`,`Reflection: ${reflection?'received'+(day.reflectionLate?' late':''):'not submitted'}`,`Reported time: ${day.loggedMinutes} minutes`,`Missed commitments without prior communication: ${day.uncommunicatedMisses}`,...(reflection?[`Work done: ${reflection.workDone}`,`Easy: ${reflection.easy}`,`Hard: ${reflection.hard}`,`Evidence of understanding: ${reflection.evidence}`,`Next action: ${reflection.nextStep}`,`Feedback requested: ${reflection.mentorFeedback}`,`Tomorrow’s proposal: ${reflection.tomorrowProposal}`]:[]),'Reported completion and time are learner reports, not independently verified mastery.'];
}
