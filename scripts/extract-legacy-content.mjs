import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createContext, runInContext } from "vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsPath = join(__dirname, "..", "..", "aleph-main-temp", "app.js");
const outputDir = join(__dirname, "..", "..", "aleph-main-temp-extracted");

// Minimal browser mocks so app.js can load without crashing.
const mockElement = {
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => mockElement,
  querySelectorAll: () => [],
  classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
  dataset: {},
  style: {},
  textContent: "",
  innerHTML: "",
  value: "",
  checked: false,
  setAttribute: () => {},
  getAttribute: () => null,
  appendChild: () => {},
  remove: () => {},
  focus: () => {},
  click: () => {},
};

const mockStorage = {
  _data: new Map(),
  getItem(k) { return this._data.get(k) ?? null; },
  setItem(k, v) { this._data.set(k, String(v)); },
  removeItem(k) { this._data.delete(k); },
  clear() { this._data.clear(); },
  get length() { return this._data.size; },
  key() { return null; },
};

const mockDocument = {
  querySelector: () => mockElement,
  querySelectorAll: () => [],
  getElementById: () => mockElement,
  createElement: () => mockElement,
  body: mockElement,
  documentElement: mockElement,
  addEventListener: () => {},
  removeEventListener: () => {},
};

const mockWindow = {
  location: { hostname: "localhost", href: "http://localhost", pathname: "/", search: "", hash: "" },
  localStorage: mockStorage,
  sessionStorage: mockStorage,
  document: mockDocument,
  navigator: {
    serviceWorker: { getRegistrations: async () => [], register: async () => ({}) },
    credentials: undefined,
    userAgent: "node",
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  caches: { keys: async () => [], delete: async () => {} },
  history: { pushState: () => {}, replaceState: () => {} },
  fetch: async () => ({ ok: false, json: async () => ({}) }),
  alert: () => {},
  confirm: () => true,
  prompt: () => null,
  open: () => null,
  console,
  Math,
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  Promise,
  Set,
  Map,
  WeakMap,
  WeakSet,
  Symbol,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  URLSearchParams,
  Blob: class Blob {},
  File: class File {},
  FileReader: class FileReader { readAsDataURL() {} },
  btoa: (s) => Buffer.from(String(s), "binary").toString("base64"),
  atob: (s) => Buffer.from(String(s), "base64").toString("binary"),
  TextEncoder,
  TextDecoder,
};

const context = createContext({
  ...mockWindow,
  window: mockWindow,
  document: mockDocument,
  localStorage: mockStorage,
  sessionStorage: mockStorage,
  navigator: mockWindow.navigator,
  fetch: mockWindow.fetch,
});

console.log("Loading app.js...");
const appJs = readFileSync(appJsPath, "utf8");

// Run the file. Top-level code may execute but should not crash with mocks.
runInContext(appJs, context, { filename: "app.js", timeout: 30000 });

console.log("Extracting GATE DA Basic sections...");
runInContext("const __extractedGateDaBasicSections = gateDaBasicSections();", context);

console.log("Extracting plans...");
runInContext("const __extractedDefaultUser = typeof defaultUser === 'function' ? defaultUser() : {};", context);
runInContext("const __extractedBasicUser = typeof basicGateDaUser === 'function' ? basicGateDaUser() : __extractedDefaultUser;", context);
const platinumPlan = runInContext("buildPriyankaPlatinumPlan(new Date().toISOString(), [], [], __extractedDefaultUser)", context);
const basicPlan = runInContext("buildGateDaBasicPlan(new Date().toISOString(), [], __extractedGateDaBasicSections, __extractedBasicUser)", context);
const gateDaBasicSections = runInContext("__extractedGateDaBasicSections", context);

mkdirSync(outputDir, { recursive: true });

writeFileSync(
  join(outputDir, "gateDaBasicSections.json"),
  JSON.stringify(gateDaBasicSections, null, 2)
);

writeFileSync(
  join(outputDir, "basicPlan.json"),
  JSON.stringify(basicPlan, null, 2)
);

writeFileSync(
  join(outputDir, "platinumPlan.json"),
  JSON.stringify(platinumPlan, null, 2)
);

console.log("Extraction complete.");
console.log("  gateDaBasicSections:", gateDaBasicSections.length, "sections");
console.log("  basicPlan subjects:", basicPlan.subjects?.length);
console.log("  basicPlan schedule:", basicPlan.schedule?.length);
console.log("  basicPlan tasks:", basicPlan.tasks?.length);
console.log("  platinumPlan subjects:", platinumPlan.subjects?.length);
console.log("  platinumPlan schedule:", platinumPlan.schedule?.length);
console.log("  platinumPlan tasks:", platinumPlan.tasks?.length);
console.log("Output directory:", outputDir);
