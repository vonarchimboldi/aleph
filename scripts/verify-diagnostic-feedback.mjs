import assert from 'node:assert/strict';
import {saveDay,loadProgress} from '../api/_math-diagnostic-store.js';
import {feedbackStatus,processFeedback,drainFeedback,feedbackVersion} from '../api/_diagnostic-feedback.js';
import {buildFeedbackInput,generateDiagnosticReport,loadRubric,reportSchema,validateReport,generationSchema} from '../api/_diagnostic-feedback-model.js';
import handler from '../api/math-diagnostic-feedback.js';
import cron from '../api/cron/diagnostic-feedback.js';
import {renderFeedback} from '../math-diagnostic/feedback.mjs';

process.env.ALEPH_DIAGNOSTIC_MEMORY='1';
const learner='feedback-test-'+Date.now();
const data=answer=>({answers:{'A1-1':{answer,confidence:'3 — sure'}},selected:[],notes:''});
const day1=await loadRubric(1);
function reportFor(ids){return {headline:'Your work',overall:'You preserved the zero case.',encouragement:'Build on that check.',evidenceLimitations:['Unanswered items need a separate check.'],questions:ids.map(id=>({id,status:'unclear',evidence:'No readable work for this item.',whatYouGotRight:'',issue:'Evidence is incomplete.',teaching:'Check each operation preserves the solution set.',nextStep:'Explain your first step.',skill:id.split('-')[0]})),specificSkills:[{skill:"domain checks",status:"needs checking",evidence:["A1-1"],explanation:"Check the zero case.",nextStep:"Explain cancellation."}],higherLevelSkills:[{skill:"preserving equivalence",status:"needs checking",evidence:["A1-1"],explanation:"Operations need conditions.",nextStep:"Give a counterexample."}],patterns:[],crossDayChecks:[],bigPictureLesson:{title:'Preserving solutions',explanation:'Check conditions before dividing.',workedExample:'x²=x has roots 0 and 1.',connectionToYourWork:'Cancellation needs a zero check.'},nextSteps:[{priority:'1',task:'Explain cancellation.',why:'Preserve the zero case.',successCriterion:'State the excluded value.'}]}}
const fake=async record=>({report:reportFor((await loadRubric(record.day)).core.concat(record.submitted.selected)),model:'test-only'});
assert.equal((await feedbackStatus(learner,1)).status,'not submitted');
let submitted=await saveDay({learner,day:1,expectedRevision:0,action:'submit',data:data('x²=x: zero must be considered.')});
assert.equal((await feedbackStatus(learner,1)).status,'queued');
let calls=0;await processFeedback(learner,1,{generate:async(...args)=>{calls++;return fake(...args)}});
assert.equal((await feedbackStatus(learner,1)).status,'ready');
await processFeedback(learner,1,{generate:async()=>{calls++;throw Error('must not run')}});assert.equal(calls,1);
const version=feedbackVersion((await loadProgress(learner)).records);
submitted=await saveDay({learner,day:1,expectedRevision:submitted.revision,data:data('Unsaved-to-submission edit')});
assert.equal(feedbackVersion((await loadProgress(learner)).records),version);
assert.equal((await feedbackStatus(learner,1)).status,'ready');
submitted=await saveDay({learner,day:1,expectedRevision:submitted.revision,action:'submit',data:data('Corrected submission')});
assert.equal((await feedbackStatus(learner,1)).status,'queued');

let release,entered;const begun=new Promise(resolve=>entered=resolve),hold=new Promise(resolve=>release=resolve);
const running=processFeedback(learner,1,{generate:async(...args)=>{entered();await hold;return fake(...args)}});await begun;
assert.equal((await processFeedback(learner,1,{generate:()=>assert.fail('duplicate generation')})).status,'generating');
submitted=await saveDay({learner,day:1,expectedRevision:submitted.revision,action:'submit',data:data('Newer submitted evidence')});
release();assert.equal((await running).status,'queued');assert.equal((await feedbackStatus(learner,1)).status,'queued');
await processFeedback(learner,1,{generate:async()=>{throw Error('Provider unavailable')}});
assert.equal((await feedbackStatus(learner,1)).status,'failed');
assert.equal((await processFeedback(learner,1,{generate:()=>assert.fail('backoff not honored')})).status,'failed');
await processFeedback(learner,1,{generate:fake,now:()=>Date.now()+180000});
assert.equal((await feedbackStatus(learner,1)).status,'ready');

