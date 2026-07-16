#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const psetsDir = path.join(root, "psets");
const appPath = path.join(root, "app.js");
const appSource = fs.readFileSync(appPath, "utf8");
const minArtifactScore = 75;
const minAverageScore = 80;
const bannedPhrases = ["clearly", "trivially", "by inspection", "it follows"];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function normalizeText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function countMatches(content, pattern) {
  return (content.match(pattern) || []).length;
}

function extractProblemBlocks(content) {
  return content.match(/<article class="problem"[\s\S]*?<\/article>/g) || [];
}

function extractFirstParagraph(block) {
  return normalizeText(block.split("<details>")[0]?.match(/<p>([\s\S]*?)<\/p>/)?.[1] || "");
}

function extractTitle(block) {
  return normalizeText(block.match(/<div class="problem-title">([\s\S]*?)<\/div>/)?.[1] || "");
}

function extractSolution(block) {
  return block.match(/<details>[\s\S]*?<summary>\s*Solution\s*<\/summary>([\s\S]*?)<\/details>/i)?.[1] || "";
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function addCriterion(parts, label, earned, max, evidence) {
  parts.push({ label, earned: Math.max(0, Math.min(max, earned)), max, evidence });
}

function scorePset(file) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  if (/"unlockPolicy"\s*:\s*"solutions-after-submission"/.test(content)) {
    return scoreLockedSubmissionQuiz(file, content);
  }
  const problems = extractProblemBlocks(content);
  const titles = problems.map(extractTitle);
  const statements = problems.map(extractFirstParagraph);
  const solutions = problems.map(extractSolution);
  const parts = [];

  let structure = 0;
  [
    'class="wrap"',
    'class="hero"',
    'href="/psets/material-page.css"',
    'src="/psets/material-page.js"',
    "katex.min.css",
    "math-fallback"
  ].forEach((snippet) => {
    if (content.includes(snippet)) structure += 1.5;
  });
  if (problems.length > 0) structure += 2;
  if (problems.length === countMatches(content, /<summary>\s*Solution\s*<\/summary>/g)) structure += 2;
  if (/Answer Summary/.test(content)) structure += 1;
  if (problems.length === 10) structure += 1;
  addCriterion(parts, "Structure and workflow", structure, 15, `${problems.length} problems, ${solutions.filter(Boolean).length} solutions`);

  const hasConcept = /Problems 1-5[\s\S]{0,80}(Concept|Mechanic)/i.test(content);
  const hasApplication = /Problems 6-8[\s\S]{0,80}(Application|Integration)/i.test(content);
  const hasChallenge = /Problems 9-10[\s\S]{0,100}(Challenge|Hidden|ISI)/i.test(content);
  const tagKinds = uniqueCount((content.match(/<span class="tag[^"]*">([\s\S]*?)<\/span>/g) || []).map(normalizeText));
  let progression = 0;
  if (hasConcept) progression += 5;
  if (hasApplication) progression += 5;
  if (hasChallenge) progression += 5;
  if (uniqueCount(titles) === titles.length) progression += 2.5;
  if (uniqueCount(statements) === statements.length) progression += 2.5;
  if (tagKinds >= 8) progression += 2;
  addCriterion(parts, "Progression and diagnostic design", progression, 20, `${tagKinds} distinct visible tags`);

  const solutionWordCounts = solutions.map(wordCount);
  const completeSolutions = solutionWordCounts.filter((count) => count >= 45).length;
  const veryShortSolutions = solutionWordCounts.filter((count) => count < 30).length;
  const solutionMath = solutions.filter((solution) => /\\\(|\\\[|<div class="formula">/.test(solution)).length;
  let completeness = 0;
  if (problems.length) completeness += (completeSolutions / problems.length) * 15;
  if (problems.length) completeness += (solutionMath / problems.length) * 5;
  if (content.includes("Therefore") || content.includes("So")) completeness += 3;
  if (veryShortSolutions === 0) completeness += 2;
  addCriterion(parts, "Solution completeness", completeness, 25, `${completeSolutions}/${problems.length} solutions have at least 45 words`);

  let math = 0;
  if (/\\\(|\\\[/.test(content)) math += 5;
  if (!/(^|[^\\])\$/.test(content.replace(/<script[\s\S]*?<\/script>/gi, " "))) math += 4;
  if (/\\operatorname|\\mathbf|\\hat|\\bar|\\sum|\\int/.test(content)) math += 3;
  if (countMatches(content, /<div class="formula">/g) >= 1) math += 3;
  addCriterion(parts, "Mathematical communication", math, 15, `${countMatches(content, /<div class="formula">/g)} formula blocks`);

  const plainText = normalizeText(content).toLowerCase();
  let accessibility = 0;
  if (/<p class="sub">/.test(content)) accessibility += 2;
  if (/Core Pattern|Checklist|How To Use It|Recognition Guide/.test(content)) accessibility += 3;
  if (bannedPhrases.every((phrase) => !plainText.includes(phrase))) accessibility += 3;
  if (wordCount(content.match(/<section class="hero">([\s\S]*?)<\/section>/)?.[1] || "") >= 20) accessibility += 2;
  addCriterion(parts, "Learner accessibility", accessibility, 10, "hero/core-pattern language present");

  const problemTags = problems.filter((block) => /<span class="tag/.test(block)).length;
  const diagnosticWords = ["concept", "mechanics", "application", "challenge", "hidden", "isi", "integration"];
  const diagnosticHits = diagnosticWords.filter((word) => plainText.includes(word)).length;
  let feedback = 0;
  if (problems.length) feedback += (problemTags / problems.length) * 8;
  feedback += Math.min(7, diagnosticHits);
  addCriterion(parts, "Feedback readiness", feedback, 15, `${problemTags}/${problems.length} problems have visible tags`);

  return summarizeScore(relative, "pset", parts);
}

function scoreLockedSubmissionQuiz(file, content) {
  const relative = path.relative(root, file);
  const problems = extractProblemBlocks(content);
  const rendered = content.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const metadataMatch = content.match(/<script id="quiz-metadata" type="application\/json">([\s\S]*?)<\/script>/);
  let metadata = null;
  try {
    metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
  } catch {
    metadata = null;
  }
  const parts = [];

  let structure = 0;
  [
    'class="wrap"',
    'class="hero"',
    'href="/psets/material-page.css"',
    'src="/psets/material-page.js"',
    "katex.min.css",
    "math-fallback"
  ].forEach((snippet) => {
    if (content.includes(snippet)) structure += 1.5;
  });
  if (metadata) structure += 3;
  if (metadata?.unlockPolicy === "solutions-after-submission") structure += 2;
  if (!/<details\b/i.test(rendered) && !/<summary\b/i.test(rendered)) structure += 1;
  if (problems.length > 0) structure += 5;
  addCriterion(parts, "Locked quiz workflow", structure, 20, `${problems.length} questions, unlock policy ${metadata?.unlockPolicy || "missing"}`);

  const questions = metadata?.questions || [];
  const topics = questions.length ? questions.map((question) => question.topic).filter(Boolean) : metadata?.topics || [];
  const topicCounts = new Map();
  topics.forEach((topic) => topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1));
  const questionTypes = new Map();
  questions.forEach((question) => questionTypes.set(question.type, (questionTypes.get(question.type) || 0) + 1));
  let coverage = 0;
  if (topics.length && topicCounts.size >= Math.min(6, topics.length)) coverage += 9;
  if (metadata?.questionCount === problems.length || questions.length === problems.length) coverage += 5;
  if (!questions.length || [...topicCounts.values()].every((count) => count >= 1)) coverage += 3;
  if (!questions.length || questionTypes.size >= 2) coverage += 3;
  addCriterion(parts, "Scope and topic balance", coverage, 20, `${topicCounts.size} topic groups`);

  const text = normalizeText(content).toLowerCase();
  const diagnosticWords = ["feedback", "workflow", "error", "diagnostic", "confidence", "scratch", "repair", "next"];
  const diagnosticHits = diagnosticWords.filter((word) => text.includes(word)).length;
  let diagnostic = 0;
  if (metadata?.feedbackWorkflow) diagnostic += 8;
  if (diagnosticHits >= 3) diagnostic += 6;
  if (problems.every((block) => /<span class="tag/.test(block))) diagnostic += 4;
  if (/instructions|checklist|core pattern/i.test(content)) diagnostic += 2;
  addCriterion(parts, "Diagnostic and feedback readiness", diagnostic, 20, `${diagnosticHits} diagnostic words`);

  let examFit = 0;
  if (/CMI|PSB|ISI|GATE|review quiz/i.test(content)) examFit += 5;
  if (/durationMinutes|90 minutes|120 minutes|two-hour|90-minute/i.test(content)) examFit += 4;
  if (/multi-select|short answer|written solution|written review|subpart/i.test(text)) examFit += 5;
  if (/trap|first step|correction note|pattern/i.test(text)) examFit += 4;
  if (metadata?.cmiRubricVersion || metadata?.feedbackWorkflow) examFit += 2;
  addCriterion(parts, "Exam fit and speed pressure", examFit, 20, metadata?.examTarget || metadata?.title || "locked review");

  const hasNoAnswerLanguage = !/(answer key|correct answer|solution<\/summary>|<details\b)/i.test(rendered);
  const promptWordCounts = problems.map((block) => wordCount(block));
  let answerability = 0;
  if (hasNoAnswerLanguage) answerability += 6;
  if (promptWordCounts.every((count) => count >= 10)) answerability += 5;
  if (problems.length >= 6) answerability += 4;
  if (/\\\(|\\\[/.test(content)) answerability += 3;
  if (!/(^|[^\\])\$/.test(rendered)) answerability += 2;
  addCriterion(parts, "Answerability without leakage", answerability, 20, `${problems.length} rendered questions`);

  return summarizeScore(relative, "locked review quiz", parts);
}

function extractFunctionBody(name) {
  const signature = `function ${name}`;
  const start = appSource.indexOf(signature);
  if (start === -1) return "";
  const open = appSource.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < appSource.length; index += 1) {
    const char = appSource[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return appSource.slice(open + 1, index);
  }
  return "";
}

function sectionBlock(sectionId) {
  const start = appSource.indexOf(`id: "${sectionId}"`);
  if (start === -1) return "";
  const nextSection = appSource.indexOf("\n    {\n      id:", start + 1);
  return appSource.slice(start, nextSection === -1 ? appSource.length : nextSection);
}

function collectConceptGraphMappings() {
  const body = extractFunctionBody("conceptGraphForSection");
  const mappings = [];
  const pattern = /section\?\.id === "([^"]+)"\) return ([A-Za-z0-9_]+)\(\);/g;
  let match;
  while ((match = pattern.exec(body))) {
    mappings.push({ sectionId: match[1], graphFunction: match[2] });
  }
  return mappings;
}

function collectGraphNodes(graphBody) {
  const nodesBlock = graphBody.match(/nodes: \{([\s\S]*?)\n    \}/)?.[1] || "";
  const nodes = [];
  const nodePattern = /^\s{6}"?([A-Za-z0-9-]+)"?: \{/gm;
  let match;
  while ((match = nodePattern.exec(nodesBlock))) nodes.push(match[1]);
  return nodes;
}

function collectMetadataEntries(questionBody) {
  const metadataBlock = questionBody.match(/const metadata = \{([\s\S]*?)\n  \};/)?.[1] || "";
  const entries = [];
  const pattern = /"([^"]+)": \{([^}]+)\}/g;
  let match;
  while ((match = pattern.exec(metadataBlock))) {
    const concept = match[2].match(/targetConcept: "([^"]+)"/)?.[1] || "";
    const prereqBlock = match[2].match(/prereqsUsed: \[([^\]]*)\]/)?.[1] || "";
    const prereqs = [...prereqBlock.matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
    const difficulty = Number(match[2].match(/difficulty: ([0-9]+)/)?.[1] || 0);
    const gateWeight = match[2].match(/gateWeight: "([^"]+)"/)?.[1] || "";
    entries.push({ id: match[1], concept, prereqs, difficulty, gateWeight });
  }
  return entries;
}

function collectQuestionBlocks(questionBody) {
  const blocks = [];
  const pattern = /\{\n\s+id: "([^"]+)",\n\s+kind: "([^"]+)",[\s\S]*?answer: "([^"]+)"\n\s+\}/g;
  let match;
  while ((match = pattern.exec(questionBody))) {
    blocks.push({ id: match[1], kind: match[2], answer: match[3], block: match[0] });
  }
  return blocks;
}

function scoreQuiz({ sectionId, graphFunction }) {
  const block = sectionBlock(sectionId);
  const graphBody = extractFunctionBody(graphFunction);
  const questionFunction = block.match(/questions: ([A-Za-z0-9_]+)\(\)/)?.[1] || "";
  const questionBody = extractFunctionBody(questionFunction);
  const graphNodes = collectGraphNodes(graphBody);
  const metadata = collectMetadataEntries(questionBody);
  const questions = collectQuestionBlocks(questionBody);
  const parts = [];

  let mechanics = 0;
  if (block.includes("reviewQuiz:")) mechanics += 4;
  if (questionFunction) mechanics += 4;
  if (graphBody.includes(`chapterId: "${sectionId}"`)) mechanics += 4;
  if (metadata.length === questions.length && questions.length > 0) mechanics += 4;
  if (graphBody.includes("repairMaterial") && graphBody.includes("fallbackInstruction")) mechanics += 4;
  addCriterion(parts, "Review workflow mechanics", mechanics, 20, `${metadata.length}/${questions.length} questions have metadata`);

  const single = questions.filter((question) => question.kind.includes("single")).length;
  const mixedTwo = questions.filter((question) => question.kind.includes("two")).length;
  const mixedThree = questions.filter((question) => question.kind.includes("three")).length;
  let progression = 0;
  if (single >= 1) progression += 6;
  if (mixedTwo >= 1) progression += 6;
  if (mixedThree >= 1) progression += 6;
  if (questions.length >= 4 && questions.length <= 12) progression += 2;
  addCriterion(parts, "Diagnostic progression", progression, 20, `${single} single, ${mixedTwo} two-concept, ${mixedThree} three-concept`);

  const metadataConcepts = new Set(metadata.flatMap((entry) => [entry.concept, ...entry.prereqs].filter(Boolean)));
  const missingConcepts = [...metadataConcepts].filter((concept) => !graphNodes.includes(concept));
  const targetConcepts = new Set(metadata.map((entry) => entry.concept).filter(Boolean));
  let coverage = 0;
  if (targetConcepts.size >= Math.min(questions.length, 4)) coverage += 7;
  if (metadataConcepts.size >= targetConcepts.size) coverage += 4;
  if (!missingConcepts.length) coverage += 6;
  if (graphNodes.length >= metadataConcepts.size) coverage += 3;
  addCriterion(parts, "Concept coverage", coverage, 20, `${targetConcepts.size} target concepts, ${missingConcepts.length} missing graph nodes`);

  const repairCount = countMatches(graphBody, /repairMaterial:/g);
  let actionability = 0;
  actionability += Math.min(8, repairCount);
  if (graphBody.includes("fallbackConcepts")) actionability += 4;
  if (graphBody.includes("fallbackDifficultyMix")) actionability += 4;
  if (graphBody.includes("stableNextAction")) actionability += 4;
  addCriterion(parts, "Feedback actionability", actionability, 20, `${repairCount} repair-material entries`);

  const optionCounts = questions.map((question) => countMatches(question.block, /\{ id: "[a-d]", text: "/g));
  const promptLengths = questions.map((question) => wordCount(question.block.match(/prompt: "([^"]+)"/)?.[1] || ""));
  const distinctOptions = questions.filter((question) => {
    const options = [...question.block.matchAll(/text: "([^"]+)"/g)].map((match) => match[1]);
    return uniqueCount(options) === options.length;
  }).length;
  let quality = 0;
  if (optionCounts.every((count) => count === 4)) quality += 6;
  if (promptLengths.every((count) => count >= 6)) quality += 4;
  if (distinctOptions === questions.length) quality += 5;
  if (metadata.every((entry) => entry.difficulty >= 1 && entry.gateWeight)) quality += 5;
  addCriterion(parts, "Question quality", quality, 20, `${distinctOptions}/${questions.length} questions have distinct options`);

  return summarizeScore(sectionId, "review quiz", parts);
}

function summarizeScore(name, type, parts) {
  const score = Math.round(parts.reduce((sum, part) => sum + part.earned, 0));
  const max = parts.reduce((sum, part) => sum + part.max, 0);
  return {
    name,
    type,
    score,
    max,
    passed: score >= minArtifactScore,
    parts
  };
}

function printResult(result) {
  const status = result.passed ? "PASS" : "FAIL";
  console.log(`${status} ${result.type}: ${result.name} — ${result.score}/${result.max}`);
  result.parts.forEach((part) => {
    const earned = Math.round(part.earned * 10) / 10;
    console.log(`  - ${part.label}: ${earned}/${part.max} (${part.evidence})`);
  });
}

const psetResults = walk(psetsDir).map(scorePset);
const quizResults = collectConceptGraphMappings().map(scoreQuiz);
const results = [...psetResults, ...quizResults];

if (!results.length) {
  console.error("No psets or graph-backed review quizzes found to judge.");
  process.exit(1);
}

results.forEach(printResult);

const average = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
console.log(`Average quality score: ${average}/100 across ${results.length} artifacts.`);

const failures = results.filter((result) => !result.passed);
if (failures.length || average < minAverageScore) {
  if (failures.length) {
    console.error(`Quality judge failed: ${failures.length} artifact${failures.length === 1 ? "" : "s"} below ${minArtifactScore}.`);
  }
  if (average < minAverageScore) {
    console.error(`Quality judge failed: average score ${average} is below ${minAverageScore}.`);
  }
  process.exit(1);
}

const psbVerifier = spawnSync(process.execPath, ["scripts/verify-platinum-psb-material.mjs"], {
  cwd: root,
  encoding: "utf8"
});
if (psbVerifier.stdout) process.stdout.write(psbVerifier.stdout);
if (psbVerifier.stderr) process.stderr.write(psbVerifier.stderr);
if (psbVerifier.status !== 0) process.exit(psbVerifier.status || 1);

console.log("Quality judge passed.");
