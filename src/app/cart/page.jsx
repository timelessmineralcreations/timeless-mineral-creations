"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeItem, clearItems, siteSettings } = useCart();
  const [customerNote, setCustomerNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const rawSubtotal = cart.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  const salePercent =
    siteSettings?.sitewideSaleEnabled
      ? Math.max(
          0,
          Math.min(
            100,
            Number(
              siteSettings.sitewideSalePercent || 0
            )
          )
        )
      : 0;

  const saleSavings =
    rawSubtotal * (salePercent / 100);

  const subtotal =
    rawSubtotal - saleSavings;

  const standardShipping =
    Number(
      siteSettings?.standardShippingPriceCents ??
        800
    ) / 100;

  const priorityShipping =
    Number(
      siteSettings?.priorityShippingPriceCents ??
        1500
    ) / 100;

  async function handleCheckout() {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  cart,
  customerNote,
}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed.");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong starting checkout.");
      setIsCheckingOut(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "50px 20px",
      }}
    >
      <h1 style={{ fontSize: "44px", marginBottom: "28px" }}>
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div>
          <p style={{ fontSize: "18px", opacity: 0.8 }}>
            Your cart is empty.
          </p>

          <Link
            href="/collections"
            style={{
              color: "#D4AF37",
              fontWeight: 700,
            }}
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: "28px",
          }}
        >
          <div style={{ display: "grid", gap: "18px" }}>
            {cart.map((item) => {
              const isRemiStyle =
  item.bezelSize !== undefined &&
  item.keepsakeMaterial !== undefined;

              const isKeepsake =
                item.collectionId === "keepsake" ||
                item.collectionSlug === "keepsake";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "180px minmax(0, 1fr) auto",
                    gap: "20px",
                    padding: "18px",
                    border:
                      "1px solid rgba(255,255,255,.14)",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,.05)",
                  }}
                >
                  <img
                    src={
                      item.image ||
                      "/rings/signature/signature-stainless-steel-turquoise-howlite-8mm.png"
                    }
                    alt={item.collectionName || "Cart item"}
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "14px",
                    }}
                  />

                  <div>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: 10,
                      }}
                    >
                      {item.collectionName || "Custom Piece"}
                    </h2>

                    {isRemiStyle ? (
                      <RemiCartDetails item={item} />
                    ) : isKeepsake ? (
                      <KeepsakeCartDetails item={item} />
                    ) : (
                      <StandardRingCartDetails item={item} />
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#D4AF37",
                        marginBottom: "16px",
                      }}
                    >
                      $
                      {(
                        (Number(item.price) || 0) *
                        (item.quantity || 1)
                      ).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border:
                          "1px solid rgba(255,255,255,.22)",
                        background: "transparent",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside
            style={{
              padding: "22px",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: "18px",
              background: "rgba(255,255,255,.05)",
              height: "fit-content",
              position: "sticky",
              top: "95px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Order Summary</h2>

            <SummaryLine
              label="Items"
              value={cart.reduce(
                (total, item) =>
                  total + (item.quantity || 1),
                0
              )}
            />

            <SummaryLine
              label="Merchandise"
              value={`$${rawSubtotal.toFixed(2)}`}
            />

            {salePercent > 0 && (
              <SummaryLine
                label={`${
                  siteSettings?.sitewideSaleName ||
                  "Sitewide Sale"
                } (${salePercent}% off)`}
                value={`-$${saleSavings.toFixed(2)}`}
              />
            )}

            <SummaryLine
              label="Subtotal"
              value={`$${subtotal.toFixed(2)}`}
            />

            <SummaryLine
              label="USPS Ground Advantage"
              value={`$${standardShipping.toFixed(2)}`}
            />

            <SummaryLine
              label="USPS Priority Mail"
              value={`$${priorityShipping.toFixed(2)}`}
            />

            <hr              style={{
                margin: "18px 0",
                opacity: 0.2,
              }}
            />

            <SummaryLine
              label="Total before shipping"
              value={`$${subtotal.toFixed(2)}`}
              large
            />

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "12px",
                lineHeight: 1.5,
                opacity: 0.72,
              }}
            >
              Select Ground Advantage or Priority Mail
              during secure checkout.
            </p>

<div
  style={{
    marginTop: "22px",    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,.14)",
  }}
