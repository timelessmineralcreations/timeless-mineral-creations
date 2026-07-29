"use client";

const engravingFonts = [
  {
    id: "arial",
    name: "Arial",
    fontFamily: "Arial, sans-serif",
  },
  {
    id: "century",
    name: "Century",
    fontFamily: "Century, serif",
  },
  {
    id: "comic-sans",
    name: "Comic Sans",
    fontFamily: '"Comic Sans MS", cursive',
  },
  {
    id: "freestyle-script",
    name: "Freestyle Script",
    fontFamily: '"Freestyle Script", cursive',
  },
  {
    id: "papyrus",
    name: "Papyrus",
    fontFamily: "Papyrus, fantasy",
  },
  {
    id: "sitka",
    name: "Sitka",
    fontFamily: "Sitka, serif",
  },
  {
    id: "times-new-roman",
    name: "Times New Roman",
    fontFamily: '"Times New Roman", serif',
  },
];

export default function EngravingSelector({
  engravingEnabled,
  engravingType,
  engravingText,
  selectedEngravingFont,
  onToggleEngraving,
  onChangeEngravingType,
  onChangeEngraving,
  onChangeEngravingFont,
}) {
  const isStandardText = engravingType === "standard";
  const isCustomSignature = engravingType === "customSignature";

  const activeFont =
    engravingFonts.find(
      (font) =>
        font.id === selectedEngravingFont?.id ||
        font.id === selectedEngravingFont
    ) || engravingFonts[0];

  return (
    <section
      style={{
        marginTop: "30px",
        padding: "22px",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <h2 style={{ marginBottom: "14px", color: "red" }}>
  THIS IS THE NEW ENGRAVING SELECTOR
</h2>

      <button
        type="button"
        onClick={onToggleEngraving}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: engravingEnabled
            ? "2px solid #D4AF37"
            : "1px solid rgba(255,255,255,0.2)",
          background: engravingEnabled
            ? "rgba(212,175,55,0.14)"
            : "rgba(255,255,255,0.05)",
          color: "inherit",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {engravingEnabled ? "✓ Engraving Added" : "Add Engraving"}
      </button>

      {engravingEnabled && (
        <>
          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>
            Choose Engraving Type
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => onChangeEngravingType("standard")}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: isStandardText
                  ? "2px solid #D4AF37"
                  : "1px solid rgba(255,255,255,0.2)",
                background: isStandardText
                  ? "rgba(212,175,55,0.14)"
                  : "rgba(255,255,255,0.04)",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong>Standard Text</strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  opacity: 0.75,
                }}
              >
                Choose a font and enter your engraving. (+$20)
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeEngravingType("customSignature")}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: isCustomSignature
                  ? "2px solid #D4AF37"
                  : "1px solid rgba(255,255,255,0.2)",
                background: isCustomSignature
                  ? "rgba(212,175,55,0.14)"
                  : "rgba(255,255,255,0.04)",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong>Handwritten Signature</strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  opacity: 0.75,
                }}
              >
                We will engrave your actual handwriting or signature. (+$50)
              </div>
            </button>
          </div>

          {isStandardText && (
            <>
              <div style={{ marginTop: "24px" }}>
                <label
                  htmlFor="engraving-text"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 700,
                  }}
                >
                  Enter Engraving
                </label>

                <input
                  id="engraving-text"
                  type="text"
                  value={engravingText}
                  onChange={(event) =>
                    onChangeEngraving(event.target.value)
                  }
                  placeholder="Enter engraving..."
                  maxLength={25}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.05)",
                    color: "inherit",
                    fontSize: "18px",
                    fontSize: "20px",
                    fontSize: "20px",
                    fontFamily: activeFont.fontFamily,
                    lineHeight: 1.4,
                    boxSizing: "border-box",
                  }}
                />

                <p
                  style={{
                    marginTop: "8px",
                    opacity: 0.6,
                    fontSize: "14px",
                  }}
                >
                  {engravingText.length}/25 characters including spaces.
                  Engraving is case-sensitive.
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "22px",
                    borderRadius: "14px",
                    border: "1px solid rgba(212,175,55,0.35)",
                    background: "rgba(212,175,55,0.08)",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Live Engraving Preview
                  </div>

                  <div
                    style={{
                      minHeight: "52px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: activeFont.fontFamily,
                      fontSize: "32px",
                      lineHeight: 1.3,
                      color: "#ffffff",
                      textAlign: "center",
                      overflowWrap: "anywhere",
                      transition: "font-family 0.2s ease",
                    }}
                  >
                    {engravingText || "Your engraving will appear here"}
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "13px",
                      opacity: 0.55,
                    }}
                  >
                    Selected font: {activeFont.name}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "22px" }}>
                <h3 style={{ marginBottom: "12px" }}>
                  Choose Engraving Font
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {engravingFonts.map((font) => {
                    const active = activeFont.id === font.id;

                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => onChangeEngravingFont(font)}
                        style={{
                          padding: "14px",
                          borderRadius: "10px",
                          border: active
                            ? "2px solid #D4AF37"
                            : "1px solid rgba(255,255,255,0.2)",
                          background: active
                            ? "rgba(212,175,55,0.14)"
                            : "rgba(255,255,255,0.04)",
                          color: "inherit",
                          fontFamily: font.fontFamily,
                          fontSize: "17px",
                          cursor: "pointer",
                        }}
                      >
                        {font.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {isCustomSignature && (
            <div
              style={{
                marginTop: "24px",
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                lineHeight: 1.6,
              }}
            >
              <strong>Submitting Your Handwriting</strong>

              <p style={{ marginTop: "8px", opacity: 0.8 }}>
                After placing your order, you will receive instructions for
                submitting a clear photo or scan of the handwritten signature.
                Black writing on plain white paper works best.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}