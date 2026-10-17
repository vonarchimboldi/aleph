import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {blank,available,complete,validate,math} from '../math-diagnostic/core.mjs';
const p=blank();assert(available(p,1));assert(!available(p,2));assert.throws(()=>complete(p,2));complete(p,1);assert(available(p,2));assert.throws(()=>validate({version:1,completed:[2],days:{}}));assert.throws(()=>validate({version:1,completed:Array.from({length:11},(_,i)=>i+1),days:{}}));
assert(math('2^(n+1)').includes('<sup>n+1</sup>'));assert(!math('<script>').includes('<script>'));
const ids=new Set();let total=0;
for(let n=1;n<=10;n++){
 const stem=String(n).padStart(2,'0'),q=JSON.parse(fs.readFileSync(`math-diagnostic/days/day-${stem}.json`)),t=JSON.parse(fs.readFileSync(`math-diagnostic/tutor/day-${stem}.json`));assert.equal(q.core.length,8);
 for(const item of q.core){assert(!ids.has(item.id));ids.add(item.id);total++;}
 for(const item of [...q.core,...q.branches]){assert.deepEqual(Object.keys(item).sort(),['id','prompt']);assert(t.questions[item.id].answer);assert.equal(t.questions[item.id].credit.length,3);}
 assert.equal(fs.readFileSync(`math-diagnostic/days/day-${stem}.pdf`).subarray(0,5).toString(),'%PDF-');
}
assert.equal(total,80);
const source=fs.readFileSync('app.js','utf8'),c=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});
for(const f of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(source.slice(0,source.indexOf('const state = loadState();'))+source.slice(source.indexOf('function loadState()')),c);
const plan=c.buildCoursePlan();c.state={user:c.defaultUser(),...plan,patternSubmissions:[]};
const subject=plan.subjects.find(s=>s.mathDiagnostic);assert(subject);assert(c.subjectReaderTemplate(subject).includes('Open my diagnostic'));assert(plan.resources.some(r=>r.id==='resource-platinum-math-diagnostic'));
assert(!c.buildCoursePlan(c.basicGateDaUser()).subjects.some(s=>s.mathDiagnostic));
const saved=JSON.parse(JSON.stringify(c.state));saved.tasks[0].done=true;saved.patternSubmissions=[{materialId:'preserved',solutionText:'Prior work'}];const merged=c.mergeCanonicalPlanWithProgress(plan,saved);assert(merged.tasks[0].done);assert.deepEqual(merged.patternSubmissions,saved.patternSubmissions);
console.log('PASS: ten daily PDFs, 80 distinct core items, learner/solution separation, sequential release, backup validation, Platinum-only routing and existing progress.');
