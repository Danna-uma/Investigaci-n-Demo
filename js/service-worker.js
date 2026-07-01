// ============================================================
// service-worker.js — Task Manager
// Estrategia: Cache First para el "app shell" (HTML, CSS, JS,
// manifest, íconos). Como es una app de tareas guardadas en
// localStorage, no hay datos remotos que pedir con Network First:
// una vez cacheado el shell, la app funciona 100% offline.
// ============================================================

const CACHE_NAME = "taskmanager-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./js/pwa.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// --- INSTALL: precachear el app shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precacheando app shell");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// --- ACTIVATE: limpiar caches de versiones anteriores ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- FETCH: Cache First con fallback a red ---
self.addEventListener("fetch", (event) => {
  // Solo interceptamos peticiones GET (no tiene sentido cachear POST, etc.)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Si es navegación (el usuario abrió la app sin red y sin cache previo)
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});