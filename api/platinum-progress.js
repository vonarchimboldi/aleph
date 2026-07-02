import {
  loadPlatinumProgressSnapshot,
  platinumProgressStoreStatus,
  savePlatinumProgressSnapshot,
  savePlatinumSubmissionRecords
} from "./_platinum-progress-store.js";

const MAX_BODY_BYTES = 250000;

export default async function handler(request, response) {
  if (request.method === "GET") {
    const snapshot = await loadPlatinumProgressSnapshot();
    return response.status(200).json({
      store: platinumProgressStoreStatus(),
      snapshot
    });
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const snapshot = request.body || {};
  const encodedSize = Buffer.byteLength(JSON.stringify(snapshot), "utf8");
  if (encodedSize > MAX_BODY_BYTES) {
    return response.status(413).json({ error: "Progress snapshot is too large" });
  }

  if (snapshot.accountTypeId !== "gate-da-platinum") {
    return response.status(400).json({ error: "Only Platinum progress snapshots are accepted" });
  }

  if (!snapshot.user?.email && !snapshot.user?.id) {
    return response.status(400).json({ error: "Snapshot must include a learner identifier" });
  }

  const stored = await savePlatinumProgressSnapshot(snapshot);
  await savePlatinumSubmissionRecords(submissionRecordsFromSnapshot(snapshot));
  return response.status(200).json({
    ok: true,
    store: platinumProgressStoreStatus(),
    syncedAt: stored.storedAt
  });
}

function submissionRecordsFromSnapshot(snapshot) {
  const user = snapshot.user || {};
  const materials = [
    ...(snapshot.materials?.due || []),
    ...(snapshot.materials?.upcoming || []),
    ...(snapshot.materials?.archivedWithSubmissions || []),
    ...(snapshot.feedback?.latest || []),
    ...(snapshot.feedback?.consolidated?.feedbackItems || [])
  ];
  const seen = new Set();
  return materials
    .filter((material) => material?.submitted || material?.fileName || material?.feedbackReady)
    .filter((material) => {
      const key = `${user.id || user.email || user.name || "unknown-user"}::${material.materialId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((material) => ({
      userId: user.id || user.email || user.name || "unknown-user",
      learnerName: user.displayName || user.name || "",
      learnerEmail: user.email || "",
      materialId: material.materialId,
      materialTitle: material.materialTitle,
      materialUrl: material.materialUrl,
      subjectId: material.subjectId,
      subjectTitle: material.subjectTitle,
      patternId: material.patternId,
      patternTitle: material.patternTitle,
      week: material.week,
      sourceWeek: material.sourceWeek,
      date: material.date,
      fileName: material.fileName,
      uploadedAt: material.uploadedAt,
      feedbackStatus: material.feedbackReady ? "completed" : "not_requested",
      feedbackReady: material.feedbackReady,
      feedbackUpdatedAt: material.feedbackUpdatedAt,
      feedbackModel: material.feedbackModel,
      feedbackVerdict: material.feedbackVerdict,
      feedbackScore: material.feedbackScore
    }));
}
