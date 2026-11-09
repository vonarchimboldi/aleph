import assert from 'node:assert/strict';
import {learningNotices} from '../api/_learning-notices.js';
import {listNotifications,markNotificationRead} from '../api/_notifications.js';
process.env.ALEPH_DIAGNOSTIC_MEMORY='1';
assert.deepEqual(learningNotices('another-learner'),[]);
const notices=await listNotifications('user-priyanka');
const n=notices.notifications.find(n=>n.id==='logic-repair-2026-11-03');
assert.equal(n.title,'Please make time for this');
assert.equal(n.href,'/math-remedial/logic-repair.html');
assert.equal(n.unread,true);
assert.equal((await listNotifications('user-priyanka')).unreadCount,5);
await assert.rejects(markNotificationRead({learner:'another-learner',id:n.id,version:n.version}),e=>e.status===409);
await assert.rejects(markNotificationRead({learner:'user-priyanka',id:n.id,version:'old'}),e=>e.status===409);
const ack=await markNotificationRead({learner:'user-priyanka',id:n.id,version:n.version});
assert.equal((await listNotifications('user-priyanka')).unreadCount,4);
assert.equal((await markNotificationRead({learner:'user-priyanka',id:n.id,version:n.version})).readAt,ack.readAt);
assert.equal((await listNotifications('another-learner')).notifications.length,0);
console.log('PASS: learner-specific learning notice, read-only discovery, durable idempotent acknowledgement, learner and version isolation. In-memory records only.');

const current=learningNotices('user-priyanka').filter(n=>n.id.endsWith('review-2026-11-08'));
assert.equal(current.length,3);assert.equal(new Set(current.map(n=>n.id)).size,3);
for(const notice of current){
 assert.equal(notice.description,'Dedicate a 90 minute session for this.');
 assert(['/calculus-review/','/dsa-review/','/dbms-review/'].includes(notice.href));
 assert((await listNotifications('user-priyanka')).notifications.find(n=>n.id===notice.id).unread);
 await markNotificationRead({learner:'user-priyanka',id:notice.id,version:notice.version});
}
const policy=(await listNotifications('user-priyanka')).notifications.find(n=>n.id==='mandatory-daily-review-2026-11-09');
assert(policy.unread);assert(policy.description.includes('MUST complete all three'));assert(policy.description.includes('account being locked by admin'));assert(policy.description.includes('automatic email activation is pending'));
await markNotificationRead({learner:'user-priyanka',id:policy.id,version:policy.version});
assert.equal((await listNotifications('user-priyanka')).unreadCount,0);
console.log('PASS: three distinct review notices with exact requested90-minute wording, course links and independent read markers.');
