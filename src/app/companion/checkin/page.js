"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { safeJson } from "@/lib/apiClient";
import "./checkin.css";

function CheckinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setLoadingBooking(false);
      return;
    }

    let cancelled = false;

    async function loadBooking() {
      try {
        setLoadingBooking(true);
        setError("");

        const res = await fetch(`/api/bookings/${bookingId}`, {
          cache: "no-store",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await safeJson(res);

        if (cancelled) return;

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not load booking.");
        }

        setBooking(data.booking);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load booking.");
      } finally {
        if (!cancelled) setLoadingBooking(false);
      }
    }

    loadBooking();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Check-in failed.");
      }

      setResult(data);
      setCode("");
    } catch (e) {
      setError(e.message || "Check-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectCheckin() {
    if (!booking) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked_in" }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Check-in failed.");
      }

      setResult({
        success: true,
        booking: {
          customerName:
            `${data.booking?.customer?.firstName || ""} ${
              data.booking?.customer?.lastName || ""
            }`.trim() || "Guest",
          duration: data.booking?.duration,
        },
      });
    } catch (e) {
      setError(e.message || "Check-in failed.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingBooking) {
    return (
      <main className="companion-checkin-page">
        <div className="companion-checkin-container">
          <div className="companion-checkin-card">
            <div className="companion-checkin-icon">⏳</div>
            <h1>Loading booking...</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="companion-checkin-page">
      <div className="companion-checkin-container">
        <Link href="/companion/dashboard" className="companion-checkin-back">
          ← Dashboard
        </Link>

        <div className="companion-checkin-card">
          <div className="companion-checkin-icon">🎟️</div>

          {booking ? (
            <>
              <h1>Check in {booking.customer?.firstName || "guest"}</h1>
              <p>
                {new Date(`${booking.date}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  { weekday: "short", day: "numeric", month: "short" }
                )}{" "}
                · {booking.time} · {booking.duration}{" "}
                {booking.duration === 1 ? "hour" : "hours"}
              </p>

              {/*<button
                type="button"
                className="companion-checkin-direct"
                onClick={handleDirectCheckin}
                disabled={loading}
              >
                {loading ? "Checking in..." : "Confirm check-in"}
              </button>*/}

              <div className="companion-checkin-divider">
                <span>or enter ticket code</span>
              </div>
            </>
          ) : (
            <>
              <h1>Check in a guest</h1>
              <p>Enter the ticket code your customer shows you.</p>
            </>
          )}

          <form onSubmit={handleSubmit} className="companion-checkin-form">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CK-XXXXXXXX"
              disabled={loading}
              autoFocus={!booking}
            />
            <button type="submit" disabled={loading || !code.trim()}>
              {loading ? "Checking..." : "Check in"}
            </button>
          </form>

          {error && <div className="companion-checkin-error">{error}</div>}

          {result && (
            <div
              className={`companion-checkin-result ${
                result.alreadyCheckedIn ? "warn" : "success"
              }`}
            >
              <div className="companion-checkin-result-icon">
                {result.alreadyCheckedIn ? "⚠️" : "✅"}
              </div>
              <h3>
                {result.alreadyCheckedIn
                  ? "Already checked in"
                  : "Checked in successfully"}
              </h3>
              <p>
                <strong>{result.booking?.customerName || "Guest"}</strong>
                {result.booking?.duration && (
                  <>
                    {" "} · {result.booking.duration}{" "}
                    {result.booking.duration === 1 ? "hour" : "hours"}
                  </>
                )}
              </p>

              <button
                type="button"
                className="companion-checkin-done"
                onClick={() => router.push("/companion/dashboard")}
              >
                Back to dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CompanionCheckinPage() {
  return (
    <Suspense
      fallback={
        <main className="companion-checkin-page">
          <div className="companion-checkin-container">
            <div className="companion-checkin-card">
              <div className="companion-checkin-icon">⏳</div>
              <h1>Loading...</h1>
            </div>
          </div>
        </main>
      }
    >
      <CheckinContent />
    </Suspense>
  );
}