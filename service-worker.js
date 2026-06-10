const CACHE_NAME = "learning-studio-v109";
const IS_LOCAL = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(self.location.hostname);
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js?v=seeded-user-canonical-workspace-v74",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  return;
});
