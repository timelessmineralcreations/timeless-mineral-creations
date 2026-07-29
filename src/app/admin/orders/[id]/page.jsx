import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import IncomingPackagePanel from "@/components/admin/IncomingPackagePanel";
import InternalNotesEditor from "@/components/admin/InternalNotesEditor";
import OutgoingShipmentPanel from "@/components/admin/OutgoingShipmentPanel";
import ProductionWorkspace from "@/components/admin/ProductionWorkspace";
import OrderTimeline from "@/components/admin/OrderTimeline";
import PaymentActions from "@/components/admin/PaymentActions";
import CancelOrderActions from "@/components/admin/CancelOrderActions";
import ProductionProgressCard from "@/components/admin/ProductionProgressCard";

export const dynamic = "force-dynamic";



function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortenOrderId(id) {
  return `ORD-${id.slice(-8).toUpperCase()}`;
}

function displayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function parseConfiguration(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getStatusStyle(status) {
  const normalizedStatus = status?.toLowerCase() || "";

  if (
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("shipped")
  ) {
    return {
      background: "rgba(34, 197, 94, 0.16)",
      color: "#86efac",
      border: "1px solid rgba(34, 197, 94, 0.35)",
    };
  }

  if (normalizedStatus.includes("production")) {
    return {
      background: "rgba(59, 130, 246, 0.16)",
      color: "#93c5fd",
      border: "1px solid rgba(59, 130, 246, 0.35)",
    };
  }

  if (normalizedStatus.includes("received")) {
    return {
      background: "rgba(168, 85, 247, 0.16)",
      color: "#d8b4fe",
      border: "1px solid rgba(168, 85, 247, 0.35)",
    };
  }

  return {
    background: "rgba(234, 179, 8, 0.16)",
    color: "#fde68a",
    border: "1px solid rgba(234, 179, 8, 0.35)",
  };
}

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
  items: true,

  refunds: {
    orderBy: {
      createdAt: "desc",
    },
  },
},
  });

  if (!order) {
    notFound();
  }

  const statusStyle = getStatusStyle(order.status);

  const shippingAddress = [
    order.shippingAddress1,
    order.shippingAddress2,
    [order.shippingCity, order.shippingState]
      .filter(Boolean)
      .join(", "),
    order.shippingPostal,
    order.shippingCountry,
  ].filter(Boolean);

  return (
    <div
      style={{
        padding: "40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href="/admin/orders"
            style={{
              color: "#f7c948",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "14px",
              fontWeight: 700,
            }}
          >
            ← Back to Orders
          </Link>

          <h1
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: "2rem",
            }}
          >
            {shortenOrderId(order.id)}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
            }}
          >
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(34, 197, 94, 0.16)",
              color: "#86efac",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            Payment: {order.paymentStatus}
          </span>

          <span
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              fontWeight: 700,
              ...statusStyle,
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <section style={card}>
          <h2 style={sectionTitle}>Customer</h2>

          <DetailRow
            label="Name"
            value={
              order.customerName ||
              order.shippingName ||
              "Not provided"
            }
          />

          <DetailRow
            label="Email"
            value={displayValue(order.customerEmail)}
          />

          <DetailRow
            label="Phone"
            value={displayValue(order.customerPhone)}
          />
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Shipping Address</h2>

          <div
            style={{
              color: "#e5e5e5",
              lineHeight: 1.7,
            }}
          >
            <div>{displayValue(order.shippingName)}</div>

            {shippingAddress.length > 0 ? (
              shippingAddress.map((line) => (
                <div key={line}>{line}</div>
              ))
            ) : (
              <div style={{ color: "#a3a3a3" }}>
                No shipping address saved
              </div>
            )}
          </div>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Payment Summary</h2>

          <DetailRow
            label="Subtotal"
            value={
              order.subtotal === null
                ? "Not provided"
                : formatCurrency(order.subtotal)
            }
          />

          <DetailRow
            label="Shipping"
            value={
              order.shippingCost === null
                ? "Not provided"
                : formatCurrency(order.shippingCost)
            }
          />

          <DetailRow
            label="Tax"
            value={
              order.taxAmount === null
                ? "Not provided"
                : formatCurrency(order.taxAmount)
            }
          />

          <div
            style={{
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              fontSize: "1.08rem",
              fontWeight: 800,
            }}
          >
            <span>Total</span>
            <span>{formatCurrency(order.totalPrice)}</span>
          </div>
        </section>
      </div>

      <section
        style={{
          ...card,
          marginBottom: "24px",
        }}
      >
        <h2 style={sectionTitle}>Order Items</h2>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {order.items.map((item, index) => {
            const configuration = parseConfiguration(
              item.configurationJson
            );

            return (
              <article
                key={item.id}
                style={{
                  padding: "20px",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  background: "#171717",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: "6px",
                        fontSize: "1.2rem",
                      }}
                    >
                      Item {index + 1}:{" "}
                      {item.productName ||
                        item.collectionName ||
                        "Custom Memorial Jewelry"}
                    </h3>

                    <div
                      style={{
                        color: "#a3a3a3",
                      }}
                    >
                      Quantity: {item.quantity}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {formatCurrency(item.unitPrice)}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px 24px",
                  }}
                >
                  <DetailRow
                    label="Collection"
                    value={displayValue(item.collectionName)}
                  />

                  <DetailRow
                    label="Product Type"
                    value={displayValue(item.productType)}
                  />

                  <DetailRow
                    label="Material"
                    value={displayValue(item.material)}
                  />

                  <DetailRow
                    label="Core"
                    value={displayValue(item.core)}
                  />

                  <DetailRow
                    label="Style"
                    value={displayValue(item.style)}
                  />

                  <DetailRow
                    label="Width"
                    value={
                      item.width
                        ? `${item.width}mm`
                        : "Not provided"
                    }
                  />

                  <DetailRow
                    label="Size"
                    value={displayValue(item.size)}
                  />

                  <DetailRow
                    label="Design"
                    value={displayValue(item.design)}
                  />

                  <DetailRow
                    label="Memorial Materials"
                    value={displayValue(item.memorialMaterials)}
                  />

                  <DetailRow
                    label="Minerals"
                    value={displayValue(item.minerals)}
                  />

                  <DetailRow
                    label="Accent Materials"
                    value={displayValue(item.accentMaterials)}
                  />

                  <DetailRow
                    label="Glow"
                    value={displayValue(item.glow)}
                  />

                  <DetailRow
                    label="Engraving"
                    value={displayValue(item.engraving, "None")}
                  />
                </div>

                {configuration?.channels ? (
                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "18px",
                      borderTop: "1px solid #333",
                    }}
                  >
                    <h4
                      style={{
                        marginTop: 0,
                        marginBottom: "10px",
                      }}
                    >
                      Channel Details
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: "#d4d4d4",
                        lineHeight: 1.6,
                      }}
                    >
                      {configuration.channels}
                    </p>
                  </div>
                ) : null}

                {configuration?.itemDescription ? (
                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "18px",
                      borderTop: "1px solid #333",
                    }}
                  >
                    <h4
                      style={{
                        marginTop: 0,
                        marginBottom: "10px",
                      }}
                    >
                      Full Configuration
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: "#d4d4d4",
                        lineHeight: 1.7,
                      }}
                    >
                      {configuration.itemDescription}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

