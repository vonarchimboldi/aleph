#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appPath = path.join(root, "app.js");
const source = fs.readFileSync(appPath, "utf8");

function extractFunctionBody(name) {
  const signature = `function ${name}`;
  const start = source.indexOf(signature);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return "";
}

function sectionBlock(sectionId) {
  const start = source.indexOf(`id: "${sectionId}"`);
  if (start === -1) return "";
  const nextSection = source.indexOf("\n    {\n      id:", start + 1);
  return source.slice(start, nextSection === -1 ? source.length : nextSection);
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

function collectMetadataQuestionIds(questionFunctionBody) {
  const metadataBlock = questionFunctionBody.match(/const metadata = \{([\s\S]*?)\n  \};/)?.[1] || "";
  const ids = new Set();
  const idPattern = /"([^"]+)": \{[^}]*targetConcept:[^}]*prereqsUsed:[^}]*difficulty:[^}]*gateWeight:[^}]*\}/g;
  let match;
  while ((match = idPattern.exec(metadataBlock))) {
    ids.add(match[1]);
  }
  return ids;
}

function collectQuestionIds(questionFunctionBody) {
  const ids = new Set();
  const idPattern = /id: "([^"]+)",\s*\n\s*kind:/g;
  let match;
  while ((match = idPattern.exec(questionFunctionBody))) {
    ids.add(match[1]);
  }
  return ids;
}

function collectGraphNodes(graphBody) {
  const nodesBlock = graphBody.match(/nodes: \{([\s\S]*?)\n    \}/)?.[1] || "";
  const nodes = new Set();
  const nodePattern = /^\s{6}"?([A-Za-z0-9-]+)"?: \{/gm;
  let match;
  while ((match = nodePattern.exec(nodesBlock))) {
    nodes.add(match[1]);
  }
  return nodes;
}

function collectMetadataConcepts(questionFunctionBody) {
  const metadataBlock = questionFunctionBody.match(/const metadata = \{([\s\S]*?)\n  \};/)?.[1] || "";
  const concepts = new Set();
  const fields = ["targetConcept", "prereqsUsed"];
  fields.forEach((field) => {
    const pattern = new RegExp(`${field}: (${field === "targetConcept" ? '"[^"]+"' : "\\[[^\\]]*\\]"})`, "g");
    let match;
    while ((match = pattern.exec(metadataBlock))) {
      const valuePattern = /"([^"]+)"/g;
      let value;
      while ((value = valuePattern.exec(match[1]))) {
        concepts.add(value[1]);
      }
    }
  });
  return concepts;
}

const errors = [];

[
  ["metadata-aware scoring", "const scoredConcepts = new Set(["],
  ["target concept scoring", "answer.targetConcept"],
  ["prerequisite scoring", "...(answer.prereqsUsed || [])"],
  ["graph-backed assessment dashboard", "activeGateDaSections().filter((section) => conceptGraphForSection(section))"],
  ["graph-backed feedback report", "const graph = conceptGraphForSection(section)"]
].forEach(([label, snippet]) => {
  if (!source.includes(snippet)) errors.push(`app.js: missing ${label}`);
});

const mappings = collectConceptGraphMappings();
if (!mappings.length) {
  errors.push("app.js: no review quiz concept graph mappings found in conceptGraphForSection");
}

mappings.forEach(({ sectionId, graphFunction }) => {
  const block = sectionBlock(sectionId);
  const graphBody = extractFunctionBody(graphFunction);
  const questionFunction = block.match(/questions: ([A-Za-z0-9_]+)\(\)/)?.[1] || "";
  const questionBody = questionFunction ? extractFunctionBody(questionFunction) : "";

  if (!block) errors.push(`app.js: graph-backed section ${sectionId} is missing from gateDaProbabilitySections`);
  if (!block.includes("reviewQuiz:")) errors.push(`app.js: graph-backed section ${sectionId} must define reviewQuiz`);
  if (!questionFunction) errors.push(`app.js: graph-backed section ${sectionId} reviewQuiz must call a question generator`);
  if (!graphBody) errors.push(`app.js: graph function ${graphFunction} is missing`);
  if (!questionBody) errors.push(`app.js: question generator ${questionFunction || "(missing)"} is missing`);

  if (!graphBody.includes(`chapterId: "${sectionId}"`)) {
    errors.push(`app.js: ${graphFunction} chapterId must match ${sectionId}`);
  }
  ["fallbackConcepts", "fallbackDifficultyMix", "fallbackInstruction", "stableNextAction", "repairMaterial"].forEach((snippet) => {
    if (!graphBody.includes(snippet)) errors.push(`app.js: ${graphFunction} missing ${snippet}`);
  });

  if (!questionBody.includes("const metadata = {")) {
    errors.push(`app.js: ${questionFunction} must declare per-question metadata`);
  }
  if (!questionBody.includes(".map((question) => ({")) {
    errors.push(`app.js: ${questionFunction} must attach metadata to generated questions`);
  }

  const questionIds = collectQuestionIds(questionBody);
  const metadataIds = collectMetadataQuestionIds(questionBody);
  questionIds.forEach((id) => {
    if (!metadataIds.has(id)) {
      errors.push(`app.js: ${questionFunction} question ${id} is missing complete targetConcept/prereqsUsed/difficulty/gateWeight metadata`);
    }
  });

  const graphNodes = collectGraphNodes(graphBody);
  const metadataConcepts = collectMetadataConcepts(questionBody);
  metadataConcepts.forEach((concept) => {
    if (!graphNodes.has(concept)) {
      errors.push(`app.js: ${questionFunction} metadata concept "${concept}" is missing from ${graphFunction}.nodes`);
    }
  });
});

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log(`Review quiz verification passed for ${mappings.length} graph-backed quiz${mappings.length === 1 ? "" : "zes"}.`);