const pdf='data:application/pdf;base64,'+Buffer.from('%PDF-1.4\nTest\n%%EOF').toString('base64');
submitted=await saveDay({learner,day:1,expectedRevision:submitted.revision,action:'submit',data:data('Check PDF'),file:{name:'work.pdf',dataUrl:pdf}});
let attached=false;await processFeedback(learner,1,{generate:async(record,records,attachment)=>{attached=attachment?.dataUrl===pdf;const input=await buildFeedbackInput(record,records,attachment);assert(input.content.some(c=>c.type==='input_file'&&c.file_data===pdf));assert.equal(input.ids.length,8);return fake(record)}});assert(attached);
await saveDay({learner,day:2,expectedRevision:0,action:'submit',data:{answers:{'A1-3':{answer:'No solution, x≠3'}},selected:[]}});
assert.equal((await feedbackStatus(learner,1)).status,'queued','new day invalidates cumulative report');
const backfill=await drainFeedback({generate:fake,limit:3});assert.equal(backfill.length,2);assert(backfill.every(r=>r.status==='ready'));

const sample=reportFor(day1.core),allowed=new Set(day1.core);
assert.equal(validateReport(sample,day1.core,allowed),sample);
assert.throws(()=>validateReport({...sample,questions:sample.questions.slice(1)},day1.core,allowed),/every submitted question/);
assert.throws(()=>validateReport({...sample,questions:sample.questions.map(()=>sample.questions[0])},day1.core,allowed),/every submitted question/);
assert.throws(()=>validateReport({...sample,overall:'Tomorrow solve I3-4'},day1.core,allowed),/unassessed/);
assert.throws(()=>validateReport({...sample,higherLevelSkills:[{skill:'algebra'}]},day1.core,allowed),/format/);
const markup=renderFeedback({...sample,headline:'<img src=x onerror=alert(1)>',overall:'<script>bad()</script>'});assert(!markup.includes('<script>'));assert(markup.includes('&lt;script&gt;'));

const records=(await loadProgress(learner)).records;
const rec=records.find(r=>r.day===2);let payload;
process.env.OPENAI_API_KEY='test-only-not-a-real-key';
const generated=await generateDiagnosticReport(rec,records,null,{fetcher:async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({status:'completed',output_text:JSON.stringify({...reportFor((await loadRubric(2)).core),questions:Object.fromEntries(reportFor((await loadRubric(2)).core).questions.map(({id,...q})=>[id,q])),crossDayChecks:Object.fromEntries(JSON.parse(payload.input[1].content[0].text).requiredCrossDayComparisons.map(c=>[c.skill,{evidenceByDay:Object.fromEntries([...new Set(c.items.map(i=>i.day))].map(day=>["day"+day,c.items.filter(i=>i.day===day).map(i=>({id:i.id,observation:"Observed response"}))])),conclusion:"Reconcile the responses.",nextCheck:"Explain a fresh example."}]))})})}}});
assert.equal(generated.report.questions.length,8);assert.equal(generated.report.crossDayChecks.length,2);assert.equal(payload.store,false);assert.deepEqual(payload.text.format.schema,generationSchema(JSON.parse(payload.input[1].content[0].text).requiredCrossDayComparisons,JSON.parse(payload.input[1].content[0].text).questions.map(q=>q.id)));
const input=JSON.parse(payload.input[1].content[0].text);assert.equal(input.submittedDayContext.length,2);assert(input.submittedDayContext[0].attachmentNotReviewed);assert(!JSON.stringify(input.questions).includes('I3-4'));
await assert.rejects(generateDiagnosticReport(rec,records,null,{fetcher:async()=>({ok:false,status:429})}),/429/);
await assert.rejects(generateDiagnosticReport(rec,records,null,{fetcher:async()=>({ok:true,json:async()=>({status:'incomplete'})})}),/finish/);
delete process.env.OPENAI_API_KEY;
let code,payloadResult;const res={setHeader(){},status(c){code=c;return this},json(p){payloadResult=p;return this}};
await handler({method:'GET',url:'/api/math-diagnostic-feedback?learner='+learner+'&day=2',headers:{host:'localhost'}},res);assert.equal(code,200);assert.equal(payloadResult.status,'ready');
await handler({method:'GET',url:'/api/math-diagnostic-feedback?day=0',headers:{host:'localhost'}},res);assert.equal(code,400);
process.env.CRON_SECRET='test-worker-secret';
await cron({method:'GET',headers:{}},res);assert.equal(code,401);delete process.env.CRON_SECRET;
console.log('PASS: durable backfill; submitted-only evidence; cached reports; resubmission/cross-day invalidation; concurrent claims; stale-job rejection; retry backoff; attachment input; exact item coverage; no unassessed item IDs; safe rendering; provider failures; API validation and cron authorization. No real model calls or learner records used.');
