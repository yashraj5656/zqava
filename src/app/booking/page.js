"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./booking.css";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [paymentMethod, ] = useState("upi");
  //const [ setPaymentMethod] = useState("upi");

  const companionId =
  searchParams.get("companionId") || "";

  const [companion, setCompanion] = useState({
    id: "",
    name: "Companion",
    hourlyRate: 0,
    profilePhoto: "",
    image: "",
  });
const [loadingCompanion, setLoadingCompanion] =
  useState(true);

  /* =========================================================
     COMPANION
  ========================================================= */

  useEffect(() => {
    async function loadCompanion() {
      if (!companionId) {
        setLoadingCompanion(false);
        return;
      }
  
      try {
        setLoadingCompanion(true);
  
        const response = await fetch(
          `/api/companions/${companionId}`,
          {
            cache: "no-store",
          }
        );
  
        const data = await response.json();
  
        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load companion."
          );
        }
  
        setCompanion(data.companion);
      } catch (error) {
        console.error(
          "Companion loading error:",
          error
        );
  
        setError(
          error.message ||
            "Failed to load companion."
        );
      } finally {
        setLoadingCompanion(false);
      }
    }
  
    loadCompanion();
  }, [companionId]);

  /* =========================================================
     BOOKING DETAILS
  ========================================================= */

  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  const duration = Math.max(
    1,
    Number(searchParams.get("duration")) || 1
  );

  const hourlyRate =
  Number(companion?.hourlyRate) || 0;

