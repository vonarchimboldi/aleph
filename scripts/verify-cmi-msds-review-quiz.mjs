import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const quizzes = [
  {
    file: "psets/week-02/july-05-cmi-msds-review-quiz.html",
    expectedTopics: [
      "dm-counting-binomial",
      "dm-relations-state-machines",
      "dm-proofs-inclusion-induction",
      "dsa-lists-stacks-queues",
      "dsa-complexity-arrays-search",
      "dsa-recursion-strings-sorting"
    ]
  },
  {
    file: "psets/week-02/july-12-cmi-msds-dm-dsa-review-quiz.html",
    expectedTopics: [
      "dm-counting-casework",
      "dm-relations-functions-state",
      "dm-proofs-induction-ie",
      "dsa-complexity-arrays-search",
      "dsa-recursion-strings-sorting",
      "dsa-lists-stacks-queues"
    ]
  }
];

function fail(message) {
  errors.push(message);
}

quizzes.forEach(({ file, expectedTopics }) => {
  const quizPath = path.join(root, file);
  const html = fs.readFileSync(quizPath, "utf8");
  const prefix = `${file}:`;

  if (!html.includes('href="/psets/material-page.css"')) fail(`${prefix} missing shared material stylesheet.`);
  if (!html.includes('src="/psets/material-page.js"')) fail(`${prefix} missing shared material renderer.`);
  if (/<details\b/i.test(html) || /<summary\b/i.test(html)) fail(`${prefix} must not embed unlockable solution details.`);
  const renderedHtml = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  if (/<details\b/i.test(renderedHtml) || /<summary\b/i.test(renderedHtml)) fail(`${prefix} must not embed unlockable solution details.`);
  if (/answer key|correct answer/i.test(renderedHtml)) {
    fail(`${prefix} appears to expose answer-key language.`);
  }
  if (/linear algebra|eigenvalue|probability|uniform|chebyshev|calculus|derivative/i.test(renderedHtml)) {
    fail(`${prefix} includes off-scope topics outside covered Discrete Math and DSA.`);
  }

  const metadataMatch = html.match(/<script id="quiz-metadata" type="application\/json">([\s\S]*?)<\/script>/);
  if (!metadataMatch) {
    fail(`${prefix} missing quiz metadata JSON.`);
    return;
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataMatch[1]);
  } catch (error) {
    fail(`${prefix} quiz metadata JSON is invalid: ${error.message}`);
  }

  if (metadata) {
    if (metadata.durationMinutes !== 120) fail(`${prefix} duration must be 120 minutes.`);
    if (metadata.questionCount !== 30) fail(`${prefix} question count must be 30.`);
    if (metadata.examTarget !== "CMI-MSDS") fail(`${prefix} missing CMI-MSDS exam target metadata.`);
    if (metadata.cmiRubricVersion !== "cmi-msds-review-rubric-v1") fail(`${prefix} missing CMI rubric version metadata.`);
    if (metadata.mcqPolicy !== "multi-select-all-correct-no-partial-credit") fail(`${prefix} MCQ policy must match CMI all-correct/no-partial-credit format.`);
    if (metadata.unlockPolicy !== "solutions-after-submission") fail(`${prefix} solutions must be locked until submission.`);
    if (!metadata.feedbackWorkflow?.errorAnalysis) fail(`${prefix} missing error-analysis feedback workflow metadata.`);

    const questions = metadata.questions || [];
    if (questions.length !== 30) fail(`${prefix} expected 30 metadata questions, found ${questions.length}.`);

    const byTopic = new Map();
    const byType = new Map();
    const ids = new Set();
    questions.forEach((question) => {
      if (ids.has(question.id)) fail(`${prefix} duplicate question id: ${question.id}`);
      ids.add(question.id);
      byTopic.set(question.topic, (byTopic.get(question.topic) || 0) + 1);
      byType.set(question.type, (byType.get(question.type) || 0) + 1);

      if (!expectedTopics.includes(question.topic)) fail(`${prefix} ${question.id}: unexpected topic ${question.topic}.`);
      if (!["mcq", "short-answer"].includes(question.type)) fail(`${prefix} ${question.id}: invalid type ${question.type}.`);
      if (question.difficulty && !["medium", "medium-hard", "hard"].includes(question.difficulty)) fail(`${prefix} ${question.id}: difficulty is not CMI-appropriate.`);
      if (question.skills && (!Array.isArray(question.skills) || question.skills.length < 2)) fail(`${prefix} ${question.id}: needs at least two skill tags.`);
      if (question.cmiFit !== undefined && question.cmiFit.length < 24) fail(`${prefix} ${question.id}: missing CMI-fit rationale.`);
      if (question.cmi_dimensions) {
        const scores = Object.values(question.cmi_dimensions);
        if (scores.length !== 6 || scores.some((score) => score < 0 || score > 2)) fail(`${prefix} ${question.id}: invalid CMI dimension scores.`);
        if (!question.cmi_pass) fail(`${prefix} ${question.id}: CMI pass flag is false.`);
      }
    });

    expectedTopics.forEach((topic) => {
      if (byTopic.get(topic) !== 5) fail(`${prefix} ${topic}: expected 5 questions, found ${byTopic.get(topic) || 0}.`);
    });
    if (byType.get("mcq") !== 15) fail(`${prefix} expected 15 MCQs, found ${byType.get("mcq") || 0}.`);
    if (byType.get("short-answer") !== 15) fail(`${prefix} expected 15 short-answer questions, found ${byType.get("short-answer") || 0}.`);

    const articleCount = (html.match(/<article class="problem"/g) || []).length;
    if (articleCount !== 30) fail(`${prefix} expected 30 rendered problem articles, found ${articleCount}.`);
  }
});

if (errors.length) {
  console.error("CMI MS DS review quiz verifier failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("CMI MS DS review quiz verifier passed.");
