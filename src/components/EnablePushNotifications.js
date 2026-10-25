
"use client";

import { useEffect, useState } from "react";

function decodeVapidKey(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function EnablePushNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
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

        const subscription =
          await registration.pushManager.getSubscription();

        if (!cancelled) {
          setEnabled(
            Notification.permission === "granted" &&
            Boolean(subscription)
          );
        }

        // Restore the subscription in MongoDB if it exists locally.
        if (subscription && Notification.permission === "granted") {
          const response = await fetch("/api/push/subscribe", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          });

          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(
              result.message || "Could not sync your subscription."
            );
          }
        }
      } catch (error) {
        console.error("Checking push subscription failed:", error);

        if (!cancelled) {
          setStatus("Could not verify notification settings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setStatus("");

    try {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        throw new Error("Push notifications are not supported here.");
      }

      if (Notification.permission === "denied") {
        throw new Error(
          "Notifications are blocked. Allow them in your browser settings."
        );
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("The public VAPID key is missing.");
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(publicKey),
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not save your subscription."
        );
      }

      setEnabled(true);
      setStatus("Mobile notifications are enabled.");
    } catch (error) {
      console.error("Enabling notifications failed:", error);
      setStatus(error.message || "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading || enabled}
      >
        {loading
          ? "Checking..."
          : enabled
            ? "Notifications Enabled ✓"
            : "Enable Mobile Notifications"}
      </button>

      {status && <p role="status">{status}</p>}
    </div>
  );
}
