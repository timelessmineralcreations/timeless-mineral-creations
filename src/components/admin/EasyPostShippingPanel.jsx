"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EasyPostShippingPanel({
  orderId,
  initialCarrier = "",
  initialTrackingNumber = "",
  initialTrackingStatus = "",
  initialLabelUrl = "",
  initialShippedAt = null,
}) {
  const router = useRouter();

  const [weightOz, setWeightOz] =
    useState("");

  const [length, setLength] =
    useState("11");

  const [width, setWidth] =
    useState("8.5");

  const [height, setHeight] =
    useState("1");

  const [loading, setLoading] =
    useState(false);

  const [buying, setBuying] =
    useState(false);

  const [error, setError] =
    useState("");

  const [shipmentId, setShipmentId] =
    useState("");

  const [shipmentMode, setShipmentMode] =
    useState(null);

  const [rates, setRates] =
    useState([]);

  const [purchasedLabel, setPurchasedLabel] =
    useState(() => {
      if (
        !initialLabelUrl &&
        !initialTrackingNumber
      ) {
        return null;
      }

      return {
        trackingNumber:
          initialTrackingNumber,

        trackingStatus:
          initialTrackingStatus,

        labelUrl:
          initialLabelUrl,

        carrier:
          initialCarrier || "USPS",

        service:
          "Ground Advantage",

        shippedAt:
          initialShippedAt,

        rate:
          null,

        testMode:
          false,

        saved:
          true,
      };
    });

  function clearRateResults() {
    setRates([]);
    setShipmentId("");
    setShipmentMode(null);
    setError("");
  }

  async function getRates() {
    const numericWeight =
      Number(weightOz);

    const numericLength =
      Number(length);

    const numericWidth =
      Number(width);

    const numericHeight =
      Number(height);

    if (
      !Number.isFinite(numericWeight) ||
      numericWeight <= 0
    ) {
      setError(
        "Enter the exact packaged weight in ounces."
      );

      return;
    }

    if (
      !Number.isFinite(numericLength) ||
      !Number.isFinite(numericWidth) ||
      !Number.isFinite(numericHeight) ||
      numericLength <= 0 ||
      numericWidth <= 0 ||
      numericHeight <= 0
    ) {
      setError(
        "Enter valid package dimensions greater than 0 inches."
      );

      return;
    }

    setLoading(true);
    setError("");
    setRates([]);
    setShipmentId("");
    setShipmentMode(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/shipping/rates`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            weightOz:
              numericWeight,

            length:
              numericLength,

            width:
              numericWidth,

            height:
              numericHeight,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to retrieve shipping rates."
        );
      }

      setShipmentId(
        data.shipmentId || ""
      );

      setShipmentMode(
        data.mode === "production"
          ? "production"
          : "test"
      );

      setRates(
        Array.isArray(data.rates)
          ? data.rates
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to retrieve shipping rates."
      );
    } finally {
      setLoading(false);
    }
  }

  async function buyLabel(rate) {
    if (
      !shipmentId ||
      !rate?.id
    ) {
      setError(
        "Get a fresh USPS rate before purchasing a label."
      );

      return;
    }

    setBuying(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/shipping/buy`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            shipmentId,
            rateId:
              rate.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to purchase shipping label."
        );
      }

      setPurchasedLabel({
        trackingNumber:
          data.trackingNumber || "",

        trackingStatus:
          data.testMode
            ? ""
            : "Pre-Transit",

        labelUrl:
          data.labelUrl || "",

        rate:
          data.rate ?? null,

        carrier:
          data.carrier || "USPS",

        service:
          data.service ||
          "Ground Advantage",

        shippedAt:
          data.orderUpdated
            ? new Date().toISOString()
            : null,

        testMode:
          Boolean(data.testMode),

        saved:
          Boolean(
            data.orderUpdated
          ),
      });

      setRates([]);
      setShipmentId("");
      setShipmentMode(null);

      if (data.orderUpdated) {
        router.refresh();
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to purchase shipping label."
      );
    } finally {
      setBuying(false);
    }
  }

  const hasPermanentLabel =
    purchasedLabel &&
    !purchasedLabel.testMode;

  const isTestRate =
    shipmentMode === "test";

  const isProductionRate =
    shipmentMode === "production";

  return (
    <div
      style={{
        marginTop: "24px",
        marginBottom: "24px",
        padding: "22px",
        border:
          "1px solid rgba(212,175,55,0.35)",
        borderRadius: "14px",
        background:
          "rgba(212,175,55,0.05)",
      }}
    >
      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#f5f5f5",
          }}
        >
          EasyPost Shipping Label
        </div>

        {!purchasedLabel ? (
          <div
            style={{
              marginTop: "6px",
              color: "#a3a3a3",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            Enter the exact finished
            package weight and dimensions
            before getting the USPS rate.
          </div>
        ) : null}
      </div>

      {!purchasedLabel ? (
        <>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#d4d4d4",
              fontWeight: 700,
            }}
          >
            Exact Packaged Weight
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#111",
                border:
                  "1px solid #444",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={weightOz}
                onChange={(event) => {
                  setWeightOz(
                    event.target.value
                  );

                  clearRateResults();
                }}
                placeholder="2.70"
                style={{
                  width: "130px",
                  padding:
                    "12px 14px",
                  border: "none",
                  outline: "none",
                  background:
                    "transparent",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              />

              <span
                style={{
                  padding:
                    "0 14px 0 6px",
                  color: "#a3a3a3",
                  fontWeight: 700,
                }}
              >
                oz
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#8f8f8f",
              fontSize: "0.82rem",
            }}
          >
            Weigh the complete finished
            package exactly as it will be
            mailed.
          </div>

          <div
            style={{
              marginTop: "22px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                marginBottom:
                  "10px",
                color: "#d4d4d4",
                fontWeight: 700,
              }}
            >
              Package Dimensions
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <DimensionField
                label="Length"
                value={length}
                onChange={(value) => {
                  setLength(value);
                  clearRateResults();
                }}
              />

              <DimensionField
                label="Width"
                value={width}
                onChange={(value) => {
                  setWidth(value);
                  clearRateResults();
                }}
              />

              <DimensionField
                label="Height"
                value={height}
                onChange={(value) => {
                  setHeight(value);
                  clearRateResults();
                }}
              />
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#8f8f8f",
                fontSize: "0.82rem",
              }}
            >
              Default package size is
              11 × 8.5 × 1 in. Change
              these only when using a
              different mailer or box.
            </div>
          </div>

          <button
            type="button"
            onClick={getRates}
            disabled={
              loading || buying
            }
            style={{
              padding:
                "12px 18px",
              borderRadius:
                "10px",
              border: "none",
              background:
                loading || buying
                  ? "#555"
                  : "linear-gradient(135deg,#E9C054,#B8860B)",
              color: "#111",
              fontWeight: 800,
              cursor:
                loading || buying
                  ? "wait"
                  : "pointer",
            }}
          >
            {loading
              ? "Getting Rate..."
              : "Get USPS Rate"}
          </button>
        </>
      ) : null}

      {error ? (
        <div
          style={{
            marginTop: "16px",
            padding:
              "12px 14px",
            borderRadius: "10px",
            background:
              "rgba(239,68,68,0.12)",
            border:
              "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      ) : null}

      {rates.length > 0 ? (
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gap: "12px",
          }}
        >
          {isTestRate ? (
            <div
              style={{
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "rgba(59,130,246,0.12)",
                border:
                  "1px solid rgba(59,130,246,0.4)",
                color: "#93c5fd",
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              TEST MODE — No real postage
              will be charged and the
              label will be marked VOID.
            </div>
          ) : null}

          {isProductionRate ? (
            <div
              style={{
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "rgba(34,197,94,0.10)",
                border:
                  "1px solid rgba(34,197,94,0.4)",
                color: "#86efac",
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              PRODUCTION MODE — Purchasing
              this label will charge real
              postage and mark the order
              as shipped.
            </div>
          ) : null}

          <div
            style={{
              color: "#a3a3a3",
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform:
                "uppercase",
              letterSpacing:
                ".05em",
            }}
          >
            USPS Ground Advantage
          </div>

          {rates.map((rate) => (
            <div
              key={rate.id}
              style={{
                padding: "16px",
                borderRadius:
                  "12px",
                border:
                  "1px solid #3f3f3f",
                background:
                  "#161616",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  {rate.carrier}{" "}
                  Ground Advantage
                </div>

                {rate.deliveryDays ? (
                  <div
                    style={{
                      marginTop:
                        "4px",
                      color:
                        "#a3a3a3",
                      fontSize:
                        "0.85rem",
                    }}
                  >
                    Estimated{" "}
                    {
                      rate.deliveryDays
                    }{" "}
                    day
                    {rate.deliveryDays ===
                    1
                      ? ""
                      : "s"}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "1.25rem",
                    fontWeight: 900,
                    color: "#E9C054",
                  }}
                >
                  $
                  {Number(
                    rate.rate
                  ).toFixed(2)}
                </div>

                <button
                  type="button"
                  disabled={buying}
                  onClick={() =>
                    buyLabel(rate)
                  }
                  style={{
                    padding:
                      "11px 16px",
                    borderRadius:
                      "10px",
                    border: "none",
                    background:
                      buying
                        ? "#555"
                        : isTestRate
                        ? "#60a5fa"
                        : "#22c55e",
                    color:
                      "#08120b",
                    fontWeight: 900,
                    cursor: buying
                      ? "wait"
                      : "pointer",
                  }}
                >
                  {buying
                    ? "Creating Label..."
                    : isTestRate
                    ? "Buy Test Label"
                    : "Buy Shipping Label"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {purchasedLabel ? (
        <div
          style={{
            marginTop: "18px",
            padding: "18px",
            borderRadius: "12px",
            background:
              purchasedLabel.testMode
                ? "rgba(59,130,246,0.09)"
                : "rgba(34,197,94,0.09)",
            border:
              purchasedLabel.testMode
                ? "1px solid rgba(59,130,246,0.35)"
                : "1px solid rgba(34,197,94,0.35)",
          }}
        >
          <div
            style={{
              color:
                purchasedLabel.testMode
                  ? "#93c5fd"
                  : "#86efac",
              fontWeight: 900,
              fontSize: "1.05rem",
            }}
          >
            {purchasedLabel.testMode
              ? "Test Label Created"
              : "Shipping Label Purchased"}
          </div>

          {hasPermanentLabel ? (
            <div
              style={{
                marginTop: "6px",
                color: "#a3a3a3",
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              This label is saved with
              the order and can be
              reprinted later.
            </div>
          ) : (
            <div
              style={{
                marginTop: "6px",
                color: "#93c5fd",
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              Test labels are not saved
              to the real order.
            </div>
          )}

          <div
            style={{
              marginTop: "12px",
              color: "#d4d4d4",
              lineHeight: 1.7,
            }}
          >
            <div>
              <strong>
                Carrier:
              </strong>{" "}
              {purchasedLabel.carrier ||
                "USPS"}
            </div>

            <div>
              <strong>
                Service:
              </strong>{" "}
              {purchasedLabel.service ||
                "Ground Advantage"}
            </div>

            {purchasedLabel.rate !==
            null ? (
              <div>
                <strong>
                  Postage:
                </strong>{" "}
                $
                {Number(
                  purchasedLabel.rate
                ).toFixed(2)}
              </div>
            ) : null}

            {purchasedLabel.trackingNumber ? (
              <div>
                <strong>
                  Tracking:
                </strong>{" "}
                {
                  purchasedLabel.trackingNumber
                }
              </div>
            ) : null}

            {purchasedLabel.trackingStatus ? (
              <div>
                <strong>
                  Tracking Status:
                </strong>{" "}
                {
                  purchasedLabel.trackingStatus
                }
              </div>
            ) : null}

            {purchasedLabel.shippedAt ? (
              <div>
                <strong>
                  Shipped:
                </strong>{" "}
                {formatDateTime(
                  purchasedLabel.shippedAt
                )}
              </div>
            ) : null}
          </div>

          {purchasedLabel.labelUrl ? (
            <a
              href={
                purchasedLabel.labelUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:
                  "inline-block",
                marginTop: "16px",
                padding:
                  "12px 18px",
                borderRadius:
                  "10px",
                background:
                  "linear-gradient(135deg,#E9C054,#B8860B)",
                color: "#111",
                textDecoration:
                  "none",
                fontWeight: 900,
              }}
            >
              {purchasedLabel.testMode
                ? "Open / Print Test Label"
                : "Open / Reprint Label"}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DimensionField({
  label,
  value,
  onChange,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "5px",
        color: "#a3a3a3",
        fontSize: "0.82rem",
      }}
    >
      {label}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#111",
          border:
            "1px solid #444",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          style={{
            width: "85px",
            padding: "10px",
            border: "none",
            outline: "none",
            background:
              "transparent",
            color: "#fff",
          }}
        />

        <span
          style={{
            paddingRight: "10px",
            color: "#777",
          }}
        >
          in
        </span>
      </div>
    </label>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(new Date(value));
  } catch {
    return "";
  }
}