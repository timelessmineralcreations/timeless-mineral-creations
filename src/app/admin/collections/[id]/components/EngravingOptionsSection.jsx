import FormSection from "./FormSection";

export default function EngravingOptionsSection({
  engravingOptions = [],
  selectedEngravingOptionSlugs = [],
}) {
  const selectedSet =
    new Set(
      selectedEngravingOptionSlugs
    );

  return (
    <FormSection
      title="Engraving Options"
      description="Choose which engraving methods are allowed for this collection. A Product Base must also have engraving enabled before customers will see these options."
    >
      {engravingOptions.length === 0 ? (
        <div
          style={{
            border:
              "1px solid rgba(255,255,255,.1)",

            borderRadius:
              "13px",

            padding:
              "18px",

            background:
              "rgba(255,255,255,.025)",

            color:
              "#98a49f",

            lineHeight:
              1.55,
          }}
        >
          No active engraving options are
          available. Add or activate them
          under Admin → Engraving Options.
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
          {engravingOptions.map(
            (option) => {
              const price =
                Number(
                  option.priceAdjustmentCents ||
                    0
                ) / 100;

              return (
                <label
                  key={option.slug}
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "flex-start",

                    gap:
                      "12px",

                    padding:
                      "15px",

                    borderRadius:
                      "13px",

                    border:
                      "1px solid rgba(255,255,255,.1)",

                    background:
                      "rgba(255,255,255,.025)",

                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="engravingOptionSlugs"
                    value={
                      option.slug
                    }
                    defaultChecked={selectedSet.has(
                      option.slug
                    )}
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

                  <span
                    style={{
                      display:
                        "block",

                      minWidth:
                        0,
                    }}
                  >
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
                      {option.name}
                    </strong>

                    {option.description ? (
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
                          option.description
                        }
                      </span>
                    ) : null}

                    <span
                      style={{
                        display:
                          "block",

                        marginTop:
                          "8px",

                        color:
                          "#d9b56d",

                        fontSize:
                          "12px",

                        fontWeight:
                          "800",
                      }}
                    >
                      {price > 0
                        ? `Master price: +$${price.toFixed(
                            2
                          )}`
                        : "Included"}
                    </span>
                  </span>
                </label>
              );
            }
          )}
        </div>
      )}

      <p
        style={{
          margin:
            "2px 0 0",

          color:
            "#7f8c87",

          fontSize:
            "12px",

          lineHeight:
            1.5,
        }}
      >
        This controls which engraving methods
        belong to the collection. Product Base
        engraving permission still takes
        priority. If the selected Product Base
        cannot be engraved, the customer will
        not see engraving regardless of what is
        checked here.
      </p>
    </FormSection>
  );
}