/* Registra el Service Worker cuando la página termina de cargar. */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js"
      );

      console.log("[PWA] Service Worker registrado:", registration.scope);
    } catch (error) {
      console.error("[PWA] Error registrando el Service Worker:",error);
    }
  });
} else {
  console.warn("[PWA] Este navegador no admite Service Workers.");
}

// Instalación de la PWA
let deferredPrompt = null;

const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-btn");
const dismissInstallBtn = document.getElementById("dismiss-install");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  if (installBanner) {
    installBanner.hidden = false;
  }
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) {
    console.warn("[PWA] La instalación todavía no está disponible.");
    return;
  }

  try {
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;

    console.log("[PWA] Resultado de instalación:", choiceResult.outcome);
  } catch (error) {
    console.error("[PWA] Ocurrió un error durante la instalación:", error);
  } finally {
    deferredPrompt = null;

    if (installBanner) {
      installBanner.hidden = true;
    }
  }
});

dismissInstallBtn?.addEventListener("click", () => {
  if (installBanner) {
    installBanner.hidden = true;
  }
});

window.addEventListener("appinstalled", () => {
  console.log("[PWA] Aplicación instalada correctamente.");

  deferredPrompt = null;

  if (installBanner) {
    installBanner.hidden = true;
  }
});

// Estado de conexión
const offlineBanner = document.getElementById("offline-banner");

function updateConnectionStatus() {
  if (!offlineBanner) {
    return;
  }

  const isOnline = navigator.onLine;
  offlineBanner.hidden = isOnline;

  if (isOnline) {
    console.log("[PWA] Conexión restablecida.");
  } else {
    console.warn("[PWA] Aplicación funcionando sin conexión.");
  }
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

updateConnectionStatus();