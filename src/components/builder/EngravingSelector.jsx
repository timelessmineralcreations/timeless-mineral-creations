"use client";

import { useEffect } from "react";

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

function getEngravingType(option) {
  const key = String(
    option?.slug ||
      option?.id ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    key === "standard-engraving" ||
    key === "standard" ||
    key === "standard-text"
  ) {
    return "standard";
  }

  if (
    key === "custom-signature" ||
    key === "customsignature" ||
    key === "handwritten-signature"
  ) {
    return "customSignature";
  }

  return null;
}

function getOptionPrice(option) {
  const directPrice =
    Number(option?.price);

  if (
    Number.isFinite(directPrice)
  ) {
    return directPrice;
  }

  const cents =
    Number(
      option?.priceAdjustmentCents
    );

  if (
    Number.isFinite(cents)
  ) {
    return cents / 100;
  }

  return 0;
}

function formatPrice(price) {
  const amount = Number(price);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return "Included";
  }

  if (
    Number.isInteger(amount)
  ) {
    return `+$${amount}`;
  }

  return `+$${amount.toFixed(2)}`;
}

export default function EngravingSelector({
  engravingOptions = [],

  engravingEnabled,
  engravingType,
  engravingText,
  selectedEngravingFont,

  onToggleEngraving,
  onChangeEngravingType,
  onChangeEngraving,
  onChangeEngravingFont,
}) {
  /*
   * COLLECTION-CONTROLLED ENGRAVING
   *
   * The collection page passes only the
   * active engraving methods that are
   * assigned to this collection.
   *
   * Product Base allowEngraving is checked
   * by CollectionConfigurator before this
   * component is displayed.
   */
  const availableOptions =
    Array.isArray(engravingOptions)
      ? engravingOptions
          .map((option) => ({
            ...option,

            engravingType:
              getEngravingType(
                option
              ),
          }))
          .filter(
            (option) =>
              option.active !==
                false &&
              option.engravingType
          )
      : [];

  const standardOption =
    availableOptions.find(
      (option) =>
        option.engravingType ===
        "standard"
    ) || null;

  const customSignatureOption =
    availableOptions.find(
      (option) =>
        option.engravingType ===
        "customSignature"
    ) || null;

  const availableTypes =
    availableOptions.map(
      (option) =>
        option.engravingType
    );

  const availableTypeKey =
    availableTypes.join("|");

  /*
   * If an old saved design selected an
   * engraving method that is no longer
   * allowed for this collection, move it
   * to the first currently allowed method.
   */
  useEffect(() => {
    if (
      !engravingEnabled ||
      availableTypes.length === 0
    ) {
      return;
    }

    if (
      availableTypes.includes(
        engravingType
      )
    ) {
      return;
    }

    onChangeEngravingType(
      availableTypes[0]
    );
  }, [
    engravingEnabled,
    engravingType,
    availableTypeKey,
    onChangeEngravingType,
  ]);

  /*
   * This also prevents an engraving section
   * from appearing when the collection has
   * explicitly been assigned zero methods.
   */
  if (
    availableOptions.length === 0
  ) {
    return null;
  }

  const effectiveEngravingType =
    availableTypes.includes(
      engravingType
    )
      ? engravingType
      : availableTypes[0];

  const isStandardText =
    effectiveEngravingType ===
    "standard";

  const isCustomSignature =
    effectiveEngravingType ===
    "customSignature";

  const standardPrice =
    getOptionPrice(
      standardOption
    );

  const customSignaturePrice =
    getOptionPrice(
      customSignatureOption
    );

  return (
    <section
      style={{
        marginTop: "30px",
        padding: "22px",
        border:
          "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        background:
          "rgba(255,255,255,0.03)",
      }}
    >
      <h2
        style={{
          marginBottom: "14px",
        }}
      >
        ✍️ Inside Engraving
      </h2>

      <button
        type="button"
        onClick={
          onToggleEngraving
        }
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",

          border:
            engravingEnabled
              ? "2px solid #D4AF37"
              : "1px solid rgba(255,255,255,0.2)",

          background:
            engravingEnabled
              ? "rgba(212,175,55,0.14)"
              : "rgba(255,255,255,0.05)",

          color: "inherit",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {engravingEnabled
          ? "✓ Add Inside Engraving"
          : "Add Inside Engraving"}
      </button>

      {engravingEnabled && (
        <>
          <h3
            style={{
              marginTop: "24px",
              marginBottom:
                "12px",
            }}
          >
            Choose Engraving Type
          </h3>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",

              gap: "12px",

              marginBottom:
                "24px",
            }}
          >
            {standardOption && (
              <button
                type="button"
                onClick={() =>
                  onChangeEngravingType(
                    "standard"
                  )
                }
                style={{
                  padding: "16px",

                  borderRadius:
                    "12px",

                  border:
                    isStandardText
                      ? "2px solid #D4AF37"
                      : "1px solid rgba(255,255,255,.2)",

                  background:
                    isStandardText
                      ? "rgba(212,175,55,.14)"
                      : "rgba(255,255,255,.04)",

                  color: "inherit",

                  cursor:
                    "pointer",

                  textAlign:
                    "left",
                }}
              >
                <strong>
                  {standardOption.name ||
                    "Standard Text"}
                </strong>

                <p
                  style={{
                    marginTop:
                      "8px",

                    opacity:
                      0.75,

                    fontSize:
                      "14px",

                    lineHeight:
                      1.5,
                  }}
                >
                  {standardOption.description ||
                    "Choose a font and enter your engraving."}

                  <br />

                  <strong>
                    {formatPrice(
                      standardPrice
                    )}
                  </strong>
                </p>
              </button>
            )}

            {customSignatureOption && (
              <button
                type="button"
                onClick={() =>
                  onChangeEngravingType(
                    "customSignature"
                  )
                }
                style={{
                  padding: "16px",

                  borderRadius:
                    "12px",

                  border:
                    isCustomSignature
                      ? "2px solid #D4AF37"
                      : "1px solid rgba(255,255,255,.2)",

                  background:
                    isCustomSignature
                      ? "rgba(212,175,55,.14)"
                      : "rgba(255,255,255,.04)",

                  color: "inherit",

                  cursor:
                    "pointer",

                  textAlign:
                    "left",
                }}
              >
                <strong>
                  {customSignatureOption.name ||
                    "Handwritten Signature"}
                </strong>

                <p
                  style={{
                    marginTop:
                      "8px",

                    opacity:
                      0.75,

                    fontSize:
                      "14px",

                    lineHeight:
                      1.5,
                  }}
                >
                  {customSignatureOption.description ||
                    "We will engrave your actual handwriting or signature."}

                  <br />

                  <strong>
                    {formatPrice(
                      customSignaturePrice
                    )}
                  </strong>
                </p>
              </button>
            )}
          </div>

          {isStandardText &&
            standardOption && (
              <>
                <h3>
                  Enter Engraving
                </h3>

                <input
                  type="text"
                  value={
                    engravingText
                  }
                  onChange={(e) =>
                    onChangeEngraving(
                      e.target
                        .value
                    )
                  }
                  placeholder="Enter engraving..."
                  maxLength={25}
                  style={{
                    width:
                      "100%",

                    padding:
                      "14px",

                    marginTop:
                      "12px",

                    borderRadius:
                      "10px",

                    border:
                      "1px solid rgba(255,255,255,.2)",

                    background:
                      "rgba(255,255,255,.05)",

                    color:
                      "inherit",

                    fontSize:
                      "20px",

                    fontFamily:
                      selectedEngravingFont?.fontFamily ||
                      "Arial, sans-serif",

                    transition:
                      "font-family 0.2s ease",
                  }}
                />

                <p
                  style={{
                    marginTop:
                      "8px",

                    opacity:
                      0.6,

                    fontSize:
                      "14px",
                  }}
                >
                  {
                    engravingText.length
                  }
                  /25 characters
                  including spaces
                </p>

                <h3
                  style={{
                    marginTop:
                      "24px",
                  }}
                >
                  Choose Engraving
                  Font
                </h3>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px,1fr))",

                    gap:
                      "12px",

                    marginTop:
                      "12px",
                  }}
                >
                  {engravingFonts.map(
                    (font) => (
                      <button
                        key={
                          font.id
                        }
                        type="button"
                        onClick={() =>
                          onChangeEngravingFont(
                            font
                          )
                        }
                        style={{
                          padding:
                            "16px",

                          borderRadius:
                            "10px",

                          border:
                            selectedEngravingFont?.id ===
                            font.id
                              ? "2px solid #D4AF37"
                              : "1px solid rgba(255,255,255,.2)",

                          background:
                            selectedEngravingFont?.id ===
                            font.id
                              ? "rgba(212,175,55,.14)"
                              : "rgba(255,255,255,.04)",

                          color:
                            "inherit",

                          cursor:
                            "pointer",

                          fontFamily:
                            font.fontFamily,
                        }}
                      >
                        {
                          font.name
                        }
                      </button>
                    )
                  )}
                </div>
              </>
            )}

          {isCustomSignature &&
            customSignatureOption && (
              <div
                style={{
                  marginTop:
                    "20px",

                  padding:
                    "18px",

                  borderRadius:
                    "12px",

                  background:
                    "rgba(255,255,255,.05)",

                  lineHeight:
                    1.6,
                }}
              >
                <h3>
                  Handwritten
                  Signature
                </h3>

                <p
                  style={{
                    marginTop:
                      "10px",

                    lineHeight:
                      1.7,
                  }}
                >
                  Please write
                  your signature
                  in a single
                  horizontal line
                  using a black
                  pen on plain
                  white paper.
                  After placing
                  your order,
                  simply send us
                  a clear photo
                  or email.
                </p>

                <p>
                  Black ink on
                  plain white
                  paper produces
                  the best
                  results.
                </p>
              </div>
            )}
        </>
      )}
    </section>
  );
}