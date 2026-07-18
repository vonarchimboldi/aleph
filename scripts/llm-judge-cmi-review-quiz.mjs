#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const defaultQuiz = "psets/week-03/july-19-cmi-msds-dm-dsa-review-quiz.html";
const quizFile = process.argv[2] || defaultQuiz;
const quizPath = path.join(root, quizFile);
const rubricPath = path.join(root, "skills/question-generation/cmi-msds-review-rubric.md");
const reportsDir = path.join(root, "reports");

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_JUDGE_MODEL || process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";

if (!apiKey) {
  console.error("OPENAI_API_KEY is required to run the LLM quiz judge.");
  process.exit(1);
}

if (!fs.existsSync(quizPath)) {
  console.error(`Quiz file not found: ${quizFile}`);
  process.exit(1);
}

const html = fs.readFileSync(quizPath, "utf8");
const rubric = fs.readFileSync(rubricPath, "utf8");
const metadata = extractMetadata(html);
const renderedQuestions = extractQuestions(html);
const prompt = buildPrompt({ quizFile, metadata, renderedQuestions, rubric });

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "quiz_file",
    "model_judge",
    "overall",
    "dimension_scores",
    "topic_feedback",
    "question_feedback",
    "regeneration_candidates",
    "improvement_plan"
  ],
  properties: {
    quiz_file: { type: "string" },
    model_judge: { type: "string" },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["score_100", "difficulty_level", "cmi_readiness", "summary"],
      properties: {
        score_100: { type: "number" },
        difficulty_level: { type: "string" },
        cmi_readiness: { type: "string" },
        summary: { type: "string" }
      }
    },
    dimension_scores: {
      type: "object",
      additionalProperties: false,
      required: ["subject_coverage", "skills_required", "techniques_required", "analysis_level", "speed", "reasoning_kind"],
      properties: {
        subject_coverage: dimensionSchema(),
        skills_required: dimensionSchema(),
        techniques_required: dimensionSchema(),
        analysis_level: dimensionSchema(),
        speed: dimensionSchema(),
        reasoning_kind: dimensionSchema()
      }
    },
    topic_feedback: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["topic", "score_10", "difficulty", "strength", "weakness", "recommended_change"],
        properties: {
          topic: { type: "string" },
          score_10: { type: "number" },
          difficulty: { type: "string" },
          strength: { type: "string" },
          weakness: { type: "string" },
          recommended_change: { type: "string" }
        }
      }
    },
    question_feedback: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score_12", "pass", "strong_pass", "difficulty_fit", "main_issue", "regenerate", "revision_instruction"],
        properties: {
          id: { type: "string" },
          score_12: { type: "number" },
          pass: { type: "boolean" },
          strong_pass: { type: "boolean" },
          difficulty_fit: { type: "string" },
          main_issue: { type: "string" },
          regenerate: { type: "boolean" },
          revision_instruction: { type: "string" }
        }
      }
    },
    regeneration_candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "reason", "target_revision"],
        properties: {
          id: { type: "string" },
          reason: { type: "string" },
          target_revision: { type: "string" }
        }
      }
    },
    improvement_plan: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["priority", "change", "reason"],
        properties: {
          priority: { type: "string" },
          change: { type: "string" },
          reason: { type: "string" }
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
          "You are Aleph's independent review-quiz quality judge.",
          "Evaluate generated Discrete Math and DSA review quiz questions against the supplied CMI MS DS rubric.",
          "Be strict about difficulty, ambiguity, triviality, off-scope drift, answerability, and whether a miss would produce useful feedback.",
          "Do not provide solutions or answer keys.",
          "Return only the requested JSON schema."
        ].join("\n")
      },
      {
        role: "user",
        content: prompt
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "cmi_review_quiz_judge_report",
        schema,
        strict: true
      }
    }
  })
});

if (!response.ok) {
  const details = await response.text();
  console.error(`LLM judge request failed: ${response.status}`);
  console.error(details.slice(0, 1200));
  process.exit(1);
}

const result = await response.json();
const outputText = extractOutputText(result);
if (!outputText) {
  console.error("LLM judge returned no structured output.");
  process.exit(1);
}

