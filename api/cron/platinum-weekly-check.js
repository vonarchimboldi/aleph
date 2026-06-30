import {
  loadPlatinumProgressSnapshot,
  platinumProgressStoreStatus,
  saveLastWeeklyCheck
} from "../_platinum-progress-store.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.authorization !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: "Unauthorized cron request" });
  }

  const snapshot = await loadPlatinumProgressSnapshot();
  if (!snapshot) {
    const result = {
      ok: true,
      status: "no_snapshot",
      message: "No Platinum progress snapshot has been synced yet.",
      checkedAt: new Date().toISOString(),
      store: platinumProgressStoreStatus()
    };
    await saveLastWeeklyCheck(result);
    return response.status(200).json(result);
  }

  const report = buildWeeklyReport(snapshot);
  const emailResult = await maybeSendWeeklyEmail(snapshot, report);
  const result = {
    ok: true,
    checkedAt: new Date().toISOString(),
    store: platinumProgressStoreStatus(),
    report,
    email: emailResult
  };
  await saveLastWeeklyCheck(result);
  return response.status(200).json(result);
}

function buildWeeklyReport(snapshot) {
  const pace = snapshot.pace || {};
  const dueTasks = snapshot.tasks?.due || [];
  const overdueTasks = dueTasks.filter((task) => task.dueState === "overdue");
  const dueTodayTasks = dueTasks.filter((task) => task.dueState === "due-today");
  const incompleteDueTasks = dueTasks.filter((task) => task.status !== "completed");
  const materialsDue = snapshot.materials?.due || [];
  const missingSubmissions = materialsDue.filter((material) => !material.submitted);
  const missingFeedback = materialsDue.filter((material) => material.submitted && !material.feedbackReady);
  const feedbackReady = mergeFeedbackItems(
    materialsDue.filter((material) => material.feedbackReady),
    snapshot.feedback?.consolidated?.feedbackItems || [],
    snapshot.feedback?.latest || []
  );
  const latestFeedback = feedbackReady
    .slice()
    .sort((a, b) => (b.feedbackUpdatedAt || "").localeCompare(a.feedbackUpdatedAt || ""))
    .slice(0, 8);
  const severeFeedback = feedbackReady.filter((material) => {
    const verdict = String(material.feedbackVerdict || "").toLowerCase();
    return verdict.includes("revise") || verdict.includes("weak") || verdict.includes("incomplete") || verdict === "red" || verdict === "yellow";
  });
  const adaptivePlan = buildAdaptiveWeeklyPlan(snapshot, feedbackReady);

  const alerts = [];
  if (overdueTasks.length) alerts.push(`${overdueTasks.length} overdue task(s)`);
  if (missingSubmissions.length) alerts.push(`${missingSubmissions.length} missing submission(s)`);
  if (missingFeedback.length) alerts.push(`${missingFeedback.length} submitted item(s) waiting for feedback`);
  if (severeFeedback.length) alerts.push(`${severeFeedback.length} feedback item(s) need revision`);

  const status = alerts.length || pace.statusLabel === "Behind plan" || pace.statusLabel === "At risk"
    ? "action_needed"
    : "on_pace";

  return {
    status,
    statusLabel: status === "on_pace" ? "On pace" : "Action needed",
    currentWeek: pace.currentWeek || snapshot.currentWeek,
    completionRate: pace.completionRate ?? 100,
    expectedTaskCount: pace.expectedCount || dueTasks.length,
    completedExpectedTaskCount: pace.completedExpectedCount || dueTasks.filter((task) => task.status === "completed").length,
    overdueCount: overdueTasks.length,
    dueTodayCount: dueTodayTasks.length,
    incompleteDueTaskCount: incompleteDueTasks.length,
    materialDueCount: materialsDue.length,
    submittedMaterialCount: materialsDue.filter((material) => material.submitted).length,
    feedbackReadyCount: feedbackReady.length,
    missingSubmissionCount: missingSubmissions.length,
    missingFeedbackCount: missingFeedback.length,
    severeFeedbackCount: severeFeedback.length,
    alerts,
    nextTasks: incompleteDueTasks.slice(0, 8),
    missingSubmissions: missingSubmissions.slice(0, 8),
    missingFeedback: missingFeedback.slice(0, 8),
    latestFeedback,
    consolidatedFeedback: {
      feedbackCount: snapshot.feedback?.consolidated?.feedbackCount ?? feedbackReady.length,
      archivedFeedbackCount: snapshot.feedback?.consolidated?.archivedFeedbackCount ?? feedbackReady.filter((material) => material.archived).length,
      currentFeedbackCount: snapshot.feedback?.consolidated?.currentFeedbackCount ?? feedbackReady.filter((material) => !material.archived).length,
      submittedWaitingForFeedback: snapshot.feedback?.consolidated?.submittedWaitingForFeedback || [],
      topicSummaries: snapshot.feedback?.consolidated?.topicSummaries || []
    },
    adaptivePlan
  };
}

