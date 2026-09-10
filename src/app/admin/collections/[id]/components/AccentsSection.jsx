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

export default function AccentsSection({
  collection,
  decorativeAccentOptions = [],
  accentStyleOptions = [],
}) {
  const configuration =
    parseCollectionOptions(collection);

  const selectedMaterials = Array.isArray(
    configuration?.options?.decorativeAccents
      ?.allowed
  )
    ? configuration.options.decorativeAccents.allowed
    : [];

  const selectedStyles = Array.isArray(
    configuration?.options?.decorativeAccents
      ?.allowedStyles
  )
    ? configuration.options.decorativeAccents
        .allowedStyles
    : [];

  return (
    <FormSection
      title="Decorative Accents"
      description="Choose which decorative accent materials and placement styles are available for this collection. No Decorative Accent will always remain available to customers."
    >
      <div
        style={{
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          >
            Accent Materials
          </strong>

          {decorativeAccentOptions.length === 0 ? (
            <EmptyMessage>
              No active Decorative Accents are
              currently available in the master
              catalog.
            </EmptyMessage>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {decorativeAccentOptions.map(
                (option) => {
                  const price =
                    formatMoneyFromCents(
                      option.priceAdjustmentCents
                    );

                  return (
                    <label
                      key={option.id}
                      style={optionCardStyle}
                    >
                      <input
                        type="checkbox"
                        name="accentMaterialIds"
                        value={option.slug}
                        defaultChecked={selectedMaterials.includes(
                          option.slug
                        )}
                        style={checkboxStyle}
                      />

                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt={option.name}
                          style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "9px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border:
                              "1px solid rgba(255,255,255,.1)",
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
                          <strong>
                            {option.name}
                          </strong>

                          {price ? (
                            <span
                              style={{
                                color:
                                  "#d9b56d",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "850",
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
                              color:
                                "#98a49f",
                              fontSize:
                                "13px",
                              lineHeight: 1.45,
                            }}
                          >
                            {
                              option.description
                            }
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div>
          <strong
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          >
            Accent Styles
          </strong>

          {accentStyleOptions.length === 0 ? (
            <EmptyMessage>
              No active Accent Styles are currently
              available in the master catalog.
            </EmptyMessage>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {accentStyleOptions.map(
                (option) => (
                  <label
                    key={option.id}
                    style={optionCardStyle}
                  >
                    <input
                      type="checkbox"
                      name="accentStyleIds"
                      value={option.slug}
                      defaultChecked={selectedStyles.includes(
                        option.slug
                      )}
                      style={checkboxStyle}
                    />

                    {option.imageUrl ? (
                      <img
                        src={option.imageUrl}
                        alt={option.name}
                        style={{
                          width: "58px",
                          height: "58px",
                          borderRadius: "9px",
                          objectFit: "cover",
                          flexShrink: 0,
                          border:
                            "1px solid rgba(255,255,255,.1)",
                        }}
                      />
                    ) : null}

                    <span
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {option.name}
                      </strong>

                      {option.description ? (
                        <span
                          style={{
                            display: "block",
                            color: "#98a49f",
                            fontSize: "13px",
                            lineHeight: 1.45,
                          }}
                        >
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}

function EmptyMessage({ children }) {
  return (
    <div
      style={{
        padding: "16px",
        border:
          "1px dashed rgba(255,255,255,.16)",
        borderRadius: "12px",
        background:
          "rgba(255,255,255,.02)",
        color: "#98a49f",
        fontSize: "14px",
      }}
    >
      {children}
    </div>
  );
}

const optionCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "14px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,.1)",
  background:
    "rgba(255,255,255,.025)",
  cursor: "pointer",
};

const checkboxStyle = {
  width: "18px",
  height: "18px",
  marginTop: "2px",
  accentColor: "#d9b56d",
  flexShrink: 0,
};