{order.customerNote ? (
  <section
    style={{
      ...card,
      marginBottom: "24px",
      border: "1px solid rgba(212,175,55,.35)",
      background: "rgba(212,175,55,.06)",
    }}
  >
    <h2 style={sectionTitle}>Customer Notes</h2>

    <div
      style={{
        color: "#f5f5f5",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
      }}
    >
      {order.customerNote}
    </div>
  </section>
) : null}

      <section style={card}>
        <h2 style={sectionTitle}>Internal Order Information</h2>

<ProductionWorkspace
  orderId={order.id}
  initialValues={{
    coreConfirmedAt: order.coreConfirmedAt
      ? order.coreConfirmedAt.toISOString()
      : null,
    sizeConfirmedAt: order.sizeConfirmedAt
      ? order.sizeConfirmedAt.toISOString()
      : null,
    materialsPreparedAt: order.materialsPreparedAt
      ? order.materialsPreparedAt.toISOString()
      : null,
    buildCompletedAt: order.buildCompletedAt
      ? order.buildCompletedAt.toISOString()
      : null,
    engravingCompletedAt: order.engravingCompletedAt
      ? order.engravingCompletedAt.toISOString()
      : null,
    qualityCheckedAt: order.qualityCheckedAt
      ? order.qualityCheckedAt.toISOString()
      : null,
    photosTakenAt: order.photosTakenAt
      ? order.photosTakenAt.toISOString()
      : null,
    packagedAt: order.packagedAt
      ? order.packagedAt.toISOString()
      : null,
  }}
