"use client";

import { useState } from "react";

import FormSection from "./FormSection";
import { emptyStateStyle } from "./styles";

export default function MineralsSection({
  minerals,
  selectedMineralIds,
}) {
  const [selectedIds, setSelectedIds] = useState(
    () =>
      new Set(
        (selectedMineralIds || []).map((id) =>
          String(id)
        )
      )
  );

  function selectAllMinerals() {
    setSelectedIds(
      new Set(
        minerals.map((mineral) =>
          String(mineral.id)
        )
      )
    );
  }

  function clearAllMinerals() {
    setSelectedIds(new Set());
  }

  function toggleMineral(mineralId) {
    const id = String(mineralId);

    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <FormSection
      title="Minerals"
      description="Choose which active crushed minerals are available as inlay options for this collection."
    >
      {minerals.length === 0 ? (
        <div style={emptyStateStyle}>
          No active minerals are available yet. Add one from
          the Minerals section of the admin dashboard.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              onClick={selectAllMinerals}
              style={{
                border:
                  "1px solid rgba(217, 181, 109, 0.45)",
                borderRadius: "10px",
                padding: "9px 14px",
                background:
                  "rgba(217, 181, 109, 0.12)",
                color: "#d9b56d",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Select All Minerals
            </button>

            <button
              type="button"
              onClick={clearAllMinerals}
              style={{
                border:
                  "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "10px",
                padding: "9px 14px",
                background:
                  "rgba(255, 255, 255, 0.04)",
                color: "#c7cfcb",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "#98a49f",
                fontSize: "13px",
                marginLeft: "4px",
              }}
            >
              {selectedIds.size} of {minerals.length} selected
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "12px",
            }}
          >
            {minerals.map((mineral) => {
              const mineralId = String(
                mineral.id
              );

              return (
                <label
                  key={mineral.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "13px",
                    padding: "15px",
                    cursor: "pointer",
                    background:
                      "rgba(255, 255, 255, 0.025)",
                  }}
                >
                  <input
                    type="checkbox"
                    name="mineralIds"
                    value={mineral.id}
                    checked={selectedIds.has(
                      mineralId
                    )}
                    onChange={() =>
                      toggleMineral(
                        mineral.id
                      )
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      marginTop: "2px",
                      accentColor: "#d9b56d",
                      flexShrink: 0,
                    }}
                  />

                  {mineral.imageUrl ? (
                    <img
                      src={mineral.imageUrl}
                      alt=""
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border:
                          "1px solid rgba(255, 255, 255, 0.12)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        background:
                          mineral.colorHex ||
                          "#444",
                        border:
                          "1px solid rgba(255, 255, 255, 0.12)",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <span
                    style={{ minWidth: 0 }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#eef3f0",
                      }}
                    >
                      {mineral.name}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        color: "#98a49f",
                        fontSize: "13px",
                        lineHeight: 1.45,
                      }}
                    >
                      {mineral.description ||
                        "No description entered"}
                    </span>

                    <span
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#d9b56d",
                        fontSize: "13px",
                        fontWeight: "800",
                      }}
                    >
                      /{mineral.slug}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </FormSection>
  );
}