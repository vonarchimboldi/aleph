import {verify} from 'node:crypto';
const failure=(message,status=400)=>Object.assign(Error(message),{status});
export function requireStudyAdmin(input,learner,now,publicKey){
 try{const [payload,signature,...extra]=String(input.adminToken||'').split('.');if(extra.length||!payload||!signature)throw Error();const raw=Buffer.from(payload,'base64url');if(!verify(null,raw,publicKey,Buffer.from(signature,'base64url')))throw Error();const grant=JSON.parse(raw);const time=new Date(now).getTime();if(grant.purpose!=='aleph-study-admin-v1'||grant.learner!==learner||!Number.isFinite(grant.issuedAt)||!Number.isFinite(grant.expiresAt)||grant.issuedAt>time||grant.expiresAt<=time||grant.expiresAt-grant.issuedAt>86400000)throw Error();return true;}catch{throw failure('Authorize admin actions with a valid admin access file.',401);}
}
