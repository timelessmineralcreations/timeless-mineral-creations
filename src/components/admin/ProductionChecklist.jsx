"use client";

import { useState } from "react";

const checklistItems = [
  {
    key: "coreConfirmed",
    label: "Core selected and confirmed",
    dateField: "coreConfirmedAt",
  },
  {
    key: "sizeConfirmed",
    label: "Ring size confirmed",
    dateField: "sizeConfirmedAt",
  },
  {
    key: "materialsPrepared",
    label: "Materials prepared",
    dateField: "materialsPreparedAt",
  },
  {
    key: "buildCompleted",
    label: "Ring build completed",
    dateField: "buildCompletedAt",
  },
  {
    key: "engravingCompleted",
    label: "Engraving completed",
    dateField: "engravingCompletedAt",
  },
  {
    key: "qualityChecked",
    label: "Quality check passed",
    dateField: "qualityCheckedAt",
  },
  {
    key: "photosTaken",
    label: "Photos taken",
    dateField: "photosTakenAt",
  },
  {
    key: "packaged",
    label: "Order packaged",
    dateField: "packagedAt",
  },
];

export default function ProductionChecklist({
  orderId,
  initialValues,
  onChange,
}) {
  const [values, setValues] = useState(initialValues);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  function updateValues(nextValues) {
    setValues(nextValues);
    onChange?.(nextValues);
  }

  async function toggleItem(item, checked) {
    const previousValues = values;

    const optimisticValues = {
      ...values,
      [item.dateField]: checked
        ? new Date().toISOString()
        : null,
    };

    updateValues(optimisticValues);
    setSavingKey(item.key);
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
            [item.key]: checked,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update production checklist."
        );
      }

      const savedValues = {
        ...optimisticValues,
        [item.dateField]:
          data.order[item.dateField] || null,
      };

      updateValues(savedValues);
    } catch (error) {
      console.error("Checklist update failed:", error);
      updateValues(previousValues);
      setError(error.message);
    } finally {
      setSavingKey("");
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
        Production Checklist
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {checklistItems.map((item) => {
          const completedAt = values[item.dateField];
          const isSaving = savingKey === item.key;

          return (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "11px",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: completedAt
                  ? "rgba(34, 197, 94, 0.08)"
                  : "#171717",
                cursor: isSaving ? "wait" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(completedAt)}
                disabled={Boolean(savingKey)}
                onChange={(event) =>
                  toggleItem(item, event.target.checked)
                }
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                }}
              />

              <div>
                <div
                  style={{
                    color: completedAt
                      ? "#86efac"
                      : "#f5f5f5",
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#a3a3a3",
                    fontSize: "0.82rem",
                  }}
                >
                  {isSaving
                    ? "Saving..."
                    : completedAt
                      ? new Date(
                          completedAt
                        ).toLocaleString()
                      : "Not completed"}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {error ? (
        <div
          style={{
            marginTop: "12px",
            color: "#fca5a5",
            fontSize: "0.88rem",
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}