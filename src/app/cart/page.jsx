"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function normalizeSalePercent(
  value
) {
  const percent =
    Number(value);

  if (
    !Number.isFinite(
      percent
    )
  ) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round(
        percent
      )
    )
  );
}

function getRegularUnitPrice(
  item
) {
  const regularPrice =
    Number(
      item.regularPrice ??
      item.originalPrice ??
      item.price
    );

  if (
    !Number.isFinite(
      regularPrice
    ) ||
    regularPrice < 0
  ) {
    return 0;
  }

  return (
    Math.round(
      regularPrice * 100
    ) / 100
  );
}

function getDiscountedPrice(
  regularPrice,
  enabled,
  percent
) {
  const regularCents =
    Math.max(
      0,
      Math.round(
        (Number(
          regularPrice
        ) || 0) * 100
      )
    );

  if (
    !enabled ||
    percent <= 0
  ) {
    return (
      regularCents / 100
    );
  }

  const discountedCents =
    Math.round(
      (regularCents *
        (100 - percent)) /
      100
    );

  return (
    discountedCents /
    100
  );
}

export default function CartPage() {
  const {
    cart,
    removeItem,
    clearItems,
  } = useCart();

  const [
    customerNote,
    setCustomerNote,
  ] = useState("");

  const [
    saleSettings,
    setSaleSettings,
  ] = useState({
    enabled: false,
    percent: 0,
    name: "",
  });

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  const [
    isCheckingOut,
    setIsCheckingOut,
  ] = useState(false);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 700px)"
      );

    const updateMobile =
      () => {
        setIsMobile(
          mediaQuery.matches
        );
      };

    updateMobile();

    mediaQuery.addEventListener(
      "change",
      updateMobile
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMobile
      );
    };
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    async function loadSaleSettings() {
      try {
        const response =
          await fetch(
            "/api/site-settings/sale",
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          return;
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        const percent =
          normalizeSalePercent(
            data.percent
          );

        setSaleSettings({
          enabled:
            Boolean(
              data.enabled
            ) &&
            percent >
            0,

          percent,

          name:
            String(
              data.name ||
              ""
            ).trim(),
        });
      } catch (
      error
      ) {
        console.error(
          "Could not load current sale settings:",
          error
        );
      }
    }

    loadSaleSettings();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const salePercent =
    normalizeSalePercent(
      saleSettings.percent
    );

  const saleActive =
    Boolean(
      saleSettings.enabled
    ) &&
    salePercent > 0;

  const saleName =
    saleSettings.name ||
    "Site-Wide Sale";

  const regularSubtotal =
    cart.reduce(
      (
        total,
        item
      ) => {
        const quantity =
          Number(
            item.quantity
          ) || 1;

        return (
          total +
          getRegularUnitPrice(
            item
          ) *
          quantity
        );
      },
      0
    );

  const subtotal =
    cart.reduce(
      (
        total,
        item
      ) => {
        const quantity =
          Number(
            item.quantity
          ) || 1;

        const regularPrice =
          getRegularUnitPrice(
            item
          );

        const currentPrice =
          getDiscountedPrice(
            regularPrice,
            saleActive,
            salePercent
          );

        return (
          total +
          currentPrice *
          quantity
        );
      },
      0
    );

  const saleSavings =
    Math.max(
      0,
      regularSubtotal -
      subtotal
    );

  async function handleCheckout() {
    if (isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    try {
      /*
       * Build the checkout cart from the
       * CURRENT site-wide sale.
       *
       * regularPrice is always preserved so
       * the server can independently calculate
       * the authoritative checkout amount.
       */
      const checkoutCart =
        cart.map(
          (item) => {
            const regularPrice =
              getRegularUnitPrice(
                item
              );

            const currentPrice =
              getDiscountedPrice(
                regularPrice,
                saleActive,
                salePercent
              );

            return {
              ...item,

              regularPrice,

              price:
                currentPrice,

              sitewideSale:
                saleActive
                  ? {
                    name:
                      saleName,

                    percent:
                      salePercent,
                  }
                  : null,
            };
          }
        );

      const response =
        await fetch(
          "/api/checkout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  cart:
                    checkoutCart,

                  customerNote,
                }
              ),
          }
        );

      const data =
        await response.json();

      if (data.url) {
        window.location.href =
          data.url;
      } else {
        alert(
          data.error ||
          "Checkout failed."
        );

        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        "Something went wrong starting checkout."
      );

      setIsCheckingOut(false);
    }
  }

  return (
    <main
      style={{
        width:
          "100%",

        maxWidth:
          "1200px",

        margin:
          "0 auto",

        padding:
          isMobile
            ? "28px 14px 40px"
            : "50px 20px",

        boxSizing:
          "border-box",

        overflowX:
          "hidden",
      }}
    >
      <h1
        style={{
          fontSize:
            isMobile
              ? "38px"
              : "44px",

          lineHeight:
            1.08,

          marginBottom:
            isMobile
              ? "22px"
              : "28px",
        }}
      >
        Your Cart
      </h1>

      {cart.length ===
        0 ? (
        <div>
          <p
            style={{
              fontSize:
                "18px",

              opacity:
                0.8,
            }}
          >
            Your cart is
            empty.
          </p>

          <Link
            href="/collections"
            style={{
              color:
                "#D4AF37",

              fontWeight:
                700,
            }}
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              isMobile
                ? "minmax(0, 1fr)"
                : "minmax(0, 1fr) 340px",

            gap:
              isMobile
                ? "18px"
                : "28px",

            width:
              "100%",

            minWidth:
              0,
          }}
        >
          <div
            style={{
              display:
                "grid",

              gap:
                "18px",

              width:
                "100%",

              minWidth:
                0,
            }}
          >
            {cart.map(
              (item) => {
                const collectionId =
                  String(
                    item.collectionId ||
                    ""
                  ).toLowerCase();

                const collectionSlug =
                  String(
                    item.collectionSlug ||
                    ""
                  ).toLowerCase();

                const collectionName =
                  String(
                    item.collectionName ||
                    ""
                  ).toLowerCase();

                const isKeepsakeBranch =
                  collectionId.includes(
                    "keepsake-branch"
                  ) ||
                  collectionSlug.includes(
                    "keepsake-branch"
                  ) ||
                  collectionName.includes(
                    "keepsake branch"
                  );

                const isEvermoreRing =
                  (collectionId.includes(
                    "evermore"
                  ) &&
                    collectionId.includes(
                      "ring"
                    )) ||
                  (collectionSlug.includes(
                    "evermore"
                  ) &&
                    collectionSlug.includes(
                      "ring"
                    )) ||
                  (collectionName.includes(
                    "evermore"
                  ) &&
                    collectionName.includes(
                      "ring"
                    ));

                const isEvermoreBracelet =
                  (collectionId.includes(
                    "evermore"
                  ) &&
                    collectionId.includes(
                      "bracelet"
                    )) ||
                  (collectionSlug.includes(
                    "evermore"
                  ) &&
                    collectionSlug.includes(
                      "bracelet"
                    )) ||
                  (collectionName.includes(
                    "evermore"
                  ) &&
                    collectionName.includes(
                      "bracelet"
                    ));

                const isEvermoreNecklace =
                  (collectionId.includes(
                    "evermore"
                  ) &&
                    collectionId.includes(
                      "necklace"
                    )) ||
                  (collectionSlug.includes(
                    "evermore"
                  ) &&
                    collectionSlug.includes(
                      "necklace"
                    )) ||
                  (collectionName.includes(
                    "evermore"
                  ) &&
                    collectionName.includes(
                      "necklace"
                    ));

                const isRemiStyle =
                  item.bezelSize !==
                  undefined &&
                  item.keepsakeMaterial !==
                  undefined;

                const isKeepsake =
                  item.collectionId ===
                  "keepsake" ||
                  item.collectionSlug ===
                  "keepsake";

                const quantity =
                  Number(
                    item.quantity
                  ) || 1;

                const regularUnitPrice =
                  getRegularUnitPrice(
                    item
                  );

                const currentUnitPrice =
                  getDiscountedPrice(
                    regularUnitPrice,
                    saleActive,
                    salePercent
                  );

                const regularLineTotal =
                  regularUnitPrice *
                  quantity;

                const currentLineTotal =
                  currentUnitPrice *
                  quantity;

                const itemHasSale =
                  saleActive &&
                  currentLineTotal <
                  regularLineTotal;

                return (
                  <div
                    key={
                      item.id
                    }
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        isMobile
                          ? "minmax(0, 1fr)"
                          : "180px minmax(0, 1fr) auto",

                      gap:
                        isMobile
                          ? "16px"
                          : "20px",

                      width:
                        "100%",

                      minWidth:
                        0,

                      boxSizing:
                        "border-box",

                      padding:
                        isMobile
                          ? "14px"
                          : "18px",

                      border:
                        "1px solid rgba(255,255,255,.14)",

                      borderRadius:
                        "18px",

                      background:
                        "rgba(255,255,255,.05)",

                      overflow:
                        "hidden",
                    }}
                  >
                    <img
                      src={
                        item.image ||
                        "/rings/signature/signature-stainless-steel-turquoise-howlite-8mm.png"
                      }
                      alt={
                        item.collectionName ||
                        "Cart item"
                      }
                      style={{
                        width:
                          isMobile
                            ? "100%"
                            : "180px",

                        height:
                          isMobile
                            ? "auto"
                            : "180px",

                        aspectRatio:
                          isMobile
                            ? "1 / 1"
                            : "auto",

                        maxHeight:
                          isMobile
                            ? "320px"
                            : "none",

                        objectFit:
                          "cover",

                        borderRadius:
                          "14px",

                        display:
                          "block",
                      }}
                    />

                    <div
                      style={{
                        minWidth:
                          0,

                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      <h2
                        style={{
                          marginTop:
                            0,

                          marginBottom:
                            10,
                        }}
                      >
                        {item.collectionName ||
                          "Custom Piece"}
                      </h2>

                      {itemHasSale && (
                        <div
                          style={{
                            display:
                              "inline-block",

                            marginBottom:
                              "10px",

                            padding:
                              "5px 8px",

                            borderRadius:
                              "8px",

                            border:
                              "1px solid rgba(212,175,55,.35)",

                            background:
                              "rgba(212,175,55,.08)",

                            color:
                              "#D4AF37",

                            fontSize:
                              "12px",

                            fontWeight:
                              800,
                          }}
                        >
                          {saleName} •{" "}
                          {salePercent}%
                          Off
                        </div>
                      )}

                      {isKeepsakeBranch ? (
                        <KeepsakeBranchCartDetails
                          item={
                            item
                          }
                        />
                      ) : isEvermoreRing ? (
                        <EvermoreRingCartDetails
                          item={
                            item
                          }
                        />
                      ) : isEvermoreBracelet ? (
                        <EvermoreCartDetails
                          item={
                            item
                          }
                        />
                      ) : isEvermoreNecklace ? (
                        <EvermoreNecklaceCartDetails
                          item={
                            item
                          }
                        />
                      ) : isRemiStyle ? (
                        <RemiCartDetails
                          item={
                            item
                          }
                        />
                      ) : isKeepsake ? (
                        <KeepsakeCartDetails
                          item={
                            item
                          }
                        />
                      ) : (
                        <StandardRingCartDetails
                          item={
                            item
                          }
                        />
                      )}
                    </div>

                    <div
                      style={{
                        textAlign:
                          isMobile
                            ? "left"
                            : "right",

                        minWidth:
                          0,
                      }}
                    >
                      {itemHasSale && (
                        <div
                          style={{
                            fontSize:
                              "14px",

                            opacity:
                              0.55,

                            textDecoration:
                              "line-through",

                            marginBottom:
                              "2px",
                          }}
                        >
                          $
                          {regularLineTotal.toFixed(
                            2
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize:
                            "26px",

                          fontWeight:
                            800,

                          color:
                            "#D4AF37",

                          marginBottom:
                            isMobile
                              ? "10px"
                              : "16px",
                        }}
                      >
                        $
                        {currentLineTotal.toFixed(
                          2
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        style={{
                          padding:
                            "8px 12px",

                          borderRadius:
                            "10px",

                          border:
                            "1px solid rgba(255,255,255,.22)",

                          background:
                            "transparent",

                          color:
                            "white",

                          cursor:
                            "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <aside
            style={{
              width:
                "100%",

              minWidth:
                0,

              boxSizing:
                "border-box",

              padding:
                isMobile
                  ? "18px"
                  : "22px",

              border:
                "1px solid rgba(255,255,255,.14)",

              borderRadius:
                "18px",

              background:
                "rgba(255,255,255,.05)",

              height:
                "fit-content",

              position:
                isMobile
                  ? "static"
                  : "sticky",

              top:
                isMobile
                  ? "auto"
                  : "95px",

              overflow:
                "hidden",
            }}
          >
            <h2
              style={{
                marginTop:
                  0,
              }}
            >
              Order Summary
            </h2>

            {saleActive && (
              <div
                style={{
                  marginBottom:
                    "16px",

                  padding:
                    "10px 12px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid rgba(212,175,55,.35)",

                  background:
                    "rgba(212,175,55,.08)",
                }}
              >
                <div
                  style={{
                    color:
                      "#D4AF37",

                    fontWeight:
                      800,

                    fontSize:
                      "14px",
                  }}
                >
                  {saleName}
                </div>

                <div
                  style={{
                    marginTop:
                      "2px",

                    fontSize:
                      "12px",

                    opacity:
                      0.8,
                  }}
                >
                  {salePercent}% off
                  jewelry
                </div>
              </div>
            )}

            <SummaryLine
              label="Items"
              value={cart.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (Number(
                    item.quantity
                  ) || 1),
                0
              )}
            />

            {saleActive && (
              <>
                <SummaryLine
                  label="Regular Subtotal"
                  value={`$${regularSubtotal.toFixed(
                    2
                  )}`}
                />

                <SummaryLine
                  label={`Sale Savings (${salePercent}%)`}
                  value={`-$${saleSavings.toFixed(
                    2
                  )}`}
                  highlight
                />
              </>
            )}

            <SummaryLine
              label="Subtotal"
              value={`$${subtotal.toFixed(
                2
              )}`}
            />

            <SummaryLine
              label="Shipping"
              value="Calculated at checkout"
            />

            <hr
              style={{
                margin:
                  "18px 0",

                opacity:
                  0.2,
              }}
            />

            <SummaryLine
              label="Total"
              value={`$${subtotal.toFixed(
                2
              )}`}
              large
            />

            <div
              style={{
                marginTop:
                  "22px",

                paddingTop:
                  "20px",

                borderTop:
                  "1px solid rgba(255,255,255,.14)",
              }}
            >
              <label
                htmlFor="customer-note"
                style={{
                  display:
                    "block",

                  fontSize:
                    "16px",

                  fontWeight:
                    800,

                  marginBottom:
                    "8px",
                }}
              >
                Additional
                Information

                <span
                  style={{
                    marginLeft:
                      "6px",

                    fontSize:
                      "13px",

                    fontWeight:
                      500,

                    opacity:
                      0.65,
                  }}
                >
                  Optional
                </span>
              </label>

              <p
                style={{
                  margin:
                    "0 0 10px",

                  fontSize:
                    "13px",

                  lineHeight:
                    1.5,

                  opacity:
                    0.76,
                }}
              >
                Is there anything you would like me to know about
                your order? You may include color preferences,
                placement requests, gift details, or anything else
                that may help while creating your piece.
              </p>

              <textarea
                id="customer-note"
                value={
                  customerNote
                }
                onChange={(
                  event
                ) =>
                  setCustomerNote(
                    event.target.value.slice(
                      0,
                      1000
                    )
                  )
                }
                maxLength={
                  1000
                }
                rows={
                  6
                }
                placeholder="Example: Please keep the hair visible and use more blue than green."
                style={{
                  width:
                    "100%",

                  boxSizing:
                    "border-box",

                  resize:
                    "vertical",

                  minHeight:
                    "130px",

                  padding:
                    "12px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid rgba(255,255,255,.2)",

                  background:
                    "rgba(0,0,0,.28)",

                  color:
                    "white",

                  font:
                    "inherit",

                  lineHeight:
                    1.5,

                  outline:
                    "none",

                  display:
                    "block",
                }}
              />

              <div
                style={{
                  marginTop:
                    "6px",

                  textAlign:
                    "right",

                  fontSize:
                    "12px",

                  opacity:
                    0.6,
                }}
              >
                {
                  customerNote.length
                }
                /1000
              </div>
            </div>

            <button
              type="button"
              disabled={
                isCheckingOut
              }
              onClick={
                handleCheckout
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "18px",

                padding:
                  "14px",

                borderRadius:
                  "12px",

                border:
                  "none",

                background:
                  "linear-gradient(135deg, rgb(233, 192, 84), rgb(184, 134, 11))",

                color:
                  "#111",

                fontWeight:
                  800,

                cursor:
                  isCheckingOut
                    ? "wait"
                    : "pointer",
              }}
            >
              {isCheckingOut
                ? "Starting Checkout..."
                : "Secure Checkout"}
            </button>

            <Link
              href="/collections"
              style={{
                display:
                  "block",

                textAlign:
                  "center",

                marginTop:
                  "14px",

                color:
                  "#D4AF37",

                textDecoration:
                  "none",

                fontWeight:
                  700,
              }}
            >
              Continue Shopping
            </Link>

            <button
              type="button"
              onClick={
                clearItems
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "12px",

                padding:
                  "10px",

                borderRadius:
                  "10px",

                border:
                  "1px solid rgba(255,255,255,.18)",

                background:
                  "transparent",

                color:
                  "white",

                cursor:
                  "pointer",
              }}
            >
              Clear Cart
            </button>

            <p
              style={{
                fontSize:
                  "12px",

                opacity:
                  0.7,

                marginTop:
                  "16px",
              }}
            >
              Each piece is handcrafted. Memorial material
              shipping instructions will be provided after
              checkout.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function KeepsakeBranchCartDetails({
  item,
}) {
  const collectionName =
    String(
      item.collectionName ||
      ""
    ).toLowerCase();

  const isNecklace =
    item.productType ===
    "necklace" ||
    collectionName.includes(
      "necklace"
    );

  const metalFinish =
    item.finish ||
    item.core?.finish ||
    item.core?.color ||
    "Not selected";

  return (
    <>
      <CartLine
        label="Metal Finish"
        value={
          metalFinish
        }
      />

      <CartLine
        label="Keepsake Material"
        value={formatKeepsakeMaterial(
          item.keepsakeMaterial
        )}
      />

      <CartLine
        label={
          isNecklace
            ? "Necklace Length"
            : "Ring Size"
        }
        value={
          item.size ||
          (isNecklace
            ? '16" with 2" extender'
            : "Adjustable")
        }
      />

      {item.birthstone && (
        <CartLine
          label="Birthstone"
          value={`${item.birthstone.month} — ${item.birthstone.stone}`}
        />
      )}

      {item.engraving && (
        <CartLine
          label="Engraving"
          value={
            item.engraving.text ||
            item.engraving.name ||
            "Yes"
          }
        />
      )}

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes"
        />
      )}

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
          />
        )}
    </>
  );
}

function RemiCartDetails({
  item,
}) {
  const keepsakeBase =
    item.keepsakeMaterialName ||
    formatKeepsakeMaterial(
      item.keepsakeMaterial
    ) ||
    "Not selected";

  const mineralName =
    item.mineral?.name ||
    item.naturalMineral ||
    item.naturalMineralName ||
    "";

  const glowName =
    item.glow?.name ||
    item.glowName ||
    (typeof item.glow ===
      "string"
      ? item.glow
      : "") ||
    "No Glow";

  const decorativeAccent =
    item.decorativeAccentName ||
    formatOptionName(
      item.decorativeAccent
    ) ||
    "None";

  const accentStyle =
    item.accentStyleName ||
    formatOptionName(
      item.accentStyle
    ) ||
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

      {item.productType !==
        "necklace" && (
          <CartLine
            label="Ring Size"
            value={
              item.size ||
              "Not selected"
            }
          />
        )}

      {item.collectionSlug === "legacy-cross" ? (
        <CartLine
          label="Pendant Size"
          value={item.pendantSize || "7 × 5 mm"}
        />
      ) : (
        <CartLine
          label="Bezel Size"
          value={
            item.bezelSizeName ||
            item.bezelSize ||
            "Not selected"
          }
        />
      )}

      {item.productType ===
        "necklace" && (
          <CartLine
            label="Chain"
            value={
              item.chain ||
              "Pendant Only — No Chain"
            }
          />
        )}

      <CartLine
        label="Keepsake Base"
        value={
          keepsakeBase
        }
      />

      <CartLine
        label="Hair Placement"
        value={
          item.hairPlacementName ||
          formatOptionName(
            item.hairPlacement
          ) ||
          "None"
        }
      />

      {item.keepsakeMaterial !==
        "mineralBase" &&
        mineralName && (
          <CartLine
            label="Natural Mineral"
            value={
              mineralName
            }
          />
        )}

      <CartLine
        label="Decorative Accent"
        value={
          decorativeAccent
        }
      />

      {item.decorativeAccent !==
        "none" &&
        accentStyle && (
          <CartLine
            label="Accent Style"
            value={
              accentStyle
            }
          />
        )}

      <CartLine
        label="Glow Effect"
        value={
          glowName
        }
      />

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes (+$30)"
        />
      )}

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
          />
        )}
    </>
  );
}

