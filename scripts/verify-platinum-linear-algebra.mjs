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
const subject = context.state.subjects.find((entry) => entry.id === "subject-platinum-linear-algebra");
const curriculum = subject.curriculum;
const plain = (value) => JSON.parse(JSON.stringify(value));
assert.deepEqual(plain(curriculum.weeks.map((entry) => entry.mmChapter)), [1, 2, 3, 4, 5, 6, null, null, null]);
assert.equal(curriculum.startDate, '2026-10-01');
assert.equal(curriculum.endDate, '2026-11-30');
const readingBlocks = curriculum.weeks.flatMap((entry) => entry.hhBlocks);
for (const chapter of [1, 2]) {
  const blocks = readingBlocks.filter((entry) => entry.chapter === chapter);
  const sections = blocks.flatMap((entry) => entry.sections);
  assert.deepEqual(plain(sections), Array.from({length: chapter === 1 ? 10 : 11}, (_, index) => `${chapter}.${index + 1}`));
  for (const block of blocks) {
    const month = chapter === 1 ? '2026-10' : '2026-11';
    assert(block.startDate.startsWith(month) && block.endDate.startsWith(month));
  }
}
curriculum.weeks.forEach((week,index) => {
  assert.equal(week.startDate, index ? context.addDays(curriculum.weeks[index-1].endDate,1) : curriculum.startDate);
  assert(week.practiceDue <= week.reviewDue);
  assert.equal(week.repairDue, context.addDays(week.reviewDue,2));
  assert(week.physicalModel && week.experiment);
  assert.equal(week.resources.length,0);
});
assert(!JSON.stringify(curriculum.sources).match(/youtube|3blue1brown|databook|18-06/i));
const tasks = context.state.tasks.filter((task) => task.studyPlanId === curriculum.id);
assert.equal(tasks.length, 55);
assert.equal(new Set(tasks.map((task) => task.id)).size, 55);
for (const task of tasks) {
  const linked = context.linkedScheduleForTask(task);
  assert(linked && linked.subjectId === subject.id && linked.week === task.week);
  assert.equal(context.taskDueDate(task), task.date);
  assert(task.date >= curriculum.startDate && task.date <= curriculum.endDate);
  assert(!/video|lecture|watch/i.test(task.type));
  assert.doesNotThrow(() => context.taskRowTemplate(task));
}
const materials = subject.patternWorkspaces.flatMap((pattern) => pattern.weeks);
assert.equal(materials.length, 18);
assert.equal(new Set(materials.map((material) => material.id)).size, 18);
for (const week of materials) {
  const material = context.findPatternMaterialAcrossState(week.id);
  assert.equal(material.subject.id, subject.id);
  assert.equal(context.buildFeedbackMaterialContext(material).questions.length, 2);
  assert(context.buildFeedbackMaterialContext(material).readings.includes("M&M"));
  assert(context.buildFeedbackMaterialContext(material).physicalModel);
  assert.equal(week.feedbackWorkflow.rubric.reduce((sum, entry) => sum + entry.points, 0), 10);
}
const html = context.subjectReaderTemplate(subject);
assert(html.includes("October") && html.includes("November") && !html.includes("Dates pending"));
assert(!html.includes("PSB Review") && !html.includes("ISI-style"), "must not inject Probability review days");
assert.equal((html.match(/data-solution-upload=/g) || []).length, 18);
assert.equal(context.platinumMaterialSnapshots().filter((entry) => entry.subjectId === subject.id).length, 18);
context.state.patternSubmissions.push({materialId:'platinum-la-w1-practice',fileName:'old.md',solutionText:'earlier work'});
assert(context.findPatternMaterialAcrossState('platinum-la-w1-practice').week.inlineQuestions[0].includes('x + 2y'));
assert(context.subjectReaderTemplate(subject).includes('Earlier assignment submissions'));
assert(context.platinumMaterialSnapshots().find((entry) => entry.materialId === 'platinum-la-w1-practice').archived);

const saved = plain(context.state);
saved.tasks.find((task) => task.id === tasks[0].id).done = true;
saved.patternSubmissions = [{ materialId: materials[0].id, fileName: "solution.md", solutionText: "My work", feedback: "Saved feedback" }];
saved.quizAttempts = [{ id: "saved-review" }];
const migrated = context.mergeCanonicalPlanWithProgress(context.buildCoursePlan(), saved);
assert.equal(migrated.tasks.find((task) => task.id === tasks[0].id).done, true);
assert.deepEqual(migrated.patternSubmissions, saved.patternSubmissions);
assert.deepEqual(migrated.quizAttempts, saved.quizAttempts);
const basic = context.buildCoursePlan(context.basicGateDaUser());
assert(!basic.subjects.some((entry) => entry.id === subject.id));
assert(!basic.tasks.some((task) => task.studyPlanId));

// Relative study weeks must not be merged into the old June calendar or its task filter.
const elements = new Map();
context.document = { querySelector(selector) {
  if (!elements.has(selector)) elements.set(selector, { value: "la:3", innerHTML: "", querySelector: () => null, querySelectorAll: () => [] });
  return elements.get(selector);
} };
context.renderTaskAlerts = () => {};
context.renderWeekOptions();
assert.equal(elements.get("#week-select").value, "la:3");
context.renderTaskList();
const board = elements.get("#task-list-board").innerHTML;
assert(board.includes("LA Week 3") && !board.includes("LA Week 2") && !board.includes("DSA W3"));
context.renderSchedule();
assert(!elements.get("#schedule-list").innerHTML.includes("calendar dates pending"));
assert(elements.get("#schedule-list").innerHTML.includes("Linear Algebra Week 9"));
const index = fs.readFileSync("index.html", "utf8");
assert(index.indexOf('src="platinum-linear-algebra.js') < index.indexOf('src="app.js'));
console.log("PASS: Oct–Nov calendar, monthly chapter boundaries, 55 dated tasks, 48-hour rechecks, 18 submission flows, archived work, deferred videos, progress migration, and Basic isolation.");
