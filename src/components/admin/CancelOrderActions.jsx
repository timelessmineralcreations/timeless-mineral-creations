"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderActions({
  orderId,
  cancelledAt,
  cancellationReason,
}) {
  const router = useRouter();

  const [reason, setReason] =
    useState(
      cancellationReason || ""
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteText, setDeleteText] =
    useState("");

  const [error, setError] =
    useState("");

  const isCancelled =
    Boolean(cancelledAt);

  async function updateCancellation(
    cancelOrder
  ) {
    if (
      cancelOrder &&
      !reason.trim()
    ) {
      setError(
        "Enter a cancellation reason."
      );

      return;
    }

    const confirmed =
      window.confirm(
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
      const response =
        await fetch(
          `/api/admin/orders/${orderId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cancelOrder,
              cancellationReason:
                reason,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update the order."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Cancellation update failed:",
        error
      );

      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function permanentlyDeleteOrder() {
    if (
      deleteText.trim() !== "DELETE"
    ) {
      setError(
        'Type DELETE exactly to permanently remove this order.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        "PERMANENTLY DELETE THIS ORDER?\n\n" +
          "This cannot be undone.\n\n" +
          "Use this only for practice/test orders.\n\n" +
          "Deleting the website order will NOT issue a Stripe refund and will NOT void purchased postage."
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/orders/${orderId}`,
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              confirmText:
                "DELETE",

              confirmOrderId:
                orderId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to permanently delete the order."
        );
      }

      router.push(
        "/admin/orders"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Order deletion failed:",
        error
      );

      setError(error.message);
      setDeleting(false);
    }
  }

  const controlsDisabled =
    saving || deleting;

  return (
    <>
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
                borderRadius:
                  "10px",

                background:
                  "rgba(239,68,68,.1)",

                border:
                  "1px solid rgba(239,68,68,.35)",

                color: "#fca5a5",
                lineHeight: 1.6,
              }}
            >
              <strong>
                This order was cancelled.
              </strong>

              <div
                style={{
                  marginTop: "6px",
                }}
              >
                Cancelled:{" "}
                {new Date(
                  cancelledAt
                ).toLocaleString()}
              </div>

              <div>
                Reason:{" "}
                {cancellationReason ||
                  "No reason saved"}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                updateCancellation(
                  false
                )
              }
              disabled={
                controlsDisabled
              }
              style={{
                ...restoreButton,

                cursor:
                  controlsDisabled
                    ? "wait"
                    : "pointer",

                opacity:
                  controlsDisabled
                    ? 0.65
                    : 1,
              }}
            >
              {saving
                ? "Restoring..."
                : "Restore Order"}
            </button>
          </>
        ) : (
          <>
            <label>
              <div
                style={
                  fieldLabel
                }
              >
                Cancellation reason
              </div>

              <textarea
                value={reason}
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target
                      .value
                  )
                }
                placeholder="Customer requested cancellation"
                disabled={
                  controlsDisabled
                }
                rows={4}
                style={
                  textareaStyle
                }
              />
            </label>

            <div
              style={{
                marginTop: "10px",
                marginBottom:
                  "14px",
                color: "#a3a3a3",
                fontSize:
                  "0.86rem",
                lineHeight: 1.5,
              }}
            >
              Cancelling the order does
              not refund the payment.
              Use Payment Actions
              separately when a refund
              is needed.
            </div>

            <button
              type="button"
              onClick={() =>
                updateCancellation(
                  true
                )
              }
              disabled={
                controlsDisabled
              }
              style={{
                ...dangerButton,

                cursor:
                  controlsDisabled
                    ? "wait"
                    : "pointer",

                opacity:
                  controlsDisabled
                    ? 0.65
                    : 1,
              }}
            >
              {saving
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          </>
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
      </section>

      <section
        style={{
          marginTop: "24px",
          padding: "22px",

          background:
            "rgba(127,29,29,.08)",

          border:
            "1px solid rgba(239,68,68,.45)",

          borderRadius: "14px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "8px",
            color: "#fca5a5",
            fontSize: "1.2rem",
          }}
        >
          Delete Practice / Test Order
        </h2>

        <div
          style={{
            color: "#a3a3a3",
            fontSize: "0.88rem",
            lineHeight: 1.6,
            marginBottom: "16px",
          }}
        >
          Permanently removes this order
          from the website database. Use
          this only for practice or test
          orders. This cannot be undone.
        </div>

        <div
          style={{
            padding: "12px",
            marginBottom: "16px",

            border:
              "1px solid rgba(239,68,68,.3)",

            borderRadius: "10px",

            background:
              "rgba(239,68,68,.06)",

            color: "#fca5a5",
            fontSize: "0.84rem",
            lineHeight: 1.6,
          }}
        >
          This does not issue a Stripe
          refund and does not void a
          purchased EasyPost label.
        </div>

        <label>
          <div
            style={{
              ...fieldLabel,
              color: "#fca5a5",
            }}
          >
            Type DELETE to confirm
          </div>

          <input
            type="text"
            value={deleteText}
            onChange={(event) => {
              setDeleteText(
                event.target.value
              );

              setError("");
            }}
            disabled={
              controlsDisabled
            }
            autoComplete="off"
            placeholder="DELETE"
            style={{
              width: "220px",
              maxWidth: "100%",
              boxSizing:
                "border-box",

              padding:
                "11px 12px",

              borderRadius:
                "10px",

              border:
                "1px solid rgba(239,68,68,.45)",

              background:
                "#121212",

              color: "#fff",
              fontSize: "15px",
              fontFamily:
                "inherit",
            }}
          />
        </label>

        <div>
          <button
            type="button"
            onClick={
              permanentlyDeleteOrder
            }
            disabled={
              controlsDisabled ||
              deleteText.trim() !==
                "DELETE"
            }
            style={{
              marginTop: "14px",

              padding:
                "12px 18px",

              borderRadius:
                "10px",

              border:
                "1px solid rgba(239,68,68,.65)",

              background:
                deleteText.trim() ===
                  "DELETE" &&
                !controlsDisabled
                  ? "rgba(239,68,68,.22)"
                  : "rgba(100,100,100,.15)",

              color:
                deleteText.trim() ===
                  "DELETE" &&
                !controlsDisabled
                  ? "#fecaca"
                  : "#777",

              fontWeight: 900,

              cursor:
                deleting
                  ? "wait"
                  : deleteText.trim() ===
                      "DELETE" &&
                    !controlsDisabled
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {deleting
              ? "Deleting Order..."
              : "Permanently Delete Order"}
          </button>
        </div>
      </section>
    </>
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

  border:
    "1px solid rgba(239,68,68,.55)",

  background:
    "rgba(239,68,68,.14)",

  color: "#fca5a5",
  fontWeight: 800,
};

const restoreButton = {
  marginTop: "14px",
  padding: "12px 18px",
  borderRadius: "10px",

  border:
    "1px solid rgba(34,197,94,.5)",

  background:
    "rgba(34,197,94,.12)",

  color: "#86efac",
  fontWeight: 800,
};