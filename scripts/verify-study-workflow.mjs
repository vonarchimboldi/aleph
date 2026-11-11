import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mutateTracker,trackerState,materialTrackerNotifications,checkTrackerReminders} from '../api/_material-tracker.js';
import {studyDigest,requireStudyAdmin} from '../api/_study-workflow.js';
import {mintStudyAdminToken} from './study-admin.mjs';
for(const k of ['KV_REST_API_URL','UPSTASH_REDIS_REST_URL','aleph_KV_REST_API_URL'])assert(!process.env[k],'Tests must not touch live KV.');
process.env.ALEPH_DIAGNOSTIC_MEMORY='1';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const learner='synthetic-study',initial=new Date('2026-11-09T13:00:00Z');let now=initial,revision=0;
let adminToken=mintStudyAdminToken(privateKey,learner,now.getTime());
async function action(input){const record=await mutateTracker({learner,expectedRevision:revision,...input},now,publicKey);revision=record.revision;return record;}
let record;
for(let i=1;i<=3;i++)record=await action({action:'assign',materialId:'synthetic-'+i,title:'Synthetic topic '+i,href:'/calculus-review/day-01.html',dueDate:'2026-11-09',minutes:90});
const ids=record.assignments.map(a=>a.id);
await assert.rejects(action({action:'study-start'}),e=>e.status===401);
await assert.rejects(action({action:'study-start',adminToken,startDate:'2026-11-08'}));
record=await action({action:'study-start',adminToken});assert.equal(record.study.endDate,'2026-11-22');assert.equal(record.assignments.length,3);
await assert.rejects(action({action:'reschedule',id:ids[0],dueDate:'2026-11-10'}),e=>e.status===401);
await assert.rejects(action({action:'cancel',id:ids[0],actor:'admin'}),e=>e.status===401);
await assert.rejects(action({action:'complete',id:ids[0]}),/Record time spent/);
const estimates=ids.map(assignmentId=>({assignmentId,minutes:90,confidence:3}));
const agreement={action:'study-accept',day:'2026-11-09',planVersion:1,termsAccepted:true,availableMinutes:300,purpose:'Practice prerequisite techniques to make the later problems possible.',startCue:'After breakfast I will sit at my desk and open the first lesson.',firstStep:'Attempt the first problem without looking at the worked answer.',estimates};
await assert.rejects(action({...agreement,availableMinutes:120}),/exceed available time/);
record=await action({action:'study-raise',day:'2026-11-09',assignmentId:ids[0],category:'question',problem:'I do not understand which hypotheses let us apply this theorem.',tried:'I read the theorem and tested it on the first two examples.',helpNeeded:'Please show which hypothesis is violated in the second example.'});
await assert.rejects(action(agreement),/unanswered question/);
await assert.rejects(action({action:'study-respond',id:record.study.issues[0].id,response:'Inspect the continuity hypothesis at the boundary point.'}),e=>e.status===401);
record=await action({action:'study-respond',id:record.study.issues[0].id,adminToken,response:'Inspect the continuity hypothesis at the boundary point.'});
record=await action(agreement);assert(record.study.plans[0].learnerAgreedAt);
await assert.rejects(action(agreement),e=>e.status===409);
record=await action({action:'study-log',assignmentId:ids[0],day:'2026-11-09',minutes:160,detail:'Solved questions one and two; checked the endpoint condition in question three.'});
record=await action({action:'complete',id:ids[0]});
record=await action({action:'study-request',assignmentId:ids[1],kind:'reschedule',newDueDate:'2026-11-10',reason:'The first lesson took 160 minutes; move this lesson tomorrow and leave only the planned third topic today.'});
const requestId=record.study.requests[0].id;assert.equal(record.assignments[1].dueDate,'2026-11-09');
await assert.rejects(action({action:'study-decide',id:requestId,decision:'approve',response:'Agreed; keep the final topic today and move this lesson tomorrow.'}),e=>e.status===401);
record=await action({action:'study-decide',adminToken,id:requestId,decision:'approve',response:'Agreed; keep the final topic today and move this lesson tomorrow.'});
assert.equal(record.assignments[1].dueDate,'2026-11-10');assert.equal(record.study.plans[0].version,2);assert(!record.study.plans[0].learnerAgreedAt);assert(record.study.plans[0].revisions[0].learnerAgreedAt);
const reflect={action:'study-reflect',day:'2026-11-09',workDone:'Solved the first two limit exercises and checked the theorem hypotheses in a third example.',easy:'Factoring the polynomial examples was straightforward; I could explain the cancellation.',hard:'The endpoint hypothesis was confusing until I tested it against the counterexample.',evidence:'I solved a fresh cancellation example without notes, but still need help on the endpoint case.',nextStep:'Write down each theorem hypothesis before applying it to a new problem.',mentorFeedback:'Please check whether my endpoint explanation is sufficient and point out the first incorrect step.',tomorrowProposal:'Start with the postponed second topic and reconsider the new day’s capacity before accepting it.',unfinished:ids.map(assignmentId=>({assignmentId,reason:'I ran out of time after the first topic took longer; the remaining questions still need work.'})),understanding:ids.map(assignmentId=>({assignmentId,score:3}))};
await assert.rejects(action({...reflect,easy:'ok'}),/specific explanation/);
record=await action({...reflect,resolvedAssignments:ids.map(id=>({id,completedAt:'2026-11-09T10:00:00Z'}))});
assert.equal(record.study.reflections[0].snapshot.find(a=>a.id===ids[2]).completedByDay,false,'Client cannot forge submission receipts');
record=await action({...reflect,hard:reflect.hard+' I need to practice a second counterexample.'});assert.equal(record.study.reflections[0].history.length,1);
record=await action({action:'study-reflection-feedback',day:'2026-11-09',adminToken,feedback:'Your example is correct, but the hypothesis explanation needs a precise statement about continuity.',nextAction:'Write a second example where continuity fails and explain why the theorem cannot be applied.'});
record=await action({action:'study-feedback-followup',day:'2026-11-09',whatChanged:'I wrote a discontinuous example and checked the boundary behavior explicitly.',evidence:'The function now skips the intermediate value; that isolates the missing continuity assumption.'});
assert(record.study.reflections[0].feedbackFollowup);
// A late change cannot erase yesterday's accepted commitments or the original plan.
now=new Date('2026-11-10T14:00:00Z');adminToken=mintStudyAdminToken(privateKey,learner,now.getTime());
record=await action({action:'study-request',assignmentId:ids[2],kind:'reschedule',newDueDate:'2026-11-11',reason:'I did not finish this yesterday; I need a fresh day to complete the remaining questions honestly.'});
record=await action({action:'study-decide',adminToken,id:record.study.requests.at(-1).id,decision:'approve',response:'Move it forward, but retain the original missed commitment in the weekly review.'});
let view=await trackerState(learner,now);assert.equal(view.study.days[0].assignments.length,2,'Deadline-time plan survives later edits');assert(view.study.days[0].assignments.some(a=>a.id===ids[2]));assert.equal(view.study.days[0].reflectionLate,false);assert.equal(view.study.days[0].uncommunicatedMisses,1,'Late rescheduling cannot erase a missed accepted commitment');
// Re-agree to today's new version, log a late completion and retain its date.
await action({action:'study-log',assignmentId:ids[2],day:'2026-11-10',minutes:30,detail:'Finished the remaining polynomial problem and explained the factorization step.'});
await action({action:'complete',id:ids[2]});
view=await trackerState(learner,now);assert(view.study.days[0].assignments.find(a=>a.id===ids[2]).late);
assert(studyDigest(record,view.assignments,now).some(line=>line.includes('Reflection: received')));
// Preparation is not a claim that the Sunday conversation already occurred.
const weekly={action:'study-weekly',weekEnd:'2026-11-15',assessment:'The first topic took nearly twice the expected time, which delayed the other review work.',strengths:'Polynomial manipulation was fluent and supported by independently solved examples.',weaknesses:'Theorem hypotheses remain a recurring gap in my written explanations.',estimationLessons:'Ninety minutes was too optimistic for unfamiliar proofs; use actual time from comparable sessions.',relationship:'Precise feedback on the first incorrect step helped more than a complete replacement solution.',nextWeekPlan:'Schedule fewer new topics and reserve one review session to fix the theorem-hypothesis gap.'};
record=await action(weekly);await assert.rejects(action({action:'study-weekly-review',adminToken,weekEnd:'2026-11-15',reviewMinutes:20,mentorFeedback:'Review the mismatch between the estimates and actual time.',agreedNextWeek:'Reduce new work and protect the daily communication habit.'}),/future conversation/);
now=new Date('2026-11-15T18:00:00Z');adminToken=mintStudyAdminToken(privateKey,learner,now.getTime());
record=await action({action:'study-weekly-review',adminToken,weekEnd:'2026-11-15',reviewMinutes:20,mentorFeedback:'Review the mismatch between the estimates and actual time.',agreedNextWeek:'Reduce new work and protect the daily communication habit.'});assert(record.study.weeklyReviews[0].reviewedAt);
assert.throws(()=>requireStudyAdmin({adminToken},'different-learner',now,publicKey),e=>e.status===401);
assert.throws(()=>requireStudyAdmin({adminToken},learner,new Date('2026-11-17T18:00:00Z'),publicKey),e=>e.status===401);
assert(!JSON.stringify(await trackerState(learner,now)).includes(adminToken));
console.log('PASS: purpose/capacity agreement, unanswered questions, estimates, actual work, no silent schedule edits, signed mentor decisions, required specific reflections, forged-receipt rejection, amendment history, late work/history preservation, weekly preparation versus held review, feedback follow-up and scoped expiring admin authorization. Synthetic records only.');

