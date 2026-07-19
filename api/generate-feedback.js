const FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "verdict",
    "score",
    "maxScore",
    "studentSummary",
    "whatTheyGotRight",
    "stillNotUnderstood",
    "errorsDespiteKnowing",
    "firstIssue",
    "conceptGap",
    "correctApproach",
    "minimalCorrection",
    "nextDrill",
    "masteryUpdates",
    "prerequisiteChecks",
    "errorAnalysis",
    "prerequisiteHypotheses",
    "diagnosticRecommendations",
    "adaptivePlanSignal",
    "questionFeedback",
    "narrativeFeedback",
    "studentReport"
  ],
  properties: {
    verdict: { type: "string", enum: ["green", "yellow", "red"] },
    score: { type: "number", minimum: 0, maximum: 100 },
    maxScore: { type: "number", minimum: 1, maximum: 100 },
    studentSummary: { type: "string" },
    whatTheyGotRight: { type: "array", items: { type: "string" } },
    stillNotUnderstood: { type: "array", items: { type: "string" } },
    errorsDespiteKnowing: { type: "array", items: { type: "string" } },
    firstIssue: {
      type: "object",
      additionalProperties: false,
      required: ["location", "explanation"],
      properties: {
        location: { type: "string" },
        explanation: { type: "string" }
      }
    },
    conceptGap: {
      type: "object",
      additionalProperties: false,
      required: ["tag", "description"],
      properties: {
        tag: { type: "string" },
        description: { type: "string" }
      }
    },
    correctApproach: { type: "array", items: { type: "string" } },
    minimalCorrection: { type: "string" },
    nextDrill: {
      type: "object",
      additionalProperties: false,
      required: ["skillTag", "difficulty", "instruction"],
      properties: {
        skillTag: { type: "string" },
        difficulty: { type: "string", enum: ["mechanics", "application", "hard"] },
        instruction: { type: "string" }
      }
    },
    masteryUpdates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["skill", "delta", "reason"],
        properties: {
          skill: { type: "string" },
          delta: { type: "number", enum: [-1, 0, 1] },
          reason: { type: "string" }
        }
      }
    },
    prerequisiteChecks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prerequisite", "status", "evidence", "repairWork", "bridgeWork"],
        properties: {
          prerequisite: { type: "string" },
          status: { type: "string", enum: ["secure", "shaky", "missing", "not checked"] },
          evidence: { type: "string" },
          repairWork: { type: "string" },
          bridgeWork: { type: "string" }
        }
      }
    },
    errorAnalysis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["errorType", "observedError", "likelyPrerequisite", "confidence", "evidence", "repairPriority"],
        properties: {
          errorType: {
            type: "string",
            enum: [
              "conceptual_gap",
              "prerequisite_gap",
              "representation_error",
              "setup_error",
              "algebra_error",
              "calculus_error",
              "probability_model_error",
              "execution_error",
              "communication_error"
            ]
          },
          observedError: { type: "string" },
          likelyPrerequisite: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          evidence: { type: "string" },
          repairPriority: { type: "string", enum: ["low", "medium", "high"] }
        }
      }
    },
    prerequisiteHypotheses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prerequisite", "hypothesis", "confidence", "evidence", "sourceSkill", "testOnSunday", "repairPriority"],
        properties: {
          prerequisite: { type: "string" },
          hypothesis: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          evidence: { type: "string" },
          sourceSkill: { type: "string" },
          testOnSunday: { type: "boolean" },
          repairPriority: { type: "string", enum: ["low", "medium", "high"] }
        }
      }
    },
    diagnosticRecommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prerequisite", "diagnosticProblemType", "confirmationCriterion", "bridgeProblemType"],
        properties: {
          prerequisite: { type: "string" },
          diagnosticProblemType: { type: "string" },
          confirmationCriterion: { type: "string" },
          bridgeProblemType: { type: "string" }
        }
      }
    },
    adaptivePlanSignal: {
      type: "object",
      additionalProperties: false,
      required: ["advanceNormally", "repairRatio", "bridgeRatio", "targetRatio", "cumulativeRatio", "rationale"],
      properties: {
        advanceNormally: { type: "boolean" },
        repairRatio: { type: "number", minimum: 0, maximum: 1 },
        bridgeRatio: { type: "number", minimum: 0, maximum: 1 },
        targetRatio: { type: "number", minimum: 0, maximum: 1 },
        cumulativeRatio: { type: "number", minimum: 0, maximum: 1 },
        rationale: { type: "string" }
      }
    },
    questionFeedback: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "status", "marksAwarded", "maxMarks", "summary", "issue", "correction", "skillTag"],
        properties: {
          question: { type: "string" },
          status: { type: "string", enum: ["correct", "partially correct", "incorrect", "not attempted", "unclear"] },
          marksAwarded: { type: "number", minimum: 0, maximum: 100 },
          maxMarks: { type: "number", minimum: 0, maximum: 100 },
          summary: { type: "string" },
          issue: { type: "string" },
          correction: { type: "string" },
          skillTag: { type: "string" }
        }
      }
    },
    narrativeFeedback: {
      type: "object",
      additionalProperties: false,
      required: ["overall", "understood", "shaky", "missing", "improvementPlan"],
      properties: {
        overall: { type: "string" },
        understood: { type: "string" },
        shaky: { type: "string" },
        missing: { type: "string" },
        improvementPlan: { type: "string" }
      }
    },
    studentReport: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "right", "notYet", "executionIssues", "masteryPlan", "encouragement"],
      properties: {
        headline: { type: "string" },
        right: { type: "array", items: { type: "string" } },
        notYet: { type: "array", items: { type: "string" } },
        executionIssues: { type: "array", items: { type: "string" } },
        masteryPlan: { type: "array", items: { type: "string" } },
        encouragement: { type: "string" }
      }
    }
  }
};

