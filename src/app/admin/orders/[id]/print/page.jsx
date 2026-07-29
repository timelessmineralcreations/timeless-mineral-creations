import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function displayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

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
  }).format(new Date(value));
}

function shortenOrderId(id) {
  return `ORD-${id.slice(-8).toUpperCase()}`;
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

export default async function OrderBuildSheetPage({ params }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "32px",
        background: "#fff",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          header,
          nav,
          footer,
          .no-print {
            display: none !important;
          }

          main {
            max-width: none !important;
            padding: 0 !important;
          }

          .build-item {
            break-inside: avoid;
          }

          @page {
            margin: 0.5in;
          }
        }
      `}</style>

      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <Link
          href={`/admin/orders/${order.id}`}
          style={{
            color: "#8a6500",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Back to Order
        </Link>

        <button
          type="button"
          onClick={undefined}
          style={{
            padding: "10px 18px",
            border: "1px solid #111",
            borderRadius: "8px",
            background: "#fff",
            color: "#111",
            fontWeight: 700,
          }}
        >
          Use Ctrl + P to Print
        </button>
      </div>

      <section
        style={{
          borderBottom: "3px solid #111",
          paddingBottom: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              Timeless Mineral Creations
            </h1>

            <div
              style={{
                marginTop: "6px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Order Build Sheet
            </div>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
              }}
            >
              {shortenOrderId(order.id)}
            </div>

            <div style={{ marginTop: "5px" }}>
              Ordered: {formatDate(order.createdAt)}
            </div>

            <div style={{ marginTop: "5px" }}>
              Status: {order.status}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        <div style={infoBox}>
          <h2 style={sectionTitle}>Customer</h2>

          <BuildRow
            label="Name"
            value={
              order.customerName ||
              order.shippingName ||
              "Not provided"
            }
          />

          <BuildRow
            label="Email"
            value={displayValue(order.customerEmail)}
          />

          <BuildRow
            label="Phone"
            value={displayValue(order.customerPhone)}
          />
        </div>

        <div style={infoBox}>
          <h2 style={sectionTitle}>Order Summary</h2>

          <BuildRow
            label="Items"
            value={order.items.length}
          />

          <BuildRow
            label="Total"
            value={formatCurrency(order.totalPrice)}
          />

          <BuildRow
            label="Memorial Received"
            value={order.materialsReceivedAt ? "Yes" : "No"}
          />

          <BuildRow
            label="Materials Verified"
            value={order.materialsVerifiedAt ? "Yes" : "No"}
          />
        </div>
      </section>

      {order.customerNote ? (
        <section
          style={{
            ...infoBox,
            marginBottom: "24px",
          }}
        >
          <h2 style={sectionTitle}>Customer Notes</h2>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {order.customerNote}
          </div>
        </section>
      ) : null}

      {order.items.map((item, index) => {
        const configuration = parseConfiguration(
          item.configurationJson
        );

        return (
          <section
            key={item.id}
            className="build-item"
            style={{
              border: "2px solid #111",
              borderRadius: "10px",
              padding: "22px",
              marginBottom: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "20px",
                paddingBottom: "14px",
                borderBottom: "1px solid #777",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                  }}
                >
                  Item {index + 1}:{" "}
                  {item.productName ||
                    item.collectionName ||
                    "Custom Memorial Jewelry"}
                </h2>

                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  Quantity: {item.quantity}
                </div>
              </div>

              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                }}
              >
                {formatCurrency(item.unitPrice)}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "16px 24px",
              }}
            >
              <BuildRow
                label="Collection"
                value={displayValue(item.collectionName)}
              />

              <BuildRow
                label="Product Type"
                value={displayValue(item.productType)}
              />

              <BuildRow
                label="Material"
                value={displayValue(item.material)}
              />

              <BuildRow
                label="Core"
                value={displayValue(item.core)}
              />

              <BuildRow
                label="Style"
                value={displayValue(item.style)}
              />

              <BuildRow
                label="Width"
                value={
                  item.width
                    ? `${item.width}mm`
                    : "Not provided"
                }
              />

              <BuildRow
                label="Size"
                value={displayValue(item.size)}
              />

              <BuildRow
                label="Design"
                value={displayValue(item.design)}
              />

              <BuildRow
                label="Memorial Materials"
                value={displayValue(item.memorialMaterials)}
              />

              <BuildRow
                label="Minerals"
                value={displayValue(item.minerals)}
              />

              <BuildRow
                label="Accent Materials"
                value={displayValue(item.accentMaterials)}
              />

              <BuildRow
                label="Glow"
                value={displayValue(item.glow)}
              />

              <BuildRow
                label="Engraving"
                value={displayValue(item.engraving, "None")}
              />
            </div>

            {configuration?.itemDescription ? (
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #777",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: "7px",
                  }}
                >
                  Full Configuration
                </div>

                <div
                  style={{
                    lineHeight: 1.6,
                  }}
                >
                  {configuration.itemDescription}
                </div>
              </div>
            ) : null}

            <div
              style={{
                marginTop: "24px",
                paddingTop: "18px",
                borderTop: "1px solid #777",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "14px",
                }}
              >
                Production Checklist
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 28px",
                }}
              >
                <ChecklistItem label="Core confirmed" />
                <ChecklistItem label="Size confirmed" />
                <ChecklistItem label="Memorial materials verified" />
                <ChecklistItem label="Minerals prepared" />
                <ChecklistItem label="Inlay completed" />
                <ChecklistItem label="Engraving completed" />
                <ChecklistItem label="Final finish completed" />
                <ChecklistItem label="Quality check passed" />
                <ChecklistItem label="Photos taken" />
                <ChecklistItem label="Ready to package" />
              </div>
            </div>
          </section>
        );
      })}

      <section
        style={{
          ...infoBox,
          marginBottom: "24px",
        }}
      >
        <h2 style={sectionTitle}>Internal Production Notes</h2>

        {order.internalNotes ? (
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            {order.internalNotes}
          </div>
        ) : null}

        <div style={writingLine} />
        <div style={writingLine} />
        <div style={writingLine} />
        <div style={writingLine} />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginTop: "34px",
        }}
      >
        <SignatureLine label="Completed By" />
        <SignatureLine label="Completion Date" />
      </section>
    </main>
  );
}

function BuildRow({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          textTransform: "uppercase",
          color: "#555",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ChecklistItem({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "16px",
          height: "16px",
          border: "2px solid #111",
        }}
      />

      <span>{label}</span>
    </div>
  );
}

function SignatureLine({ label }) {
  return (
    <div>
      <div
        style={{
          height: "32px",
          borderBottom: "1px solid #111",
        }}
      />

      <div
        style={{
          marginTop: "6px",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const infoBox = {
  border: "1px solid #777",
  borderRadius: "8px",
  padding: "18px",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "19px",
};

const writingLine = {
  height: "28px",
  borderBottom: "1px solid #aaa",
};