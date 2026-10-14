
"use client";

import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkInstalled = () => {
      setInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    checkInstalled();

    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setMessage("");
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setMessage("");
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      setMessage(
        "Install prompt unavailable. Check your PWA manifest, service worker, and browser installability."
      );
      return;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;

      if (result.outcome === "accepted") {
        setMessage("Installation accepted.");
      } else {
        setMessage("Installation cancelled.");
      }
    } catch (error) {
      console.error("PWA installation error:", error);
      setMessage("Could not open the install dialog. Check the browser console.");
    } finally {
      setInstallPrompt(null);
    }
  }

  if (installed) return null;

  return (
    <div>
      <button
        type="button"
        className="install-pwa-link"
        onClick={handleInstall}
      >
        ↓ Install ZQAVA
      </button>

      {message && (
        <p role="status" style={{ fontSize: "12px", marginTop: "8px" }}>
          {message}
        </p>
      )}
    </div>
  );
}
