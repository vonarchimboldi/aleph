import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const course=JSON.parse(fs.readFileSync('calculus-review/course.json','utf8'));
assert.equal(course.length,10);
const ids=new Set();
for(const day of course){
 assert.equal(day.problems.length,5);
 const html=fs.readFileSync(`calculus-review/day-${String(day.day).padStart(2,'0')}.html`,'utf8');
 assert(!/\\\(|\\\[/.test(html),'No raw math delimiters');
 assert(html.includes('class="mindmap"')&&html.includes('Text version of the map'));
 assert.equal((html.match(/data-skill=/g)||[]).length,5);
 assert.equal((html.match(/class="solution"/g)||[]).length,6); // practice + exit
 for(const match of html.matchAll(/data-problem="([^"]+)"/g)){assert(!ids.has(match[1]));ids.add(match[1]);}
 assert(html.includes('Scratchpad saves on this browser only'));
}
assert.equal(ids.size,70);
assert.equal(course[3].worked.length,12);assert.equal(course[4].worked.length,12);
assert.equal(course[4].videoSources.length,12);
assert(course[0].worked.length>=14&&course[1].worked.length>=10);
assert(course[5].story.includes('weakly convex')&&course[5].story.includes('secant'));
const source=fs.readFileSync('app.js','utf8'),c=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});
for(const file of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
vm.runInContext(source.slice(0,source.indexOf('const state = loadState();'))+source.slice(source.indexOf('function loadState()')),c);
const plan=c.buildCoursePlan();const subject=plan.subjects.find(s=>s.id==='subject-platinum-calculus-review');assert(subject);
const slots=subject.materialWorkspaces.flatMap(w=>w.weeks);assert.equal(slots.length,10);
c.state={user:c.defaultUser(),...plan,patternSubmissions:[]};
const html=c.subjectReaderTemplate(subject);assert.equal((html.match(/data-solution-upload=/g)||[]).length,10);
assert(!c.buildCoursePlan(c.basicGateDaUser()).subjects.some(s=>s.id===subject.id));
for(const slot of slots){
 assert.equal(slot.date,'');assert.equal(slot.inlineQuestions.length,7);
 assert.equal(Object.keys(slot.modelLesson.gradingKeys).length,6);
 assert.equal(slot.feedbackWorkflow.rubric.reduce((s,r)=>s+r.points,0),10);
 const found=c.findPatternMaterial(subject,slot.id);assert(found);
 const context=c.buildFeedbackMaterialContext(found);assert(context.modelingExplanation.gradingKeys);
 assert(fs.existsSync(slot.materialUrl));
}
const saved=JSON.parse(JSON.stringify(c.state));saved.tasks[0].done=true;saved.patternSubmissions=[{materialId:'synthetic-preserved',solutionText:'Synthetic prior work'}];
const merged=c.mergeCanonicalPlanWithProgress(plan,saved);assert(merged.tasks[0].done);assert.deepEqual(merged.patternSubmissions,saved.patternSubmissions);
// Numerical independent checks of representative values, including an improper endpoint.
function simpson(f,a,b,n=20000){const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3;}
assert(Math.abs(simpson(x=>x-x*x,0,1)-1/6)<1e-10);
assert(Math.abs(simpson(x=>2-x-x*x,-2,1)-4.5)<1e-10);
assert(Math.abs(simpson(x=>1/((x+1)*(x+2)),0,1)-Math.log(4/3))<1e-10);
assert(Math.abs(simpson(x=>x===0?0:x===1?1:(x-1)/Math.log(x),0,1)-Math.log(2))<1e-4);
assert.equal((.75**3+.75-1),11/64);
assert(Math.abs(.2**5/120-1/375000)<1e-20);
console.log('PASS: ten rendered lessons, five practices and exit keys each, twelve IVT/MVT companions, maps, ten feedback/upload slots, no calendar changes, prior progress preserved, representative computations. Synthetic state only.');
