"use client";

import { useState } from "react";

const statuses = [
  "Awaiting Memorial Materials",
  "Materials Received",
  "Preparing Materials",
  "In Production",
  "Quality Check",
  "Ready to Ship",
  "Shipped",
  "Completed",
];

export default function OrderStatusSelect({
  orderId,
  initialStatus,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  async function updateStatus(newStatus) {
  const previousStatus = status;

  setStatus(newStatus);
  setSaving(true);

  try {
    const response = await fetch(
      `/api/admin/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to update status.");
    }
  } catch (error) {
    console.error("Status update failed:", error);
    setStatus(previousStatus);
    alert(error.message);
  } finally {
    setSaving(false);
  }
}

  return (
    <>
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={saving}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          background: "#121212",
          color: "#fff",
          border: "1px solid #444",
          fontSize: "15px",
        }}
      >
        {statuses.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>

      {saving && (
        <div
          style={{
            marginTop: "8px",
            color: "#a3a3a3",
            fontSize: ".85rem",
          }}
        >
          Saving...
        </div>
      )}
    </>
  );
}