
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./creator.css";

const initialData = {
  creator: null,
  stats: {
    registrations: 0,
    totalEligibleProfit: 0,
    totalCommission: 0,
    unpaidCommission: 0,
  },
};

function rupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function CreatorDashboardPage() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/creator/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to load dashboard.");
        return;
      }

      setData(result);
      setError("");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function copyLink() {
    if (!data.creator?.referralLink) return;

    try {
      await navigator.clipboard.writeText(data.creator.referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy the link. Please copy it manually.");
    }
  }

  if (loading) {
    return (
      <main className="creator-page">
        <section className="creator-panel">
          <p>Loading your creator dashboard...</p>
        </section>
      </main>
    );
  }

  if (error && !data.creator) {
    return (
      <main className="creator-page">
        <section className="creator-panel">
          <p className="creator-eyebrow">ZQAVA PARTNERS</p>
          <h1>Creator dashboard</h1>
          <p className="creator-description">{error}</p>
          <Link className="creator-button creator-link-button" href="/creator/register">
            Apply to join
          </Link><br></br>
          <button
            className="creator-secondary-button"
            type="button"
            onClick={loadDashboard}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const creator = data.creator;
  const stats = data.stats;

  return (
    <main className="creator-page">
      <section className="creator-dashboard">
        <header className="creator-dashboard-header">
          <div>
            <p className="creator-eyebrow">ZQAVA PARTNERS</p>
            <h1>Your creator dashboard</h1>
            <p className="creator-description">
              Track your referrals and eligible earnings.
            </p>
          </div>

          <span className={`creator-status status-${creator.status}`}>
            {creator.status}
          </span>
        </header>

        {creator.status !== "approved" ? (
          <div className="creator-pending">
            <h2>Application under review</h2>
            <p>
              Your application is currently {creator.status}.
              Your referral link will become active after approval.
            </p>
          </div>
        ) : (
          <div className="creator-referral-box">
            <label htmlFor="creator-referral-link">Your referral link</label>
            <div className="creator-link-row">
              <input
                id="creator-referral-link"
                value={creator.referralLink}
                readOnly
                onFocus={(event) => event.target.select()}
              />
              <button
                className="creator-button"
                type="button"
                onClick={copyLink}
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
            <p className="creator-note">
              Share this link with your audience. Registrations are counted
              after referred users successfully create accounts.
            </p>
          </div>
        )}

        <div className="creator-stats-grid">
          <article className="creator-stat-card">
            <span>Referred registrations</span>
            <strong>{stats.registrations}</strong>
          </article>

          <article className="creator-stat-card">
            <span>Eligible platform profit</span>
            <strong>{rupees(stats.totalEligibleProfit)}</strong>
          </article>

          <article className="creator-stat-card">
            <span>Total commission</span>
            <strong>{rupees(stats.totalCommission)}</strong>
          </article>

          <article className="creator-stat-card">
            <span>Paid to bank</span>
            <strong>{rupees(stats.unpaidCommission)}</strong>
          </article>
        </div>

        <p className="creator-note">
          Commission rate: {creator.commissionRate}% of eligible platform
          contribution profit for up to 12 months per referred customer.
          Earnings will remain at zero until qualifying transactions are
          connected to the commission system.
        </p>

        {error && <p className="creator-message">{error}</p>}

        <button
          className="creator-secondary-button"
          type="button"
          onClick={loadDashboard}
        >
          Refresh statistics
        </button><br></br>
        <Link
          className="creator-secondary-button"
          type="button"
          href="/companion/bank-details"
        >
          Manage payouts 
        </Link>
      </section>
    </main>
  );
}