const MAX_DIRECT_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(501).json({ error: "LLM feedback service is not configured" });
  }

  const {
    materialTitle,
    materialContext,
    workflow,
    solutionText,
    uploadedFile,
    uploadedFiles,
    learnerName
  } = request.body || {};

  if (!materialTitle || !workflow || !solutionText) {
    return response.status(400).json({ error: "Missing material title, rubric workflow, or solution text" });
  }

  const payload = {
    materialTitle,
    materialContext: materialContext || {},
    workflow,
    learnerName: learnerName || "the learner",
    solutionText: String(solutionText).slice(0, 30000),
    uploadedFiles: normalizeUploadedFiles(uploadedFiles, uploadedFile)
  };
  const estimatedBytes = payload.uploadedFiles.reduce((sum, file) => sum + estimateDataUrlBytes(file.fileDataUrl), 0);
  if (estimatedBytes > MAX_DIRECT_ATTACHMENT_BYTES) {
      return response.status(413).json({
        error: "Uploaded file is too large for direct feedback generation",
        details: `Direct PDF/image feedback currently supports about ${formatBytes(MAX_DIRECT_ATTACHMENT_BYTES)} of attached content per request. This upload is about ${formatBytes(estimatedBytes)} after decoding. Upload a smaller PDF/image or export the solution as text/Markdown.`
      });
  }
  const userContent = buildFeedbackInputContent(payload);

  const model = process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";
  let openaiResponse;
  try {
    openaiResponse = await fetch("https://api.openai.com/v1/responses", {
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
              "You are Aleph's mathematics feedback engine.",
              "Generate student-facing feedback from the submitted solution and rubric.",
              "Do not invent work the student did not do.",
              "First parse or transcribe the learner's submitted content from solutionText and any attached PDF/image. Then evaluate only the parsed visible work. If the content is unreadable or incomplete, say so explicitly.",
              "Separate conceptual gaps from execution mistakes.",
              "Use the workflow prerequisite graph when provided; do not invent a prerequisite label if a supplied graph label applies.",
              "Always produce prerequisiteChecks. Start from the most basic prerequisites in the workflow graph before evaluating higher-level skills. Mark secure, shaky, missing, or not checked with evidence from the submitted work.",
              "For every non-green solution, produce concrete errorAnalysis, prerequisiteHypotheses, and diagnosticRecommendations.",
              "Sunday diagnostics should confirm or falsify the prerequisite hypotheses using direct prerequisite checks and bridge problems.",
              "Set adaptivePlanSignal ratios so they sum to roughly 1. Use repair/bridge weight when prerequisite gaps are likely. The next week's material must include repairWork and bridgeWork from prerequisiteChecks before advancing to higher-level target problems.",
              "Be specific, concrete, and kind without being vague.",
              "If the submitted solution is too incomplete to evaluate, say that and assign a red verdict.",
              "Produce questionFeedback with one item per visible question or subquestion in the submitted solution. If a question is not visible or not attempted, mark it unclear or not attempted instead of inventing work.",
              "If workflow.maxScore is supplied, set maxScore exactly to workflow.maxScore and compute score using workflow.scoringPolicy. For CMI DM/DSA review quizzes, Q1-Q15 are 2 marks each and Q16-Q30 are 3 marks each, for 75 total marks. Each questionFeedback item must include marksAwarded and maxMarks under that scheme.",
              "Use the rubric to produce narrativeFeedback as a detailed, human-readable tutor report. Avoid terse bullet-only summaries. Clearly explain what the learner understood, what is shaky, what they can improve, and what is missing.",
              "Return only the requested JSON schema."
            ].join("\n")
          },
          {
            role: "user",
            content: userContent
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "aleph_feedback_report",
            schema: FEEDBACK_SCHEMA,
            strict: true
          }
        }
      })
    });
  } catch (error) {
    return response.status(502).json({ error: "LLM provider request failed", details: error.message });
  }

  if (!openaiResponse.ok) {
    const details = await openaiResponse.text();
    return response.status(502).json({ error: "LLM provider rejected the request", details: trimProviderDetails(details) });
  }

  const result = await openaiResponse.json();
  const outputText = extractOutputText(result);
  if (!outputText) {
    return response.status(502).json({ error: "LLM provider returned no structured feedback" });
  }

  try {
    const feedbackRecord = JSON.parse(outputText);
    return response.status(200).json({
      feedbackRecord,
      feedback: summarizeFeedback(feedbackRecord),
      model
    });
  } catch {
    return response.status(502).json({ error: "LLM provider returned invalid JSON", raw: outputText });
  }
}

