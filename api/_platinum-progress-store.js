const SNAPSHOT_KEY = "aleph:platinum:progress:primary";
const SNAPSHOT_INDEX_KEY = "aleph:platinum:progress:index:v1";
const SNAPSHOT_KEY_PREFIX = "aleph:platinum:progress:user:v1:";
const LAST_CRON_KEY = "aleph:platinum:weekly-check:last";
const SUBMISSIONS_KEY = "aleph:platinum:submissions:v1";

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.aleph_KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.aleph_KV_REST_API_TOKEN;
  return { url, token, configured: Boolean(url && token) };
}

function localStore() {
  if (!globalThis.__alephPlatinumProgressStore) {
    globalThis.__alephPlatinumProgressStore = new Map();
  }
  return globalThis.__alephPlatinumProgressStore;
}

async function kvCommand(command) {
  const config = kvConfig();
  if (!config.configured) {
    const store = localStore();
    const [name, key, value] = command;
    if (name === "GET") return store.get(key) || null;
    if (name === "SET") {
      store.set(key, value);
      return "OK";
    }
    throw new Error(`Unsupported local command: ${name}`);
  }

  const result = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!result.ok) {
    const details = await result.text();
    throw new Error(`KV request failed: ${result.status} ${details}`);
  }

  const payload = await result.json();
  return payload.result;
}

export async function savePlatinumProgressSnapshot(snapshot) {
  const learnerId = platinumSnapshotLearnerId(snapshot);
  const stored = {
    ...snapshot,
    storedAt: new Date().toISOString()
  };
  await kvCommand(["SET", snapshotKey(learnerId), JSON.stringify(stored)]);
  const index = await loadSnapshotIndex();
  const nextEntry = {
    learnerId,
    name: snapshot.user?.displayName || snapshot.user?.name || "Platinum learner",
    email: snapshot.user?.email || "",
    storedAt: stored.storedAt
  };
  const entries = index.filter((entry) => entry.learnerId !== learnerId);
  entries.push(nextEntry);
  await kvCommand(["SET", SNAPSHOT_INDEX_KEY, JSON.stringify(entries)]);
  // Keep the legacy key current for older deployed clients and cron code.
  await kvCommand(["SET", SNAPSHOT_KEY, JSON.stringify(stored)]);
  return stored;
}

