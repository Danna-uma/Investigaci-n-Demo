// ============================================================
// pwa.js — registro del Service Worker + prompt de instalación
// + indicador de estado de conexión
// ============================================================

// --- Registrar el Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => console.log("[PWA] Service Worker registrado:", reg.scope))
      .catch((err) => console.error("[PWA] Error registrando SW:", err));
  });
}

// --- Prompt de instalación (evento beforeinstallprompt) ---
let deferredPrompt;
const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-btn");
const dismissBtn = document.getElementById("dismiss-install");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBanner.hidden = false;
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log("[PWA] Resultado de instalación:", outcome);
  deferredPrompt = null;
  installBanner.hidden = true;
});

dismissBtn?.addEventListener("click", () => {
  installBanner.hidden = true;
});

window.addEventListener("appinstalled", () => {
  console.log("[PWA] App instalada");
  installBanner.hidden = true;
});

// --- Indicador de conexión ---
const offlineBanner = document.getElementById("offline-banner");

function updateConnectionStatus() {
  offlineBanner.hidden = navigator.onLine;
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
updateConnectionStatus();