function EvermoreRingCartDetails({
  item,
}) {
  const metalFinish =
    item.finish ||
    item.core?.finish ||
    item.core?.color ||
    "Not selected";

  return (
    <>
      <CartLine
        label="Material"
        value={
          item.material ||
          "Not selected"
        }
      />

      <CartLine
        label="Metal Finish"
        value={
          metalFinish
        }
      />

      <CartLine
        label="Ring Size"
        value={
          item.size ||
          "Not selected"
        }
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
            ? `${item.birthstone.month} — ${item.birthstone.stone}`
            : "Not selected"
        }
      />

      {item.engraving && (
        <CartLine
          label="Engraving"
          value={
            item.engraving.name ||
            "Yes"
          }
        />
      )}

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes"
        />
      )}

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
          />
        )}
    </>
  );
}

function EvermoreCartDetails({
  item,
}) {
  const metalFinish =
    item.finish ||
    item.core?.finish ||
    item.core?.color ||
    "Not selected";

  const braceletLength =
    item.braceletLength ||
    item.length ||
    item.size ||
    "Not selected";

  return (
    <>
      <CartLine
        label="Material"
        value={
          item.material ||
          "Not selected"
        }
      />

      <CartLine
        label="Metal Finish"
        value={
          metalFinish
        }
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
            ? `${item.birthstone.month} — ${item.birthstone.stone}`
            : "Not selected"
        }
      />

      <CartLine
        label="Bracelet Length"
        value={
          braceletLength
        }
      />

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
          />
        )}
    </>
  );
}