>
  <label
    htmlFor="customer-note"
    style={{
      display: "block",
      fontSize: "16px",
      fontWeight: 800,
      marginBottom: "8px",
    }}
  >
    Additional Information
    <span
      style={{
        marginLeft: "6px",
        fontSize: "13px",
        fontWeight: 500,
        opacity: 0.65,
      }}
    >
      Optional
    </span>
  </label>

  <p
    style={{
      margin: "0 0 10px",
      fontSize: "13px",
      lineHeight: 1.5,
      opacity: 0.76,
    }}
  >
    Is there anything you would like me to know about your order?
    You may include color preferences, placement requests, gift details,
    or anything else that may help while creating your piece.
  </p>

  <textarea
    id="customer-note"
    value={customerNote}
    onChange={(event) =>
      setCustomerNote(event.target.value.slice(0, 1000))
    }
    maxLength={1000}
    rows={6}
    placeholder="Example: Please keep the hair visible and use more blue than green."
    style={{
      width: "100%",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "130px",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,.2)",
      background: "rgba(0,0,0,.28)",
      color: "white",
      font: "inherit",
      lineHeight: 1.5,
      outline: "none",
    }}
  />

  <div
    style={{
      marginTop: "6px",
      textAlign: "right",
      fontSize: "12px",
      opacity: 0.6,
    }}
  >
    {customerNote.length}/1000
  </div>
</div>

            <button
              type="button"
              disabled={isCheckingOut}
              onClick={handleCheckout}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background:
                  "linear-gradient(135deg, rgb(233, 192, 84), rgb(184, 134, 11))",
                color: "#111",
                fontWeight: 800,
                cursor: isCheckingOut ? "wait" : "pointer",
              }}
            >
              {isCheckingOut ? "Starting Checkout..." : "Secure Checkout"}
            </button>

            <Link
              href="/collections"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "14px",
                color: "#D4AF37",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Continue Shopping
            </Link>

            <button
              type="button"
              onClick={clearItems}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "10px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,.18)",
                background: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.76,
                marginTop: "16px",
                lineHeight: 1.55,
              }}
            >
              <p style={{ margin: "0 0 8px" }}>
                Current turnaround:{" "}
                {siteSettings?.turnaroundMinWeeks ?? 2}-
                {siteSettings?.turnaroundMaxWeeks ?? 10} weeks.
              </p>

              {siteSettings?.usShippingOnly && (
                <p style={{ margin: "0 0 8px" }}>
                  Shipping is currently available within
                  the United States only.
                </p>
              )}

              {siteSettings?.shippingInstructions && (
                <p style={{ margin: "0 0 8px" }}>
                  {siteSettings.shippingInstructions}
                </p>
              )}

              <p style={{ margin: 0 }}>
                Memorial material shipping instructions
                will also be included in your order
                confirmation email.
              </p>
            </div>
          </aside>
        </div>
      )}    </main>
  );
}

