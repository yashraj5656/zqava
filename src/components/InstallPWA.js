
"use client";

import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    checkInstalled();

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      console.log(
        "The browser installation prompt is not currently available."
      );
      return;
    }

    await installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    } else {
      // The user cancelled; they can try again later
      // if the browser makes the prompt available again.
      setInstallPrompt(null);
    }
  }

  if (isInstalled) return null;

  return (
    <button
      type="button"
      className="install-pwa-link"
      onClick={handleInstall}
      disabled={!installPrompt}
      title={
        installPrompt
          ? "Install ZQAVA"
          : "Installation prompt is not available yet"
      }
    >
      ↓ Download App
    </button>
  );
}
