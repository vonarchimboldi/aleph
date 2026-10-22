import {createHash} from 'node:crypto';
import {diagnosticFeedbackNotifications} from './_diagnostic-feedback.js';
import {kvCommand} from './_platinum-progress-store.js';
import {assertStore,validateIdentity} from './_math-diagnostic-store.js';

function readKey(learner,id,version){
  const hash=createHash('sha256').update(JSON.stringify([id,version])).digest('hex');
  return `aleph:notifications:read:v1:${encodeURIComponent(learner)}:${hash}`;
}

export async function listNotifications(learner){
  assertStore();validateIdentity(learner);
  const notices=await diagnosticFeedbackNotifications(learner);
  const notifications=await Promise.all(notices.map(async notice=>{
    const readAt=await kvCommand(['GET',readKey(learner,notice.id,notice.version)]);
    return {...notice,readAt:readAt||null,unread:!readAt};
  }));
  return {notifications,unreadCount:notifications.filter(n=>n.unread).length};
}

export async function markNotificationRead({learner,id,version}={}){
  assertStore();validateIdentity(learner);
  if(typeof id!=='string'||typeof version!=='string'||id.length>100||version.length>180)throw Object.assign(Error('A notification and report version are required.'),{status:400});
  const notice=(await diagnosticFeedbackNotifications(learner)).find(n=>n.id===id&&n.version===version);
  if(!notice)throw Object.assign(Error('This report has changed or is no longer ready. Refresh before marking it read.'),{status:409});
  const key=readKey(learner,id,version),existing=await kvCommand(['GET',key]);
  const readAt=existing||new Date().toISOString();
  if(!existing)await kvCommand(['SET',key,readAt]);
  // Each version has its own immutable marker. An old request cannot clear a
  // new report's unread status, including a refresh racing this write.
  return {id,version,readAt};
}