function EvermoreNecklaceCartDetails({
  item,
}) {
  const metalFinish =
    item.finish ||
    item.core?.finish ||
    item.core?.color ||
    "Not selected";

  const necklaceLength =
    item.necklaceLength ||
    item.length ||
    item.size ||
    "Not selected";

  return (
    <>
      <CartLine
        label="Material"
        value={
          item.material ||
          "Not selected"
        }
      />

      <CartLine
        label="Metal Finish"
        value={
          metalFinish
        }
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
            ? `${item.birthstone.month} — ${item.birthstone.stone}`
            : "Not selected"
        }
      />

      <CartLine
        label="Necklace Length"
        value={
          necklaceLength
        }
      />

      {item.specialRequest && (
        <CartLine
          label="⭐ Special Request"
          value="Yes"
        />
      )}

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
          />
        )}
    </>
  );
}

function KeepsakeCartDetails({
  item,
}) {
  return (
    <>
      <CartLine
        label="Material"
        value={
          item.material ||
          "Not selected"
        }
      />

      <CartLine
        label="Profile"
        value="Slim"
      />

      <CartLine
        label="Size"
        value={
          item.size ||
          "Not selected"
        }
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

function StandardRingCartDetails({
  item,
}) {
  const style =
    `${item.core?.color
      ? `${item.core.color} `
      : ""
      }${item.core?.edge ||
      item.core?.finish ||
      ""
      }`.trim() ||
    "Not selected";

  const channelDefinitions =
    item.design?.channels ||
    [];

  const hasChannelSelections =
    channelDefinitions.length >
    0 &&
    item.channels &&
    Object.keys(
      item.channels
    ).length > 0;

  const globalGlowName =
    item.glow?.name ||
    (typeof item.glow ===
      "string"
      ? formatOptionName(
        item.glow
      )
      : "None");

  return (
    <>
      <CartLine
        label="Material"
        value={
          item.material ||
          "Not selected"
        }
      />

      <CartLine
        label="Style"
        value={
          style
        }
      />

      <CartLine
        label="Width"
        value={
          item.width?.width !=
            null
            ? `${item.width.width}mm`
            : typeof item.width ===
              "number"
              ? `${item.width}mm`
              : "Not selected"
        }
      />

      {Number(
        item.channelWidth ||
        item.width
          ?.channel ||
        0
      ) > 0 && (
          <CartLine
            label="Channel Width"
            value={`${Number(
              item.channelWidth ||
              item.width
                ?.channel
            )}mm`}
          />
        )}

      <CartLine
        label="Size"
        value={
          item.size ||
          "Not selected"
        }
      />

      <CartLine
        label="Design"
        value={
          item.design?.name ||
          "Not selected"
        }
      />

      {hasChannelSelections ? (
        <ChannelCartDetails
          channels={
            item.channels
          }
          channelDefinitions={
            channelDefinitions
          }
          groupLabel={
            item.collectionId ===
              "quad"
              ? "Section"
              : "Channel"
          }
        />
      ) : (
        <>
          <CartLine
            label="Memorial Material"
            value={
              item.memorialMaterials
                ?.length
                ? item.memorialMaterials
                  .map(
                    (
                      value
                    ) =>
                      formatMemorialMaterial(
                        value
                      )
                  )
                  .join(
                    ", "
                  )
                : "None"
            }
          />

          <CartLine
            label="Minerals"
            value={
              item.minerals
                ?.length
                ? item.minerals
                  .map(
                    (
                      mineral
                    ) =>
                      mineral
                        ?.name ||
                      formatOptionName(
                        mineral
                          ?.id
                      ) ||
                      formatOptionName(
                        mineral
                      )
                  )
                  .filter(
                    Boolean
                  )
                  .join(
                    ", "
                  )
                : "None"
            }
          />
        </>
      )}

      <CartLine
        label="Accent Materials"
        value={
          item.accentMaterials
            ?.length
            ? item.accentMaterials
              .map(
                (
                  value
                ) =>
                  formatAccentMaterial(
                    value?.id ||
                    value
                  )
              )
              .join(
                ", "
              )
            : "None"
        }
      />

      {item.glow && (
        <CartLine
          label="Glow"
          value={
            globalGlowName
          }
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
                : item.engravingText ||
                "Yes"
            }
          />

          {item.engravingType !==
            "customSignature" && (
              <CartLine
                label="Font"
                value={
                  item.engravingFont
                    ?.name ||
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

      {(item.quantity ||
        1) >
        1 && (
          <CartLine
            label="Quantity"
            value={
              item.quantity
            }
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
        marginTop:
          "10px",

        marginBottom:
          "10px",

        display:
          "grid",

        gap:
          "10px",
      }}
    >
      {channelDefinitions.map(
        (
          channel,
          index
        ) => {
          const selection =
            channels?.[
            channel.id
            ] || {};

          const memorialValue =
            selection.memorial
              ?.id ||
            selection.memorial;

          const memorialName =
            formatMemorialMaterial(
              memorialValue
            );

          const mineralValue =
            selection.mineral
              ?.id ||
            selection.mineral;

          const mineralName =
            selection.mineral
              ?.name ||
            formatOptionName(
              mineralValue
            );

          const glowValue =
            selection.glow
              ?.id ||
            selection.glow;

          const glowName =
            selection.glow
              ?.name ||
            formatOptionName(
              glowValue
            );

          const accentValue =
            selection.accent
              ?.id ||
            selection
              .accentMaterial
              ?.id ||
            selection.accent ||
            selection.accentMaterial;

          const accentName =
            selection.accent
              ?.name ||
            selection
              .accentMaterial
              ?.name ||
            formatAccentMaterial(
              accentValue
            );

          const label =
            channel.name ||
            `${groupLabel} ${index + 1
            }`;

          return (
            <div
              key={
                channel.id ||
                `${groupLabel}-${index + 1}`
              }
              style={{
                padding:
                  "10px 12px",

                borderRadius:
                  "10px",

                border:
                  "1px solid rgba(212,175,55,.28)",

                background:
                  "rgba(212,175,55,.06)",
              }}
            >
              <div
                style={{
                  fontSize:
                    "14px",

                  fontWeight:
                    800,

                  color:
                    "#D4AF37",

                  marginBottom:
                    "6px",
                }}
              >
                {label}
              </div>

              <CartLine
                label="Memorial"
                value={
                  memorialName ||
                  "None"
                }
              />

              <CartLine
                label="Mineral"
                value={
                  mineralName ||
                  "None"
                }
              />

              {accentName && (
                <CartLine
                  label="Accent"
                  value={
                    accentName
                  }
                />
              )}

              {glowName && (
                <CartLine
                  label="Glow"
                  value={
                    glowName
                  }
                />
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

function formatMemorialMaterial(
  value
) {
  if (!value) {
    return "";
  }

  const labels = {
    ashes:
      "Cremation Ashes",

    cremation:
      "Cremation Ashes",

    hair:
      "Hair",

    fur:
      "Pet Fur",

    horseHair:
      "Horse Hair",

    sand:
      "Sand",

    soil:
      "Soil",

    fabric:
      "Fabric",

    breastMilk:
      "Breast Milk",
  };

  return (
    labels[value] ||
    formatOptionName(
      value
    )
  );
}

function formatAccentMaterial(
  value
) {
  if (!value) {
    return "";
  }

  const labels = {
    goldFoil:
      "Gold Foil",

    silverFoil:
      "Silver Foil",
  };

  return (
    labels[value] ||
    formatOptionName(
      value
    )
  );
}

function formatKeepsakeMaterial(
  value
) {
  const labels = {
    breastMilk:
      "Breast Milk",

    cremation:
      "Cremation Ashes",

    ashes:
      "Cremation Ashes",

    sand:
      "Sand",

    soil:
      "Soil",

    mineralBase:
      "Mineral Base",

    specialRequest:
      "Special Request",
  };

  return (
    labels[value] ||
    formatOptionName(
      value
    ) ||
    "Not selected"
  );
}

function formatOptionName(
  value
) {
  if (
    !value ||
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /[-_]/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function CartLine({
  label,
  value,
}) {
  return (
    <p
      style={{
        margin:
          "5px 0",

        fontSize:
          "14px",

        lineHeight:
          1.45,

        opacity:
          0.9,

        overflowWrap:
          "anywhere",

        wordBreak:
          "break-word",
      }}
    >
      <strong>
        {label}:
      </strong>{" "}

      {value ||
        "None"}
    </p>
  );
}

function SummaryLine({
  label,
  value,
  large = false,
  highlight = false,
}) {
  return (
    <div
      style={{
        display:
          "flex",

        justifyContent:
          "space-between",

        alignItems:
          "flex-start",

        margin:
          "10px 0",

        fontSize:
          large
            ? "22px"
            : "15px",

        fontWeight:
          large
            ? 800
            : 500,

        gap:
          "16px",

        minWidth:
          0,

        color:
          highlight
            ? "#D4AF37"
            : "inherit",
      }}
    >
      <span>
        {label}
      </span>

      <span
        style={{
          textAlign:
            "right",

          minWidth:
            0,

          maxWidth:
            "58%",

          overflowWrap:
            "anywhere",

          wordBreak:
            "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}