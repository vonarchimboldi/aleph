#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const reportsDir = path.join(root, "reports");
const week = Number(argValue("--week") || 4);
const weekDir = `psets/week-${String(week).padStart(2, "0")}`;
const defaultFreshFeedback = `reports/platinum-feedback-${new Date().toISOString().slice(0, 10)}.json`;
const freshFeedbackPath = argValue("--feedback") || defaultFreshFeedback;
const fallbackFeedbackPath = argValue("--fallback-feedback") || latestNonEmptyFeedbackArtifact(freshFeedbackPath);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_JUDGE_MODEL || process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";
const skipLlm = process.argv.includes("--skip-llm");

const materialFiles = [
  "indicators",
  "conditional-expectation-tower",
  "order-statistics",
  "mle-estimation",
  "ump-np-tests",
  "regression-ols",
  "psb-review-quiz"
]
  .map((needle) => findWeekFile(weekDir, needle))
  .filter(Boolean);

if (!materialFiles.length) {
  console.error(`No PSB material files found for ${weekDir}.`);
  process.exit(1);
}

const freshFeedback = readJsonIfExists(freshFeedbackPath);
const fallbackFeedback = fallbackFeedbackPath ? readJsonIfExists(fallbackFeedbackPath) : null;
const evidence = chooseEvidence(freshFeedback, fallbackFeedback);
const deterministicReport = judgeDeterministically({ materialFiles, evidence });
let llmReport = null;

if (!skipLlm) {
  if (!apiKey) {
    console.error("OPENAI_API_KEY is required unless --skip-llm is set.");
    process.exit(1);
  }
  llmReport = await runLlmJudge({ materialFiles, evidence, deterministicReport });
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  modelJudge: skipLlm ? "not-run" : model,
  week,
  materialFiles,
  feedbackEvidence: evidence.summary,
  deterministicReport,
  llmReport,
  dspyGepaOptimizationPack: buildOptimizationPack({ materialFiles, evidence, deterministicReport, llmReport })
};

fs.mkdirSync(reportsDir, { recursive: true });
const base = `psb-week-${String(week).padStart(2, "0")}-quality-loop`;
const jsonPath = path.join(reportsDir, `${base}.json`);
const mdPath = path.join(reportsDir, `${base}.md`);
const datasetPath = path.join(reportsDir, `${base}-dspy-gepa-dataset.json`);
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(mdPath, renderMarkdown(report));
fs.writeFileSync(datasetPath, `${JSON.stringify(report.dspyGepaOptimizationPack, null, 2)}\n`);

console.log(`PSB quality report written: ${path.relative(root, jsonPath)}`);
console.log(`PSB quality summary written: ${path.relative(root, mdPath)}`);
console.log(`DSPy/GEPA dataset written: ${path.relative(root, datasetPath)}`);
if (llmReport?.overall?.score_100 !== undefined) {
  console.log(`LLM score: ${llmReport.overall.score_100}/100 (${llmReport.overall.readiness})`);
}
console.log(`Deterministic score: ${deterministicReport.overall.score_100}/100`);
console.log(`Regeneration candidates: ${deterministicReport.regenerationCandidates.length + (llmReport?.regeneration_candidates?.length || 0)}`);

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function readJsonIfExists(file) {
  if (!file || !fs.existsSync(path.join(root, file))) return null;
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function latestNonEmptyFeedbackArtifact(excludePath) {
  if (!fs.existsSync(path.join(root, "reports"))) return "";
  return fs.readdirSync(path.join(root, "reports"))
    .filter((file) => /^platinum-feedback-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => `reports/${file}`)
    .filter((file) => file !== excludePath)
    .map((file) => ({ file, json: readJsonIfExists(file) }))
    .filter((entry) => (entry.json?.feedbackEvidence?.totalFeedbackReports || 0) > 0)
    .sort((a, b) => b.file.localeCompare(a.file))[0]?.file || "";
}

function findWeekFile(dir, needle) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return "";
  const file = fs.readdirSync(fullDir).find((entry) => entry.includes(needle) && entry.endsWith(".html"));
  return file ? path.join(dir, file) : "";
}

function chooseEvidence(fresh, fallback) {
  const freshCount = fresh?.feedbackEvidence?.totalFeedbackReports || 0;
  const fallbackCount = fallback?.feedbackEvidence?.totalFeedbackReports || 0;
  const source = freshCount > 0 ? fresh : fallback;
  const sourcePath = freshCount > 0 ? freshFeedbackPath : fallbackFeedbackPath;
  const reports = source?.feedbackEvidence?.reports || [];
  const weakPrerequisites = collectWeakPrerequisites(reports);
  return {
    source,
    reports,
    weakPrerequisites,
    summary: {
      freshFeedbackPath,
      freshFeedbackReports: freshCount,
      fallbackFeedbackPath: fallbackCount ? fallbackFeedbackPath : "",
      fallbackFeedbackReports: fallbackCount,
      selectedEvidencePath: sourcePath || "",
      selectedEvidenceReason: freshCount > 0 ? "fresh production artifact had feedback reports" : "fresh production artifact was empty, so latest non-empty artifact was used",
      weakPrerequisites
    }
  };
}