function mergeFeedbackItems(...groups) {
  const byId = new Map();
  groups.flat().forEach((item) => {
    if (!item?.materialId) return;
    const existing = byId.get(item.materialId);
    if (!existing || (item.feedbackUpdatedAt || "") > (existing.feedbackUpdatedAt || "")) {
      byId.set(item.materialId, item);
    }
  });
  return Array.from(byId.values());
}

function buildAdaptiveWeeklyPlan(snapshot, feedbackReady) {
  const hypotheses = collectPrerequisiteHypotheses(feedbackReady);
  const sundayEvidence = feedbackReady.filter((material) => /review|quiz/i.test(material.materialTitle || ""));
  const ranked = rankPrerequisiteHypotheses(hypotheses, sundayEvidence);
  const top = ranked.slice(0, 6);
  const confirmed = top.filter((item) => item.status === "confirmed");
  const highPriority = top.filter((item) => item.repairPriority === "high" || item.confidence === "high");
  const allocation = adaptiveAllocation({ top, confirmed, highPriority });

  return {
    status: top.length ? "adaptive_plan_ready" : "no_prerequisite_gaps_detected",
    rationale: top.length
      ? "Next week's problem sets should adapt to the strongest prerequisite hypotheses from daily feedback and use Sunday diagnostics to confirm or falsify them."
      : "No prerequisite hypotheses are available yet. Generate structured feedback or run the Sunday diagnostic before adapting next week's material.",
    currentWeek: snapshot.pace?.currentWeek || snapshot.currentWeek || null,
    hypotheses: top,
    sundayDiagnosticPlan: buildSundayDiagnosticPlan(top),
    nextWeekProblemSetPlan: buildNextWeekProblemSetPlan(top, allocation),
    allocation
  };
}

function collectPrerequisiteHypotheses(feedbackReady) {
  const hypotheses = [];
  feedbackReady.forEach((material) => {
    (material.feedbackPrerequisiteChecks || []).forEach((check) => {
      if (!check.prerequisite || check.status === "secure") return;
      hypotheses.push({
        prerequisite: check.prerequisite,
        hypothesis: `Prerequisite check marked ${check.status}.`,
        confidence: check.status === "missing" ? "high" : check.status === "shaky" ? "medium" : "low",
        evidence: check.evidence || material.feedbackSummary || "",
        sourceSkill: material.feedbackConceptGap || "",
        testOnSunday: true,
        repairPriority: check.status === "missing" ? "high" : "medium",
        repairWork: check.repairWork || "",
        bridgeWork: check.bridgeWork || "",
        sourceMaterialId: material.materialId,
        sourceMaterialTitle: material.materialTitle,
        sourceDate: material.date,
        fromSundayReview: /review|quiz/i.test(material.materialTitle || "")
      });
    });

    (material.feedbackPrerequisiteHypotheses || []).forEach((hypothesis) => {
      hypotheses.push({
        prerequisite: hypothesis.prerequisite || material.feedbackConceptGap || "unspecified prerequisite",
        hypothesis: hypothesis.hypothesis || "Prerequisite may be shaky.",
        confidence: hypothesis.confidence || "medium",
        evidence: hypothesis.evidence || material.feedbackSummary || "",
        sourceSkill: hypothesis.sourceSkill || material.feedbackConceptGap || "",
        testOnSunday: hypothesis.testOnSunday !== false,
        repairPriority: hypothesis.repairPriority || "medium",
        repairWork: hypothesis.repairWork || "",
        bridgeWork: hypothesis.bridgeWork || "",
        sourceMaterialId: material.materialId,
        sourceMaterialTitle: material.materialTitle,
        sourceDate: material.date,
        fromSundayReview: /review|quiz/i.test(material.materialTitle || "")
      });
    });

    (material.feedbackErrorAnalysis || [])
      .filter((error) => error.likelyPrerequisite)
      .forEach((error) => {
        hypotheses.push({
          prerequisite: error.likelyPrerequisite,
          hypothesis: `Observed ${error.errorType || "error"} suggests ${error.likelyPrerequisite} is shaky.`,
          confidence: error.confidence || "medium",
          evidence: error.evidence || error.observedError || "",
          sourceSkill: material.feedbackConceptGap || "",
          testOnSunday: true,
          repairPriority: error.repairPriority || "medium",
          repairWork: "",
          bridgeWork: "",
          sourceMaterialId: material.materialId,
          sourceMaterialTitle: material.materialTitle,
          sourceDate: material.date,
          fromSundayReview: /review|quiz/i.test(material.materialTitle || "")
        });
      });
  });
  return hypotheses;
}

