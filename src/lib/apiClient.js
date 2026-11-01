/**
 * Safely parse a fetch response as JSON.
 *
 * Returns an empty object `{}` if the response body is empty,
 * or `{ success: false, message: "..." }` if the body isn't valid JSON.
 *
 * This prevents "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
 * from crashing the page when a route returns 404 HTML, redirects, or
 * an empty 500 body.
 *
 * @param {Response} res - the Response object from fetch()
 * @returns {Promise<object>} - parsed JSON, or a safe fallback object
 */
export async function safeJson(res) {
    try {
      const text = await res.text();
  
      if (!text || !text.trim()) {
        return {};
      }
  
      try {
        return JSON.parse(text);
      } catch {
        return {
          success: false,
          message: `Invalid response from server (${res.status})`,
        };
      }
    } catch {
      return {
        success: false,
        message: `Could not read server response (${res.status})`,
      };
    }
  }
  
  /**
   * Convenience helper: fetch + safeJson in one call.
   *
   * Usage:
   *   const { ok, status, data } = await fetchJson("/api/bookings", { ... });
   *   if (!ok || !data.success) { ... }
   *
   * @param {string} url
   * @param {RequestInit} [options]
   */
  export async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await safeJson(res);
    return { ok: res.ok, status: res.status, data };
  }