function collectWeakPrerequisites(reports) {
  const byName = new Map();
  reports.forEach((report) => {
    (report.feedbackPrerequisiteHypotheses || []).forEach((hypothesis) => {
      const key = hypothesis.prerequisite || hypothesis.name || "";
      if (!key) return;
      const entry = byName.get(key) || {
        prerequisite: key,
        priority: hypothesis.priority || "",
        confidence: hypothesis.confidence || "",
        topics: new Set(),
        evidence: new Set(),
        nextDrills: new Set()
      };
      entry.topics.add(report.patternTitle || report.materialTitle || "PSB");
      if (hypothesis.hypothesis) entry.evidence.add(hypothesis.hypothesis);
      if (report.feedbackNextDrill) entry.nextDrills.add(report.feedbackNextDrill);
      byName.set(key, entry);
    });
  });
  return Array.from(byName.values()).map((entry) => ({
    prerequisite: entry.prerequisite,
    priority: entry.priority,
    confidence: entry.confidence,
    topics: Array.from(entry.topics),
    evidence: Array.from(entry.evidence),
    nextDrills: Array.from(entry.nextDrills)
  }));
}

function judgeDeterministically({ materialFiles, evidence }) {
  const pageScores = materialFiles.map((file) => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const text = normalize(html);
    const problems = html.match(/<article class="problem"[\s\S]*?<\/article>/g) || [];
    const isQuiz = /"unlockPolicy"\s*:\s*"solutions-after-submission"/.test(html);
    const parts = [];
    addPart(parts, "workflow", hasAll(html, ['class="wrap"', 'class="hero"', 'href="/psets/material-page.css"', 'src="/psets/material-page.js"', "math-fallback"]) ? 20 : 12, 20, "shared material shell and renderer");
    addPart(parts, "psb_structure", isQuiz ? (problems.length === 6 ? 15 : 8) : (problems.length === 10 ? 15 : 8), 15, `${problems.length} rendered problem cards`);
    addPart(parts, "feedback_alignment", feedbackAlignmentScore(file, text, evidence.weakPrerequisites), 25, "checks page-specific weak-prerequisite terms from feedback artifacts");
    addPart(parts, "exam_difficulty", examDifficultyScore(file, text, isQuiz), 20, "topic-specific PSB/ISI-style traps, support checks, pair cases, proof/explanation pressure");
    addPart(parts, "optimization_traceability", /Feedback-Informed Repair Focus|Feedback-Informed Review Targets/i.test(html) ? 20 : 6, 20, "visible link from feedback evidence to material");
    const score = Math.round(parts.reduce((sum, part) => sum + part.earned, 0));
    return {
      file,
      type: isQuiz ? "locked-review-quiz" : "daily-pset",
      score_100: score,
      pass: score >= 85,
      parts
    };
  });
  const average = Math.round(pageScores.reduce((sum, page) => sum + page.score_100, 0) / pageScores.length);
  const regenerationCandidates = pageScores
    .filter((page) => !page.pass)
    .map((page) => ({
      file: page.file,
      reason: `Deterministic PSB score ${page.score_100}/100 is below 85.`,
      targetRevision: "Add explicit feedback-informed repair/bridge/target/synthesis language and strengthen PSB trap/difficulty signals."
    }));
  return {
    overall: {
      score_100: average,
      pass: average >= 88 && regenerationCandidates.length === 0
    },
    pageScores,
    regenerationCandidates
  };
}

function hasAll(value, snippets) {
  return snippets.every((snippet) => value.includes(snippet));
}

function addPart(parts, label, earned, max, evidence) {
  parts.push({ label, earned: Math.max(0, Math.min(max, earned)), max, evidence });
}

