"use client";

import { useState } from "react";

export default function InternalNotesEditor({
  orderId,
  initialNotes = "",
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveNotes() {
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
          body: JSON.stringify({
            internalNotes: notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save internal notes."
        );
      }

      setMessage("Saved");
    } catch (error) {
      console.error("Internal notes update failed:", error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "22px",
        paddingTop: "20px",
        borderTop: "1px solid #333",
      }}
    >
      <div
        style={{
          color: "#a3a3a3",
          fontSize: "0.84rem",
          marginBottom: "8px",
        }}
      >
        Internal Notes
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={6}
        disabled={saving}
        placeholder="Private production notes for this order..."
        style={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: "140px",
          resize: "vertical",
          padding: "12px",
          borderRadius: "10px",
          background: "#121212",
          color: "#fff",
          border: "1px solid #444",
          font: "inherit",
          lineHeight: 1.5,
        }}
      />

      <button
        type="button"
        onClick={saveNotes}
        disabled={saving}
        style={{
          marginTop: "12px",
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
        {saving ? "Saving..." : "Save Internal Notes"}
      </button>

      {message ? (
        <div
          style={{
            marginTop: "10px",
            color:
              message === "Saved" ? "#86efac" : "#fca5a5",
            fontSize: "0.88rem",
          }}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}