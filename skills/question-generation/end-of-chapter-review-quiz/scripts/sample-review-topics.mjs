#!/usr/bin/env node

import fs from "node:fs";

function parseArgs(argv) {
  const args = {
    input: "",
    single: 5,
    pair: 3,
    triple: 2,
    seed: "review-quiz",
    minGateWeight: ""
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = value;
      i += 1;
    }
  }

  args.single = Number(args.single);
  args.pair = Number(args.pair);
  args.triple = Number(args.triple);

  return args;
}

function usage() {
  return `Usage:
node sample-review-topics.mjs --input concept-graph.json --single 5 --pair 3 --triple 2 --seed chapter-id

Input formats:
  { "nodes": { "id": { "label": "...", "prereqs": [], "gateWeight": "high" } } }
  { "topics": [{ "id": "...", "label": "...", "prereqs": [], "gateWeight": "high" }] }
  ["topic-a", "topic-b", "topic-c"]`;
}

function readInput(inputPath) {
  if (!inputPath || inputPath === "-") {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(inputPath, "utf8");
}

function normalizeTopics(data) {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === "string") {
        return { id: item, label: item, prereqs: [], gateWeight: "medium" };
      }
      return normalizeTopic(item.id || item.label, item);
    });
  }

  if (Array.isArray(data.topics)) {
    return data.topics.map((topic) => normalizeTopic(topic.id || topic.label, topic));
  }

  if (data.nodes && typeof data.nodes === "object") {
    return Object.entries(data.nodes).map(([id, node]) => normalizeTopic(id, node));
  }

  throw new Error("Input must be a concept graph with nodes, a topics array, or an array of topic ids.");
}

function normalizeTopic(id, topic) {
  return {
    id: String(id),
    label: String(topic.label || topic.name || id),
    prereqs: Array.isArray(topic.prereqs) ? topic.prereqs.map(String) : [],
    gateWeight: topic.gateWeight || "medium"
  };
}

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rng(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}

function gateWeightValue(weight) {
  if (weight === "high") return 3;
  if (weight === "medium") return 2;
  if (weight === "low") return 1;
  return 2;
}

function shuffleWeighted(items, random) {
  return items
    .map((item) => ({
      item,
      rank: -Math.log(Math.max(random(), Number.EPSILON)) / gateWeightValue(item.gateWeight)
    }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
}

function isConnected(combo, topicById) {
  const ids = new Set(combo.map((topic) => topic.id));
  return combo.some((topic) => topic.prereqs.some((prereq) => ids.has(prereq)))
    || combo.some((topic) => {
      return [...ids].some((id) => topicById.get(id)?.prereqs.includes(topic.id));
    });
}

function combinations(items, size) {
  const out = [];
  const current = [];

  function visit(start) {
    if (current.length === size) {
      out.push([...current]);
      return;
    }
    for (let i = start; i <= items.length - (size - current.length); i += 1) {
      current.push(items[i]);
      visit(i + 1);
      current.pop();
    }
  }

  visit(0);
  return out;
}

function sampleCombos(topics, size, count, random) {
  if (!count || topics.length < size) return [];
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  const all = combinations(topics, size);
  const connected = all.filter((combo) => isConnected(combo, topicById));
  const pool = connected.length >= count ? connected : all;

  return shuffleWeighted(
    pool.map((combo) => ({
      id: combo.map((topic) => topic.id).join("+"),
      label: combo.map((topic) => topic.label).join(" + "),
      gateWeight: combo.some((topic) => topic.gateWeight === "high") ? "high" : "medium",
      topics: combo
    })),
    random
  ).slice(0, count);
}

function sampleSingles(topics, count, random) {
  return shuffleWeighted(topics, random).slice(0, Math.min(count, topics.length));
}

function makePlan(topics, args) {
  const random = rng(args.seed);
  const minWeight = args.minGateWeight ? gateWeightValue(args.minGateWeight) : 0;
  const eligible = topics.filter((topic) => gateWeightValue(topic.gateWeight) >= minWeight);

  if (!eligible.length) {
    throw new Error("No eligible topics after applying filters.");
  }

  const singles = sampleSingles(eligible, args.single, random).map((topic, index) => ({
    id: `single-${index + 1}`,
    kind: "single concept",
    topics: [topic.id],
    labels: [topic.label],
    gateWeight: topic.gateWeight
  }));

  const pairs = sampleCombos(eligible, 2, args.pair, random).map((combo, index) => ({
    id: `pair-${index + 1}`,
    kind: "mixed: two concepts",
    topics: combo.topics.map((topic) => topic.id),
    labels: combo.topics.map((topic) => topic.label),
    gateWeight: combo.gateWeight
  }));

  const triples = sampleCombos(eligible, 3, args.triple, random).map((combo, index) => ({
    id: `triple-${index + 1}`,
    kind: "mixed: three concepts",
    topics: combo.topics.map((topic) => topic.id),
    labels: combo.topics.map((topic) => topic.label),
    gateWeight: combo.gateWeight
  }));

  return {
    seed: args.seed,
    requested: { single: args.single, pair: args.pair, triple: args.triple },
    availableTopics: eligible.length,
    samples: [...singles, ...pairs, ...triples]
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const raw = readInput(args.input);
  const data = JSON.parse(raw);
  const topics = normalizeTopics(data);
  const plan = makePlan(topics, args);
  console.log(JSON.stringify(plan, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  console.error(usage());
  process.exit(1);
}
