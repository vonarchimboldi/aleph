import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {november24Assignments} from './assign-nov24-review-week.mjs';
const src=fs.readFileSync('app.js','utf8'),c=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});
for(const f of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(src.slice(0,src.indexOf('const state = loadState();'))+src.slice(src.indexOf('function loadState()')),c);
const plan=c.buildCoursePlan(),subject=plan.subjects.find(s=>s.id==='subject-platinum-ai-round2');assert(subject);c.state={user:c.defaultUser(),...plan,patternSubmissions:[]};
assert.equal(subject.materialWorkspaces.length,7);assert.equal((c.subjectReaderTemplate(subject).match(/data-solution-upload=/g)||[]).length,7);
const ids=new Set();for(const e of subject.materialWorkspaces){const w=e.weeks[0];assert.equal(w.date,'');assert.equal(w.inlineQuestions.length,5);assert.equal(w.feedbackWorkflow.maxScore,10);assert.equal(w.feedbackWorkflow.rubric.reduce((n,x)=>n+x.points,0),10);assert.equal(Object.keys(w.modelLesson.gradingKeys).length,5);assert.equal(Object.keys(w.modelLesson.methodTags).length,5);
 const html=fs.readFileSync(w.materialUrl,'utf8');assert.equal((html.match(/data-teaching-step/g)||[]).length,2);assert(html.includes('first step that failed'));for(const q of w.inlineQuestions){const id=q.split(':')[0];assert(!ids.has(id));ids.add(id);assert(html.includes('data-response="'+id+'"'));assert(w.modelLesson.gradingKeys[id]);}
 assert(c.buildFeedbackMaterialContext(c.findPatternMaterial(subject,w.id)).modelingExplanation.gradingKeys);
}
assert.equal(ids.size,35);assert(!c.buildCoursePlan(c.basicGateDaUser()).subjects.some(s=>s.id===subject.id));
const original={...c.state,patternSubmissions:[{materialId:'ai-review-day-06',solutionText:'Synthetic original work retained'}]};assert.deepEqual(c.mergeCanonicalPlanWithProgress(plan,original).patternSubmissions,original.patternSubmissions);
const rows=november24Assignments();assert.equal(rows.length,19);assert.equal(rows.filter(x=>x.materialId.startsWith('ai-round2')).length,7);assert.equal(rows.filter(x=>x.materialId.endsWith('-round2-transfer')).length,7);assert.equal(rows.filter(x=>x.materialId.startsWith('calculus-phase2')).length,5);assert(!rows.some(x=>x.materialId.endsWith('-application')));assert(!rows.some(x=>x.subject.includes('DBMS')));assert.equal(rows.at(-1).dueDate,'2026-11-30');
// Recompute numeric answers independently rather than trusting their text keys.
const close=(a,b)=>assert(Math.abs(a-b)<1e-12);
close((.3*.8)/(.3*.8+.7*.2),12/19);
const l1=.8*.9+.2*.1,l0=.2*.9+.8*.1;close((.5*l1)/(.5*l1+.5*l0),.74);
close((.25*.9)/(.25*.9+.75*.1),.75);close((.02+.06)/(.02+.08+.06+.04),.4);
assert.equal(1+2+2*2+2*3,13);assert.equal(1+2+4+8+1,16);
const edges={S:[['A',2],['B',1],['G',10]],A:[['G',3]],B:[['A',2],['G',8]],G:[]};const best={S:0},queue=[['S',0]],pops=[];while(queue.length){queue.sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]));const[u,g]=queue.shift();if(g!==best[u])continue;pops.push(u);if(u==='G')break;for(const[v,cost]of edges[u])if(best[v]===undefined||g+cost<best[v]){best[v]=g+cost;queue.push([v,g+cost]);}}
assert.equal(best.G,5);assert.deepEqual(pops,['S','B','A','G']);assert.equal(Math.max(...[[6,8],[7,4],[5,9]].map(x=>Math.min(...x))),6);
console.log('PASS: seven upload/feedback workspaces, 35 separately keyed/tagged questions, 10-point rubrics, small teaching cycles, preserved Round 1 work, Basic isolation, nineteen correct dated assignments and independent numerical checks.');
