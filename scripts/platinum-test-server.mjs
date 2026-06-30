import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import generateFeedbackHandler from "../api/generate-feedback.js";

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), ".."));
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || "127.0.0.1";
const FEEDBACK_MODE = process.env.ALEPH_FEEDBACK_MODE || (process.env.OPENAI_API_KEY ? "real" : "mock");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"]
]);

let latestPlatinumSnapshot = null;

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith("/api/generate-feedback")) {
      return handleGenerateFeedback(request, response);
    }
    if (request.url?.startsWith("/api/feedback-mode")) {
      return sendJson(response, 200, {
        mode: FEEDBACK_MODE,
        label: FEEDBACK_MODE === "real" ? "real OpenAI API" : "local mock"
      });
    }
    if (request.url?.startsWith("/api/send-feedback")) {
      return handleMockEmail(request, response);
    }
    if (request.url?.startsWith("/api/platinum-progress")) {
      return handlePlatinumProgress(request, response);
    }
    return serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: "Local test server failed", details: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Aleph Platinum test environment: http://${HOST}:${PORT}`);
  console.log("Use login: platinum / platinum");
  console.log(`Feedback mode: ${FEEDBACK_MODE === "real" ? "real OpenAI API" : "local mock"}`);
  console.log("Feedback email endpoint is mocked for local testing.");
});

async function serveStatic(request, response) {
  const parsed = new URL(request.url || "/", `http://${HOST}:${PORT}`);
  const cleanPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  const requestedPath = cleanPath && cleanPath !== "/" ? cleanPath : "index.html";
  const safePath = normalize(join(ROOT, requestedPath));

  if (!safePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(safePath);
    const type = mimeTypes.get(extname(safePath)) || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store, max-age=0"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function handleGenerateFeedback(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "POST" });
    response.end();
    return;
  }

  const body = await readJson(request);
  if (!body.materialTitle || !body.workflow || !body.solutionText) {
    sendJson(response, 400, { error: "Missing material title, rubric workflow, or solution text" });
    return;
  }

  if (FEEDBACK_MODE === "real") {
    return handleRealFeedback(body, response);
  }

  const feedbackRecord = buildMockFeedback(body);
  sendJson(response, 200, {
    feedbackRecord,
    feedback: summarizeFeedback(feedbackRecord),
    model: "aleph-local-mock-feedback"
  });
}

async function handleRealFeedback(body, response) {
  const requestShim = {
    method: "POST",
    body
  };
  const responseShim = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(response, this.statusCode, payload);
    }
  };
  await generateFeedbackHandler(requestShim, responseShim);
}

async function handleMockEmail(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "POST" });
    response.end();
    return;
  }
  await readJson(request);
  sendJson(response, 200, {
    id: `local-feedback-email-${Date.now()}`,
    mocked: true
  });
}

async function handlePlatinumProgress(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, {
      snapshot: latestPlatinumSnapshot,
      store: "local-memory-test"
    });
    return;
  }

  if (request.method === "POST") {
    latestPlatinumSnapshot = await readJson(request);
    sendJson(response, 200, {
      ok: true,
      store: "local-memory-test",
      materialCount: latestPlatinumSnapshot?.materials?.length || 0
    });
    return;
  }

  response.writeHead(405, { Allow: "GET, POST" });
  response.end();
}

