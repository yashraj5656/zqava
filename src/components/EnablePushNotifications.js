
"use client";

import { useCallback, useEffect, useState } from "react";

function decodeVapidKey(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");

  return Uint8Array.from(
    window.atob(base64),
    (char) => char.charCodeAt(0)
  );
}

export default function EnablePushNotifications() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const saveSubscription = useCallback(async (subscription) => {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Could not save subscription.");
    }
  }, []);

  const registerDevice = useCallback(async () => {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Push notification configuration is missing.");
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey),
      });
    }

    await saveSubscription(subscription);
    setEnabled(true);
    setVisible(false);
    setMessage("");
  }, [saveSubscription]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        let subscription =
          await registration.pushManager.getSubscription();

        // Permission was granted previously: restore the device automatically.
        if (
          Notification.permission === "granted" &&
          !subscription
        ) {
          const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

          if (publicKey) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: decodeVapidKey(publicKey),
            });
          }
        }

        if (subscription && Notification.permission === "granted") {
          const response = await fetch("/api/push/subscribe", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          });

          if (response.status === 401) return;

          if (!response.ok) {
            throw new Error("Could not sync notification settings.");
          }

          if (!cancelled) setEnabled(true);
          return;
        }

        // Never repeatedly prompt people who blocked notifications.
        if (Notification.permission === "denied") return;

        // Don't show the custom prompt again if dismissed on this browser.
        if (localStorage.getItem("zqava-push-dismissed") === "1") {
          return;
        }

        // Check login before showing the prompt.
        const check = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        });

        if (!check.ok) return;

        if (!cancelled) setVisible(true);
      } catch (error) {
        console.error("Notification initialization failed:", error);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    setMessage("");

    try {
      if (Notification.permission === "denied") {
        setMessage("Allow notifications in your browser settings.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("Notifications weren't allowed. You can enable them later.");
        return;
      }

      await registerDevice();
    } catch (error) {
      console.error("Enable notifications failed:", error);
      setMessage(error.message || "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem("zqava-push-dismissed", "1");
    setVisible(false);
  }

  if (enabled || !visible) return null;

  return (
    <aside className="zqava-push-prompt" role="region"
      aria-label="Notification settings">
      <button
        type="button"
        className="zqava-push-close"
        onClick={dismiss}
        aria-label="Dismiss notification prompt"
      >
        ×
      </button>

      <div className="zqava-push-icon" aria-hidden="true">🔔</div>

      <div className="zqava-push-copy">
        <strong>Never miss a message</strong>
        <p>Enable notifications to know when someone messages you on ZQAVA.</p>
        {message && <p role="status">{message}</p>}
      </div>

      <button
        type="button"
        className="zqava-push-enable"
        onClick={enable}
        disabled={busy}
      >
        {busy ? "Enabling..." : "Enable"}
      </button>
    </aside>
  );
}
