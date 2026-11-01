"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckinClient({ partyId }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Verification failed.");
      }

      setResult(data);
      setCode("");
    } catch (e) {
      setError(e.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkin-container">
      <Link href={`/parties/${partyId}`} className="checkin-back">
        ← Back to party
      </Link>

      <div className="checkin-card">
        <div className="checkin-icon">🎟️</div>
        <h1>Check in a guest</h1>
        <p>Enter or scan the ticket code from the guest's phone.</p>

        <form onSubmit={handleVerify} className="checkin-form">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ZQ-XXXXXXXXXX"
            autoFocus
            disabled={loading}
          />
          <button type="submit" disabled={loading || !code.trim()}>
            {loading ? "Checking..." : "Verify"}
          </button>
        </form>

        {error && <div className="checkin-error">{error}</div>}

        {result && (
          <div
            className={`checkin-result ${
              result.alreadyCheckedIn ? "warn" : "success"
            }`}
          >
            <div className="checkin-result-icon">
              {result.alreadyCheckedIn ? "⚠️" : "✅"}
            </div>
            <h3>
              {result.alreadyCheckedIn
                ? "Already checked in"
                : "Checked in successfully"}
            </h3>
            <p>
              <strong>{result.ticket.buyerName}</strong> •{" "}
              {result.ticket.quantity}{" "}
              {result.ticket.quantity === 1 ? "guest" : "guests"}
            </p>
            <small>Ticket: {result.ticket.ticketCode}</small>
          </div>
        )}
      </div>
    </div>
  );
}