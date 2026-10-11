import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync('app.js', 'utf8');
const context = vm.createContext({console, URL, selectedPatternMaterialId:null, pendingUploadFiles:new Map()});
for (const file of ['platinum-linear-algebra.js','platinum-machine-learning.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context);
vm.runInContext(source.slice(0,source.indexOf('const state = loadState();'))+source.slice(source.indexOf('function loadState()')),context);
const pack = JSON.parse(fs.readFileSync('gate-da-dbms/pack.json','utf8'));
assert.equal(pack.chapters.length,8);
for (const chapter of pack.chapters) for(const field of ['notes','solutions']) assert.equal(fs.readFileSync(`gate-da-dbms/${chapter[field]}`).subarray(0,5).toString(),'%PDF-');
for(const kind of ['notes','practice','solutions']) assert.equal(fs.readFileSync(`gate-da-dbms/GATE-DA-DBMS-${kind}.pdf`).subarray(0,5).toString(),'%PDF-');
for(const user of [context.defaultUser(),context.basicGateDaUser()]) {
  const plan=context.buildCoursePlan(user);
  context.state={user,...plan,patternSubmissions:[]};
  const subject=plan.subjects.find(s=>s.id==='subject-gate-da-dbms');
  assert.equal(subject.dbmsPack.chapters.length,8);
  assert(context.subjectReaderTemplate(subject).includes('gate-da-dbms/index.html'));
  assert(plan.resources.some(r=>r.id==='resource-gate-da-dbms-exam-pack'));
  const saved=JSON.parse(JSON.stringify(context.state));
  saved.tasks[0].done=true;
  saved.patternSubmissions=[{materialId:'preserved',solutionText:'Saved work'}];
  const merged=context.mergeCanonicalPlanWithProgress(plan,saved);
  assert(merged.tasks[0].done);
  assert.deepEqual(merged.patternSubmissions,saved.patternSubmissions);
}
console.log('PASS: eight chapter downloads, three books, Basic/Platinum routing and saved progress.');
