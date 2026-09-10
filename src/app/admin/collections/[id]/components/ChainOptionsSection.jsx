export default function ChainOptionsSection({
  chainOptions = [],
  selectedChainOptionSlugs = [],
}) {
  const selectedSet = new Set(
    Array.isArray(selectedChainOptionSlugs)
      ? selectedChainOptionSlugs
      : []
  );

  return (
    <section
      style={{
        border:
          "1px solid rgba(255,255,255,.11)",
        borderRadius: "18px",
        background:
          "rgba(255,255,255,.035)",
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: "0 0 7px",
            fontSize: "22px",
          }}
        >
          Chain Options
        </h2>

        <p
          style={{
            margin: 0,
            color: "#98a49f",
            lineHeight: 1.55,
            maxWidth: "720px",
          }}
        >
          Choose which chain options
          are available for this
          collection.
        </p>
      </div>

      {chainOptions.length === 0 ? (
        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.10)",
            background:
              "rgba(255,255,255,.025)",
            color: "#84918c",
            fontSize: "13px",
          }}
        >
          No active Chain Options have
          been created yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "12px",
          }}
        >
          {chainOptions.map(
            (option) => {
              const checked =
                selectedSet.has(
                  option.slug
                );

              const price =
                Number(
                  option.priceAdjustmentCents ||
                    0
                ) / 100;

              return (
                <label
                  key={option.id}
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: "11px",
                    padding: "14px",
                    borderRadius:
                      "12px",

                    border: checked
                      ? "1px solid rgba(217,181,109,.55)"
                      : "1px solid rgba(255,255,255,.10)",

                    background:
                      checked
                        ? "rgba(217,181,109,.09)"
                        : "rgba(255,255,255,.025)",

                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="chainOptionSlugs"
                    value={option.slug}
                    defaultChecked={
                      checked
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      marginTop: "2px",
                      flexShrink: 0,
                      accentColor:
                        "#d9b56d",
                    }}
                  />

                  <span>
                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#eef3f1",
                        fontSize:
                          "14px",
                      }}
                    >
                      {option.name}
                    </strong>

                    {option.description ? (
                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                          color:
                            "#84918c",
                          fontSize:
                            "12px",
                          lineHeight:
                            1.4,
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
                          "6px",
                        color:
                          price > 0
                            ? "#d9b56d"
                            : "#9aa7a2",
                        fontSize:
                          "12px",
                        fontWeight:
                          "800",
                      }}
                    >
                      {price > 0
                        ? `+$${price.toFixed(
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
          margin: "18px 0 0",
          color: "#77847f",
          fontSize: "12px",
        }}
      >
        {
          chainOptions.filter(
            (option) =>
              selectedSet.has(
                option.slug
              )
          ).length
        }{" "}
        of {chainOptions.length} chain
        options currently selected.
      </p>
    </section>
  );
}