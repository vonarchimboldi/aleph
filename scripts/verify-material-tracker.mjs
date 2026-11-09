import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import fs from 'node:fs';import vm from 'node:vm';
import {mutateTracker,trackerState,resolvedAssignments,trackerDay,materialTrackerNotifications,checkTrackerReminders,localMaterialUrl} from '../api/_material-tracker.js';
import {kvCommand} from '../api/_platinum-progress-store.js';
import {listNotifications,markNotificationRead} from '../api/_notifications.js';
import cron from '../api/cron/material-tracker.js';
// Fail closed if a developer accidentally runs this test with a real data store.
for(const name of ['KV_REST_API_URL','UPSTASH_REDIS_REST_URL','aleph_KV_REST_API_URL'])assert(!process.env[name],'Run with no live KV environment.');
process.env.ALEPH_DIAGNOSTIC_MEMORY='1';
const now=new Date('2026-11-09T17:00:00Z'),learner='synthetic-tracker';
const sample={learner,action:'assign',materialId:'calculus-review-day-01',title:'Synthetic limits',subject:'Calculus',href:'/calculus-review/day-01.html',dueDate:'2026-11-08',minutes:90};
let record=await mutateTracker({...sample,expectedRevision:0},now);const id=record.assignments[0].id;
assert.equal((await trackerState(learner,now)).assignments[0].status,'overdue');
await assert.rejects(mutateTracker({...sample,expectedRevision:0},now),e=>e.status===409);
await assert.rejects(mutateTracker({...sample,expectedRevision:1},now),e=>e.status===409);
await assert.rejects(mutateTracker({...sample,expectedRevision:1,dueDate:'2026-99-99'},now),e=>e.status===400);
assert.throws(()=>localMaterialUrl('javascript:alert(1)'));assert.throws(()=>localMaterialUrl('https://example.com/calculus-review/a.html'));
for(const [instant,day] of [['2026-11-09T04:59:59Z','2026-11-08'],['2026-11-09T05:00:00Z','2026-11-09'],['2026-03-09T03:59:59Z','2026-03-08'],['2026-03-09T04:00:00Z','2026-03-09']])assert.equal(trackerDay(new Date(instant)),day);
assert.equal(resolvedAssignments(record,[],new Date('2026-11-09T04:59:59Z'))[0].status,'due-today');
assert.equal(resolvedAssignments(record,[{userId:learner,materialId:sample.materialId,submittedAt:'2026-11-08T16:00:00Z'}],now)[0].status,'overdue','Old submission must not complete a new assignment');
assert.equal(resolvedAssignments(record,[{userId:learner,materialId:sample.materialId,submittedAt:'2026-11-09T18:00:00Z'}],now)[0].completionSource,'submission');
record=await mutateTracker({learner,expectedRevision:record.revision,action:'complete',id},now);assert.equal((await trackerState(learner,now)).assignments[0].status,'completed');
record=await mutateTracker({learner,expectedRevision:record.revision,action:'reopen',id},now);
record=await mutateTracker({learner,expectedRevision:record.revision,action:'reschedule',id,dueDate:'2026-11-10'},now);assert.equal((await trackerState(learner,now)).assignments[0].status,'upcoming');
record=await mutateTracker({learner,expectedRevision:record.revision,action:'reschedule',id,dueDate:'2026-11-08'},now);
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
async function configure(email='synthetic@example.invalid',enabled=true){const payload=JSON.stringify({purpose:'aleph-material-tracker-config-v1',learner,expectedRevision:record.revision,email,enabled,expiresAt:now.getTime()+60000});record=await mutateTracker({learner,action:'configure',expectedRevision:record.revision,payload,signature:sign(null,Buffer.from(payload),privateKey).toString('base64')},now,publicKey);}
await assert.rejects(mutateTracker({learner,expectedRevision:record.revision,action:'configure',payload:'{}',signature:'fake'},now),e=>e.status===401);
await configure();assert(!JSON.stringify(await trackerState(learner,now)).includes('synthetic@example.invalid'));
const env={RESEND_API_KEY:'mock-only',FROM_EMAIL:'mock@example.invalid',CRON_SECRET:'mock-secret'};let deliveries=[];
const fetcher=async(url,options)=>{deliveries.push(options);await new Promise(r=>setTimeout(r,10));return{ok:true,json:async()=>({id:'synthetic-receipt'})}};
await Promise.all([checkTrackerReminders({now,env,fetcher}),checkTrackerReminders({now,env,fetcher})]);assert.equal(deliveries.length,1);
assert.equal((await checkTrackerReminders({now,env,fetcher})).results[0].reason,'already_sent');assert.equal(deliveries.length,1);
assert.equal(JSON.parse(deliveries[0].body).to,'synthetic@example.invalid');assert(JSON.parse(deliveries[0].body).text.includes('Synthetic limits'));
const tomorrow=new Date('2026-11-10T17:00:00Z');let retries=[];
await checkTrackerReminders({now:tomorrow,env,fetcher:async(u,o)=>{retries.push(o);throw Error('Synthetic ambiguous timeout')}});
await checkTrackerReminders({now:tomorrow,env,fetcher:async(u,o)=>{retries.push(o);return{ok:true,json:async()=>({id:'retry-receipt'})}}});
assert.equal(retries.length,2);assert.equal(retries[0].body,retries[1].body);assert.equal(retries[0].headers['Idempotency-Key'],retries[1].headers['Idempotency-Key']);
await configure('changed@example.invalid');const nextDay=new Date('2026-11-11T17:00:00Z');await checkTrackerReminders({now:nextDay,env,fetcher:async()=>{throw Error('Synthetic timeout')}});await configure('other@example.invalid');
assert.equal((await checkTrackerReminders({now:nextDay,env,fetcher})).results[0].reason,'delivery_configuration_changed_needs_review');
await configure('other@example.invalid',false);await checkTrackerReminders({now:new Date('2026-11-12T17:00:00Z'),env,fetcher});assert.equal(deliveries.length,1);
// Real identity names are used only in the isolated in-memory store.
let p=await mutateTracker({...sample,learner:'user-priyanka',expectedRevision:0,dueDate:'2026-03-08'},new Date('2026-03-08T15:00:00Z'));
const [notice]=await materialTrackerNotifications('user-priyanka',new Date('2026-03-09T04:00:00Z'));assert.equal(notice.generatedAt,'2026-03-09T04:00:00.000Z');
assert.equal((await materialTrackerNotifications('user-reviewer',now))[0].id,notice.id);
const current=(await listNotifications('user-priyanka')).notifications.find(n=>n.id===notice.id);assert(current.unread);
await markNotificationRead({learner:'user-priyanka',id:current.id,version:current.version});assert((await listNotifications('user-reviewer')).notifications.find(n=>n.id===notice.id).unread);
await kvCommand(['SET','aleph:platinum:submissions:v1',JSON.stringify({submissions:[{userId:'user-priyanka',materialId:sample.materialId,submittedAt:'2026-11-09T18:00:00Z'}]})]);assert.equal((await materialTrackerNotifications('user-priyanka',now)).length,0);
p=await mutateTracker({learner:'user-priyanka',expectedRevision:p.revision,action:'cancel',id:p.assignments[0].id},now);assert.equal((await trackerState('user-priyanka',now)).assignments.length,0);
async function response(request){let status=200,body;const r={setHeader(){},status(s){status=s;return this},json(b){body=b}};await cron(request,r);return{status,body}}
assert.equal((await response({method:'GET',headers:{}})).status,503);process.env.CRON_SECRET='synthetic';assert.equal((await response({method:'GET',headers:{}})).status,401);assert.equal((await response({method:'POST',headers:{authorization:'Bearer synthetic'}})).status,405);
const c=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});for(const f of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const s=fs.readFileSync('app.js','utf8');vm.runInContext(s.slice(0,s.indexOf('const state = loadState();'))+s.slice(s.indexOf('function loadState()')),c);c.state={user:c.defaultUser(),...c.buildCoursePlan(),patternSubmissions:[]};const catalog=c.platinumMaterialSnapshots();
for(const prefix of ['calculus-phase1-day-','skiena-review-day-','dbms-review-day-']){const matches=catalog.filter(a=>a.materialId.startsWith(prefix));assert(matches.length>=7,prefix);assert(matches.every(m=>!m.date));}
for(const m of catalog.filter(m=>!m.archived&&m.materialUrl))localMaterialUrl(m.materialUrl);
console.log('PASS: Toronto/DST deadlines, conflicts, receipt/manual completion, dates, cancellation, 22 review assignments available without historical deadlines, learner/owner notifications with separate read markers, signed recipient configuration, no address leakage, cron authentication, concurrent sends, durable deduplication and safe retries. In-memory store and mocked email only.');
