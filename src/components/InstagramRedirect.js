
"use client";

import { useEffect } from "react";

export default function InstagramRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent || "";

    const isInstagram = /Instagram/i.test(ua);

    if (!isInstagram) return;

    const currentUrl = window.location.href;

    // Android: attempt to open the URL in Chrome.
    if (/Android/i.test(ua)) {
      const urlWithoutScheme = currentUrl.replace(/^https?:\/\//, "");

      const intentUrl =
        `intent://${urlWithoutScheme}` +
        `#Intent;scheme=https;` +
        `package=com.android.chrome;` +
        `S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;

      window.location.replace(intentUrl);
      return;
    }

    // iOS: no reliable automatic external-browser launch.
    // Leave the page open rather than risk a broken redirect.
  }, []);

  return null;
}
