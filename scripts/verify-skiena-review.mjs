import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';
const D=JSON.parse(fs.readFileSync('dsa-review/course.json','utf8')),ids=new Set();assert.equal(D.length,7);
for(const day of D){
 assert.equal(day.questions.length,5);assert.equal(day.questions.filter(q=>q.type==='multi-select').length,2);
 const html=fs.readFileSync(`dsa-review/day-${String(day.day).padStart(2,'0')}.html`,'utf8');
 assert(html.includes('id="feedback" hidden')&&html.includes('id="big-picture" hidden'));assert(html.includes('class="mindmap"')&&html.includes('<pre><code>'));
 for(const q of day.questions){assert(!ids.has(q.id));ids.add(q.id);assert(q.source_block&&q.first&&q.trap&&q.skill);if(q.type==='multi-select'){assert.equal(q.options.length,4);assert(q.correct.length>0);}}
}
assert.equal(ids.size,35);
const src=fs.readFileSync('app.js','utf8'),c=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});
for(const f of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(src.slice(0,src.indexOf('const state = loadState();'))+src.slice(src.indexOf('function loadState()')),c);
const plan=c.buildCoursePlan(),subject=plan.subjects.find(s=>s.id==='subject-platinum-skiena-review');assert(subject);
c.state={user:c.defaultUser(),...plan,patternSubmissions:[]};assert.equal(subject.materialWorkspaces.length,7);assert.equal((c.subjectReaderTemplate(subject).match(/data-solution-upload=/g)||[]).length,7);
for(const {weeks} of subject.materialWorkspaces){const w=weeks[0];assert.equal(w.date,'');assert.equal(w.inlineQuestions.length,5);assert.equal(Object.keys(w.modelLesson.gradingKeys).length,5);assert(fs.existsSync(w.materialUrl));assert.equal(w.feedbackWorkflow.rubric.reduce((s,r)=>s+r.points,0),10);assert(c.buildFeedbackMaterialContext(c.findPatternMaterial(subject,w.id)).modelingExplanation.gradingKeys);}
assert(!c.buildCoursePlan(c.basicGateDaUser()).subjects.some(s=>s.id===subject.id));
const old=JSON.parse(JSON.stringify(c.state));old.tasks[0].done=true;old.patternSubmissions=[{materialId:'synthetic-old-attempt',solutionText:'Synthetic retained work'}];const merged=c.mergeCanonicalPlanWithProgress(plan,old);assert(merged.tasks[0].done);assert.deepEqual(merged.patternSubmissions,old.patternSubmissions);
console.log('PASS: seven lessons/diagnostics/maps;35 unique tagged prompts;seven upload/feedback slots with matching grading keys;relative days;existing progress preserved. Synthetic state only.');