function RemiCartDetails({ item }) {
  const keepsakeBase =
    item.keepsakeMaterialName ||
    formatKeepsakeMaterial(item.keepsakeMaterial) ||
    "Not selected";

  const mineralName =
    item.mineral?.name ||
    item.naturalMineral ||
    item.naturalMineralName ||
    "";

  const glowName =
    item.glow?.name ||
    item.glowName ||
    (typeof item.glow === "string" ? item.glow : "") ||
    "No Glow";

  const decorativeAccent =
    item.decorativeAccentName ||
    formatOptionName(item.decorativeAccent) ||
    "None";

  const accentStyle =
    item.accentStyleName ||
    formatOptionName(item.accentStyle) ||
    "";

  return (
    <>
      <CartLine
        label="Metal Finish"
        value={
          item.finish ||
          item.material ||
          "Not selected"
        }
      />

      {item.productType !== "necklace" && (
  <CartLine
    label="Ring Size"
    value={item.size || "Not selected"}
  />
)}

      <CartLine
        label="Bezel Size"
        value={item.bezelSize || "Not selected"}
      />
{item.productType === "necklace" && (
  <CartLine
    label="Chain"
    value={item.chain || "Pendant Only — No Chain"}
  />
)}
      <CartLine
        label="Keepsake Base"
        value={keepsakeBase}
      />

      <CartLine
        label="Hair Placement"
        value={
          item.hairPlacementName ||
          formatOptionName(item.hairPlacement) ||
          "None"
        }
      />

      {item.keepsakeMaterial !== "mineralBase" &&
        mineralName && (
          <CartLine
            label="Natural Mineral"
            value={mineralName}
          />
        )}

      <CartLine
        label="Decorative Accent"
        value={decorativeAccent}
      />

      {item.decorativeAccent !== "none" &&
        accentStyle && (
          <CartLine
            label="Accent Style"
            value={accentStyle}
          />
        )}

      <CartLine
        label="Glow Effect"
        value={glowName}
      />

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes (+$30)"
        />
      )}

      {(item.quantity || 1) > 1 && (
        <CartLine
          label="Quantity"
          value={item.quantity}
        />
      )}
    </>
  );
}

function KeepsakeCartDetails({ item }) {
  return (
    <>
      <CartLine
        label="Material"
        value={item.material || "Not selected"}
      />

      <CartLine label="Profile" value="Slim" />

      <CartLine
        label="Size"
        value={item.size || "Not selected"}
      />

      <CartLine
        label="Keepsake Material"
        value={formatKeepsakeMaterial(
          item.keepsakeMaterial
        )}
      />

      <CartLine
        label="Birthstone"
        value={
          item.birthstone
            ? `${item.birthstone.month} • ${item.birthstone.stone}`
            : "Not selected"
        }
      />

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes"
        />
      )}
    </>
  );
}

function StandardRingCartDetails({ item }) {
  const style =
    `${item.core?.color ? `${item.core.color} ` : ""}${
      item.core?.edge || item.core?.finish || ""
    }`.trim() || "Not selected";

  const channelDefinitions =
    item.design?.channels || [];

  const hasChannelSelections =
    channelDefinitions.length > 0 &&
    item.channels &&
    Object.keys(item.channels).length > 0;

  const globalGlowName =
    item.glow?.name ||
    (typeof item.glow === "string"
      ? formatOptionName(item.glow)
      : "None");

  return (
    <>
      <CartLine
        label="Material"
        value={item.material || "Not selected"}
      />

      <CartLine
        label="Style"
        value={style}
      />

      <CartLine
        label="Width"
        value={
          item.width?.width != null
            ? `${item.width.width}mm`
            : typeof item.width === "number"
              ? `${item.width}mm`
              : "Not selected"
        }
      />

      <CartLine
        label="Channel Width"
        value={
          item.channelWidth
            ? `${item.channelWidth}mm`
            : item.width?.channel
              ? `${item.width.channel}mm`
              : "Not selected"
        }
      />

      <CartLine
        label="Size"
        value={item.size || "Not selected"}
      />

      <CartLine
        label="Design"
        value={item.design?.name || "Not selected"}
      />

      {hasChannelSelections ? (
        <ChannelCartDetails
          channels={item.channels}
          channelDefinitions={channelDefinitions}
          groupLabel={
            item.collectionId === "quad"
              ? "Section"
              : "Channel"
          }
        />
      ) : (
        <>
          <CartLine
            label="Memorial Material"
            value={
              item.memorialMaterials?.length
                ? item.memorialMaterials
                    .map((value) =>
                      formatMemorialMaterial(value)
                    )
                    .join(", ")
                : "None"
            }
          />

          <CartLine
            label="Minerals"
            value={
              item.minerals?.length
                ? item.minerals
                    .map(
                      (mineral) =>
                        mineral?.name ||
                        formatOptionName(mineral?.id) ||
                        formatOptionName(mineral)
                    )
                    .filter(Boolean)
                    .join(", ")
                : "None"
            }
          />
        </>
      )}

      <CartLine
        label="Accent Materials"
        value={
          item.accentMaterials?.length
            ? item.accentMaterials
                .map((value) =>
                  formatAccentMaterial(
                    value?.id || value
                  )
                )
                .join(", ")
            : "None"
        }
      />

      {!hasChannelSelections && (
        <CartLine
          label="Glow"
          value={globalGlowName}
        />
      )}

      {item.engravingEnabled && (
        <>
          <CartLine
            label="Engraving"
            value={
              item.engravingType ===
              "customSignature"
                ? "Handwritten Signature"
                : item.engravingText || "Yes"
            }
          />

          {item.engravingType !==
            "customSignature" && (
            <CartLine
              label="Font"
              value={
                item.engravingFont?.name ||
                "Not selected"
              }
            />
          )}
        </>
      )}

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes"
        />
      )}

      {(item.quantity || 1) > 1 && (
        <CartLine
          label="Quantity"
          value={item.quantity}
        />
      )}
    </>
  );
}

