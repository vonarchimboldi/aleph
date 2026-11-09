import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {sign} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function mintStudyAdminToken(privateKey,learner,now=Date.now()){
 const payload=Buffer.from(JSON.stringify({purpose:'aleph-study-admin-v1',learner,issuedAt:now,expiresAt:now+86400000}));
 return payload.toString('base64url')+'.'+sign(null,payload,privateKey).toString('base64url');
}
async function run(){
 const args=process.argv.slice(2),learner='user-priyanka';
 if(!args.includes('--start')&&!args.includes('--access-file'))throw Error('Use --start to activate the agreement, or --access-file to create a one-day admin access file.');
 const token=mintStudyAdminToken(readFileSync('/Users/abhinav/.local/share/aleph/review-publisher-private.pem'),learner);
 if(args.includes('--access-file')){
  const at=args.indexOf('--access-file'),path=args[at+1]&&!args[at+1].startsWith('--')?resolve(args[at+1]):'/Users/abhinav/.local/share/aleph/study-admin-access.json';
  mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify({token,expiresAt:new Date(Date.now()+86400000).toISOString()})+'\n',{mode:0o600});console.log('One-day admin access file saved: '+path);
 }
 if(args.includes('--start')){
  const endpoint='https://aleph-alpha.io/api/material-tracker';
  async function request(options){const r=await fetch(endpoint+'?learner='+learner,{...options,signal:AbortSignal.timeout(20000)});const b=await r.json();if(!r.ok)throw Error(b.error||'Agreement request failed');return b;}
  const current=await request();if(current.study){console.log('Agreement already active; existing records preserved.');return;}
  const next=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learner,action:'study-start',expectedRevision:current.revision,startDate:current.today,adminToken:token})});
  console.log(JSON.stringify({agreementStart:next.study.startDate,agreementEnd:next.study.endDate,proposedDays:next.study.plans.length,assignmentsPreserved:next.assignments.length,learnerAcceptance:next.study.termsAcceptedAt,alertsReady:next.alerts.ready}));
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await run();
