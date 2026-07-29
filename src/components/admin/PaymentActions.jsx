"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatCurrencyFromCents(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((Number(cents) || 0) / 100);
}

export default function PaymentActions({
  orderId,
  totalPrice,
  paymentStatus,
  refundedAmountCents,
  refundStatus,
  refunds,
}) {
  const router = useRouter();

  const totalCents = Math.round(Number(totalPrice) * 100);
  const remainingCents = Math.max(
    totalCents - refundedAmountCents,
    0
  );

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const amountCents = useMemo(() => {
    const parsed = Number(amount);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.round(parsed * 100);
  }, [amount]);

  async function issueRefund(refundAmountCents) {
    if (
      !Number.isInteger(refundAmountCents) ||
      refundAmountCents <= 0
    ) {
      setError("Enter a valid refund amount.");
      return;
    }

    if (refundAmountCents > remainingCents) {
      setError(
        `The maximum remaining refund is ${formatCurrencyFromCents(
          remainingCents
        )}.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Refund ${formatCurrencyFromCents(
        refundAmountCents
      )} to this customer?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amountCents: refundAmountCents,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to issue refund."
        );
      }

      setAmount("");
      setReason("");
      router.refresh();
    } catch (error) {
      console.error("Refund failed:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "22px",
        background: "#1d1d1d",
        border: "1px solid #333",
        borderRadius: "14px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "18px",
          fontSize: "1.2rem",
        }}
      >
        Payment Actions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <SummaryBox
          label="Payment Status"
          value={paymentStatus}
        />

        <SummaryBox
          label="Original Total"
          value={formatCurrencyFromCents(totalCents)}
        />

        <SummaryBox
          label="Refunded"
          value={formatCurrencyFromCents(
            refundedAmountCents
          )}
        />

        <SummaryBox
          label="Remaining Paid"
          value={formatCurrencyFromCents(remainingCents)}
        />
      </div>

      {refundStatus ? (
        <div
          style={{
            marginBottom: "18px",
            color: "#fbbf24",
            fontWeight: 700,
          }}
        >
          Refund status: {refundStatus}
        </div>
      ) : null}

      {remainingCents > 0 ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <label>
              <div style={fieldLabel}>Partial refund amount</div>

              <input
                type="number"
                min="0.01"
                max={(remainingCents / 100).toFixed(2)}
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="25.00"
                disabled={saving}
                style={inputStyle}
              />
            </label>

            <label>
              <div style={fieldLabel}>
                Internal refund reason
              </div>

              <input
                type="text"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Customer requested cancellation"
                disabled={saving}
                style={inputStyle}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => issueRefund(amountCents)}
              disabled={saving || amountCents <= 0}
              style={secondaryButton}
            >
              {saving
                ? "Processing..."
                : "Issue Partial Refund"}
            </button>

            <button
              type="button"
              onClick={() => issueRefund(remainingCents)}
              disabled={saving}
              style={dangerButton}
            >
              {saving
                ? "Processing..."
                : `Refund Remaining ${formatCurrencyFromCents(
                    remainingCents
                  )}`}
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "rgba(34,197,94,.08)",
            border: "1px solid rgba(34,197,94,.3)",
            color: "#86efac",
            fontWeight: 700,
          }}
        >
          This order has been fully refunded.
        </div>
      )}

      {error ? (
        <div
          style={{
            marginTop: "14px",
            color: "#fca5a5",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          marginTop: "26px",
          paddingTop: "22px",
          borderTop: "1px solid #333",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "14px",
          }}
        >
          Refund History
        </h3>

        {refunds.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
            }}
          >
            No refunds have been issued.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {refunds.map((refund) => (
              <div
                key={refund.id}
                style={{
                  padding: "14px",
                  border: "1px solid #333",
                  borderRadius: "10px",
                  background: "#171717",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    fontWeight: 800,
                  }}
                >
                  <span>
                    {formatCurrencyFromCents(
                      refund.amountCents
                    )}
                  </span>

                  <span>{refund.status}</span>
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#a3a3a3",
                    fontSize: "0.84rem",
                    lineHeight: 1.5,
                  }}
                >
                  <div>
                    {new Date(
                      refund.createdAt
                    ).toLocaleString()}
                  </div>

                  {refund.reason ? (
                    <div>Reason: {refund.reason}</div>
                  ) : null}

                  {refund.requestedByEmail ? (
                    <div>
                      Requested by:{" "}
                      {refund.requestedByEmail}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryBox({ label, value }) {
  let background = "#171717";
  let color = "#f5f5f5";

  if (label === "Payment Status") {
    switch (value) {
      case "Paid":
        background = "rgba(34,197,94,.12)";
        color = "#86efac";
        break;

      case "Partially Refunded":
        background = "rgba(245,158,11,.12)";
        color = "#fcd34d";
        break;

      case "Refunded":
        background = "rgba(239,68,68,.12)";
        color = "#fca5a5";
        break;

      default:
        break;
    }
  }

  return (
    <div
      style={{
        padding: "14px",
        background,
        border: "1px solid #333",
        borderRadius: "10px",
      }}
    >
      <div style={fieldLabel}>{label}</div>

      <div
        style={{
          color,
          fontWeight: 800,
          fontSize: "1.05rem",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const fieldLabel = {
  marginBottom: "6px",
  color: "#a3a3a3",
  fontSize: "0.84rem",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#121212",
  color: "#fff",
  fontSize: "15px",
};

const secondaryButton = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #555",
  background: "#292929",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const dangerButton = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid rgba(239,68,68,.55)",
  background: "rgba(239,68,68,.14)",
  color: "#fca5a5",
  fontWeight: 800,
  cursor: "pointer",
};