function rankPrerequisiteHypotheses(hypotheses, sundayEvidence) {
  const grouped = new Map();
  hypotheses.forEach((hypothesis) => {
    const key = normalizePrerequisite(hypothesis.prerequisite);
    if (!grouped.has(key)) {
      grouped.set(key, {
        prerequisite: hypothesis.prerequisite,
        score: 0,
        confidence: "low",
        repairPriority: "low",
        evidence: [],
        sources: [],
        repairWork: [],
        bridgeWork: [],
        diagnosticProblemTypes: new Set(),
        status: "needs_confirmation"
      });
    }
    const entry = grouped.get(key);
    const weight = confidenceWeight(hypothesis.confidence) + priorityWeight(hypothesis.repairPriority) + (hypothesis.fromSundayReview ? 2 : 0);
    entry.score += weight;
    entry.confidence = strongerLabel(entry.confidence, hypothesis.confidence);
    entry.repairPriority = strongerLabel(entry.repairPriority, hypothesis.repairPriority);
    if (hypothesis.evidence) entry.evidence.push(hypothesis.evidence);
    if (hypothesis.repairWork) entry.repairWork.push(hypothesis.repairWork);
    if (hypothesis.bridgeWork) entry.bridgeWork.push(hypothesis.bridgeWork);
    entry.sources.push({
      materialId: hypothesis.sourceMaterialId,
      materialTitle: hypothesis.sourceMaterialTitle,
      date: hypothesis.sourceDate,
      sourceSkill: hypothesis.sourceSkill,
      fromSundayReview: hypothesis.fromSundayReview
    });
    if (hypothesis.fromSundayReview) entry.status = "confirmed";
  });

  const sundayText = JSON.stringify(sundayEvidence.map((item) => ({
    title: item.materialTitle,
    gaps: item.feedbackPrerequisiteHypotheses,
    errors: item.feedbackErrorAnalysis
  }))).toLowerCase();

  return Array.from(grouped.values())
    .map((entry) => {
      if (entry.status !== "confirmed" && sundayText.includes(normalizePrerequisite(entry.prerequisite))) {
        entry.status = "confirmed";
        entry.score += 2;
      }
      return {
        prerequisite: entry.prerequisite,
        status: entry.status,
        confidence: entry.confidence,
        repairPriority: entry.repairPriority,
        score: entry.score,
        evidence: entry.evidence.slice(0, 3),
        repairWork: [...new Set(entry.repairWork)].slice(0, 3),
        bridgeWork: [...new Set(entry.bridgeWork)].slice(0, 3),
        sources: entry.sources.slice(0, 4)
      };
    })
    .sort((a, b) => b.score - a.score || priorityWeight(b.repairPriority) - priorityWeight(a.repairPriority));
}