let report;
try {
  report = JSON.parse(outputText);
} catch (error) {
  console.error(`LLM judge returned invalid JSON: ${error.message}`);
  console.error(outputText.slice(0, 1200));
  process.exit(1);
}

const reportBase = path.basename(quizFile, ".html");
const jsonPath = path.join(reportsDir, `${reportBase}-llm-judge.json`);
const mdPath = path.join(reportsDir, `${reportBase}-llm-judge.md`);
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(mdPath, renderMarkdown(report));

console.log(`LLM judge report written: ${path.relative(root, jsonPath)}`);
console.log(`LLM judge summary written: ${path.relative(root, mdPath)}`);
console.log(`Score: ${report.overall.score_100}/100 (${report.overall.difficulty_level}; ${report.overall.cmi_readiness})`);
console.log(`Regeneration candidates: ${report.regeneration_candidates.length}`);

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

function extractMetadata(content) {
  const match = content.match(/<script id="quiz-metadata" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  return JSON.parse(match[1]);
}

function extractQuestions(content) {
  return (content.match(/<article class="problem"[\s\S]*?<\/article>/g) || []).map((block) => {
    const id = block.match(/<article class="problem" id="([^"]+)"/)?.[1] || "";
    const title = stripHtml(block.match(/<div class="problem-title">([\s\S]*?)<\/div>/)?.[1] || "");
    const tags = [...block.matchAll(/<span class="tag[^"]*">([\s\S]*?)<\/span>/g)].map((match) => stripHtml(match[1]));
    const statement = stripHtml(block.replace(/<div class="problem-head">[\s\S]*?<\/div><\/div>/, ""));
    return { id, title, tags, statement };
  });
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPrompt({ quizFile, metadata, renderedQuestions, rubric }) {
  return [
    `Quiz file: ${quizFile}`,
    "",
    "CMI RUBRIC:",
    rubric,
    "",
    "QUIZ METADATA JSON:",
    JSON.stringify(metadata, null, 2),
    "",
    "VISIBLE QUESTIONS:",
    JSON.stringify(renderedQuestions, null, 2),
    "",
    "Judge tasks:",
    "1. Score every rubric dimension for the whole quiz.",
    "2. Classify the actual difficulty level, not the intended metadata difficulty.",
    "3. Identify weak questions, ambiguity, trivial formula-recall items, topic imbalance, missing CMI-style traps, and speed problems.",
    "4. Mark any question that should be regenerated or revised.",
    "5. Give a concise improvement plan for the generation process.",
    "6. Do not reveal correct options, answers, or worked solutions."
  ].join("\n");
}

function extractOutputText(result) {
  if (result.output_text) return result.output_text;
  return (result.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function renderMarkdown(report) {
  const lines = [
    `# LLM Judge Report - ${report.quiz_file}`,
    "",
    `Model: ${report.model_judge || model}`,
    `Overall: ${report.overall.score_100}/100`,
    `Difficulty: ${report.overall.difficulty_level}`,
    `CMI readiness: ${report.overall.cmi_readiness}`,
    "",
    "## Summary",
    "",
    report.overall.summary,
    "",
    "## Dimension Scores",
    "",
    "| Dimension | Score | Evidence |",
    "| --- | ---: | --- |"
  ];

  Object.entries(report.dimension_scores).forEach(([dimension, value]) => {
    lines.push(`| ${dimension} | ${value.score_2}/2 | ${value.evidence} |`);
  });

  lines.push("", "## Topic Feedback", "");
  report.topic_feedback.forEach((topic) => {
    lines.push(`- ${topic.topic}: ${topic.score_10}/10, ${topic.difficulty}. ${topic.recommended_change}`);
  });

  lines.push("", "## Regeneration Candidates", "");
  if (!report.regeneration_candidates.length) {
    lines.push("- None.");
  } else {
    report.regeneration_candidates.forEach((item) => {
      lines.push(`- ${item.id}: ${item.reason} Revision: ${item.target_revision}`);
    });
  }

  lines.push("", "## Improvement Plan", "");
  report.improvement_plan.forEach((item) => {
    lines.push(`- ${item.priority}: ${item.change} Reason: ${item.reason}`);
  });

  lines.push("");
  return lines.join("\n");
}
