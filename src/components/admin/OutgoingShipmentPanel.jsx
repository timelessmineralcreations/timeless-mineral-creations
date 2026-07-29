"use client";

import { useState } from "react";

const carriers = ["USPS", "UPS", "FedEx", "DHL", "Other"];

export default function OutgoingShipmentPanel({
  orderId,
  initialCarrier = "",
  initialTrackingNumber = "",
  initialTrackingStatus = "",
  outgoingShippedAt = null,
}) {
  const [carrier, setCarrier] = useState(initialCarrier);
  const [trackingNumber, setTrackingNumber] = useState(
    initialTrackingNumber
  );
  const [trackingStatus, setTrackingStatus] = useState(
    initialTrackingStatus
  );
  const [shipped, setShipped] = useState(Boolean(outgoingShippedAt));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveChanges(body) {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update outgoing shipment."
        );
      }

      setMessage("Saved");
      return data.order;
    } catch (error) {
      console.error("Outgoing shipment update failed:", error);
      setMessage(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveShipment() {
    await saveChanges({
      outgoingCarrier: carrier,
      outgoingTrackingNumber: trackingNumber,
      outgoingTrackingStatus: trackingStatus,
    });
  }

  async function handleShippedChange(event) {
    const checked = event.target.checked;
    const previousValue = shipped;

    setShipped(checked);

    const updatedOrder = await saveChanges({
      outgoingShipped: checked,
    });

    if (!updatedOrder) {
      setShipped(previousValue);
    }
  }

  return (
    <section
      style={{
        padding: "22px",
        background: "#1d1d1d",
        border: "1px solid #333",
        borderRadius: "14px",
        marginTop: "24px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "18px",
          fontSize: "1.2rem",
        }}
      >
        Outgoing Shipment
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <label>
          <div style={labelStyle}>Carrier</div>

          <select
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            disabled={saving}
            style={inputStyle}
          >
            <option value="">Select carrier</option>

            {carriers.map((carrierName) => (
              <option key={carrierName} value={carrierName}>
                {carrierName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={labelStyle}>Tracking Number</div>

          <input
            type="text"
            value={trackingNumber}
            onChange={(event) =>
              setTrackingNumber(event.target.value)
            }
            disabled={saving}
            placeholder="Enter outgoing tracking number"
            style={inputStyle}
          />
        </label>

        <label>
          <div style={labelStyle}>Tracking Status</div>

          <input
            type="text"
            value={trackingStatus}
            onChange={(event) =>
              setTrackingStatus(event.target.value)
            }
            disabled={saving}
            placeholder="Example: Label Created"
            style={inputStyle}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSaveShipment}
        disabled={saving}
        style={{
          marginTop: "18px",
          padding: "11px 18px",
          border: "none",
          borderRadius: "10px",
          background:
            "linear-gradient(135deg, rgb(233, 192, 84), rgb(184, 134, 11))",
          color: "#111",
          fontWeight: 800,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.65 : 1,
        }}
      >
        {saving ? "Saving..." : "Save Outgoing Shipment"}
      </button>

      <div
        style={{
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: "1px solid #333",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          <input
            type="checkbox"
            checked={shipped}
            onChange={handleShippedChange}
            disabled={saving}
            style={{
              width: "18px",
              height: "18px",
            }}
          />

          Finished order shipped
        </label>

        <div
          style={{
            marginTop: "8px",
            color: "#a3a3a3",
            fontSize: "0.88rem",
          }}
        >
          {outgoingShippedAt
            ? `Originally marked shipped: ${new Date(
                outgoingShippedAt
              ).toLocaleString()}`
            : "Not shipped yet"}
        </div>
      </div>

      {message ? (
        <div
          style={{
            marginTop: "12px",
            color:
              message === "Saved" ? "#86efac" : "#fca5a5",
            fontSize: "0.88rem",
          }}
        >
          {message}
        </div>
      ) : null}
    </section>
  );
}

const labelStyle = {
  marginBottom: "7px",
  color: "#a3a3a3",
  fontSize: "0.84rem",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "10px",
  background: "#121212",
  color: "#fff",
  border: "1px solid #444",
  fontSize: "15px",
};