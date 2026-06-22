const SNAPSHOT_KEY = "aleph:platinum:progress:primary";
const LAST_CRON_KEY = "aleph:platinum:weekly-check:last";

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
  const stored = {
    ...snapshot,
    storedAt: new Date().toISOString()
  };
  await kvCommand(["SET", SNAPSHOT_KEY, JSON.stringify(stored)]);
  return stored;
}

export async function loadPlatinumProgressSnapshot() {
  const raw = await kvCommand(["GET", SNAPSHOT_KEY]);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function saveLastWeeklyCheck(result) {
  const stored = {
    ...result,
    storedAt: new Date().toISOString()
  };
  await kvCommand(["SET", LAST_CRON_KEY, JSON.stringify(stored)]);
  return stored;
}

export function platinumProgressStoreStatus() {
  return kvConfig().configured ? "kv" : "memory";
}