export async function loadPlatinumProgressSnapshot(learnerId = "") {
  const raw = await kvCommand(["GET", learnerId ? snapshotKey(learnerId) : SNAPSHOT_KEY]);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function loadAllPlatinumProgressSnapshots() {
  const index = await loadSnapshotIndex();
  const snapshots = await Promise.all(index.map((entry) => loadPlatinumProgressSnapshot(entry.learnerId)));
  const available = snapshots.filter(Boolean);
  if (available.length) return available;
  const legacy = await loadPlatinumProgressSnapshot();
  return legacy ? [legacy] : [];
}

function platinumSnapshotLearnerId(snapshot) {
  const learnerId = snapshot?.user?.id || snapshot?.user?.email || snapshot?.user?.name;
  if (!learnerId) throw new Error("Platinum snapshot requires a learner identifier");
  return String(learnerId).trim();
}

function snapshotKey(learnerId) {
  return `${SNAPSHOT_KEY_PREFIX}${encodeURIComponent(String(learnerId))}`;
}

async function loadSnapshotIndex() {
  const raw = await kvCommand(["GET", SNAPSHOT_INDEX_KEY]);
  if (!raw) return [];
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveLastWeeklyCheck(result) {
  const stored = {
    ...result,
    storedAt: new Date().toISOString()
  };
  await kvCommand(["SET", LAST_CRON_KEY, JSON.stringify(stored)]);
  return stored;
}

export async function loadPlatinumSubmissionsLedger() {
  const raw = await kvCommand(["GET", SUBMISSIONS_KEY]);
  if (!raw) {
    return {
      schemaVersion: 1,
      submissions: [],
      updatedAt: ""
    };
  }
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function savePlatinumSubmissionRecord(record) {
  const ledger = await loadPlatinumSubmissionsLedger();
  const now = new Date().toISOString();
  const normalized = {
    userId: record.userId || "unknown-user",
    learnerName: record.learnerName || "",
    learnerEmail: record.learnerEmail || "",
    materialId: record.materialId,
    materialTitle: record.materialTitle || "",
    materialUrl: record.materialUrl || "",
    subjectId: record.subjectId || "",
    subjectTitle: record.subjectTitle || "",
    patternId: record.patternId || "",
    patternTitle: record.patternTitle || "",
    week: record.week ?? null,
    sourceWeek: record.sourceWeek ?? null,
    date: record.date || "",
    fileName: record.fileName || "",
    fileType: record.fileType || "",
    fileSize: record.fileSize ?? null,
    fileSizeLabel: record.fileSizeLabel || "",
    submittedAt: record.submittedAt || record.uploadedAt || now,
    updatedAt: now,
    feedbackStatus: record.feedbackStatus || "not_requested",
    feedbackReady: Boolean(record.feedbackReady),
    feedbackUpdatedAt: record.feedbackUpdatedAt || "",
    feedbackModel: record.feedbackModel || "",
    feedbackVerdict: record.feedbackVerdict || "",
    feedbackScore: record.feedbackScore ?? null,
    feedbackMaxScore: record.feedbackMaxScore ?? null,
    questionFeedback: normalizeQuestionFeedback(record.questionFeedback),
    missedConcepts: normalizeMissedConcepts(record.missedConcepts),
    reviewedConcepts: normalizeMissedConcepts(record.reviewedConcepts),
    status: record.status || "submitted"
  };
  const key = `${normalized.userId}::${normalized.materialId}`;
  const submissions = Array.isArray(ledger.submissions) ? ledger.submissions : [];
  const existingIndex = submissions.findIndex((entry) => `${entry.userId}::${entry.materialId}` === key);
  if (existingIndex >= 0) {
    submissions[existingIndex] = {
      ...submissions[existingIndex],
      ...normalized,
      submittedAt: submissions[existingIndex].submittedAt || normalized.submittedAt
    };
  } else {
    submissions.push(normalized);
  }
  const stored = {
    schemaVersion: 1,
    submissions,
    updatedAt: now
  };
  await kvCommand(["SET", SUBMISSIONS_KEY, JSON.stringify(stored)]);
  return normalized;
}

function normalizeMissedConcepts(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && String(item.concept || "").trim())
    .slice(0, 30)
    .map((item) => ({
      concept: String(item.concept).trim().slice(0, 120),
      questionIds: Array.isArray(item.questionIds) ? item.questionIds.map(String).slice(0, 12) : [],
      statuses: Array.isArray(item.statuses) ? item.statuses.map(String).slice(0, 4) : [],
      evidence: Array.isArray(item.evidence) ? item.evidence.map(String).slice(0, 3) : []
    }));
}

function normalizeQuestionFeedback(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean).slice(0, 60).map((item) => ({
    question: String(item.question || "").slice(0, 40),
    status: String(item.status || "unclear").slice(0, 30),
    marksAwarded: Number.isFinite(item.marksAwarded) ? item.marksAwarded : null,
    maxMarks: Number.isFinite(item.maxMarks) ? item.maxMarks : null,
    summary: String(item.summary || "").slice(0, 300),
    issue: String(item.issue || "").slice(0, 300),
    correction: String(item.correction || "").slice(0, 500),
    skillTag: String(item.skillTag || "").trim().slice(0, 120)
  }));
}

export async function savePlatinumSubmissionRecords(records = []) {
  const saved = [];
  for (const record of records) {
    if (!record?.materialId) continue;
    saved.push(await savePlatinumSubmissionRecord(record));
  }
  return saved;
}

export function platinumProgressStoreStatus() {
  return kvConfig().configured ? "kv" : "memory";
}
