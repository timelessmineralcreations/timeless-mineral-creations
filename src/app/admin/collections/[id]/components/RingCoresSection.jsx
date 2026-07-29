import FormSection from "./FormSection";
import { emptyStateStyle } from "./styles";

export default function RingCoresSection({
  ringCores,
  selectedRingCoreIds,
}) {
  const selectedIds = new Set(selectedRingCoreIds);

  return (
    <FormSection
      title="Ring Cores"
      description="Choose which active ring cores are available for this collection."
    >
      {ringCores.length === 0 ? (
        <div style={emptyStateStyle}>
          No active ring cores are available yet. Add one from the Ring Cores
          section of the admin dashboard.
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
          {ringCores.map((core) => {
            const details = [
              core.material,
              core.finish,
              core.color,
            ].filter(Boolean);

            return (
              <label
                key={core.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "13px",
                  padding: "15px",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.025)",
                }}
              >
                <input
                  type="checkbox"
                  name="ringCoreIds"
                  value={core.id}
                  defaultChecked={selectedIds.has(core.id)}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "2px",
                    accentColor: "#d9b56d",
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#eef3f0",
                    }}
                  >
                    {core.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#98a49f",
                      fontSize: "13px",
                      lineHeight: 1.45,
                    }}
                  >
                    {details.length ? details.join(" • ") : "No details entered"}
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
                    Cost: ${(core.supplierCostCents / 100).toFixed(2)}
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