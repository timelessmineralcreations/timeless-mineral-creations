import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoneyFromCents(value) {
  const cents = Number(value);

  if (!Number.isFinite(cents)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function MineralsPage() {
  const minerals = await prisma.mineral.findMany({
    orderBy: [
      {
        active: "desc",
      },
      {
        popular: "desc",
      },
      {
        premium: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  const activeCount = minerals.filter(
    (mineral) => mineral.active
  ).length;

  const popularCount = minerals.filter(
    (mineral) => mineral.popular
  ).length;

  const premiumCount = minerals.filter(
    (mineral) => mineral.premium
  ).length;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 7px",
              color: "#d9b56d",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Catalog Management
          </p>

          <h1
            style={{
              margin: 0,
              color: "#eef3f0",
              fontSize: "38px",
            }}
          >
            Minerals
          </h1>

          <p
            style={{
              maxWidth: "700px",
              margin: "10px 0 0",
              color: "#98a49f",
              lineHeight: 1.65,
            }}
          >
            Manage mineral names, images, categories, pricing,
            popularity, and website availability.
          </p>
        </div>

        <Link
          href="/admin/minerals/new"
          style={{
            display: "inline-flex",
            minHeight: "46px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            borderRadius: "11px",
            background:
              "linear-gradient(90deg, #efc15c, #c99425)",
            color: "#111814",
            textDecoration: "none",
            fontWeight: "900",
          }}
        >
          + New Mineral
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "26px",
        }}
      >
        <SummaryCard
          label="Total Minerals"
          value={minerals.length}
        />

        <SummaryCard
          label="Active"
          value={activeCount}
        />

        <SummaryCard
          label="Popular"
          value={popularCount}
        />

        <SummaryCard
          label="Premium"
          value={premiumCount}
        />
      </div>

      {minerals.length === 0 ? (
        <div
          style={{
            padding: "50px 24px",
            border:
              "1px dashed rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            background:
              "rgba(255, 255, 255, 0.025)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#eef3f0",
            }}
          >
            No Minerals Yet
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              color: "#98a49f",
            }}
          >
            Create your first mineral or run the mineral
            importer.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {minerals.map((mineral) => (
            <Link
              key={mineral.id}
              href={`/admin/minerals/${mineral.id}`}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "92px minmax(0, 1fr)",
                gap: "15px",
                padding: "14px",
                border:
                  mineral.featured
                    ? "1px solid rgba(217, 181, 109, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                background:
                  "rgba(255, 255, 255, 0.025)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: "92px",
                  height: "92px",
                  overflow: "hidden",
                  borderRadius: "11px",
                  background:
                    mineral.colorHex || "#07110f",
                  border:
                    "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {mineral.imageUrl ? (
                  <img
                    src={mineral.imageUrl}
                    alt={mineral.name}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      width: "100%",
                      height: "100%",
                      placeItems: "center",
                      fontSize: "30px",
                      opacity: 0.55,
                    }}
                  >
                    💎
                  </div>
                )}
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#d9b56d",
                        fontSize: "11px",
                        fontWeight: "900",
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                      }}
                    >
                      {mineral.category || "Mineral"}
                    </p>

                    <h2
                      style={{
                        margin: "6px 0 0",
                        color: "#eef3f0",
                        fontSize: "20px",
                      }}
                    >
                      {mineral.name}
                    </h2>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#8f9b96",
                        fontSize: "12px",
                      }}
                    >
                      {mineral.slug}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "7px",
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusBadge
                      label={
                        mineral.active
                          ? "Active"
                          : "Inactive"
                      }
                      tone={
                        mineral.active
                          ? "success"
                          : "neutral"
                      }
                    />

                    {mineral.popular ? (
                      <StatusBadge
                        label="Popular"
                        tone="gold"
                      />
                    ) : null}

                    {mineral.premium ? (
                      <StatusBadge
                        label="Premium"
                        tone="warning"
                      />
                    ) : null}

                    {mineral.featured ? (
                      <StatusBadge
                        label="Featured"
                        tone="gold"
                      />
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(135px, 1fr))",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  <ValueCard
                    label="Price Adjustment"
                    value={formatMoneyFromCents(
                      mineral.priceAdjustmentCents
                    )}
                  />

                  <ValueCard
                    label="Sort Order"
                    value={String(
                      mineral.sortOrder
                    )}
                  />

                  <ValueCard
                    label="Category"
                    value={
                      mineral.category ||
                      "Not assigned"
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: "#d9b56d",
                    fontSize: "13px",
                    fontWeight: "900",
                  }}
                >
                  Edit Mineral →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "16px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "13px",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <div
        style={{
          color: "#98a49f",
          fontSize: "12px",
          fontWeight: "800",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          color: "#eef3f0",
          fontSize: "29px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ValueCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "10px",
        background:
          "rgba(0, 0, 0, 0.14)",
      }}
    >
      <div
        style={{
          color: "#83908a",
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "#eef3f0",
          fontSize: "14px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  tone = "neutral",
}) {
  const tones = {
    success: {
      border:
        "1px solid rgba(134, 239, 172, 0.3)",
      background:
        "rgba(134, 239, 172, 0.1)",
      color: "#86efac",
    },

    warning: {
      border:
        "1px solid rgba(251, 191, 36, 0.3)",
      background:
        "rgba(251, 191, 36, 0.1)",
      color: "#fbbf24",
    },

    gold: {
      border:
        "1px solid rgba(217, 181, 109, 0.35)",
      background:
        "rgba(217, 181, 109, 0.1)",
      color: "#d9b56d",
    },

    neutral: {
      border:
        "1px solid rgba(255, 255, 255, 0.14)",
      background:
        "rgba(255, 255, 255, 0.05)",
      color: "#aeb9b4",
    },
  };

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "900",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        ...tones[tone],
      }}
    >
      {label}
    </span>
  );
}