function buildSundayDiagnosticPlan(hypotheses) {
  if (!hypotheses.length) {
    return {
      purpose: "Collect baseline evidence before adapting next week.",
      items: []
    };
  }
  return {
    purpose: "Confirm or falsify prerequisite hypotheses before generating next week's adaptive problem sets.",
    items: hypotheses.map((hypothesis, index) => ({
      id: `sunday-diagnostic-${index + 1}`,
      prerequisite: hypothesis.prerequisite,
      statusBeforeSunday: hypothesis.status,
      directCheck: `One short prerequisite-only problem for ${hypothesis.prerequisite}.`,
      bridgeCheck: `One bridge problem where ${hypothesis.prerequisite} is needed inside the current week's topic.`,
      confirmationCriterion: "Confirmed if either the direct check or bridge check shows the same error pattern seen in daily feedback.",
      nextActionIfConfirmed: "Allocate repair plus bridge problems next week before advancing the target topic.",
      nextActionIfCleared: "Treat as an execution slip; include only light spaced review."
    }))
  };
}

function buildNextWeekProblemSetPlan(hypotheses, allocation) {
  return {
    rule: "Generate next week's Platinum Probability and Statistics material from nominal target topics plus the prerequisite evidence below.",
    materialType: "Expository lesson material with embedded problem sets, not a bare list of questions.",
    expositionRequirements: [
      "Open each material page with a concise topic narrative explaining the pattern and why it matters.",
      "Contextualize every question block with the recognition trigger, setup idea, and prerequisite being tested.",
      "Include repair and bridge exposition before target/ISI-style questions when feedback shows prerequisite gaps.",
      "End each block with synthesis notes that connect the questions back to the learner's feedback evidence."
    ],
    allocation,
    blocks: [
      {
        block: "repair",
        ratio: allocation.repair,
        instruction: "Direct prerequisite drills for confirmed or high-confidence weak prerequisites, preceded by a short explanatory mini-lesson.",
        prerequisites: hypotheses.filter((item) => item.status === "confirmed" || item.repairPriority === "high").map((item) => item.prerequisite),
        requiredWork: hypotheses.flatMap((item) => item.repairWork || []).slice(0, 6)
      },
      {
        block: "bridge",
        ratio: allocation.bridge,
        instruction: "Problems that connect repaired prerequisites to the next target topic, with context showing why the prerequisite is needed.",
        prerequisites: hypotheses.map((item) => item.prerequisite),
        requiredWork: hypotheses.flatMap((item) => item.bridgeWork || []).slice(0, 6)
      },
      {
        block: "target",
        ratio: allocation.target,
        instruction: "Nominal next-week syllabus topics, introduced with pattern-recognition exposition before the question set.",
        prerequisites: [],
        requiredWork: ["Only advance target difficulty after the repair and bridge checks above are represented in the set."]
      },
      {
        block: "cumulative",
        ratio: allocation.cumulative,
        instruction: "Exam-style mixed review with short cues that make older patterns visible without revealing the solution.",
        prerequisites: hypotheses.slice(0, 3).map((item) => item.prerequisite),
        requiredWork: ["Include at least one mixed problem that reuses the highest-priority repaired prerequisite."]
      }
    ]
  };
}

function adaptiveAllocation({ top, confirmed, highPriority }) {
  if (!top.length) return { repair: 0.05, bridge: 0.15, target: 0.65, cumulative: 0.15 };
  if (confirmed.length || highPriority.length) return { repair: 0.3, bridge: 0.3, target: 0.3, cumulative: 0.1 };
  return { repair: 0.2, bridge: 0.3, target: 0.4, cumulative: 0.1 };
}