function feedbackAlignmentScore(file, text, weakPrerequisites) {
  const relevant = relevantPrerequisitesForFile(file, weakPrerequisites);
  if (!relevant.length) return text.includes("translation") && text.includes("support") ? 25 : 18;
  const terms = {
    "pair-products": ["pair", "overlapping", "non-overlapping", "second moment", "joint probability"],
    "final-interpretation": ["interpretation", "dependence", "final", "justify"],
    "written-justification": ["why", "justification", "explain", "conditioning variable"],
    "support-tracking": ["support", "possible values", "conditional law"],
    "support-constraint": ["support", "allowed", "parameter", "boundary"],
    "rao-blackwell": ["rao-blackwell", "sufficient", "umvue", "conditional expectation"]
  };
  const needed = new Set();
  relevant.forEach((item) => (terms[item.prerequisite] || [item.prerequisite]).forEach((term) => needed.add(term)));
  const hits = Array.from(needed).filter((term) => text.includes(term)).length;
  return Math.min(25, Math.round((hits / Math.max(1, needed.size)) * 25));
}

function relevantPrerequisitesForFile(file, weakPrerequisites) {
  const lower = file.toLowerCase();
  const wanted = [];
  if (lower.includes("indicators")) wanted.push("pair-products", "final-interpretation");
  if (lower.includes("conditional-expectation")) wanted.push("written-justification", "support-tracking");
  if (lower.includes("mle")) wanted.push("support-constraint", "rao-blackwell");
  if (lower.includes("ump")) wanted.push("support-constraint");
  if (lower.includes("regression")) wanted.push("final-interpretation");
  if (lower.includes("review")) wanted.push("pair-products", "written-justification", "support-tracking", "support-constraint", "final-interpretation");
  return weakPrerequisites.filter((item) => wanted.includes(item.prerequisite));
}

function examDifficultyScore(file, text, isQuiz) {
  const lower = file.toLowerCase();
  let terms = ["psb", "synthesis", "repair trigger"];
  if (lower.includes("indicators")) terms = [...terms, "isi-style", "variance", "conditioning", "pair", "overlapping"];
  if (lower.includes("conditional-expectation")) terms = [...terms, "conditioning", "support", "random sum", "total variance"];
  if (lower.includes("order-statistics")) terms = [...terms, "isi-style", "support", "translation", "joint", "beta"];
  if (lower.includes("mle")) terms = [...terms, "support", "boundary", "parameter", "rao-blackwell", "umvue"];
  if (lower.includes("ump")) terms = [...terms, "support", "boundary", "power", "randomization", "likelihood ratio"];
  if (lower.includes("regression")) terms = [...terms, "projection", "orthogonal", "residual", "interpretation", "normal equation"];
  if (lower.includes("review")) terms = ["psb", "support", "boundary", "conditioning", "pair-product", "projection", "synthesis", "repair", "bridge", "target"];
  const hits = terms.filter((term) => text.includes(term)).length;
  return Math.min(20, Math.round((hits / Math.max(1, terms.length)) * 20) + (isQuiz ? 1 : 0));
}

async function runLlmJudge({ materialFiles, evidence, deterministicReport }) {
  const visibleMaterial = materialFiles.map((file) => ({
    file,
    text: normalize(fs.readFileSync(path.join(root, file), "utf8")).slice(0, 9000)
  }));
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["overall", "dimension_scores", "page_feedback", "regeneration_candidates", "dspy_gepa_recommendations"],
    properties: {
      overall: {
        type: "object",
        additionalProperties: false,
        required: ["score_100", "readiness", "summary"],
        properties: {
          score_100: { type: "number" },
          readiness: { type: "string" },
          summary: { type: "string" }
        }
      },
      dimension_scores: {
        type: "object",
        additionalProperties: false,
        required: ["feedback_alignment", "psb_difficulty", "skill_coverage", "repair_bridge_target_synthesis", "solution_quality", "variety"],
        properties: {
          feedback_alignment: dimensionSchema(),
          psb_difficulty: dimensionSchema(),
          skill_coverage: dimensionSchema(),
          repair_bridge_target_synthesis: dimensionSchema(),
          solution_quality: dimensionSchema(),
          variety: dimensionSchema()
        }
      },
      page_feedback: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["file", "score_100", "strength", "weakness", "required_change"],
          properties: {
            file: { type: "string" },
            score_100: { type: "number" },
            strength: { type: "string" },
            weakness: { type: "string" },
            required_change: { type: "string" }
          }
        }
      },
      regeneration_candidates: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["file", "reason", "target_revision"],
          properties: {
            file: { type: "string" },
            reason: { type: "string" },
            target_revision: { type: "string" }
          }
        }
      },
      dspy_gepa_recommendations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["candidate_prompt_change", "expected_metric_gain", "training_example_signal"],
          properties: {
            candidate_prompt_change: { type: "string" },
            expected_metric_gain: { type: "string" },
            training_example_signal: { type: "string" }
          }
        }
      }
    }
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            "You are Aleph's independent PSB Probability and Statistics material judge.",
            "Judge whether the supplied weekly material is adapted to learner feedback and hard enough for ISI PSB-style preparation.",
            "Do not provide solutions. Be strict about weak-prerequisite coverage, repair/bridge/target/synthesis structure, and variety.",
            "Return only JSON matching the schema."
          ].join("\n")
        },
        {
          role: "user",
          content: [
            `Week: ${week}`,
            "",
            "RUBRIC:",
            "Score feedback alignment, PSB difficulty, skill coverage, repair-bridge-target-synthesis structure, solution quality, and variety. Passing material should score at least 88/100 with no page below 85.",
            "",
            "FEEDBACK EVIDENCE:",
            JSON.stringify(evidence.summary, null, 2),
            "",
            "DETERMINISTIC REPORT:",
            JSON.stringify(deterministicReport, null, 2),
            "",
            "VISIBLE MATERIAL:",
            JSON.stringify(visibleMaterial, null, 2)
          ].join("\n")
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "psb_material_judge_report",
          schema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`LLM judge request failed: HTTP ${response.status}\n${details.slice(0, 1200)}`);
  }
  const result = await response.json();
  return JSON.parse(extractOutputText(result));
}

function dimensionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["score_2", "evidence"],
    properties: {
      score_2: { type: "number" },
      evidence: { type: "string" }
    }
  };
}

function buildOptimizationPack({ materialFiles, evidence, deterministicReport, llmReport }) {
  return {
    status: "dspy_gepa_ready",
    note: "This repo does not vendor DSPy or GEPA. The pack below is the optimization dataset: inputs, metric, labels, and candidate prompt deltas for an external DSPy/GEPA run.",
    metric: {
      name: "psb_material_quality",
      passRule: "overall >= 88, every page >= 85, LLM regeneration candidates empty",
      dimensions: ["feedback_alignment", "psb_difficulty", "skill_coverage", "repair_bridge_target_synthesis", "solution_quality", "variety"]
    },
    trainingExamples: materialFiles.map((file) => ({
      input: {
        file,
        weakPrerequisites: evidence.summary.weakPrerequisites
      },
      deterministicScore: deterministicReport.pageScores.find((page) => page.file === file)?.score_100 || null,
      llmScore: llmReport?.page_feedback?.find((page) => page.file === file)?.score_100 || null,
      label: (llmReport?.regeneration_candidates || []).some((item) => item.file === file) ? "revise" : "keep"
    })),
    promptCandidates: llmReport?.dspy_gepa_recommendations || [
      {
        candidate_prompt_change: "Require every PSB pset to include feedback-informed repair, bridge, target, and cumulative synthesis labels.",
        expected_metric_gain: "Higher feedback_alignment and repair_bridge_target_synthesis scores.",
        training_example_signal: "Use weak prerequisites from feedback artifact as hard constraints."
      }
    ]
  };
}

function extractOutputText(result) {
  if (result.output_text) return result.output_text;
  return (result.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function normalize(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function renderMarkdown(report) {
  const lines = [
    `# PSB Week ${report.week} Quality Loop`,
    "",
    `Generated: ${report.generatedAt}`,
    `Model judge: ${report.modelJudge}`,
    `Deterministic score: ${report.deterministicReport.overall.score_100}/100`,
    report.llmReport ? `LLM score: ${report.llmReport.overall.score_100}/100 (${report.llmReport.overall.readiness})` : "LLM score: not run",
    "",
    "## Feedback Evidence",
    "",
    `Selected artifact: ${report.feedbackEvidence.selectedEvidencePath}`,
    `Reason: ${report.feedbackEvidence.selectedEvidenceReason}`,
    "",
    "Weak prerequisites:",
    ...report.feedbackEvidence.weakPrerequisites.map((item) => `- ${item.prerequisite}: ${item.topics.join(", ")}`),
    "",
    "## Deterministic Page Scores",
    "",
    "| File | Score | Pass |",
    "| --- | ---: | --- |",
    ...report.deterministicReport.pageScores.map((page) => `| ${page.file} | ${page.score_100}/100 | ${page.pass ? "yes" : "no"} |`),
    "",
    "## LLM Findings",
    ""
  ];
  if (!report.llmReport) {
    lines.push("- Not run.");
  } else {
    lines.push(report.llmReport.overall.summary, "", "Regeneration candidates:");
    if (!report.llmReport.regeneration_candidates.length) {
      lines.push("- None.");
    } else {
      report.llmReport.regeneration_candidates.forEach((item) => lines.push(`- ${item.file}: ${item.reason}`));
    }
  }
  lines.push("", "## DSPy/GEPA Pack", "", report.dspyGepaOptimizationPack.note, "");
  return lines.join("\n");
}