function estimateDataUrlBytes(dataUrl) {
  const text = String(dataUrl || "");
  const base64 = text.includes(",") ? text.split(",").pop() || "" : text;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function trimProviderDetails(details) {
  return String(details || "").replace(/\s+/g, " ").slice(0, 1000);
}

function normalizeUploadedFiles(uploadedFiles, uploadedFile) {
  const candidates = Array.isArray(uploadedFiles) && uploadedFiles.length ? uploadedFiles : (uploadedFile ? [uploadedFile] : []);
  return candidates
    .filter((file) => file?.fileDataUrl)
    .slice(0, 8)
    .map((file, index) => ({
      fileName: String(file.fileName || `uploaded-solution-${index + 1}`).slice(0, 200),
      fileType: String(file.fileType || "application/octet-stream").slice(0, 120),
      fileDataUrl: String(file.fileDataUrl)
    }));
}

function buildFeedbackInputContent(payload) {
  const textPayload = {
    materialTitle: payload.materialTitle,
    materialContext: payload.materialContext,
    workflow: payload.workflow,
    learnerName: payload.learnerName,
    solutionText: payload.solutionText,
    uploadedFiles: payload.uploadedFiles.length
      ? payload.uploadedFiles.map((file) => ({
          fileName: file.fileName,
          fileType: file.fileType
        }))
      : [],
    attachmentNote: payload.uploadedFiles.length
      ? "The learner solution file or compressed PDF page images are attached in this same message. Use them as the primary evidence for grading."
      : ""
  };
  const content = [
    {
      type: "input_text",
      text: JSON.stringify(textPayload, null, 2)
    }
  ];
  for (const file of payload.uploadedFiles) {
    if (isImageFile(file)) {
      content.push({
        type: "input_image",
        image_url: file.fileDataUrl
      });
    } else if (isPdfFile(file)) {
      content.push({
        type: "input_file",
        filename: file.fileName || "uploaded-solution.pdf",
        file_data: file.fileDataUrl
      });
    }
  }
  return content;
}

function isImageFile(file) {
  return String(file.fileType || "").toLowerCase().startsWith("image/")
    || /\.(png|jpe?g)$/i.test(file.fileName || "");
}

function isPdfFile(file) {
  return String(file.fileType || "").toLowerCase() === "application/pdf"
    || /\.pdf$/i.test(file.fileName || "");
}

function extractOutputText(result) {
  if (typeof result.output_text === "string") return result.output_text;
  for (const item of result.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "";
}

function summarizeFeedback(record) {
  const verdict = record.verdict || "yellow";
  const score = Number.isFinite(record.score) ? `${record.score}/${Number.isFinite(record.maxScore) ? record.maxScore : 10}` : "unscored";
  const gap = record.conceptGap?.tag || "no skill tag";
  const issue = record.firstIssue?.location || "first issue not marked";
  return `${verdict.toUpperCase()} - ${score}. Gap: ${gap}. First issue: ${issue}. ${record.minimalCorrection || "Correction task not recorded."}`;
}
