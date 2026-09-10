import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { importExistingHairPlacements } from "./actions";

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

export default async function HairPlacementPage() {
  const options = await prisma.configuratorOption.findMany({
    where: {
      category: "hair-placement",
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  const activeCount = options.filter(
    (option) => option.active
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
            Configurator Options
          </p>

          <h1
            style={{
              margin: 0,
              color: "#eef3f0",
              fontSize: "38px",
            }}
          >
            Hair Placement
          </h1>

          <p
            style={{
              maxWidth: "700px",
              margin: "10px 0 0",
              color: "#98a49f",
              lineHeight: 1.65,
            }}
          >
            Manage the ways hair or fur can be positioned
            inside your memorial jewelry.
          </p>
        </div>

        <Link
          href="/admin/hair-placement/new"
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
          + New Hair Placement
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
          label="Total Options"
          value={options.length}
        />

        <SummaryCard
          label="Active"
          value={activeCount}
        />

        <SummaryCard
          label="Inactive"
          value={options.length - activeCount}
        />
      </div>

      {options.length === 0 ? (
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
            No Hair Placement Options Yet
          </h2>

          <p
            style={{
              margin: "12px auto 22px",
              color: "#98a49f",
              maxWidth: "600px",
            }}
          >
            Import the Crescent Hair and Scattered Hair
            options already used by your configurator.
          </p>

          <form action={importExistingHairPlacements}>
            <button
              type="submit"
              style={{
                minHeight: "46px",
                padding: "0 18px",
                border: 0,
                borderRadius: "11px",
                background: "#d9b56d",
                color: "#111814",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              Import Existing Hair Placements
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {options.map((option) => (
            <Link
              key={option.id}
              href={`/admin/hair-placement/${option.id}`}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "92px minmax(0, 1fr)",
                gap: "15px",
                padding: "14px",
                border:
                  "1px solid rgba(255, 255, 255, 0.1)",
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
                    "rgba(255,255,255,0.05)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.name}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "30px",
                      opacity: 0.6,
                    }}
                  >
                    〰
                  </span>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
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
                      Hair Placement
                    </p>

                    <h2
                      style={{
                        margin: "6px 0 0",
                        color: "#eef3f0",
                        fontSize: "20px",
                      }}
                    >
                      {option.name}
                    </h2>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#8f9b96",
                        fontSize: "12px",
                      }}
                    >
                      {option.slug}
                    </p>
                  </div>

                  <StatusBadge
                    label={
                      option.active
                        ? "Active"
                        : "Inactive"
                    }
                    active={option.active}
                  />
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
                      option.priceAdjustmentCents
                    )}
                  />

                  <ValueCard
                    label="Sort Order"
                    value={String(option.sortOrder)}
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
                  Edit Hair Placement →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }) {
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

function ValueCard({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "10px",
        background: "rgba(0, 0, 0, 0.14)",
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

function StatusBadge({ label, active }) {
  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "900",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        border: active
          ? "1px solid rgba(134,239,172,.3)"
          : "1px solid rgba(255,255,255,.14)",
        background: active
          ? "rgba(134,239,172,.1)"
          : "rgba(255,255,255,.05)",
        color: active ? "#86efac" : "#aeb9b4",
      }}
    >
      {label}
    </span>
  );
}