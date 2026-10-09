
"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Register only on the deployed HTTPS site,
    // or localhost during development.
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.error(
          "ZQAVA service worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}