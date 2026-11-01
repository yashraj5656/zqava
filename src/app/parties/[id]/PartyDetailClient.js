"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartyDetailClient({ id }) {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [buyError, setBuyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  /* Share state */
  const [shareToast, setShareToast] = useState("");

  /* =========================================================
     LOAD PARTY
  ========================================================= */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid party link.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/parties/${id}`, { cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Party not found.");
        }

        setParty(data.party);
      } catch (e) {
        if (!cancelled) setError(e.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     SHARE
  ========================================================= */
  function showToast(message) {
    setShareToast(message);
    setTimeout(() => setShareToast(""), 2200);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to fallback */
    }

    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `/parties/${id}`;

    const shareTitle = party?.title
      ? `${party.title} on ZQAVA`
      : "ZQAVA Parties";

    const shareText = party?.title
      ? `Check out "${party.title}" on ZQAVA Parties.`
      : "Check out this party on ZQAVA.";

    /* Prefer the native share sheet on mobile */
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      } catch (err) {
        /* User dismissed the sheet — silently ignore */
        if (err?.name === "AbortError") return;
        /* Otherwise fall through to clipboard */
      }
    }

    /* Desktop / unsupported browsers → copy */
    const ok = await copyToClipboard(url);
    showToast(ok ? "Link copied" : "Couldn't copy link");
  }

  /* =========================================================
     BUY — create order → open Razorpay → verify
  ========================================================= */
  async function handleBuy() {
    setBuyError("");
    setBuying(true);

    try {
      const res = await fetch(`/api/parties/${id}/tickets/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (res.status === 401) {
        const redirectTo = encodeURIComponent(`/parties/${id}`);
        window.location.href = `/signup?redirect=${redirectTo}`;
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not start checkout.");
      }

      if (data.free) {
        setTicket(data.ticket);
        setParty((p) => ({
          ...p,
          ticketsSold: (p.ticketsSold || 0) + quantity,
        }));
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error(
          "Payment SDK not loaded. Please refresh the page and try again."
        );
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "ZQAVA Parties",
        description: party?.title || "Party ticket",
        order_id: data.order.id,
        theme: { color: "#7444ff" },
        prefill: {},
        notes: {
          partyId: String(id),
        },
        handler: async function (razorpayResponse) {
          setVerifying(true);
          setBuyError("");

          try {
            const verifyRes = await fetch(
              `/api/parties/${id}/tickets/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            setTicket({
              ...data.ticket,
              ...verifyData.ticket,
              status: "paid",
            });

            setParty((p) => ({
              ...p,
              ticketsSold: (p.ticketsSold || 0) + quantity,
            }));
          } catch (err) {
            setBuyError(
              err.message ||
                "Payment succeeded but verification failed. Please contact support with your payment ID."
            );
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBuyError(
              "Payment cancelled. Your seat will be released automatically if you don't complete payment."
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setBuyError(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
      });

      rzp.open();
    } catch (e) {
      setBuyError(e.message || "Something went wrong.");
    } finally {
      setBuying(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */
  if (loading) {
    return (
      <div className="party-detail-loading">
        <div className="parties-spinner" />
        <p>Loading party...</p>
      </div>
    );
  }

  /* =========================================================
     ERROR / NOT FOUND
  ========================================================= */
  if (error || !party) {
    return (
      <div className="party-detail-error">
        <h2>Party not found</h2>
        <p>{error || "This party may have been removed."}</p>
        <Link href="/parties" className="parties-primary-btn">
          Browse parties
        </Link>
      </div>
    );
  }

  /* =========================================================
     DERIVED VALUES
  ========================================================= */
  const left = Math.max(0, party.totalTickets - party.ticketsSold);
  const soldOut = left === 0;
  const dateObj = new Date(party.date);
  const isFree = party.ticketPrice === 0;

  const serviceFee = isFree
    ? 0
    : Math.round((party.ticketPrice * quantity * 10) / 100);
  const subtotal = isFree ? 0 : party.ticketPrice * quantity;
  const total = subtotal + serviceFee;

  const maxPerBooking = Math.min(party.maxGuestsPerBooking || 10, left || 1);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="party-detail-container">
      {/* Top row: back + share */}
      <div className="party-detail-topbar">
        <Link href="/parties" className="party-detail-back">
          ← All parties
        </Link>

        <button
          type="button"
          className="party-detail-share"
          onClick={handleShare}
          aria-label="Share party"
        >
          <span className="party-detail-share-icon" aria-hidden="true">
            ⤴
          </span>
          Share
        </button>
      </div>

      {/* Toast */}
      {shareToast && (
        <div className="party-detail-toast" role="status" aria-live="polite">
          ✓ {shareToast}
        </div>
      )}

      {/* ================= HERO ================= */}
      <div className="party-detail-hero">
        <div className="party-detail-cover">
          {party.coverImage ? (
            <img src={party.coverImage} alt={party.title} />
          ) : (
            <div className="party-detail-cover-fallback">
              <span>{party.category}</span>
            </div>
          )}

          <span className="party-detail-category">{party.category}</span>
        </div>

        <div className="party-detail-hero-info">
          <h1>{party.title}</h1>

          <p className="party-detail-venue">
            📍 {party.venue}, {party.city}
          </p>

          <div className="party-detail-meta">
            <div className="meta-chip">
              <span className="meta-icon">📅</span>
              <div>
                <strong>
                  {dateObj.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
                <small>
                  {party.startTime} – {party.endTime}
                </small>
              </div>
            </div>

            <div className="meta-chip">
              <span className="meta-icon">🎟️</span>
              <div>
                <strong>{soldOut ? "Sold out" : `${left} tickets left`}</strong>
                <small>
                  {party.totalTickets} total • {party.ticketsSold || 0} sold
                </small>
              </div>
            </div>

            <div className="meta-chip">
              <span className="meta-icon">🔞</span>
              <div>
                <strong>{party.ageLimit}+ only</strong>
                <small>ID required at entry</small>
              </div>
            </div>
          </div>

          {Array.isArray(party.tags) && party.tags.length > 0 && (
            <div className="party-detail-tags">
              {party.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="party-detail-grid">
        <div className="party-detail-left">
          <section className="party-detail-section">
            <h2>About this party</h2>
            <p className="party-detail-description">{party.description}</p>
          </section>

          <section className="party-detail-section">
            <h2>Hosted by</h2>
            <div className="party-detail-host">
              <div className="party-host-avatar">
                {party.hostId?.profilePhoto ? (
                  <img
                    src={party.hostId.profilePhoto}
                    alt={party.hostId.name || "Host"}
                  />
                ) : (
                  <span>
                    {(party.hostId?.name || "H").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="party-host-info">
                <strong>
                  {party.hostId?.name || "ZQAVA Host"}
                  {party.verifiedHost && (
                    <span className="party-host-verified">✓</span>
                  )}
                </strong>
                {party.hostId?.city && <small>📍 {party.hostId.city}</small>}
              </div>
            </div>
          </section>

          <section className="party-detail-section">
            <h2>What to know</h2>
            <ul className="party-detail-rules">
              <li>Arrive within 30 minutes of start time.</li>
              <li>Bring a valid government ID (age {party.ageLimit}+).</li>
              <li>Respect the venue and other guests.</li>
              <li>
                Tickets are non-refundable after 24 hours before the party.
              </li>
            </ul>
          </section>

          {/* Share at the bottom of the description column too */}
          <button
            type="button"
            className="party-detail-share-large"
            onClick={handleShare}
          >
            <span aria-hidden="true">⤴</span>
            Share this party with friends
          </button>
        </div>

        <aside className="party-detail-booking">
          {verifying && (
            <div className="party-booking-card">
              <div
                className="party-detail-loading"
                style={{ padding: "40px 20px" }}
              >
                <div className="parties-spinner" />
                <p style={{ marginTop: 12 }}>Confirming payment...</p>
              </div>
            </div>
          )}

          {!verifying && ticket && (
            <div className="party-ticket-success">
              <div className="party-ticket-icon">🎉</div>
              <h3>You&apos;re in!</h3>
              <p>Your ticket has been booked successfully.</p>

              <div className="party-ticket-code">
                <small>Ticket code</small>
                <strong>{ticket.ticketCode}</strong>
              </div>

              <div className="party-ticket-summary">
                <div>
                  <span>Tickets</span>
                  <strong>{ticket.quantity}</strong>
                </div>
                <div>
                  <span>Total paid</span>
                  <strong>
                    {ticket.totalAmount === 0
                      ? "Free"
                      : `₹${ticket.totalAmount}`}
                  </strong>
                </div>
              </div>

              <Link href="/parties" className="parties-primary-btn">
                Browse more parties
              </Link>
            </div>
          )}

          {!verifying && !ticket && (
            <div className="party-booking-card">
              <div className="party-booking-price">
                <div>
                  <strong>{isFree ? "Free" : `₹${party.ticketPrice}`}</strong>
                  {!isFree && <span>/ ticket</span>}
                </div>

                <span
                  className={`party-booking-status ${
                    soldOut ? "sold" : "available"
                  }`}
                >
                  {soldOut ? "Sold out" : `${left} left`}
                </span>
              </div>

              <div className="party-booking-divider" />

              {!soldOut ? (
                <>
                  <div className="party-booking-field">
                    <label>Number of tickets</label>

                    <div className="party-quantity">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || buying}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(maxPerBooking, q + 1))
                        }
                        disabled={quantity >= maxPerBooking || buying}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <small>Max {maxPerBooking} per booking</small>
                  </div>

                  {!isFree && (
                    <div className="party-booking-summary">
                      <div>
                        <span>
                          ₹{party.ticketPrice} × {quantity}
                        </span>
                        <strong>₹{subtotal}</strong>
                      </div>

                      <div>
                        <span>Service fee (10%)</span>
                        <strong>₹{serviceFee}</strong>
                      </div>

                      <div className="party-booking-total">
                        <span>Total</span>
                        <strong>₹{total}</strong>
                      </div>
                    </div>
                  )}

                  {isFree && (
                    <div className="party-booking-summary">
                      <div className="party-booking-total">
                        <span>Total</span>
                        <strong>Free</strong>
                      </div>
                    </div>
                  )}

                  {buyError && (
                    <div className="party-booking-error">{buyError}</div>
                  )}

                  <button
                    type="button"
                    className="party-booking-button"
                    onClick={handleBuy}
                    disabled={buying}
                  >
                    {buying
                      ? "Processing..."
                      : isFree
                      ? "Claim free ticket"
                      : `Pay ₹${total}`}
                    {!buying && <span>→</span>}
                  </button>

                  <p className="party-booking-note">
                    Secure checkout by Razorpay • Instant confirmation
                  </p>

                  <div className="party-booking-safe">
                    <span>🛡️</span>
                    <div>
                      <strong>Safe booking</strong>
                      <p>
                        Payments are processed securely by Razorpay. All
                        bookings are recorded and refunds are handled by
                        ZQAVA.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="party-booking-soldout">
                  <div className="party-booking-soldout-icon">😔</div>
                  <h3>Sold out</h3>
                  <p>All tickets for this party have been booked.</p>
                  <Link href="/parties" className="parties-ghost-btn">
                    Find another party
                  </Link>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}