const subtotal = hourlyRate * duration;

  // Keep 0 until you introduce a platform fee.
  const serviceFee = Math.round(subtotal * 10 / 100);

  const total = subtotal + serviceFee;

  /* =========================================================
     FORMATTED DATE
  ========================================================= */

  const formattedDate = useMemo(() => {
    if (!date) {
      return "Select a date";
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date]);





  

  /* =========================================================
     CONFIRM BOOKING
  ========================================================= */

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
  
      const script = document.createElement("script");
  
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
  
      script.onload = () => {
        resolve(true);
      };
  
      script.onerror = () => {
        resolve(false);
      };
  
      document.body.appendChild(script);
    });
  };




  const handleConfirm = async () => {
    setError("");
  
    if (!companion.id) {
      setError("Companion information is missing.");
      return;
    }
  
    if (!date) {
      setError("Please select a booking date.");
      return;
    }
  
    if (!time) {
      setError("Please select a booking time.");
      return;
    }
  
    if (duration < 1) {
      setError("Please select a valid booking duration.");
      return;
    }
  
    if (!hourlyRate || hourlyRate <= 0) {
      setError("Invalid companion pricing.");
      return;
    }
  
    try {
      setSubmitting(true);
  
      /* =====================================================
         LOAD RAZORPAY
      ===================================================== */
  
      const razorpayLoaded = await loadRazorpay();
  
      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection and try again."
        );
      }
  
      /* =====================================================
         CREATE SERVER-SIDE RAZORPAY ORDER
      ===================================================== */
  
      const orderResponse = await fetch(
        "/api/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companionId: companion.id,
            date,
            time,
            duration,
            message: message.trim(),
          }),
        }
      );
  
      let orderData = {};
  
      try {
        orderData = await orderResponse.json();
      } catch {
        orderData = {};
      }
  
      /* =====================================================
         LOGIN
      ===================================================== */
  
      if (orderResponse.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            window.location.pathname +
              window.location.search
          )}`
        );
  
        return;
      }
  
      if (
        !orderResponse.ok ||
        !orderData.success
      ) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }
  
      const razorpayOrder = orderData.order;
  
      /* =====================================================
         OPEN RAZORPAY CHECKOUT
      ===================================================== */
  
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  
        amount: razorpayOrder.amount,
  
        currency: razorpayOrder.currency,
  
        name: "ZQAVA",
  
        description: `Booking with ${companion.name}`,
  
        order_id: razorpayOrder.id,
  
        image: "/logo.png",
  
        handler: async function (response) {
          try {
            setSubmitting(true);
            setError("");
  
            /* =============================================
               VERIFY PAYMENT
            ============================================= */
  
            const verifyResponse = await fetch(
              "/api/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,
  
                  razorpay_payment_id:
                    response.razorpay_payment_id,
  
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );
  
            const verifyData =
              await verifyResponse.json();
  
            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }
  
            /* =============================================
               PAYMENT VERIFIED
               NOW CREATE BOOKING
            ============================================= */
  
            const bookingResponse = await fetch(
              "/api/bookings",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  companionId: companion.id,
                  date,
                  time,
                  duration,
                  message: message.trim(),
  
                  paymentMethod,
  
                  razorpayOrderId:
                    response.razorpay_order_id,
  
                  razorpayPaymentId:
                    response.razorpay_payment_id,
  
                //  paymentStatus: "paid",
                }),
              }
            );
  
            let bookingData = {};
  
            try {
              bookingData =
                await bookingResponse.json();
            } catch {
              bookingData = {};
            }
  
            if (
              bookingResponse.status === 401
            ) {
              router.push(
                `/login?redirect=${encodeURIComponent(
                  window.location.pathname +
                    window.location.search
                )}`
              );
  
              return;
            }
  
            if (
              !bookingResponse.ok ||
              !bookingData.success
            ) {
              throw new Error(
                bookingData.message ||
                  "Payment succeeded, but booking creation failed."
              );
            }
  
            /* =============================================
               SUCCESS
            ============================================= */
  
            setConfirmed(true);
          } catch (paymentError) {
            console.error(
              "Payment verification/booking error:",
              paymentError
            );
  
            setError(
              paymentError?.message ||
                "Payment was completed, but something went wrong."
            );
          } finally {
            setSubmitting(false);
          }
        },
  
        prefill: {
          name: companion.name,
        },
  
        notes: {
          companionId: companion.id,
          date,
          time,
          duration: String(duration),
        },
  
        theme: {
          color: "#111111",
        },
  
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };
  
      const razorpay = new window.Razorpay(
        options
      );
  
      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response
          );
  
          setError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
  
          setSubmitting(false);
        }
      );
  
      razorpay.open();
    } catch (err) {
      console.error(
        "Booking/payment error:",
        err
      );
  
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
  
      setSubmitting(false);
    }
  };



  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  useEffect(() => {
    if (confirmed) {
      window.scrollTo(0, 0);
    }
  }, [confirmed]);

  if (confirmed) {
    return (
      <main className="booking-page">
        <section className="booking-success-page">
          <div className="booking-success-card">
  
            <div className="booking-success-icon">
              ✓
            </div>
  
            <span className="booking-success-eyebrow">
              PAYMENT SUCCESSFUL
            </span>
  
            <h1>
              Your booking is confirmed
            </h1>
  
            <p>
              Your payment was successfully received and your
              booking request has been sent{" "}
              <strong>{companion.name}</strong>.
            </p>
  
            <div className="success-booking-details">
  
              <div>
                <span>Date</span>
                <strong>{formattedDate}</strong>
              </div>
  
              <div>
                <span>Time</span>
                <strong>{time}</strong>
              </div>
  
              <div>
                <span>Duration</span>
                <strong>
                  {duration}{" "}
                  {duration === 1 ? "hour" : "hours"}
                </strong>
              </div>
  
              <div>
                <span>Total</span>
                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>
              </div>
  
            </div>
  
            <div className="success-actions">
  
              <Link
                href="/bookings"
                className="success-primary-button"
              >
                View my bookings
              </Link>
  
              <Link
                href="/explore"
                className="success-secondary-button"
              >
                Explore more companions
              </Link>
  
            </div>
  
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <main className="booking-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="booking-top">
        <div className="booking-container">

          <Link
            href={
              companion.id
                ? `/companion/${companion.id}`
                : "/explore"
            }
            className="back-link"
          >
            ← Back to profile
          </Link>

          <div className="booking-heading">

            <span>
              BOOK YOUR EXPERIENCE
            </span>

            <h1>
              Complete your booking
            </h1>

            <p>
              Review your details before sending your
              booking request.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="booking-content">

        <div className="booking-container booking-layout">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="booking-main">

            {/* COMPANION */}

            <div className="checkout-card companion-checkout">

              <div className="checkout-companion">

                {companion.image ? (
                  <img
                    src={companion.image}
                    alt={companion.name}
                  />
                ) : (
                  <div className="checkout-avatar">
                    {companion.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>

                  <span>
                    BOOKING WITH
                  </span>

                  <h2>
                    {companion.name}
                  </h2>

                  <p>
                  ₹{hourlyRate.toLocaleString("en-IN")} / hour
                  </p>

                </div>

              </div>

            </div>


            {/* DATE & TIME */}

            <div className="checkout-card">

              <div className="card-heading">

                <div className="step-number">
                  01
                </div>

                <div>

                  <span>
                    DATE & TIME
                  </span>

                  <h2>
                    Your booking details
                  </h2>

                </div>

              </div>

              <div className="booking-details-grid">

                <div className="detail-box">

                  <span>
                    DATE
                  </span>

                  <strong>
                    {formattedDate}
                  </strong>

                </div>

                <div className="detail-box">

                  <span>
                    TIME
                  </span>

                  <strong>
                    {time || "Not selected"}
                  </strong>

                </div>

                <div className="detail-box">

                  <span>
                    DURATION
                  </span>

                  <strong>
                    {duration}{" "}
                    {duration === 1
                      ? "hour"
                      : "hours"}
                  </strong>

                </div>

              </div>

            </div>


            {/* MESSAGE */}

            <div className="checkout-card">

              <div className="card-heading">

                <div className="step-number">
                  02
                </div>

                <div>

                  <span>
                    OPTIONAL
                  </span>

                  <h2>
                    Add a note
                  </h2>

                </div>

              </div>

              <textarea
                className="booking-message"
                placeholder="Tell your companion anything they should know about your plans..."
                rows={5}
                value={message}
                maxLength={500}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
              />

              <div className="message-footer">

                <p className="field-note">
                  Keep your message respectful and
                  relevant to the booking.
                </p>

                <span>
                  {message.length}/500
                </span>

              </div>

            </div>


            {/* PAYMENT */}

            <div className="checkout-card">

              <div className="card-heading">

                <div className="step-number">
                  03
                </div>

                <div>

                  <span>
                    PAYMENT
                  </span>

                  <h2>
                    Choose payment method
                  </h2>

                </div>

              </div>

              <div className="payment-options">
  <div className="payment-option selected">
    <span className="payment-radio">
      ✓
    </span>

    <div>
      <strong>
        Razorpay Secure Checkout
      </strong>

      <small>
        UPI, Cards, Net Banking & Wallets
      </small>
    </div>
  </div>
</div>

            </div>


            {/* SAFETY */}

            <div className="booking-trust">

              <div className="trust-icon">
                ✓
              </div>

              <div>

                <strong>
                  Your booking is protected
                </strong>

                <p>
                  Keep payments and communication
                  within ZQAVA for your safety.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="booking-summary-card">

            <div className="summary-top">

              <span>
                BOOKING SUMMARY
              </span>

              <h2>
                Your reservation
              </h2>

            </div>


            {/* PERSON */}

            <div className="summary-person">

              {companion.image ? (
                <img
                  src={companion.image}
                  alt={companion.name}
                />
              ) : (
                <div className="summary-avatar">
                  {companion.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>

                <strong>
                  {companion.name}
                </strong>

                <span>
                  ZQAVA Companion
                </span>

              </div>

            </div>


            {/* INFO */}

            <div className="summary-info">

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {formattedDate}
                </strong>

              </div>

              <div>

                <span>
                  Time
                </span>

                <strong>
                  {time || "Not selected"}
                </strong>

              </div>

              <div>

                <span>
                  Duration
                </span>

                <strong>
                  {duration}{" "}
                  {duration === 1
                    ? "hour"
                    : "hours"}
                </strong>

              </div>

            </div>


            {/* PRICE */}

            <div className="price-breakdown">

              <div>

                <span>
                <span>
  ₹
  {hourlyRate.toLocaleString("en-IN")} × {duration}{" "}
  {duration === 1 ? "hour" : "hours"}
</span>
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div>

                <span>
                  ZQAVA service fee
                </span>

                <strong>
                  ₹
                  {serviceFee.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>


            {/* TOTAL */}

            <div className="summary-total-row">

              <span>
                Total
              </span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* ERROR */}

            {error && (
              <div className="booking-error">
                {error}
              </div>
            )}


            {/* CONFIRM */}

<button
  type="button"
  className="confirm-booking-button"
  onClick={handleConfirm}
  disabled={submitting}
>
  {submitting ? (
    <>
      <span className="button-spinner"></span>
      Processing payment...
    </>
  ) : (
    <>
      Pay ₹{total.toLocaleString("en-IN")}
      <span>→</span>
    </>
  )}
</button>

            <p className="summary-note">
            You’ll be redirected to Razorpay to complete your payment securely.
            </p>

          </aside>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   SUSPENSE WRAPPER
========================================================= */

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="booking-page">
          <div className="booking-loading">
            <div className="button-spinner"></div>
            <p>Loading booking...</p>
          </div>
        </main>
      }
    >
      <BookingContent />
    </Suspense>
  );
}