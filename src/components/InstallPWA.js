
"use client";

import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsInstalled(standalone);

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    alert(
      "To install ZQAVA, open your browser menu and choose " +
      "'Install app' or 'Add to Home Screen'."
    );
  }

 // if (isInstalled) return null;

  return (
    <button
      type="button"
      className="install-pwa-link"
      onClick={handleInstall}
    >
      ↓ Download App
    </button>
  );
}