// A completed day still produces the daily reflection digest once email is configured.
const emailLearner='synthetic-study-email',dayOne=new Date('2026-11-09T13:00:00Z');let emailRevision=0;
const emailToken=mintStudyAdminToken(privateKey,emailLearner,dayOne.getTime());
async function emailAction(input){const r=await mutateTracker({learner:emailLearner,expectedRevision:emailRevision,...input},dayOne,publicKey);emailRevision=r.revision;return r;}
let e=await emailAction({action:'assign',materialId:'synthetic-email-topic',title:'Synthetic finished topic',href:'/calculus-review/day-01.html',dueDate:'2026-11-09',minutes:90});const eid=e.assignments[0].id;
await emailAction({action:'study-start',adminToken:emailToken});await emailAction({action:'study-log',assignmentId:eid,day:'2026-11-09',minutes:95,detail:'Completed the independent exercise and checked the solution against the theorem hypotheses.'});await emailAction({action:'complete',id:eid});
await emailAction({...reflect,unfinished:[],understanding:[{assignmentId:eid,score:4}]});
const payload=JSON.stringify({purpose:'aleph-material-tracker-config-v1',learner:emailLearner,expectedRevision:emailRevision,email:'test@example.invalid',enabled:true,expiresAt:dayOne.getTime()+60000});
await emailAction({action:'configure',payload,signature:sign(null,Buffer.from(payload),privateKey).toString('base64')});
let sent=0;const options={now:new Date('2026-11-10T13:00:00Z'),env:{RESEND_API_KEY:'mock',FROM_EMAIL:'test@example.invalid',CRON_SECRET:'mock'},fetcher:async(url,request)=>{sent++;const body=JSON.parse(request.body);assert(body.text.includes('Easy:'));assert(body.text.includes('Hard:'));assert(body.text.includes('Feedback requested:'));assert(body.subject.includes('daily study update'));return {ok:true,json:async()=>({id:'synthetic-digest'})};}};
await checkTrackerReminders(options);await checkTrackerReminders(options);assert.equal(sent,1);
console.log('PASS: completed-day reflection digest with actual work, easy/hard and mentor feedback needs; durable once-daily delivery. Mock email only.');

// Short no-change answers are valid; substantive reflection fields remain detailed.
const currentEmail=await trackerState(emailLearner,dayOne);emailRevision=currentEmail.revision;
await assert.rejects(emailAction({...reflect,easy:'Easy',nextStep:'Nothing.',tomorrowProposal:'No change.',unfinished:[],understanding:[{assignmentId:eid,score:4}]}),/specific explanation/);
const amended=await emailAction({...reflect,nextStep:'Nothing.',tomorrowProposal:'No change.',unfinished:[],understanding:[{assignmentId:eid,score:4}]});
assert.equal(amended.study.reflections[0].nextStep,'Nothing.');assert.equal(amended.study.reflections[0].tomorrowProposal,'No change.');assert.equal(amended.study.reflections[0].history.length,1);
console.log('PASS: concise no-change answers submit; easy/hard and other substantive fields retain detailed validation and prior check-ins remain in history.');
