"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderActions({
  orderId,
  cancelledAt,
  cancellationReason,
}) {
  const router = useRouter();

  const [reason, setReason] = useState(
    cancellationReason || ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [error, setError] = useState("");

  const isCancelled = Boolean(cancelledAt);

  async function updateCancellation(cancelOrder) {
    if (cancelOrder && !reason.trim()) {
      setError("Enter a cancellation reason.");
      return;
    }

    const confirmed = window.confirm(
      cancelOrder
        ? "Cancel this order?\n\nThis will not automatically refund the customer."
        : "Restore this cancelled order?"
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelOrder,
            cancellationReason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update the order."
        );
      }

      router.refresh();
    } catch (error) {
      console.error("Cancellation update failed:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function permanentlyDeleteOrder() {
    if (deleteText.trim() !== "DELETE") {
      setError('Type "DELETE" to confirm permanent deletion.');
      return;
    }

    const confirmed = window.confirm(
      "Permanently delete this order?\n\nThis cannot be undone. It will not refund Stripe or void an EasyPost label."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmText: "DELETE",
            confirmOrderId: orderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to permanently delete the order."
        );
      }

      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error("Permanent order deletion failed:", error);
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "22px",
        background: "#1d1d1d",
        border: isCancelled
          ? "1px solid rgba(239,68,68,.55)"
          : "1px solid #333",
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
        Order Cancellation
      </h2>

      {isCancelled ? (
        <>
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.35)",
              color: "#fca5a5",
              lineHeight: 1.6,
            }}
          >
            <strong>This order was cancelled.</strong>

            <div style={{ marginTop: "6px" }}>
              Cancelled:{" "}
              {new Date(cancelledAt).toLocaleString()}
            </div>

            <div>
              Reason:{" "}
              {cancellationReason || "No reason saved"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateCancellation(false)}
            disabled={saving}
            style={restoreButton}
          >
            {saving ? "Restoring..." : "Restore Order"}
          </button>
        </>
      ) : (
        <>
          <label>
            <div style={fieldLabel}>
              Cancellation reason
            </div>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="Customer requested cancellation"
              disabled={saving}
              rows={4}
              style={textareaStyle}
            />
          </label>

          <div
            style={{
              marginTop: "10px",
              marginBottom: "14px",
              color: "#a3a3a3",
              fontSize: "0.86rem",
              lineHeight: 1.5,
            }}
          >
            Cancelling the order does not refund the
            payment. Use Payment Actions separately when a
            refund is needed.
          </div>

          <button
            type="button"
            onClick={() => updateCancellation(true)}
            disabled={saving}
            style={dangerButton}
          >
            {saving ? "Cancelling..." : "Cancel Order"}
          </button>
        </>
      )}

      <div
        style={{
          marginTop: "24px",
          paddingTop: "22px",
          borderTop: "1px solid rgba(239,68,68,.35)",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            color: "#fca5a5",
            fontSize: "1rem",
          }}
        >
          Delete Practice / Test Order
        </h3>

        <p
          style={{
            margin: "0 0 14px",
            color: "#a3a3a3",
            fontSize: "0.86rem",
            lineHeight: 1.55,
          }}
        >
          Permanently deletes this order from the website.
          This cannot be undone. It does not refund Stripe
          and does not void an EasyPost shipping label.
        </p>

        <label>
          <div style={fieldLabel}>
            Type DELETE to confirm
          </div>

          <input
            type="text"
            value={deleteText}
            onChange={(event) =>
              setDeleteText(event.target.value)
            }
            placeholder="DELETE"
            disabled={saving || deleting}
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #444",
              background: "#121212",
              color: "#fff",
              fontSize: "15px",
              fontFamily: "inherit",
            }}
          />
        </label>

        <button
          type="button"
          onClick={permanentlyDeleteOrder}
          disabled={
            saving ||
            deleting ||
            deleteText.trim() !== "DELETE"
          }
          style={{
            ...dangerButton,
            marginTop: "12px",
            opacity:
              saving ||
              deleting ||
              deleteText.trim() !== "DELETE"
                ? 0.5
                : 1,
          }}
        >
          {deleting
            ? "Deleting..."
            : "Permanently Delete Order"}
        </button>
      </div>

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
    </section>
  );
}

const fieldLabel = {
  marginBottom: "6px",
  color: "#a3a3a3",
  fontSize: "0.84rem",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  resize: "vertical",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#121212",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "inherit",
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

const restoreButton = {
  marginTop: "14px",
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,.5)",
  background: "rgba(34,197,94,.12)",
  color: "#86efac",
  fontWeight: 800,
  cursor: "pointer",
};
