"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "./bank-details.css";

export default function BankDetailsPage() {
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
    accountType: "savings",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  /* =========================================================
     LOAD EXISTING DETAILS
  ========================================================= */

  useEffect(() => {
    async function loadBankDetails() {
      try {
        const response = await fetch(
          "/api/companion/bank-details",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          window.location.href =
            `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`;

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load bank details."
          );
        }

        if (data.bankDetails) {
          setForm({
            accountHolderName:
              data.bankDetails.accountHolderName || "",

            accountNumber:
              data.bankDetails.accountNumber || "",

            confirmAccountNumber:
              data.bankDetails.accountNumber || "",

            ifscCode:
              data.bankDetails.ifscCode || "",

            bankName:
              data.bankDetails.bankName || "",

            branchName:
              data.bankDetails.branchName || "",

            upiId:
              data.bankDetails.upiId || "",

            accountType:
              data.bankDetails.accountType ||
              "savings",
          });

          setVerified(
            Boolean(data.bankDetails.verified)
          );
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadBankDetails();
  }, []);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    if (
      form.accountNumber !==
      form.confirmAccountNumber
    ) {
      setError(
        "Account numbers do not match."
      );

      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/companion/bank-details",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save bank details."
        );
      }

      setMessage(
        "Bank details saved successfully."
      );

      setVerified(
        Boolean(data.bankDetails?.verified)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="bank-page">
        <div className="bank-loading">
          Loading bank details...
        </div>
      </main>
    );
  }

  return (
    <main className="bank-page">

      <div className="bank-container">

        {/* HEADER */}

        <div className="bank-header">
{/*
          <Link
            href="/"
            className="back-link"
          >
            ← Home
          </Link>
*/}
          <div className="bank-title-row">

            <div>
              <h1>Bank Details</h1>

              <p>
                Add your bank account to receive
                your ZQAVA earnings.
              </p>
            </div>

            {verified && (
              <span className="verified-badge">
                ✓ Verified
              </span>
            )}

          </div>
        </div>

        {/* CARD */}

        <form
          className="bank-card"
          onSubmit={handleSubmit}
        >

          <div className="section-heading">
            <h2>Account Information</h2>

            <p>
              Make sure the details match the
              bank account you want to receive
              payouts into.
            </p>
          </div>

          {/* ACCOUNT HOLDER */}

          <div className="form-group">

            <label>
              Account Holder Name
              <span>*</span>
            </label>

            <input
              type="text"
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              placeholder="Enter account holder name"
              required
            />

          </div>

          {/* ACCOUNT NUMBER */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Account Number
                <span>*</span>
              </label>

              <input
                type="password"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                inputMode="numeric"
                autoComplete="off"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Confirm Account Number
                <span>*</span>
              </label>

              <input
                type="password"
                name="confirmAccountNumber"
                value={form.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter account number"
                inputMode="numeric"
                autoComplete="off"
                required
              />

            </div>

          </div>

          {/* IFSC + BANK */}

          <div className="form-row">

            <div className="form-group">

              <label>
                IFSC Code
                <span>*</span>
              </label>

              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="Example: SBIN0001234"
                style={{
                  textTransform: "uppercase",
                }}
                required
              />

            </div>

            <div className="form-group">

              <label>
                Bank Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="Example: State Bank of India"
                required
              />

            </div>

          </div>

          {/* BRANCH */}

          <div className="form-group">

            <label>
              Branch Name
            </label>

            <input
              type="text"
              name="branchName"
              value={form.branchName}
              onChange={handleChange}
              placeholder="Enter branch name"
            />

          </div>

          {/* ACCOUNT TYPE */}

          <div className="form-group">

            <label>
              Account Type
              <span>*</span>
            </label>

            <div className="account-types">

              <label
                className={
                  form.accountType === "savings"
                    ? "account-type active"
                    : "account-type"
                }
              >

                <input
                  type="radio"
                  name="accountType"
                  value="savings"
                  checked={
                    form.accountType ===
                    "savings"
                  }
                  onChange={handleChange}
                />

                <div>
                  <strong>Savings Account</strong>
                  <small>
                    Personal savings account
                  </small>
                </div>

              </label>

              <label
                className={
                  form.accountType === "current"
                    ? "account-type active"
                    : "account-type"
                }
              >

                <input
                  type="radio"
                  name="accountType"
                  value="current"
                  checked={
                    form.accountType ===
                    "current"
                  }
                  onChange={handleChange}
                />

                <div>
                  <strong>Current Account</strong>
                  <small>
                    Business/current account
                  </small>
                </div>

              </label>

            </div>

          </div>

          {/* UPI */}

          <div className="form-group">

            <label>
              UPI ID
              <small>Optional</small>
            </label>

            <input
              type="text"
              name="upiId"
              value={form.upiId}
              onChange={handleChange}
              placeholder="example@upi"
            />

            <p className="field-help">
              You can add a UPI ID as an
              additional payout option.
            </p>

          </div>

          {/* SECURITY NOTE */}

          <div className="security-note">

            <div className="security-icon">
              🔒
            </div>

            <div>
              <strong>
                Keep your banking information safe
              </strong>

              <p>
                Only submit bank details belonging
                to you. ZQAVA will use these details
                for your payouts.
              </p>
            </div>

          </div>

          {/* MESSAGES */}

          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-message success">
              ✓ {message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="save-bank-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Bank Details"}
          </button>

        </form>

      </div>

    </main>
  );
}