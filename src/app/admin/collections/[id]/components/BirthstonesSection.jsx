import FormSection from "./FormSection";
import { emptyStateStyle } from "./styles";

function parseJsonObject(value) {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export default function BirthstonesSection({
  collection,
  birthstones,
  selectedBirthstoneIds,
}) {
  const selectedIds = new Set(
    selectedBirthstoneIds || []
  );

  const configuration =
    parseJsonObject(
      collection?.configurationJson
    );

  const options =
    configuration.options &&
    typeof configuration.options === "object" &&
    !Array.isArray(configuration.options)
      ? configuration.options
      : {};

  const birthstoneOptions =
    options.birthstones &&
    typeof options.birthstones === "object" &&
    !Array.isArray(options.birthstones)
      ? options.birthstones
      : {};

  const showBirthstoneGuide =
    birthstoneOptions.showGuide === true;

  return (
    <FormSection
      title="CZ Birthstones"
      description="Choose which faceted birthstones are available for this collection. Leave all unchecked for collections that do not use CZ stones."
    >
      {birthstones.length === 0 ? (
        <div style={emptyStateStyle}>
          No active CZ birthstones are available yet. Add one
          from the Birthstones section of the admin
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
          {birthstones.map((birthstone) => {
            const details = [
              birthstone.monthName,
              birthstone.stoneType,
              birthstone.shape,
              birthstone.size,
            ].filter(Boolean);

            return (
              <label
                key={birthstone.id}
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
                  name="birthstoneIds"
                  value={birthstone.id}
                  defaultChecked={selectedIds.has(
                    birthstone.id
                  )}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "2px",
                    accentColor: "#d9b56d",
                    flexShrink: 0,
                  }}
                />

                {birthstone.imageUrl ? (
                  <img
                    src={birthstone.imageUrl}
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
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "10px",
                      background:
                        birthstone.colorHex || "#444",
                      border:
                        "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#fff",
                      fontSize: "21px",
                      flexShrink: 0,
                    }}
                  >
                    ◇
                  </span>
                )}

                <span style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#eef3f0",
                    }}
                  >
                    {birthstone.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#98a49f",
                      fontSize: "13px",
                      lineHeight: 1.45,
                    }}
                  >
                    {details.join(" • ")}
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
                    Price adjustment: +$
                    {(
                      birthstone.priceAdjustmentCents /
                      100
                    ).toFixed(2)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: "22px",
          padding: "18px",
          border:
            "1px solid rgba(217, 181, 109, 0.32)",
          borderRadius: "14px",
          background:
            "rgba(217, 181, 109, 0.055)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="showBirthstoneGuide"
            defaultChecked={
              showBirthstoneGuide
            }
            style={{
              width: "19px",
              height: "19px",
              marginTop: "2px",
              accentColor: "#d9b56d",
              flexShrink: 0,
            }}
          />

          <span>
            <strong
              style={{
                display: "block",
                color: "#eef3f0",
                marginBottom: "5px",
                fontSize: "15px",
              }}
            >
              Show Birthstone Color Guide
            </strong>

            <span
              style={{
                display: "block",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.55,
              }}
            >
              Display the global Birthstone Color
              Guide above the birthstone choices on
              the customer page.
            </span>
          </span>
        </label>
      </div>
    </FormSection>
  );
}