import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mintStudyAdminToken} from './study-admin.mjs';
export function november24Assignments(){
 const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
 const ai=read('ai-review/round2/catalog.json'),dsa=read('review-round2/catalog.json').dsa,calc=read('calculus-review/round2/materials.json');
 const rows=[];
 for(let i=0;i<7;i++){
  const dueDate=`2026-11-${24+i}`;
  for(const [subject,w] of [['AI · Pass 2',ai[i].weeks[0]],['DSA · Round 3',dsa[i].weeks.find(w=>w.id.endsWith('-round2-transfer'))],...(i<5?[['Calculus: 30-day review',calc[i+5].weeks[0]]]:[])]){
   assert(w?.id&&w.materialUrl);assert(fs.existsSync(new URL('../'+w.materialUrl,import.meta.url)));
   rows.push({materialId:w.id,title:subject==='DSA · Round 3'?`DSA Round 3 Day ${i+1}: ${dsa[i].title}`:w.materialTitle,subject,href:'/'+w.materialUrl,dueDate,minutes:90});
  }
 }
 return rows;
}
async function apply(){
 const learner='user-priyanka',endpoint='https://aleph-alpha.io/api/material-tracker?learner='+learner;
 const adminToken=mintStudyAdminToken(fs.readFileSync('/Users/abhinav/.local/share/aleph/review-publisher-private.pem'),learner);
 async function request(data){const r=await fetch(endpoint,{signal:AbortSignal.timeout(25000),...(data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})});const b=await r.json();if(!r.ok)throw Error(b.error||'Assignment request failed');return b;}
 let current=await request();assert.equal(current.today,'2026-11-23','Review this dated script before applying on a different day.');
 const original=current.assignments.map(a=>({id:a.id,materialId:a.materialId,dueDate:a.dueDate,completedAt:a.completedAt}));
 const submissionsResponse=await fetch('https://aleph-alpha.io/api/platinum-submissions?userId='+learner,{signal:AbortSignal.timeout(25000)});assert(submissionsResponse.ok);const ledger=await submissionsResponse.json();
 const submissions=ledger.submissions.filter(s=>s.userId===learner);
 const outstanding=november24Assignments();
 for(const a of outstanding){assert(!submissions.some(s=>s.materialId===a.materialId),'Do not reassign submitted work: '+a.materialId);const duplicate=current.assignments.find(x=>x.materialId===a.materialId&&!x.cancelledAt);if(duplicate)assert.equal(duplicate.dueDate,a.dueDate,'Resolve an existing date before scheduling');}
 // Publish and verify every destination before adding any assignment.
 for(const a of outstanding){const r=await fetch('https://aleph-alpha.io'+a.href,{signal:AbortSignal.timeout(25000)});assert(r.ok,'Published material unavailable: '+a.materialId);const html=await r.text();assert(html.includes('<html')&&html.includes('<title>'),'Expected a published HTML lesson');}
 let added=0;
 for(const a of outstanding){current=await request();if(current.assignments.some(x=>x.materialId===a.materialId&&x.dueDate===a.dueDate&&!x.cancelledAt))continue;
 current=await request({learner,action:'assign',expectedRevision:current.revision,adminToken,reason:'Mentor requested AI Pass 2 from Round 1 feedback and Skycak teaching, plus unfinished DSA Round 2 for the next seven days. Continue published Calculus Round 2 days 6–10; preserve completed work and DBMS alternating weeks.',...a});added++;}
 const fresh=await request();
 for(const a of original){const n=fresh.assignments.find(x=>x.id===a.id);assert(n);assert.equal(n.dueDate,a.dueDate);assert.equal(n.completedAt,a.completedAt);}
 for(const a of outstanding){const n=fresh.assignments.find(x=>x.materialId===a.materialId&&x.dueDate===a.dueDate);assert(n);assert(fresh.study.plans.find(p=>p.day===a.dueDate)?.assignments.some(x=>x.id===n.id),'Agreement missing '+a.materialId);}
 fs.writeFileSync('/private/tmp/aleph-nov24-after.json',JSON.stringify(fresh));
 console.log(JSON.stringify({added,verified:outstanding.length,earlierAssignmentsPreserved:original.length,revision:fresh.revision,days:[...new Set(outstanding.map(a=>a.dueDate))].map(day=>({day,minutes:outstanding.filter(a=>a.dueDate===day).reduce((n,a)=>n+a.minutes,0)}))}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.includes('--apply'))await apply();else console.log(JSON.stringify(november24Assignments(),null,2));}
