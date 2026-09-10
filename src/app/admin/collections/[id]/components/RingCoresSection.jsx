import FormSection from "./FormSection";
import { emptyStateStyle } from "./styles";

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatVariantSummary(variant) {
  const details = [];

  if (variant.widthMm != null) {
    details.push(`${variant.widthMm}mm width`);
  }

  if (variant.channelLayout) {
    details.push(`Channel: ${variant.channelLayout}`);
  } else if (variant.channelWidthMm != null) {
    details.push(`Channel: ${variant.channelWidthMm}mm`);
  }

  if (variant.finish) {
    details.push(variant.finish);
  }

  if (variant.bezelSize) {
    details.push(`Bezel: ${variant.bezelSize}`);
  }

  if (variant.chainOption) {
    details.push(`Chain: ${variant.chainOption}`);
  }

  if (variant.lengthOption) {
    details.push(`Length: ${variant.lengthOption}`);
  }

  const sizes = parseJsonArray(variant.sizesJson);

  if (sizes.length > 0) {
    details.push(`Sizes: ${sizes.join(", ")}`);
  }

  const finishes = parseJsonArray(variant.finishesJson);

  if (finishes.length > 0) {
    details.push(`Finishes: ${finishes.join(", ")}`);
  }

  const bezelSizes = parseJsonArray(
    variant.bezelSizesJson
  );

  if (bezelSizes.length > 0) {
    details.push(
      `Bezel sizes: ${bezelSizes.join(", ")}`
    );
  }

  const chainOptions = parseJsonArray(
    variant.chainOptionsJson
  );

  if (chainOptions.length > 0) {
    const names = chainOptions.map((option) => {
      if (
        option &&
        typeof option === "object"
      ) {
        return option.name || option.label || option.id;
      }

      return String(option);
    });

    details.push(
      `Chain options: ${names.filter(Boolean).join(", ")}`
    );
  }

  const lengths = parseJsonArray(
    variant.lengthsJson
  );

  if (lengths.length > 0) {
    details.push(`Lengths: ${lengths.join(", ")}`);
  }

  return details;
}

export default function RingCoresSection({
  ringCores,
  selectedRingCoreIds,
}) {
  const productBases = ringCores || [];
  const selectedIds = new Set(
    selectedRingCoreIds || []
  );

  return (
    <FormSection
      title="Product Bases"
      description="Choose the specific ring, necklace, bracelet, pendant, or other jewelry bases available for this collection."
    >
      {productBases.length === 0 ? (
        <div style={emptyStateStyle}>
          No active Product Bases are available yet.
          Add one from the Product Bases section of
          the admin dashboard.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {productBases.map((product) => {
            const productDetails = [
              product.productType,
              product.material,
              product.finish,
              product.color,
              product.style,
              product.edge,
            ].filter(Boolean);

            const activeVariants =
              product.variants || [];

            return (
              <label
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  border:
                    "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  padding: "17px",
                  cursor: "pointer",
                  background:
                    "rgba(255, 255, 255, 0.025)",
                }}
              >
                <input
                  type="checkbox"
                  name="productBaseIds"
                  value={product.id}
                  defaultChecked={selectedIds.has(
                    product.id
                  )}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "3px",
                    accentColor: "#d9b56d",
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      color: "#eef3f0",
                      fontSize: "16px",
                    }}
                  >
                    {product.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#98a49f",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {productDetails.length
                      ? productDetails.join(" • ")
                      : "No general product details entered"}
                  </span>

                  <span
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#d9b56d",
                      fontSize: "13px",
                      fontWeight: "800",
                    }}
                  >
                    Landed cost: $
                    {(
                      Number(
                        product.landedCostCents || 0
                      ) / 100
                    ).toFixed(2)}
                    {" • "}
                    {activeVariants.length} active{" "}
                    {activeVariants.length === 1
                      ? "variant"
                      : "variants"}
                  </span>

                  {activeVariants.length > 0 ? (
                    <span
                      style={{
                        display: "grid",
                        gap: "8px",
                        marginTop: "12px",
                      }}
                    >
                      {activeVariants.map((variant) => {
                        const variantDetails =
                          formatVariantSummary(
                            variant
                          );

                        return (
                          <span
                            key={variant.id}
                            style={{
                              display: "block",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border:
                                "1px solid rgba(255,255,255,.08)",
                              background:
                                "rgba(0,0,0,.14)",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                color: "#dfe7e3",
                                fontSize: "13px",
                                fontWeight: "800",
                              }}
                            >
                              {variant.name ||
                                variant.variantKey ||
                                "Standard"}
                            </span>

                            <span
                              style={{
                                display: "block",
                                marginTop: "4px",
                                color: "#8f9d97",
                                fontSize: "12px",
                                lineHeight: 1.5,
                              }}
                            >
                              {variantDetails.length
                                ? variantDetails.join(
                                    " • "
                                  )
                                : "No selectable variant details stored"}
                            </span>
                          </span>
                        );
                      })}
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