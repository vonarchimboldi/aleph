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
  ["shared material stylesheet", "material-page.css"],
  ["shared material renderer", "material-page.js"],
  ["main wrapper", 'class="wrap"'],
  ["hero section", 'class="hero"'],
  ["math fallback", "math-fallback"]
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
    refs.push(path.resolve(path.dirname(file), ref.split(/[?#]/)[0]));
  }
  return refs;
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

  const problemCount = countMatches(content, /<article class="problem"/g);
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

  return errors;
}

const pages = walk(psetsDir);
const errors = pages.flatMap(verifyPage);

if (!pages.length) {
  console.error("No material pages found under psets/.");
  process.exit(1);
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log(`Material page verification passed for ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
