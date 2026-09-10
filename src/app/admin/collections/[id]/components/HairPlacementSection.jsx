import FormSection from "./FormSection";

function parseCollectionOptions(collection) {
  const value = collection?.configurationJson;

  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function formatMoneyFromCents(value) {
  const cents = Number(value);

  if (!Number.isFinite(cents) || cents === 0) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function HairPlacementSection({
  collection,
  hairPlacementOptions = [],
}) {
  const configuration =
    parseCollectionOptions(collection);

  const selectedStyles = Array.isArray(
    configuration?.options?.hair?.allowedStyles
  )
    ? configuration.options.hair.allowedStyles
    : [];

  const activeOptions = hairPlacementOptions.filter(
    (option) => option.active
  );

  return (
    <FormSection
      title="Hair Placement"
      description="Choose which hair placement styles customers may select for this collection. No Hair will always remain available."
    >
      {activeOptions.length === 0 ? (
        <div
          style={{
            padding: "18px",
            border:
              "1px dashed rgba(255,255,255,.16)",
            borderRadius: "12px",
            background:
              "rgba(255,255,255,.02)",
            color: "#98a49f",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        >
          No active Hair Placement options are
          currently available in the master catalog.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {activeOptions.map((option) => {
            const price = formatMoneyFromCents(
              option.priceAdjustmentCents
            );

            return (
              <label
                key={option.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  border:
                    "1px solid rgba(255,255,255,.1)",
                  borderRadius: "12px",
                  padding: "15px",
                  cursor: "pointer",
                  background:
                    "rgba(255,255,255,.025)",
                }}
              >
                <input
                  type="checkbox"
                  name="hairPlacementIds"
                  value={option.slug}
                  defaultChecked={selectedStyles.includes(
                    option.slug
                  )}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "2px",
                    accentColor: "#d9b56d",
                  }}
                />

                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.name}
                    style={{
                      width: "58px",
                      height: "58px",
                      objectFit: "cover",
                      borderRadius: "9px",
                      border:
                        "1px solid rgba(255,255,255,.1)",
                      flexShrink: 0,
                    }}
                  />
                ) : null}

                <span
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{option.name}</strong>

                    {price ? (
                      <span
                        style={{
                          color: "#d9b56d",
                          fontSize: "12px",
                          fontWeight: "850",
                        }}
                      >
                        +{price}
                      </span>
                    ) : null}
                  </span>

                  {option.description ? (
                    <span
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: "#98a49f",
                        lineHeight: 1.45,
                      }}
                    >
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}