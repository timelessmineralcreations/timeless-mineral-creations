export default function BezelSizesSection({
  bezelSizeOptions = [],
  selectedBezelSizeSlugs = [],
}) {
  const selectedSet = new Set(
    Array.isArray(selectedBezelSizeSlugs)
      ? selectedBezelSizeSlugs
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
          Bezel Sizes
        </h2>

        <p
          style={{
            margin: 0,
            color: "#98a49f",
            lineHeight: 1.55,
            maxWidth: "720px",
          }}
        >
          Choose which bezel sizes are
          available for this collection.
          For now, these selections are
          being previewed from the
          collection&apos;s existing
          product configuration.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "12px",
        }}
      >
        {bezelSizeOptions.map(
          (option) => {
            const checked =
              selectedSet.has(
                option.slug
              );

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
                }}
              >
                <input
                  type="checkbox"
                  name="bezelSizeSlugs"
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
                      display: "block",
                      color: "#eef3f1",
                      fontSize: "14px",
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

                  {Number(
                    option.priceAdjustmentCents ||
                      0
                  ) > 0 ? (
                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#d9b56d",
                        fontSize:
                          "12px",
                        fontWeight:
                          "800",
                      }}
                    >
                      +
                      {(
                        Number(
                          option.priceAdjustmentCents
                        ) / 100
                      ).toLocaleString(
                        "en-US",
                        {
                          style:
                            "currency",
                          currency:
                            "USD",
                        }
                      )}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          }
        )}
      </div>

      <p
        style={{
          margin: "18px 0 0",
          color: "#77847f",
          fontSize: "12px",
        }}
      >
        {
          bezelSizeOptions.filter(
            (option) =>
              selectedSet.has(
                option.slug
              )
          ).length
        }{" "}
        of {bezelSizeOptions.length} bezel
        sizes currently selected.
      </p>
    </section>
  );
}