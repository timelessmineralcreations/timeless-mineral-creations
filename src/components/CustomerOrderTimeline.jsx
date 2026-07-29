function formatTimelineDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CustomerOrderTimeline({ order }) {
  const events = [
    {
      label: "Order placed",
      date: order.createdAt,
    },
    {
      label: "Memorial materials received",
      date: order.materialsReceivedAt,
    },
    {
      label: "In production",
      date:
        order.materialsPreparedAt ||
        order.buildCompletedAt,
    },
    {
      label: "Quality check passed",
      date: order.qualityCheckedAt,
    },
    {
      label: "Ready to ship",
      date: order.packagedAt,
    },
    {
      label: "Order shipped",
      date: order.outgoingShippedAt,
      details: order.outgoingTrackingNumber
        ? `Tracking: ${order.outgoingTrackingNumber}`
        : null,
    },
    {
      label: "Order delivered",
      date: order.outgoingDeliveredAt,
    },
  ]
    .filter((event) => event.date)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "22px",
        background: "#1d1d1d",
        border: "1px solid #333",
        borderRadius: "14px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "1.2rem",
        }}
      >
        Order Progress
      </h2>

      {events.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: "#a3a3a3",
          }}
        >
          Your order progress will appear here.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 0 }}>
          {events.map((event, index) => (
            <div
              key={`${event.label}-${event.date}`}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "999px",
                    background: "#d4af37",
                    marginTop: "5px",
                    flexShrink: 0,
                  }}
                />

                {index < events.length - 1 ? (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      minHeight: "42px",
                      background: "#444",
                    }}
                  />
                ) : null}
              </div>

              <div
                style={{
                  paddingBottom:
                    index < events.length - 1
                      ? "18px"
                      : 0,
                }}
              >
                <div
                  style={{
                    color: "#f5f5f5",
                    fontWeight: 700,
                  }}
                >
                  {event.label}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#a3a3a3",
                    fontSize: "0.85rem",
                  }}
                >
                  {formatTimelineDate(event.date)}
                </div>

                {event.details ? (
                  <div
                    style={{
                      marginTop: "5px",
                      color: "#d4af37",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {event.details}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}