function buildMockFeedback(payload) {
  const solution = String(payload.solutionText || "");
  const hasAttachedFile = Boolean(payload.uploadedFile?.fileDataUrl);
  const lower = solution.toLowerCase();
  const hasIndicator = /indicator|1\{|sum/i.test(solution);
  const hasIndependenceIssue = /independent|multiply|product/i.test(solution);
  const score = hasIndicator ? (hasIndependenceIssue ? 5 : 7) : 3;
  const verdict = score >= 8 ? "green" : score >= 5 ? "yellow" : "red";
  const conceptGap = hasIndependenceIssue
    ? {
        tag: "indicator-dependence-check",
        description: "The setup uses indicators, but the pair event is treated as independent without checking the shared constraint."
      }
    : {
        tag: "pattern-recognition",
        description: "The solution does not clearly identify the probability/statistics pattern before calculating."
      };

  return {
    verdict,
    score,
    maxScore: 10,
    studentSummary: `Local test feedback for ${payload.materialTitle}: the ${hasAttachedFile ? "uploaded file attachment reached the feedback API and was" : "submitted solution text was"} parsed with the mock Platinum rubric.`,
    whatTheyGotRight: hasIndicator
      ? [`${hasAttachedFile ? "The uploaded file was attached to the feedback request. " : ""}You introduced indicator variables, which is the right starting move for this type of expectation/counting problem.`]
      : ["You attempted a direct probability calculation and gave enough written work for feedback."],
    stillNotUnderstood: [
      conceptGap.description
    ],
    errorsDespiteKnowing: [
      "The calculation jumps from setup to answer without isolating the first pair/counting term that controls the variance or review statistic."
    ],
    firstIssue: {
      location: hasIndependenceIssue ? "First variance/pair-probability step" : "Opening setup",
      explanation: hasIndependenceIssue
        ? "The mock grader detected an independence-style shortcut. For these Platinum probability sets, pair events often share a constraint and need an explicit joint probability."
        : "The solution needs to name the target pattern first, then define variables that match that pattern."
    },
    conceptGap,
    correctApproach: [
      "Name the recurring pattern before calculating.",
      "Define the random variables or indicators.",
      "Compute one marginal term and one joint/pair term separately.",
      "Only simplify after the dependency structure is clear."
    ],
    minimalCorrection: "Rewrite the first setup line and add a separate joint-probability or conditioning calculation before the final simplification.",
    nextDrill: {
      skillTag: conceptGap.tag,
      difficulty: "application",
      instruction: "Do one smaller version of the same problem with 3 objects, write the indicator definitions, then compute the pair term explicitly."
    },
    masteryUpdates: [
      {
        skill: "setup",
        delta: hasIndicator ? 1 : -1,
        reason: hasIndicator ? "Indicator setup is present." : "Target variables were not clearly defined."
      },
      {
        skill: conceptGap.tag,
        delta: -1,
        reason: "The mock feedback found a prerequisite gap that should be retested on Sunday."
      }
    ],
    prerequisiteChecks: [
      {
        prerequisite: hasIndependenceIssue ? "joint probability for dependent indicators" : "pattern recognition before setup",
        status: hasIndependenceIssue ? "missing" : "shaky",
        evidence: hasIndependenceIssue
          ? "The solution multiplies pair probabilities before checking dependence."
          : "The solution begins calculating before naming the reusable method.",
        repairWork: hasIndependenceIssue
          ? "Do direct joint-probability drills with two dependent indicator events."
          : "Do prerequisite-only drills where the answer is just the method trigger and variable definitions.",
        bridgeWork: hasIndependenceIssue
          ? "Add one bridge problem where the same pair probability appears inside a variance calculation."
          : "Add one bridge problem that starts with pattern recognition and then asks for a short calculation."
      }
    ],
    errorAnalysis: [
      {
        errorType: hasIndependenceIssue ? "probability_model_error" : "setup_error",
        observedError: hasIndependenceIssue
          ? "Treats a dependent pair/counting event like a product of marginals."
          : "Starts calculating before defining the pattern and variables.",
        likelyPrerequisite: hasIndependenceIssue ? "joint probability for dependent indicators" : "pattern recognition and variable definition",
        confidence: lower.length > 80 ? "medium" : "low",
        evidence: solution.slice(0, 180),
        repairPriority: "high"
      }
    ],
    prerequisiteHypotheses: [
      {
        prerequisite: hasIndependenceIssue ? "joint probability for dependent indicators" : "pattern recognition before setup",
        hypothesis: hasIndependenceIssue
          ? "The learner may know indicators but may not yet test whether pair events are independent."
          : "The learner may need a mechanical routine for naming the pattern and variables before solving.",
        confidence: lower.length > 80 ? "medium" : "low",
        evidence: "Generated by the local Platinum test feedback endpoint.",
        sourceSkill: conceptGap.tag,
        testOnSunday: true,
        repairPriority: "high"
      }
    ],
    diagnosticRecommendations: [
      {
        prerequisite: hasIndependenceIssue ? "joint probability for dependent indicators" : "pattern recognition before setup",
        diagnosticProblemType: "A two-part Sunday diagnostic: first a direct prerequisite check, then a bridge problem using the same pset pattern.",
        confirmationCriterion: "Confirmed if the same setup or dependency error appears in either part.",
        bridgeProblemType: "Smaller-count version of the uploaded material with the pair/joint term made visible."
      }
    ],
    adaptivePlanSignal: {
      advanceNormally: false,
      repairRatio: 0.35,
      bridgeRatio: 0.25,
      targetRatio: 0.25,
      cumulativeRatio: 0.15,
      rationale: "Local mock signal: allocate repair and bridge work before advancing because the submitted solution shows a prerequisite risk."
    },
    questionFeedback: buildMockQuestionFeedback({ hasAttachedFile, hasIndicator, hasIndependenceIssue, conceptGap }),
    narrativeFeedback: {
      overall: "This attempt shows the learner is beginning from the right family of ideas: using indicators to turn a counting problem into a sum of simple random variables. The main break is not effort or notation; it is the transition from expectation-style indicator work to second-moment or variance-style indicator work.",
      understood: "The learner understands that a count can often be represented as a sum of indicator variables. That is a strong starting point because it reduces a complicated count to smaller yes/no events.",
      shaky: hasIndependenceIssue
        ? "The shaky part is dependence. The solution treats pair events as if they can be multiplied immediately, but indicator pairs in occupancy and counting problems often share the same underlying objects."
        : "The shaky part is naming the exact pattern before calculation. The solution needs to say what each indicator counts and why that indicator matches the question.",
      missing: "What is missing is a separate pair or joint-probability calculation. Without that step, the final answer may look plausible but is not justified.",
      improvementPlan: "The next improvement is to redo one smaller version of the problem and write three lines only: define the indicator, compute one marginal probability, and compute one pair probability. After those three lines are correct, the original problem becomes much safer."
    },
    studentReport: {
      headline: "Local test feedback generated",
      right: hasIndicator
        ? ["Good first move: indicators are the right tool here."]
        : ["You submitted enough written work for the feedback flow to run."],
      notYet: [conceptGap.description],
      executionIssues: ["The first unsupported calculation step needs to be separated and justified."],
      masteryPlan: [
        "Redo the setup on a smaller example.",
        "Write the marginal term and pair/joint term on separate lines.",
        "Then return to the original problem."
      ],
      encouragement: "This is mock local feedback for testing upload, rendering, storage, and adaptive-plan wiring."
    }
  };
}

function buildMockQuestionFeedback({ hasAttachedFile, hasIndicator, hasIndependenceIssue, conceptGap }) {
  const source = hasAttachedFile ? "uploaded file" : "submitted text";
  return [
    {
      question: "1",
      status: hasIndicator ? "partially correct" : "incorrect",
      summary: `From the ${source}, the first setup uses the right general direction but needs a cleaner pattern statement.`,
      issue: hasIndicator ? "The indicator definition is present but not tied to the exact counted object." : "The target counting pattern is not clearly identified.",
      correction: "Start with one sentence naming the pattern, then define one indicator for one counted object.",
      skillTag: hasIndicator ? "indicator-definition" : conceptGap.tag
    },
    {
      question: "2",
      status: hasIndependenceIssue ? "incorrect" : "unclear",
      summary: hasIndependenceIssue ? "The pair term is treated as a product of marginals." : "The mock grader cannot see a complete pair-term calculation.",
      issue: hasIndependenceIssue ? "Dependence was not checked before multiplying probabilities." : "The joint probability step needs to be visible.",
      correction: "Write the overlapping and non-overlapping cases separately before simplifying.",
      skillTag: hasIndependenceIssue ? "pair-products" : "linearity-of-expectation"
    },
    {
      question: "3",
      status: "unclear",
      summary: "The local mock does not perform real PDF vision; it only verifies that the same-page question feedback UI works.",
      issue: "Use a production OpenAI key to grade actual handwritten PDF/image content.",
      correction: "Keep this card layout, but replace mock text with model output from the uploaded file.",
      skillTag: "local-test-mode"
    }
  ];
}

function summarizeFeedback(record) {
  const score = Number.isFinite(record.score) ? `${record.score}/${record.maxScore || 10}` : "unscored";
  const gap = record.conceptGap?.tag || "no skill tag";
  const issue = record.firstIssue?.location || "first issue not marked";
  return `${record.verdict.toUpperCase()} - ${score}. Gap: ${gap}. First issue: ${issue}. ${record.minimalCorrection}`;
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0"
  });
  response.end(JSON.stringify(payload));
}
