"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import "./BookingChat.css";

export default function BookingChat({
  bookingId,
  backHref = "/bookings",
}) {
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  /* =========================================================
     LOAD CHAT
  ========================================================= */
  const loadMessages = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);

        const response = await fetch(
          `/api/messages?bookingId=${encodeURIComponent(bookingId)}`,
          { method: "GET", cache: "no-store" }
        );

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load conversation."
          );
        }

        setBooking({
          ...data.booking,
          viewerRole: data.viewer?.role,
          viewerId: data.viewer?.id,
        });

        setMessages(data.messages || []);
        setError("");
      } catch (err) {
        console.error("Load messages error:", err);
        if (showLoading) {
          setError(err.message || "Unable to load conversation.");
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [bookingId]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */
  useEffect(() => {
    if (!bookingId) return;
    loadMessages(true);
  }, [bookingId, loadMessages]);

  /* =========================================================
     POLLING
  ========================================================= */
  useEffect(() => {
    if (!bookingId) return;

    const interval = setInterval(() => {
      loadMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [bookingId, loadMessages]);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */
/* =========================================================
   AUTO SCROLL — scroll only the messages container,
   not the whole page
========================================================= */
useEffect(() => {
  if (loading) return;
  if (!shouldAutoScrollRef.current) return;

  const container = messagesContainerRef.current;
  if (!container) return;

  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
}, [messages, loading]);

  /* Track whether user is near the bottom */
  function handleScroll() {
    const el = messagesContainerRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 80;
  }

  /* =========================================================
     AUTO-GROW TEXTAREA
  ========================================================= */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  }, [messageText]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */
  async function handleSendMessage(event) {
    event?.preventDefault();

    const text = messageText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, text }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send message.");
      }

      shouldAutoScrollRef.current = true;
      setMessages((current) => [...current, data.message]);
      setMessageText("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  /* =========================================================
     ENTER TO SEND
  ========================================================= */
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  /* =========================================================
     HELPERS
  ========================================================= */
  function getOtherPerson() {
    if (!booking) return null;
    if (booking.viewerRole === "customer") return booking.companion;
    return booking.customer;
  }

  function isOwnMessage(message) {
    return (
      message.sender?._id?.toString() ===
      booking?.viewerId?.toString()
    );
  }

  function formatMessageTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatBookingDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function dateGroupLabel(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const y = new Date();
    y.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(d, today)) return "Today";
    if (sameDay(d, y)) return "Yesterday";

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* =========================================================
     GROUPED MESSAGES (by day)
  ========================================================= */
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastKey = null;

    for (const message of messages) {
      const key = dateGroupLabel(message.createdAt);
      if (key !== lastKey) {
        groups.push({ type: "day", label: key, key: `day-${key}` });
        lastKey = key;
      }
      groups.push({ type: "msg", message });
    }

    return groups;
  }, [messages]);

  /* =========================================================
     LOADING
  ========================================================= */
  if (loading) {
    return (
      <main className="chat-page">
        <div className="chat-loading">
          <div className="chat-loading-spinner" />
          <p>Loading conversation...</p>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */
  if (error && !booking) {
    return (
      <main className="chat-page">
        <div className="chat-error-card">
          <div className="chat-error-icon">!</div>
          <h1>Conversation unavailable</h1>
          <p>{error}</p>
          <Link href={backHref} className="chat-back-button">
            Go back
          </Link>
        </div>
      </main>
    );
  }

  const otherPerson = getOtherPerson();
  const displayName =
    otherPerson?.name ||
    `${otherPerson?.firstName || ""} ${otherPerson?.lastName || ""}`.trim() ||
    "Companion";
  const profilePhoto = otherPerson?.profilePhoto || "";

  const isCustomer = booking.viewerRole === "customer";

  return (
    <main className="chat-page">
      <section className="chat-shell">
        {/* HEADER */}
        <header className="chat-header">
          <Link
            href={backHref}
            className="chat-header-back"
            aria-label="Go back"
          >
            ←
          </Link>

          <div className="chat-person">
            <div className="chat-person-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h1>{displayName}</h1>
              <p>{isCustomer ? "Your companion" : "Customer"}</p>
            </div>
          </div>

          <div className="chat-booking-status">
            <span className="chat-paid-dot" />
            Paid booking
          </div>
        </header>

        {/* BOOKING BAR */}
        <div className="chat-booking-bar">
          <div>
            <span>BOOKING</span>
            <strong>{formatBookingDate(booking.date)}</strong>
          </div>
          <div>
            <span>TIME</span>
            <strong>{booking.time}</strong>
          </div>
          <div>
            <span>DURATION</span>
            <strong>
              {booking.duration}{" "}
              {booking.duration === 1 ? "hour" : "hours"}
            </strong>
          </div>
        </div>

        {/* NOTICE */}
        <div className="chat-notice">
          <span>💬</span>
          <p>
            Use this chat to coordinate your meeting details with
            each other.
          </p>
        </div>

        {/* MESSAGES */}
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h2>Start the conversation</h2>
              <p>
                Say hello and coordinate where you&apos;d like to
                meet.
              </p>
            </div>
          ) : (
            groupedMessages.map((entry) => {
              if (entry.type === "day") {
                return (
                  <div key={entry.key} className="chat-day-divider">
                    <span>{entry.label}</span>
                  </div>
                );
              }

              const message = entry.message;
              const own = isOwnMessage(message);

              return (
                <div
                  key={message._id}
                  className={`chat-message-row ${
                    own
                      ? "chat-message-row-own"
                      : "chat-message-row-other"
                  }`}
                >
                  {!own && (
                    <div className="chat-message-avatar">
                      {message.sender?.profilePhoto ? (
                        <img
                          src={message.sender.profilePhoto}
                          alt=""
                        />
                      ) : (
                        <span>
                          {(message.sender?.firstName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`chat-message-content ${
                      own ? "chat-message-content-own" : ""
                    }`}
                  >
                    <div
                      className={`chat-message-bubble ${
                        own
                          ? "chat-message-bubble-own"
                          : "chat-message-bubble-other"
                      }`}
                    >
                      {message.text}
                    </div>

                    <span className="chat-message-time">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INLINE ERROR */}
        {error && (
          <div className="chat-inline-error">{error}</div>
        )}

        {/* COMPOSER */}
        <form
          className="chat-composer"
          onSubmit={handleSendMessage}
        >
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={2000}
            rows={1}
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || !messageText.trim()}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>

        <p className="chat-composer-hint">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </section>
    </main>
  );
}