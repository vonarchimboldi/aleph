import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("app.js", "utf8");
const context = vm.createContext({ console, URL, selectedPatternMaterialId: null, pendingUploadFiles: new Map() });
vm.runInContext(fs.readFileSync("platinum-linear-algebra.js", "utf8"), context);
vm.runInContext(fs.readFileSync("platinum-machine-learning.js", "utf8"), context);
// Load the pure plan and rendering functions without browser startup effects.
vm.runInContext(source.slice(0, source.indexOf("const state = loadState();")) + source.slice(source.indexOf("function loadState()")), context);
context.state = { user: context.defaultUser(), ...context.buildCoursePlan(), patternSubmissions: [] };
const subject = context.state.subjects.find(s => s.id === "subject-platinum-machine-learning");
const curriculum = subject.curriculum;
assert.equal(curriculum.weeks.length, 8);
assert.deepEqual(Array.from(curriculum.weeks.flatMap(w => w.lectureNumbers)), Array.from({length:17},(_,i)=>i+1));
for (const [index, week] of curriculum.weeks.entries()) {
  assert.equal(week.startDate, context.addDays("2026-10-01",index*7));
  assert.equal(week.endDate, context.addDays(week.startDate,6));
  assert.equal(week.repairDue, context.addDays(week.reviewDue,2));
  assert(week.prerequisite && week.experiment && week.physicalModel);
  assert.equal(week.resources.length,0);
}
const tasks = context.state.tasks.filter(t=>t.studyPlanId===curriculum.id);
assert.equal(tasks.length,48);
for (const task of tasks) {
  assert.equal(context.linkedScheduleForTask(task).subjectId,subject.id);
  assert(task.date >= "2026-10-01" && task.date <= "2026-11-26");
}
const materials = subject.patternWorkspaces.flatMap(p=>p.weeks);
assert.equal(materials.length,16);
for (const material of materials) {
  const feedback = context.buildFeedbackMaterialContext(context.findPatternMaterialAcrossState(material.id));
  assert.equal(feedback.questions.length,2);
  assert(feedback.readings.includes("Lecture") && feedback.prerequisite);
  assert.equal(material.feedbackWorkflow.rubric.reduce((sum,r)=>sum+r.points,0),10);
}
const html=context.subjectReaderTemplate(subject);
assert.equal((html.match(/data-solution-upload=/g)||[]).length,16);
assert(!html.includes("M&M") && !html.includes("PSB Review"));
assert.equal(context.platinumMaterialSnapshots().filter(m=>m.subjectId===subject.id).length,16);
const saved=JSON.parse(JSON.stringify(context.state));
saved.tasks.find(t=>t.id===tasks[0].id).done=true;
saved.patternSubmissions=[{materialId:materials[0].id,solutionText:"Saved ML work"}];
const migrated=context.mergeCanonicalPlanWithProgress(context.buildCoursePlan(),saved);
assert(migrated.tasks.find(t=>t.id===tasks[0].id).done);
assert.deepEqual(migrated.patternSubmissions,saved.patternSubmissions);
const elements=new Map();
context.document={querySelector(selector){if(!elements.has(selector))elements.set(selector,{value:"ml:1",innerHTML:"",querySelector:()=>null,querySelectorAll:()=>[]});return elements.get(selector)}};
context.renderTaskAlerts=()=>{};
context.renderWeekOptions();
assert.equal(elements.get("#week-select").value,"ml:1");
context.renderTaskList();
const board=elements.get("#task-list-board").innerHTML;
assert(board.includes("ML Week 1") && !board.includes("data-task-done=\"task-platinum-la-"));
context.renderSchedule();
assert(elements.get("#schedule-list").innerHTML.includes("Machine Learning Week 8"));
assert(!context.buildCoursePlan(context.basicGateDaUser()).subjects.some(s=>s.id===subject.id));
console.log("PASS: ML 17 lectures, eight dated weeks, 48 tasks, 16 submissions, feedback context, progress migration, subject routing and Basic isolation.");
