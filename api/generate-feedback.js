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
    "studentReport"
  ],
  properties: {
    verdict: { type: "string", enum: ["green", "yellow", "red"] },
    score: { type: "number", minimum: 0, maximum: 10 },
    maxScore: { type: "number", enum: [10] },
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
    solutionText: String(solutionText).slice(0, 30000)
  };

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
              "Separate conceptual gaps from execution mistakes.",
              "Be specific, concrete, and kind without being vague.",
              "If the submitted solution is too incomplete to evaluate, say that and assign a red verdict.",
              "Return only the requested JSON schema."
            ].join("\n")
          },
          {
            role: "user",
            content: JSON.stringify(payload, null, 2)
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
    return response.status(502).json({ error: "LLM provider rejected the request", details });
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
  const score = Number.isFinite(record.score) ? `${record.score}/${record.maxScore || 10}` : "unscored";
  const gap = record.conceptGap?.tag || "no skill tag";
  const issue = record.firstIssue?.location || "first issue not marked";
  return `${verdict.toUpperCase()} - ${score}. Gap: ${gap}. First issue: ${issue}. ${record.minimalCorrection || "Correction task not recorded."}`;
}