function normalizePrerequisite(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function confidenceWeight(value) {
  return { high: 3, medium: 2, low: 1 }[value] || 1;
}

function priorityWeight(value) {
  return { high: 3, medium: 2, low: 1 }[value] || 1;
}

function strongerLabel(current, candidate) {
  return priorityWeight(candidate) > priorityWeight(current) ? candidate : current;
}

async function maybeSendWeeklyEmail(snapshot, report) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  const monitorEmail = process.env.PLATINUM_MONITOR_EMAIL;
  const learnerEmail = snapshot.user?.email;
  const to = monitorEmail || learnerEmail;

  if (!apiKey || !from || !to) {
    return {
      sent: false,
      reason: !to ? "missing_recipient" : "email_not_configured"
    };
  }

  if (!monitorEmail && report.status === "on_pace") {
    return {
      sent: false,
      reason: "on_pace_without_monitor_recipient"
    };
  }

  const learnerName = snapshot.user?.displayName || snapshot.user?.name || "Learner";
  const text = weeklyEmailText(learnerName, snapshot, report);
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Aleph Platinum weekly check: ${report.statusLabel}`,
      text
    })
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return {
      sent: false,
      reason: "provider_rejected",
      details
    };
  }

  const result = await resendResponse.json();
  return {
    sent: true,
    id: result.id,
    to
  };
}

function weeklyEmailText(learnerName, snapshot, report) {
  const lines = [
    `Weekly Platinum check for ${learnerName}`,
    "",
    `Status: ${report.statusLabel}`,
    `Week: ${report.currentWeek || "current"}`,
    `Task completion: ${report.completedExpectedTaskCount}/${report.expectedTaskCount} due tasks (${report.completionRate}%).`,
    `Open due work: ${report.overdueCount} overdue, ${report.dueTodayCount} due today.`,
    `Materials: ${report.submittedMaterialCount}/${report.materialDueCount} due materials submitted; ${report.feedbackReadyCount} have feedback.`,
    ""
  ];

  if (report.alerts.length) {
    lines.push("Alerts:", ...report.alerts.map((alert) => `- ${alert}`), "");
  }

  if (report.nextTasks.length) {
    lines.push("Next task recovery:", ...report.nextTasks.map((task) => `- ${task.title} (${task.type || "Task"}, due ${task.dueDate || "date not set"})`), "");
  }

  if (report.missingSubmissions.length) {
    lines.push("Missing submissions:", ...report.missingSubmissions.map((item) => `- ${item.materialTitle} (${item.date || "date not set"})`), "");
  }

  if (report.missingFeedback.length) {
    lines.push("Submitted, waiting for feedback:", ...report.missingFeedback.map((item) => `- ${item.materialTitle} (${item.date || "date not set"})`), "");
  }

  if (report.latestFeedback.length) {
    lines.push(
      "Latest feedback:",
      ...report.latestFeedback.map((item) => {
        const notUnderstood = item.feedbackNotUnderstood?.length ? ` Not understood yet: ${item.feedbackNotUnderstood.join("; ")}` : "";
        const executionIssues = item.feedbackExecutionIssues?.length ? ` Execution issues: ${item.feedbackExecutionIssues.join("; ")}` : "";
        const next = item.feedbackNextDrill ? ` Next drill: ${item.feedbackNextDrill}` : "";
        return `- ${item.materialTitle}: ${item.feedbackSummary || "Feedback recorded."}${notUnderstood}${executionIssues}${next}`;
      }),
      ""
    );
  }

  if (report.adaptivePlan?.hypotheses?.length) {
    lines.push(
      "Adaptive prerequisite analysis:",
      ...report.adaptivePlan.hypotheses.map((item) => `- ${item.prerequisite}: ${item.status}, ${item.confidence} confidence, ${item.repairPriority} repair priority.`),
      ""
    );
  }

  if (report.adaptivePlan?.sundayDiagnosticPlan?.items?.length) {
    lines.push(
      "Sunday diagnostic plan:",
      ...report.adaptivePlan.sundayDiagnosticPlan.items.map((item) => `- ${item.prerequisite}: ${item.directCheck} Bridge: ${item.bridgeCheck}`),
      ""
    );
  }

  if (report.adaptivePlan?.nextWeekProblemSetPlan?.blocks?.length) {
    lines.push(
      "Next week pset generation mix:",
      ...report.adaptivePlan.nextWeekProblemSetPlan.blocks.map((block) => {
        const required = block.requiredWork?.length ? ` Required: ${block.requiredWork.join(" | ")}` : "";
        return `- ${Math.round(block.ratio * 100)}% ${block.block}: ${block.instruction}${required}`;
      }),
      ""
    );
  }

  lines.push(`Snapshot synced: ${snapshot.syncedAt || "unknown"}`, "Aleph");
  return lines.join("\n");
}
