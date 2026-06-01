#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const psetsDir = path.join(root, "psets");
const bannedPhrases = [
  "clearly",
  "trivially",
  "by inspection",
  "it follows"
];

const requiredSnippets = [
  ["KaTeX stylesheet", "katex.min.css"],
  ["KaTeX script", "katex.min.js"],
  ["KaTeX auto-render script", "auto-render.min.js"],
  ["root-relative shared material stylesheet", 'href="/psets/material-page.css"'],
  ["root-relative shared material renderer", 'src="/psets/material-page.js"'],
  ["main wrapper", 'class="wrap"'],
  ["hero section", 'class="hero"'],
  ["math fallback", "math-fallback"]
];

const progressionSections = [
  {
    range: "Problems 1-5",
    allowedLabels: ["concept", "mechanic"]
  },
  {
    range: "Problems 6-8",
    allowedLabels: ["integration", "application"]
  },
  {
    range: "Problems 9-10",
    allowedLabels: ["challenge", "hidden", "isi"]
  }
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function stripCodeAndMath(content) {
  return content
    .replace(/\\\[[\s\S]*?\\\]/g, " ")
    .replace(/\\\([\s\S]*?\\\)/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function countMatches(content, pattern) {
  return (content.match(pattern) || []).length;
}

function localAssetPaths(file, content) {
  const refs = [];
  const refPattern = /\b(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = refPattern.exec(content))) {
    const ref = match[1];
    if (/^(https?:|mailto:|#)/.test(ref)) continue;
    const cleanRef = ref.split(/[?#]/)[0];
    refs.push(cleanRef.startsWith("/") ? path.join(root, cleanRef) : path.resolve(path.dirname(file), cleanRef));
  }
  return refs;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\\operatorname\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\left|\\right/g, "")
    .replace(/\\[()[\]]/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\\/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractProblemBlocks(content) {
  const blocks = [];
  const pattern = /<article class="problem"[\s\S]*?<\/article>/g;
  let match;
  while ((match = pattern.exec(content))) {
    blocks.push(match[0]);
  }
  return blocks;
}

function extractProblemTitle(block) {
  return normalizeText(block.match(/<div class="problem-title">([\s\S]*?)<\/div>/)?.[1] || "");
}

function extractProblemStatement(block) {
  const beforeDetails = block.split("<details>")[0] || block;
  const paragraph = beforeDetails.match(/<p>([\s\S]*?)<\/p>/)?.[1] || "";
  return normalizeText(paragraph);
}

function verifyProgression(relative, content, problemCount) {
  const errors = [];
  if (problemCount !== 10) return errors;

  progressionSections.forEach(({ range, allowedLabels }) => {
    const sectionPattern = new RegExp(`<div class="section-label">\\s*${range.replace("-", "\\-")}\\s*[^<]*?<\\/div>`, "i");
    const hasRange = sectionPattern.test(content);
    const hasLabel = allowedLabels.some((label) => new RegExp(`${range.replace("-", "\\-")}[^<]*${label}`, "i").test(content));
    if (!hasRange || !hasLabel) {
      errors.push(`${relative}: missing gradual progression section "${range}" with label ${allowedLabels.join(" or ")}`);
    }
  });

  return errors;
}

function verifyPage(file) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  const errors = [];

  requiredSnippets.forEach(([label, snippet]) => {
    if (!content.includes(snippet)) {
      errors.push(`${relative}: missing ${label}`);
    }
  });

  if (/<style[\s\S]*?>/i.test(content)) {
    errors.push(`${relative}: inline <style> block is not allowed; use psets/material-page.css`);
  }

  const problemBlocks = extractProblemBlocks(content);
  const problemCount = problemBlocks.length;
  const solutionCount = countMatches(content, /<summary>\s*Solution\s*<\/summary>/g);
  if (problemCount === 0) {
    errors.push(`${relative}: no problem cards found`);
  }
  if (problemCount !== solutionCount) {
    errors.push(`${relative}: ${problemCount} problem cards but ${solutionCount} solutions`);
  }

  if (!/Answer Summary/.test(content)) {
    errors.push(`${relative}: missing Answer Summary`);
  }

  errors.push(...verifyProgression(relative, content, problemCount));

  if (/(^|[^\\])\$/.test(stripCodeAndMath(content))) {
    errors.push(`${relative}: raw dollar math detected; use \\(...\\) or \\[...\\]`);
  }

  const textContent = stripCodeAndMath(content)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
  bannedPhrases.forEach((phrase) => {
    if (textContent.includes(phrase)) {
      errors.push(`${relative}: banned terse phrase "${phrase}" found`);
    }
  });

  localAssetPaths(file, content).forEach((assetPath) => {
    if (!fs.existsSync(assetPath)) {
      errors.push(`${relative}: missing local asset ${path.relative(root, assetPath)}`);
    }
  });

  return {
    errors,
    problems: problemBlocks.map((block, index) => ({
      file: relative,
      index: index + 1,
      title: extractProblemTitle(block),
      statement: extractProblemStatement(block)
    }))
  };
}

const pages = walk(psetsDir);
const results = pages.map(verifyPage);
const errors = results.flatMap((result) => result.errors);
const allProblems = results.flatMap((result) => result.problems);

function duplicateErrors(items, key, label) {
  const seen = new Map();
  const duplicateMessages = [];
  items.forEach((item) => {
    const value = item[key];
    if (!value) return;
    const existing = seen.get(value);
    if (existing) {
      duplicateMessages.push(
        `${item.file}: problem ${item.index} repeats ${label} from ${existing.file} problem ${existing.index}: "${value}"`
      );
      return;
    }
    seen.set(value, item);
  });
  return duplicateMessages;
}

errors.push(...duplicateErrors(allProblems, "title", "title"));
errors.push(...duplicateErrors(allProblems, "statement", "statement"));

if (!pages.length) {
  console.error("No material pages found under psets/.");
  process.exit(1);
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log(`Material page verification passed for ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
