
"use client";

import { useEffect, useState } from "react";

function getPublicKey() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!key) {
    throw new Error("The VAPID public key is not configured.");
  }

  // Convert the URL-safe Base64 VAPID key into a Uint8Array.
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = (key + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);

  return Uint8Array.from(raw, (character) =>
    character.charCodeAt(0)
  );
}

export default function PushNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const isSupported =
          typeof window !== "undefined" &&
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;

        if (!isSupported) {
          if (!cancelled) setSupported(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription =
          await registration.pushManager.getSubscription();

        if (!cancelled) {
          setPermission(Notification.permission);
          setEnabled(Boolean(subscription));
        }
      } catch {
        if (!cancelled) {
          setError("Could not check notification settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported.");
      }

      const permissionResult =
        await Notification.requestPermission();

      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error(
          permissionResult === "denied"
            ? "Notifications are blocked in your browser settings."
            : "Notification permission was not granted."
        );
      }

      // The site must already register /sw.js.
      const registration = await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: getPublicKey(),
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(subscription),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not save your subscription."
        );
      }

      setEnabled(true);
      setMessage("Push notifications are enabled.");
    } catch (err) {
      setError(err.message || "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Could not remove your subscription."
          );
        }

        await subscription.unsubscribe();
      }

      setEnabled(false);
      setMessage("Push notifications are disabled.");
    } catch (err) {
      setError(err.message || "Could not disable notifications.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <section className="push-settings">
        <h3>Push notifications</h3>
        <p>Your browser does not support web push notifications.</p>
      </section>
    );
  }

  return (
    <section className="push-settings">
      <div className="push-settings-content">
        <div>
          <h3>Push notifications</h3>
          <p>
            Get updates about messages, bookings, and important
            activity on ZQAVA.
          </p>
          <span className="push-settings-status">
            {enabled
              ? "Enabled"
              : permission === "denied"
                ? "Blocked in browser settings"
                : "Disabled"}
          </span>
        </div>

        <button
          type="button"
          onClick={
            enabled
              ? disableNotifications
              : enableNotifications
          }
          disabled={loading}
          className="push-settings-button"
        >
          {loading
            ? "Please wait..."
            : enabled
              ? "Turn off"
              : "Enable notifications"}
        </button>
      </div>

      {error && (
        <p className="push-settings-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="push-settings-success" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
