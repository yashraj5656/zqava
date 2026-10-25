"use client";

import { useState } from "react";

function decodeVapidKey(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function EnablePushNotifications() {
  const [status, setStatus] = useState("");

  async function enableNotifications() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Push notifications are not supported in this browser.");
        return;
      }

      if (!("Notification" in window)) {
        setStatus("Browser notifications are unavailable.");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("Allow notifications in your browser settings.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Notification permission was not granted.");
        return;
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
        throw new Error(result.message || "Subscription failed.");
      }

      setStatus("Notifications enabled successfully.");
    } catch (error) {
      console.error("Enable push error:", error);
      setStatus(error.message || "Could not enable notifications.");
    }
  }

  return (
    <div>
      <button type="button" onClick={enableNotifications}>
        Enable Mobile Notifications
      </button>

      {status && <p role="status">{status}</p>}
    </div>
  );
}