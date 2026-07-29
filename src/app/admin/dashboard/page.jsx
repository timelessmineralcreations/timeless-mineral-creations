import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({
    title,
    value,
    color,
    href,
    subtitle,
}) {
    const cardContent = (
        <div
            style={{
                background: "#1d1d1d",
                border: "1px solid #333",
                borderRadius: "14px",
                padding: "24px",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    color: "#a3a3a3",
                    fontSize: ".9rem",
                    marginBottom: "10px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: "2.2rem",
                    fontWeight: "700",
                    color,
                }}
            >
                {value}
            </div>

            {subtitle ? (
                <div
                    style={{
                        marginTop: "8px",
                        fontSize: ".82rem",
                        color: "#a3a3a3",
                    }}
                >
                    {subtitle}
                </div>
            ) : null}
        </div>
    );

    if (!href) {
        return cardContent;
    }

    return (
        <Link
            href={href}
            style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
            }}
        >
            {cardContent}
        </Link>
    );
}

export default async function DashboardPage() {
    const [
  awaiting,
  overdueAwaiting,
  received,
  preparing,
  production,
  quality,
  ready,
  shipped,
  completed,
  totalOrders,
  overdueOrders,
  readyToShipOrders,
] = await Promise.all([
        prisma.order.count({
            where: { status: "Awaiting Memorial Materials" },
        }),

        prisma.order.count({
            where: {
                status: "Awaiting Memorial Materials",
                createdAt: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        }),

        prisma.order.count({
            where: { status: "Materials Received" },
        }),

        prisma.order.count({
            where: { status: "Preparing Materials" },
        }),

        prisma.order.count({
            where: { status: "In Production" },
        }),

        prisma.order.count({
            where: { status: "Quality Check" },
        }),

        prisma.order.count({
            where: { status: "Ready to Ship" },
        }),

        prisma.order.count({
            where: { status: "Shipped" },
        }),

        prisma.order.count({
            where: { status: "Completed" },
        }),

        prisma.order.count(),
        prisma.order.findMany({
    where: {
        status: "Awaiting Memorial Materials",
        createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    },
    orderBy: {
        createdAt: "asc",
    },
    take: 5,
}),

prisma.order.findMany({
    where: {
        status: "Ready to Ship",
    },
    orderBy: {
        updatedAt: "asc",
    },
    take: 5,
}),
    ]);

    return (
        <div
            style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "40px",
            }}
        >
            <h1
                style={{
                    marginTop: 0,
                    marginBottom: "10px",
                }}
            >
                Dashboard
            </h1>

            <p
                style={{
                    color: "#999",
                    marginBottom: "35px",
                }}
            >
                Welcome back, Michael.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "20px",
                }}
            >
                <StatCard
                    title="Total Orders"
                    value={totalOrders}
                    color="#fff"
                    href="/admin/orders"
                />

                <StatCard
                    title="Awaiting Memorial Materials"
                    value={awaiting}
                    subtitle={
                        overdueAwaiting > 0
                            ? `⚠️ ${overdueAwaiting} overdue`
                            : undefined
                    }
                    color="#facc15"
                    href="/admin/orders?status=Awaiting%20Memorial%20Materials"
                />

                <StatCard
                    title="Materials Received"
                    value={received}
                    color="#c084fc"
                    href="/admin/orders?status=Materials%20Received"
                />

                <StatCard
                    title="Preparing Materials"
                    value={preparing}
                    color="#38bdf8"
                    href="/admin/orders?status=Preparing%20Materials"
                />

                <StatCard
                    title="In Production"
                    value={production}
                    color="#60a5fa"
                    href="/admin/orders?status=In%20Production"
                />

                <StatCard
                    title="Quality Check"
                    value={quality}
                    color="#fb923c"
                    href="/admin/orders?status=Quality%20Check"
                />

                <StatCard
                    title="Ready to Ship"
                    value={ready}
                    color="#22c55e"
                    href="/admin/orders?status=Ready%20to%20Ship"
                />

                <StatCard
                    title="Shipped"
                    value={shipped}
                    color="#4ade80"
                    href="/admin/orders?status=Shipped"
                />

                <StatCard
                    title="Completed"
                    value={completed}
                    color="#10b981"
                    href="/admin/orders?status=Completed"
                />
            </div>

<div
  style={{
    marginTop: "32px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  }}
>
  <section style={attentionCard}>
    <h2 style={attentionTitle}>Needs Attention</h2>

    {overdueOrders.length === 0 ? (
      <p style={emptyText}>
        No customers are currently overdue sending materials.
      </p>
    ) : (
      <div style={{ display: "grid", gap: "10px" }}>
        {overdueOrders.map((order) => {
          const daysWaiting = Math.floor(
            (Date.now() -
              new Date(order.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const customerName =
            order.customerName ||
            order.shippingName ||
            order.customerEmail ||
            "Customer";

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              style={attentionLink}
            >
              <div>
                <div style={{ fontWeight: 800 }}>
                  {customerName}
                </div>

                <div style={attentionMeta}>
                  Awaiting memorial materials
                </div>
              </div>

              <div
                style={{
                  color: "#fca5a5",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {daysWaiting} days
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </section>

  <section style={attentionCard}>
    <h2 style={attentionTitle}>Ready to Ship</h2>

    {readyToShipOrders.length === 0 ? (
      <p style={emptyText}>
        No finished orders are waiting to ship.
      </p>
    ) : (
      <div style={{ display: "grid", gap: "10px" }}>
        {readyToShipOrders.map((order) => {
          const customerName =
            order.customerName ||
            order.shippingName ||
            order.customerEmail ||
            "Customer";

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              style={attentionLink}
            >
              <div>
                <div style={{ fontWeight: 800 }}>
                  {customerName}
                </div>

                <div style={attentionMeta}>
                  Ready for outgoing shipment
                </div>
              </div>

              <div
                style={{
                  color: "#86efac",
                  fontWeight: 800,
                }}
              >
                Open →
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </section>
</div>

            <div
                style={{
                    marginTop: "40px",
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                }}
            >
                <Link href="/admin/orders">
                    <button style={buttonStyle}>
                        View Orders
                    </button>
                </Link>

                <Link href="/admin/customers">
                    <button style={buttonStyle}>
                        Customers
                    </button>
                </Link>

                <Link href="/admin/settings">
                    <button style={buttonStyle}>
                        Settings
                    </button>
                </Link>
            </div>
        </div>
    );
}

const attentionCard = {
  padding: "22px",
  background: "#1d1d1d",
  border: "1px solid #333",
  borderRadius: "14px",
};

const attentionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "1.2rem",
};

const attentionLink = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#171717",
  color: "#f5f5f5",
  textDecoration: "none",
};

const attentionMeta = {
  marginTop: "4px",
  color: "#a3a3a3",
  fontSize: "0.86rem",
};

const emptyText = {
  margin: 0,
  color: "#a3a3a3",
  lineHeight: 1.6,
};

const buttonStyle = {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    background:
        "linear-gradient(135deg,#E9C054,#B8860B)",
    color: "#111",
    fontWeight: "700",
    cursor: "pointer",
};