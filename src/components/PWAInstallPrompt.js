
"use client";

import { useEffect, useState } from "react";
import "./PWAInstallPrompt.css";

const DISMISS_KEY = "zqava-pwa-dismissed";

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [visibleu, setVisibleu] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    let deferredPrompt = null;

    function checkInstalled() {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      if (standalone) {
        setInstalled(true);
        setVisible(false);
        return true;
      }

      return false;
    }

    function onBeforeInstallPrompt(event) {
      // Keep the browser's native installation prompt.
      event.preventDefault();
      deferredPrompt = event;
      setInstallEvent(event);

      if (
        !checkInstalled() &&
        localStorage.getItem(DISMISS_KEY) !== "1"
      ) {
        setVisible(true);
      }
    }

    function onAppInstalled() {
      deferredPrompt = null;
      setInstallEvent(null);
      setInstalled(true);
      setVisible(false);
      setMessage("");
    }

    if (checkInstalled()) return;

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", onAppInstalled);

    // iOS Safari does not support beforeinstallprompt.
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    const isSafari =
      /safari/i.test(navigator.userAgent) &&
      !/crios|fxios|edgios|chrome|android/i.test(
        navigator.userAgent
      );

    if (
      isIOS &&
      isSafari &&
      localStorage.getItem(DISMISS_KEY) !== "1"
    ) {
      setVisible(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        onAppInstalled
      );
    };
  }, []);

  async function installApp() {
    if (!installEvent) {
      setIosInstructions(true);
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await installEvent.prompt();

      const choice = await installEvent.userChoice;

      if (choice?.outcome === "accepted") {
        setVisible(false);
        setInstalled(true);
        setInstallEvent(null);
        localStorage.removeItem(DISMISS_KEY);
      } else {
        setMessage("No problem. You can install ZQAVA later.");
      }
    } catch (error) {
      console.error("ZQAVA installation failed:", error);
      setMessage("Installation isn't available right now.");
    } finally {
      setBusy(false);
      setInstallEvent(null);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(true);
    setIosInstructions(false);
  }

  function dismissu() {
    setVisibleu(true);
  }

 // TEMPORARY TEST: force the prompt to appear
if (installed || visibleu) {
    return null;
  }

  return (
    <aside
      className="zqava-install-prompt"
      role="region"
      aria-label="Install ZQAVA app"
    >
      {iosInstructions && (
        <button
          type="button"
          className="zqava-install-dismiss"
          onClick={dismissu}
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
        )}
      <div className="zqava-install-icon" aria-hidden="true">
      <img src="/zqavab.jpg" alt="ZQAVA" />
      </div>

      <div className="zqava-install-copy">
        <strong>Get the ZQAVA app</strong>

        <p>
          Install ZQAVA for quick access to your bookings,
          messages and companions.
        </p>

        {message && (
          <p className="zqava-install-message" role="status">
            {message}
          </p>
        )}

        {iosInstructions && (
          <p className="zqava-install-message" role="status">
            Tap the Share button in Safari, then choose
            “Add to Home Screen”.
          </p>
        )}
      </div>

      <div className="zqava-install-actions">
        <button
          type="button"
          className="zqava-install-enable"
          onClick={installApp}
          disabled={busy}
        >
          {busy ? "Opening..." : iosInstructions ? "Got it" : "Install"}
        </button>

{/*<button
          type="button"
          className="zqava-install-dismiss"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          ×
        </button>*/}
      </div>
    </aside>
  );
}
