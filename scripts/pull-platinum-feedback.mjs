import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_SOURCE_URL = "https://aleph-alpha.io/api/platinum-progress";
const sourceUrl = process.argv[2] || process.env.PLATINUM_PROGRESS_URL || DEFAULT_SOURCE_URL;
const outputDir = process.env.PLATINUM_FEEDBACK_REPORT_DIR || "reports";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const response = await fetch(sourceUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Could not pull Platinum progress from ${sourceUrl}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const snapshot = payload.snapshot || payload;
  if (!snapshot?.accountTypeId) {
    throw new Error("Progress response did not include a Platinum snapshot.");
  }

  const feedbackItems = mergeFeedbackItems(
    snapshot.feedback?.consolidated?.feedbackItems || [],
    snapshot.feedback?.latest || [],
    snapshot.materials?.due?.filter((material) => material.feedbackReady) || []
  );
  const submittedWaitingForFeedback = snapshot.feedback?.consolidated?.submittedWaitingForFeedback
    || snapshot.materials?.due?.filter((material) => material.submitted && !material.feedbackReady)
    || [];
  const artifact = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceUrl,
    store: payload.store || null,
    snapshotSyncedAt: snapshot.syncedAt || "",
    coursePlanVersion: snapshot.coursePlanVersion || "",
    learner: snapshot.user || {},
    currentWeek: snapshot.currentWeek || snapshot.pace?.currentWeek || null,
    feedbackEvidence: {
      totalFeedbackReports: feedbackItems.length,
      archivedFeedbackReports: feedbackItems.filter((item) => item.archived).length,
      currentFeedbackReports: feedbackItems.filter((item) => !item.archived).length,
      submittedWaitingForFeedback,
      topicSummaries: snapshot.feedback?.consolidated?.topicSummaries || buildTopicSummaries(feedbackItems),
      reports: feedbackItems
    },
    nextWeekExpositoryMaterialPlan: {
      materialType: "Expository lesson material with embedded problem sets, not a bare list of questions.",
      useFeedbackEvidence: [
        "Start from repeated prerequisite hypotheses, prerequisiteChecks, and execution issues.",
        "Carry forward repairWork and bridgeWork before target-topic difficulty.",
        "Use archived previous pset feedback and current Week 2 feedback together."
      ],
      pageStructure: [
        "Topic narrative: why this pattern matters and when to recognize it.",
        "Feedback-informed repair section: short explanation plus prerequisite-only questions.",
        "Bridge section: explanation connecting the prerequisite to the new topic, then bridge questions.",
        "Target section: new topic exposition, pattern triggers, and ISI/GATE-style questions.",
        "Cumulative synthesis: mixed questions plus notes connecting them to earlier feedback."
      ],
      questionContextRequirements: [
        "Every question block must name the setup idea and recognition trigger.",
        "Every question must include enough context to explain what skill it tests without giving away the solution.",
        "Every solution should point back to the concept narrative and the feedback gap it repairs or extends."
      ]
    },
    nextWeekLessonInputs: snapshot.feedback?.consolidated?.nextWeekLessonInputs || null
  };

  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `platinum-feedback-${todayStamp()}.json`);
  await fs.writeFile(filePath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  console.log(`Wrote ${filePath}`);
  console.log(`Feedback reports: ${artifact.feedbackEvidence.totalFeedbackReports}`);
  console.log(`Waiting for feedback: ${artifact.feedbackEvidence.submittedWaitingForFeedback.length}`);
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
  return Array.from(byId.values())
    .sort((a, b) => (b.feedbackUpdatedAt || "").localeCompare(a.feedbackUpdatedAt || ""));
}

function buildTopicSummaries(feedbackItems) {
  const byTopic = new Map();
  feedbackItems.forEach((item) => {
    const topic = item.patternTitle || item.materialTitle || "Uncategorized";
    if (!byTopic.has(topic)) {
      byTopic.set(topic, {
        topic,
        feedbackCount: 0,
        materialIds: [],
        conceptGaps: new Set(),
        nextDrills: new Set(),
        prerequisiteHypotheses: new Set()
      });
    }
    const summary = byTopic.get(topic);
    summary.feedbackCount += 1;
    summary.materialIds.push(item.materialId);
    if (item.feedbackConceptGap) summary.conceptGaps.add(item.feedbackConceptGap);
    if (item.feedbackNextDrill) summary.nextDrills.add(item.feedbackNextDrill);
    (item.feedbackPrerequisiteHypotheses || []).forEach((hypothesis) => {
      if (hypothesis?.prerequisite) summary.prerequisiteHypotheses.add(hypothesis.prerequisite);
    });
  });
  return Array.from(byTopic.values()).map((summary) => ({
    ...summary,
    conceptGaps: Array.from(summary.conceptGaps),
    nextDrills: Array.from(summary.nextDrills),
    prerequisiteHypotheses: Array.from(summary.prerequisiteHypotheses)
  }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
