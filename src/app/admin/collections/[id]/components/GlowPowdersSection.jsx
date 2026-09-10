import FormSection from "./FormSection";
import { emptyStateStyle } from "./styles";

export default function GlowPowdersSection({
  glowPowders,
  selectedGlowPowderIds,
}) {
  const selectedIds = new Set(
    selectedGlowPowderIds || []
  );

  return (
    <FormSection
      title="Glow Powders"
      description="Choose which active glow colors customers can add to this collection."
    >
      {glowPowders.length === 0 ? (
        <div style={emptyStateStyle}>
          No active glow powders are available yet. Add one
          from the Glow Powders section of the admin
          dashboard.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "12px",
          }}
        >
          {glowPowders.map((glowPowder) => {
            const details = [
              glowPowder.brightnessLevel,
              glowPowder.glowDuration,
            ].filter(Boolean);

            const glowColor =
              glowPowder.glowColorHex ||
              glowPowder.daytimeColorHex ||
              "#444";

            return (
              <label
                key={glowPowder.id}
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
                  name="glowPowderIds"
                  value={glowPowder.id}
                  defaultChecked={selectedIds.has(
                    glowPowder.id
                  )}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "2px",
                    accentColor: "#d9b56d",
                    flexShrink: 0,
                  }}
                />

                {glowPowder.imageUrl ? (
                  <img
                    src={glowPowder.imageUrl}
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
                      borderRadius: "50%",
                      background: glowColor,
                      border:
                        "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: `0 0 14px ${glowColor}`,
                      flexShrink: 0,
                    }}
                  />
                )}

                <span style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#eef3f0",
                    }}
                  >
                    {glowPowder.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#98a49f",
                      fontSize: "13px",
                      lineHeight: 1.45,
                    }}
                  >
                    {details.length
                      ? details.join(" • ")
                      : "Optional performance details not entered"}
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
                    +$
                    {(
                      glowPowder.priceAdjustmentCents /
                      100
                    ).toFixed(2)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}