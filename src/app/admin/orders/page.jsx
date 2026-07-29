import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";





function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortenOrderId(id) {
  return `ORD-${id.slice(-8).toUpperCase()}`;
}

function getProductSummary(items) {
  if (!items?.length) {
    return "No items";
  }

  if (items.length === 1) {
    const item = items[0];

    return (
      item.productName ||
      item.collectionName ||
      "Custom Memorial Jewelry"
    );
  }

  const firstItem =
    items[0].productName ||
    items[0].collectionName ||
    "Custom Memorial Jewelry";

  return `${firstItem} + ${items.length - 1} more`;
}

function getCustomerName(order) {
  return (
    order.customerName ||
    order.shippingName ||
    order.customerEmail ||
    "Customer information unavailable"
  );
}

function getStatusStyle(status) {
  const normalizedStatus = status?.toLowerCase() || "";

  if (normalizedStatus.includes("completed")) {
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

export default async function OrdersPage({ searchParams }) {
  const params = await searchParams;
  const statusFilter = params?.status;

  const orders = await prisma.order.findMany({
    where: statusFilter
      ? {
          status: statusFilter,
        }
      : undefined,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      items: true,
    },
  });

  return (
    <div
      style={{
        padding: "40px",
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: "2rem",
            }}
          >
            Orders
          </h1>

          <p
  style={{
    margin: 0,
    color: "#a3a3a3",
  }}
>
  {statusFilter
    ? `${orders.length} ${
        orders.length === 1 ? "order" : "orders"
      } with status: ${statusFilter}`
    : `${orders.length} ${
        orders.length === 1 ? "order" : "orders"
      } saved`}
</p>

{statusFilter ? (
  <Link
    href="/admin/orders"
    style={{
      display: "inline-block",
      marginTop: "10px",
      color: "#f7c948",
      fontWeight: 700,
      textDecoration: "none",
    }}
  >
    Clear filter
  </Link>
) : null}
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            background: "#1d1d1d",
            border: "1px solid #333",
            borderRadius: "14px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            No orders yet
          </h2>

          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
            }}
          >
            Completed Stripe orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "14px",
            border: "1px solid #333",
            background: "#1d1d1d",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1000px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#2b2b2b",
                }}
              >
                <th style={th}>Order</th>
                <th style={th}>Customer</th>
                <th style={th}>Product</th>
                <th style={th}>Payment</th>
                <th style={th}>Production Status</th>
                <th style={th}>Total</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);

                return (
                  <tr key={order.id}>
                    <td style={td}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          color: "#f7c948",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        {shortenOrderId(order.id)}
                      </Link>
                    </td>

                    <td style={td}>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        {getCustomerName(order)}
                      </div>

                      {order.customerEmail &&
                      order.customerEmail !== getCustomerName(order) ? (
                        <div
                          style={{
                            color: "#a3a3a3",
                            fontSize: "0.88rem",
                          }}
                        >
                          {order.customerEmail}
                        </div>
                      ) : null}
                    </td>

                    <td style={td}>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        {getProductSummary(order.items)}
                      </div>

                      <div
                        style={{
                          color: "#a3a3a3",
                          fontSize: "0.88rem",
                        }}
                      >
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </div>
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "rgba(34, 197, 94, 0.16)",
                          color: "#86efac",
                          border: "1px solid rgba(34, 197, 94, 0.35)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          ...statusStyle,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td
                      style={{
                        ...td,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(order.totalPrice)}
                    </td>

                    <td
                      style={{
                        ...td,
                        color: "#d4d4d4",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: "16px",
  textAlign: "left",
  color: "#f5f5f5",
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
};

const td = {
  padding: "16px",
  borderTop: "1px solid #333",
  verticalAlign: "middle",
};