function ChannelCartDetails({
  channels,
  channelDefinitions,
  groupLabel = "Channel",
}) {
  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "10px",
        display: "grid",
        gap: "10px",
      }}
    >
      {channelDefinitions.map((channel, index) => {
        const selection =
          channels?.[channel.id] || {};

        const memorialValue =
          selection.memorial?.id ||
          selection.memorial;

        const memorialName =
          formatMemorialMaterial(memorialValue);

        const mineralValue =
          selection.mineral?.id ||
          selection.mineral;

        const mineralName =
          selection.mineral?.name ||
          formatOptionName(mineralValue);

        const glowValue =
          selection.glow?.id ||
          selection.glow;

        const glowName =
          selection.glow?.name ||
          formatOptionName(glowValue);

        const accentValue =
          selection.accent?.id ||
          selection.accentMaterial?.id ||
          selection.accent ||
          selection.accentMaterial;

        const accentName =
          selection.accent?.name ||
          selection.accentMaterial?.name ||
          formatAccentMaterial(accentValue);

        const label =
          channel.name ||
          `${groupLabel} ${index + 1}`;

        return (
          <div
            key={
              channel.id ||
              `${groupLabel}-${index + 1}`
            }
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border:
                "1px solid rgba(212,175,55,.28)",
              background:
                "rgba(212,175,55,.06)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#D4AF37",
                marginBottom: "6px",
              }}
            >
              {label}
            </div>

            <CartLine
              label="Memorial"
              value={memorialName || "None"}
            />

            <CartLine
              label="Mineral"
              value={mineralName || "None"}
            />

            {accentName && (
              <CartLine
                label="Accent"
                value={accentName}
              />
            )}

            {glowName && (
              <CartLine
                label="Glow"
                value={glowName}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatMemorialMaterial(value) {
  if (!value) {
    return "";
  }

  const labels = {
    ashes: "Cremation Ashes",
    cremation: "Cremation Ashes",
    hair: "Hair",
    fur: "Pet Fur",
    horseHair: "Horse Hair",
    sand: "Sand",
    soil: "Soil",
    fabric: "Fabric",
    breastMilk: "Breast Milk",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatAccentMaterial(value) {
  if (!value) {
    return "";
  }

  const labels = {
    goldFoil: "Gold Foil",
    silverFoil: "Silver Foil",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatKeepsakeMaterial(value) {
  const labels = {
    breastMilk: "Breast Milk",
    cremation: "Cremation Ashes",
    ashes: "Cremation Ashes",
    sand: "Sand",
    soil: "Soil",
    mineralBase: "Mineral Base",
  };

  return (
    labels[value] ||
    formatOptionName(value) ||
    "Not selected"
  );
}

function formatOptionName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function CartLine({ label, value }) {
  return (
    <p
      style={{
        margin: "5px 0",
        fontSize: "14px",
        opacity: 0.9,
      }}
    >
      <strong>{label}:</strong>{" "}
      {value || "None"}
    </p>
  );
}

function SummaryLine({
  label,
  value,
  large = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "10px 0",
        fontSize: large ? "22px" : "15px",
        fontWeight: large ? 800 : 500,
        gap: "16px",
      }}
    >
      <span>{label}</span>

      <span style={{ textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}