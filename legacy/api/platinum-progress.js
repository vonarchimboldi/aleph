import {
  loadPlatinumProgressSnapshot,
  platinumProgressStoreStatus,
  savePlatinumProgressSnapshot
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
  return response.status(200).json({
    ok: true,
    store: platinumProgressStoreStatus(),
    syncedAt: stored.storedAt
  });
}
