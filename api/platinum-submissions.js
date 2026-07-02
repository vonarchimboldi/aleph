import {
  loadPlatinumSubmissionsLedger,
  platinumProgressStoreStatus,
  savePlatinumSubmissionRecord
} from "./_platinum-progress-store.js";

const MAX_BODY_BYTES = 50000;

export default async function handler(request, response) {
  if (request.method === "GET") {
    const ledger = await loadPlatinumSubmissionsLedger();
    const url = new URL(request.url, `https://${request.headers.host || "aleph.local"}`);
    const userId = url.searchParams.get("userId") || "";
    const sourceWeek = url.searchParams.get("sourceWeek") || "";
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    const submissions = (ledger.submissions || [])
      .filter((entry) => !userId || entry.userId === userId || entry.learnerEmail === userId || entry.learnerName === userId)
      .filter((entry) => !sourceWeek || String(entry.sourceWeek || entry.week || "") === sourceWeek)
      .filter((entry) => !from || (entry.date && entry.date >= from) || (entry.submittedAt && entry.submittedAt.slice(0, 10) >= from))
      .filter((entry) => !to || (entry.date && entry.date <= to) || (entry.submittedAt && entry.submittedAt.slice(0, 10) <= to))
      .sort((a, b) => (a.date || a.submittedAt || "").localeCompare(b.date || b.submittedAt || ""));
    return response.status(200).json({
      ok: true,
      store: platinumProgressStoreStatus(),
      updatedAt: ledger.updatedAt || "",
      count: submissions.length,
      submissions
    });
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const encodedSize = Buffer.byteLength(JSON.stringify(request.body || {}), "utf8");
  if (encodedSize > MAX_BODY_BYTES) {
    return response.status(413).json({ error: "Submission metadata payload is too large" });
  }

  const record = request.body || {};
  if (!record.materialId) {
    return response.status(400).json({ error: "Submission record must include materialId" });
  }
  if (!record.userId && !record.learnerEmail && !record.learnerName) {
    return response.status(400).json({ error: "Submission record must include a learner identifier" });
  }

  const saved = await savePlatinumSubmissionRecord(record);
  return response.status(200).json({
    ok: true,
    store: platinumProgressStoreStatus(),
    submission: saved
  });
}
