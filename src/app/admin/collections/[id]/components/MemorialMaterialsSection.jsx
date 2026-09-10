import FormSection from "./FormSection";

function centsToDollars(value) {
  return Number(value || 0) / 100;
}

export default function MemorialMaterialsSection({
  memorialMaterialOptions = [],
  memorialMaterialRules = [],
}) {
  const ruleMap = new Map(
    memorialMaterialRules.map((rule) => [
      rule.optionKey,
      rule,
    ])
  );

  /*
   * Master Admin materials are the normal
   * source of truth.
   *
   * If an older collection happens to contain
   * a memorial-material pricing rule whose
   * master option is no longer active, keep it
   * visible here so simply editing the
   * collection does not silently delete it.
   */
  const masterSlugSet = new Set(
    memorialMaterialOptions.map(
      (option) => option.slug
    )
  );

  const legacyRules =
    memorialMaterialRules
      .filter(
        (rule) =>
          !masterSlugSet.has(
            rule.optionKey
          )
      )
      .map((rule) => ({
        id: rule.optionKey,

        name:
          rule.label ||
          rule.optionKey,

        description:
          "This material is currently assigned to this collection but is not active in the Memorial Materials master catalog.",

        defaultPrice:
          centsToDollars(
            rule.amountCents
          ),

        legacy: true,
      }));

  const materials = [
    ...memorialMaterialOptions.map(
      (option) => ({
        id: option.slug,

        name: option.name,

        description:
          option.description || "",

        defaultPrice:
          centsToDollars(
            option.priceAdjustmentCents
          ),

        legacy: false,
      })
    ),

    ...legacyRules,
  ];

  return (
    <FormSection
      title="Memorial & Keepsake Materials"
      description="Choose which memorial materials customers may select for this collection. Default pricing comes from Memorial Materials Admin, but you can override the price for this collection."
    >
      {materials.length === 0 ? (
        <div
          style={{
            border:
              "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "13px",
            padding: "18px",
            color: "#98a49f",
            lineHeight: 1.55,
            background:
              "rgba(255, 255, 255, 0.025)",
          }}
        >
          No active memorial materials are
          available. Add or activate materials
          under Admin → Memorial Materials.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "12px",
          }}
        >
          {materials.map((material) => {
            const existingRule =
              ruleMap.get(
                material.id
              );

            const selected =
              Boolean(existingRule);

            const price =
              existingRule
                ?.amountCents !==
              undefined
                ? existingRule.amountCents /
                  100
                : material.defaultPrice;

            return (
              <div
                key={material.id}
                style={{
                  border:
                    material.legacy
                      ? "1px solid rgba(217, 181, 109, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.1)",

                  borderRadius:
                    "13px",

                  padding:
                    "15px",

                  background:
                    material.legacy
                      ? "rgba(217, 181, 109, 0.055)"
                      : "rgba(255, 255, 255, 0.025)",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: "12px",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="memorialMaterialIds"
                    value={
                      material.id
                    }
                    defaultChecked={
                      selected
                    }
                    style={{
                      width:
                        "18px",
                      height:
                        "18px",
                      marginTop:
                        "2px",
                      accentColor:
                        "#d9b56d",
                      flexShrink:
                        0,
                    }}
                  />

                  <span>
                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "4px",
                        color:
                          "#eef3f0",
                      }}
                    >
                      {
                        material.name
                      }
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        color:
                          "#98a49f",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.45,
                      }}
                    >
                      {
                        material.description
                      }
                    </span>

                    {material.legacy ? (
                      <span
                        style={{
                          display:
                            "inline-block",
                          marginTop:
                            "8px",
                          padding:
                            "4px 7px",
                          borderRadius:
                            "999px",
                          background:
                            "rgba(217, 181, 109, 0.1)",
                          color:
                            "#e7c77f",
                          fontSize:
                            "11px",
                          fontWeight:
                            "800",
                        }}
                      >
                        Not active in
                        master catalog
                      </span>
                    ) : null}
                  </span>
                </label>

                <div
                  style={{
                    marginTop:
                      "14px",
                  }}
                >
                  <label
                    htmlFor={`memorialMaterialPrice-${material.id}`}
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "6px",
                      color:
                        "#98a49f",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                    }}
                  >
                    Collection price
                    adjustment
                  </label>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "7px",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#d9b56d",
                        fontWeight:
                          "800",
                      }}
                    >
                      +$
                    </span>

                    <input
                      id={`memorialMaterialPrice-${material.id}`}
                      name={`memorialMaterialPrice_${material.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={Number(
                        price || 0
                      ).toFixed(2)}
                      style={{
                        width:
                          "120px",
                        minHeight:
                          "40px",
                        padding:
                          "8px 10px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,.12)",
                        background:
                          "rgba(255,255,255,.04)",
                        color:
                          "#eef3f0",
                        fontSize:
                          "14px",
                      }}
                    />
                  </div>

                  {!existingRule &&
                  !material.legacy ? (
                    <p
                      style={{
                        margin:
                          "7px 0 0",
                        color:
                          "#74817c",
                        fontSize:
                          "11px",
                        lineHeight:
                          1.4,
                      }}
                    >
                      Master default: $
                      {Number(
                        material.defaultPrice ||
                          0
                      ).toFixed(
                        2
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}