/>
<ProductionProgressCard
  initialValues={{
    coreConfirmedAt: order.coreConfirmedAt
      ? order.coreConfirmedAt.toISOString()
      : null,
    sizeConfirmedAt: order.sizeConfirmedAt
      ? order.sizeConfirmedAt.toISOString()
      : null,
    materialsPreparedAt: order.materialsPreparedAt
      ? order.materialsPreparedAt.toISOString()
      : null,
    buildCompletedAt: order.buildCompletedAt
      ? order.buildCompletedAt.toISOString()
      : null,
    engravingCompletedAt: order.engravingCompletedAt
      ? order.engravingCompletedAt.toISOString()
      : null,
    qualityCheckedAt: order.qualityCheckedAt
      ? order.qualityCheckedAt.toISOString()
      : null,
    photosTakenAt: order.photosTakenAt
      ? order.photosTakenAt.toISOString()
      : null,
    packagedAt: order.packagedAt
      ? order.packagedAt.toISOString()
      : null,
  }}
/>
<div
  style={{
    marginTop: "24px",
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "1px solid #333",
  }}
>
  <div
    style={{
      color: "#a3a3a3",
      fontSize: ".84rem",
      marginBottom: "8px",
    }}
  >
    Customer-Facing Production Status
  </div>

  <OrderStatusSelect
    orderId={order.id}
    initialStatus={order.status}
  />
</div>

<IncomingPackagePanel
  orderId={order.id}
  initialCarrier={order.incomingCarrier || ""}
  initialTrackingNumber={order.incomingTrackingNumber || ""}
  initialTrackingStatus={order.incomingTrackingStatus || ""}
  materialsReceivedAt={
    order.materialsReceivedAt
      ? order.materialsReceivedAt.toISOString()
      : null
  }
/>

<InternalNotesEditor
  orderId={order.id}
  initialNotes={order.internalNotes || ""}
/>

<OrderTimeline
  order={{
    createdAt: order.createdAt.toISOString(),
    materialsReceivedAt: order.materialsReceivedAt?.toISOString() || null,
    materialsVerifiedAt: order.materialsVerifiedAt?.toISOString() || null,
    coreConfirmedAt: order.coreConfirmedAt?.toISOString() || null,
    sizeConfirmedAt: order.sizeConfirmedAt?.toISOString() || null,
    materialsPreparedAt: order.materialsPreparedAt?.toISOString() || null,
    buildCompletedAt: order.buildCompletedAt?.toISOString() || null,
    engravingCompletedAt:
      order.engravingCompletedAt?.toISOString() || null,
    qualityCheckedAt: order.qualityCheckedAt?.toISOString() || null,
    photosTakenAt: order.photosTakenAt?.toISOString() || null,
    packagedAt: order.packagedAt?.toISOString() || null,
    outgoingShippedAt: order.outgoingShippedAt?.toISOString() || null,
    outgoingDeliveredAt:
      order.outgoingDeliveredAt?.toISOString() || null,
  }}
/>

<OutgoingShipmentPanel
  orderId={order.id}
  initialCarrier={order.outgoingCarrier || ""}
  initialTrackingNumber={order.outgoingTrackingNumber || ""}
  initialTrackingStatus={order.outgoingTrackingStatus || ""}
  outgoingShippedAt={
    order.outgoingShippedAt
      ? order.outgoingShippedAt.toISOString()
      : null
  }
/>
<PaymentActions
  orderId={order.id}
  totalPrice={order.totalPrice}
  paymentStatus={order.paymentStatus}
  refundedAmountCents={order.refundedAmountCents}
  refundStatus={order.refundStatus}
  refunds={order.refunds.map((refund) => ({
    id: refund.id,
    createdAt: refund.createdAt.toISOString(),
    amountCents: refund.amountCents,
    status: refund.status,
    reason: refund.reason,
    requestedByEmail: refund.requestedByEmail,
  }))}
/>

<CancelOrderActions
  orderId={order.id}
  cancelledAt={
    order.cancelledAt
      ? order.cancelledAt.toISOString()
      : null
  }
  cancellationReason={order.cancellationReason}
/>

        <details
  style={{
    marginTop: "24px",
    padding: "14px",
    border: "1px solid #333",
    borderRadius: "10px",
    background: "#171717",
  }}
>
  <summary
    style={{
      cursor: "pointer",
      color: "#a3a3a3",
      fontWeight: 700,
      userSelect: "none",
    }}
  >
    Developer Details
  </summary>

  <div
    style={{
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid #333",
    }}
  >
    <DetailRow
      label="Stripe Session"
      value={displayValue(order.stripeSessionId)}
    />

    <DetailRow
      label="Payment Intent"
      value={displayValue(order.paymentIntentId)}
    />
  </div>
</details>
      </section>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          color: "#a3a3a3",
          fontSize: "0.84rem",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#f5f5f5",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const card = {
  padding: "22px",
  background: "#1d1d1d",
  border: "1px solid #333",
  borderRadius: "14px",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "1.2rem",
};