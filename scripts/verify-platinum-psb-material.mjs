#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const errors = [];

const weekThree = {
  sourceWeek: 3,
  reviewUrl: "psets/week-03/july-19-psb-review-quiz.html",
  daily: [
    {
      topic: "method of indicators",
      file: "psets/week-03/july-13-indicators.html",
      required: ["indicator", "linearity", "symmetry", "pair", "variance", "conditioning", "ISI-style"]
    },
    {
      topic: "conditional expectation and tower property",
      file: "psets/week-03/july-14-conditional-expectation-tower.html",
      required: ["condition", "tower", "inner", "variance", "random sum", "support", "hidden"]
    },
    {
      topic: "order statistics",
      file: "psets/week-03/july-15-order-statistics.html",
      required: ["maximum", "minimum", "median", "binomial count", "beta", "density", "joint"]
    },
    {
      topic: "MLE and estimation",
      file: "psets/week-03/july-16-mle-estimation.html",
      required: ["likelihood", "log", "parameter", "support", "boundary", "bias", "MLE"]
    },
    {
      topic: "UMP/NP tests",
      file: "psets/week-03/july-17-ump-np-tests.html",
      required: ["hypotheses", "likelihood ratio", "size", "power", "randomization", "UMP", "monotone"]
    },
    {
      topic: "regression and OLS",
      file: "psets/week-03/july-18-regression-ols.html",
      required: ["mean", "slope", "intercept", "residual", "normal equation", "orthogonal", "projection"]
    }
  ]
};

function fail(message) {
  errors.push(message);
}

function readHtml(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    fail(`${file}: missing file.`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function normalize(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\\operatorname\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function countMatches(content, pattern) {
  return (content.match(pattern) || []).length;
}

function articles(content) {
  return content.match(/<article class="problem"[\s\S]*?<\/article>/g) || [];
}

function sectionText(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<div class="section-label">[^<]*${escaped}[^<]*<\\/div>`, "i").test(content);
}

function verifyDailyPage({ file, topic, required }) {
  const html = readHtml(file);
  if (!html) return;
  const text = normalize(html);
  const problemBlocks = articles(html);
  const solutionCount = countMatches(html, /<summary>\s*Solution\s*<\/summary>/g);
  const prefix = `${file}:`;

  if (!html.includes('href="/psets/material-page.css"')) fail(`${prefix} missing shared material stylesheet.`);
  if (!html.includes('src="/psets/material-page.js"')) fail(`${prefix} missing shared material renderer.`);
  if (problemBlocks.length !== 10) fail(`${prefix} expected 10 problems, found ${problemBlocks.length}.`);
  if (solutionCount !== 10) fail(`${prefix} expected 10 worked solutions, found ${solutionCount}.`);
  if (!/Core Pattern/i.test(html)) fail(`${prefix} missing Core Pattern section.`);
  if (!/Setup Checklist/i.test(html)) fail(`${prefix} missing Setup Checklist section.`);
  if (!/Answer Summary/i.test(html)) fail(`${prefix} missing Answer Summary section.`);
  if (!sectionText(html, "Problems 1-5")) fail(`${prefix} missing Problems 1-5 concept-builder block.`);
  if (!sectionText(html, "Problems 6-8")) fail(`${prefix} missing Problems 6-8 integration/application block.`);
  if (!sectionText(html, "Problems 9-10")) fail(`${prefix} missing Problems 9-10 challenge block.`);
  if (!text.includes("isi-style")) fail(`${prefix} needs visible ISI-style calibration.`);
  if (!text.includes(topic.toLowerCase().split(" ")[0])) fail(`${prefix} does not visibly anchor to topic "${topic}".`);

  required.forEach((term) => {
    if (!text.includes(term.toLowerCase())) fail(`${prefix} missing PSB requirement term "${term}".`);
  });

  const firstFive = problemBlocks.slice(0, 5).map(normalize).join(" ");
  const middleThree = problemBlocks.slice(5, 8).map(normalize).join(" ");
  const finalTwo = problemBlocks.slice(8, 10).map(normalize).join(" ");
  if (!firstFive.includes("concept")) fail(`${prefix} first five problems must be marked as concept/mechanics builders.`);
  if (!/(application|integration)/.test(middleThree)) fail(`${prefix} problems 6-8 must be marked as application/integration.`);
  if (!/(challenge|hidden|isi-style)/.test(finalTwo)) fail(`${prefix} problems 9-10 must be marked as challenge/hidden/ISI-style.`);
}

function verifyReviewQuiz(file) {
  const html = readHtml(file);
  if (!html) return;
  const prefix = `${file}:`;
  const rendered = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const problemCount = articles(html).length;

  if (problemCount !== 6) fail(`${prefix} expected one review question per PSB topic, found ${problemCount}.`);
  if (/<details\b/i.test(rendered) || /<summary\b/i.test(rendered)) fail(`${prefix} must not expose solution details before submission.`);
  if (!html.includes('"unlockPolicy": "solutions-after-submission"')) fail(`${prefix} missing locked-solution policy metadata.`);
  if (!html.includes('"feedbackWorkflow": "feedback-workflow-weekly-psb-review-v1"')) fail(`${prefix} missing weekly PSB feedback workflow metadata.`);
  weekThree.daily.forEach(({ topic }) => {
    const topicHead = topic.split(" ")[0].toLowerCase();
    if (!normalize(html).includes(topicHead)) fail(`${prefix} review quiz missing topic cue for ${topic}.`);
  });
}

function verifyAppWiring() {
  weekThree.daily.forEach(({ topic, file }) => {
    if (!appSource.includes(`"${topic}": "${file}"`)) {
      fail(`app.js: source Week ${weekThree.sourceWeek} missing URL for ${topic}.`);
    }
  });
  if (!appSource.includes(`${weekThree.sourceWeek}: "${weekThree.reviewUrl}"`)) {
    fail(`app.js: source Week ${weekThree.sourceWeek} missing Sunday PSB review URL.`);
  }
  if (!appSource.includes("probabilityStatsPatternWorkspaces(2, 2)")) {
    fail("app.js: Priyanka Platinum Probability/Stats workspace is not advanced to active Week 3.");
  }
  if (!appSource.includes("completedWeeks: 2") || !appSource.includes("startWeekOffset: 2")) {
    fail("app.js: Probability/Stats plan does not record two completed source weeks and Week 3 offset.");
  }
}

verifyAppWiring();
weekThree.daily.forEach(verifyDailyPage);
verifyReviewQuiz(weekThree.reviewUrl);

if (errors.length) {
  console.error("Platinum PSB material verifier failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Platinum PSB material verifier passed for source Week 3.");
