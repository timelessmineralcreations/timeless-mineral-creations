import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RingCoresPage() {
  const ringCores = await prisma.ringCore.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const activeCount = ringCores.filter((core) => core.active).length;
  const inactiveCount = ringCores.filter((core) => !core.active).length;
  const featuredCount = ringCores.filter((core) => core.featured).length;

  return (
    <main
      style={{
        padding: "32px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#d9b56d",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Product Components
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(32px, 5vw, 50px)",
                lineHeight: 1.05,
              }}
            >
              Ring Cores
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                maxWidth: "700px",
                color: "#aab6b1",
                lineHeight: 1.65,
              }}
            >
              Manage every ring blank, supplier, cost, material, size range,
              width, channel measurement, and product image in one place.
            </p>
          </div>

          <Link
            href="/admin/ring-cores/new"
            style={{
              minHeight: "48px",
              padding: "0 20px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              background: "#d9b56d",
              color: "#111814",
              textDecoration: "none",
              fontWeight: "900",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.22)",
            }}
          >
            + New Ring Core
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <StatCard label="Total Ring Cores" value={ringCores.length} />
          <StatCard label="Active" value={activeCount} />
          <StatCard label="Inactive" value={inactiveCount} />
          <StatCard label="Featured" value={featuredCount} />
        </section>

        {ringCores.length === 0 ? (
          <section
            style={{
              border: "1px solid rgba(255, 255, 255, 0.11)",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.035)",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                margin: "0 auto 20px",
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                border: "1px solid rgba(217, 181, 109, 0.35)",
                background: "rgba(217, 181, 109, 0.1)",
                color: "#e9c77e",
                fontSize: "31px",
              }}
            >
              ⬡
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "27px",
              }}
            >
              No ring cores have been added
            </h2>

            <p
              style={{
                margin: "0 auto 24px",
                maxWidth: "590px",
                color: "#aab6b1",
                lineHeight: 1.65,
              }}
            >
              Add your first ring blank with its material, supplier cost,
              available widths, sizes, channel dimensions, and supplier
              information.
            </p>

            <Link
              href="/admin/ring-cores/new"
              style={{
                minHeight: "46px",
                padding: "0 18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "11px",
                background: "#d9b56d",
                color: "#111814",
                textDecoration: "none",
                fontWeight: "900",
              }}
            >
              Add the First Ring Core
            </Link>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {ringCores.map((core) => (
              <article
                key={core.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px minmax(0, 1fr) auto",
                  gap: "18px",
                  alignItems: "center",
                  border: "1px solid rgba(255, 255, 255, 0.11)",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.035)",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    width: "110px",
                    height: "84px",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.055)",
                    color: "#87938e",
                    fontSize: "13px",
                  }}
                >
                  {core.imageUrl ? (
                    <img
                      src={core.imageUrl}
                      alt={core.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                      marginBottom: "8px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "20px",
                      }}
                    >
                      {core.name}
                    </h2>

                    <StatusBadge
                      label={core.active ? "Active" : "Inactive"}
                      type={core.active ? "active" : "inactive"}
                    />

                    {core.featured ? (
                      <StatusBadge label="Featured" type="featured" />
                    ) : null}
                  </div>

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#b8c2be",
                      fontSize: "14px",
                    }}
                  >
                    {core.material}
                    {core.finish ? ` • ${core.finish}` : ""}
                    {core.color ? ` • ${core.color}` : ""}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#d9b56d",
                        fontWeight: "850",
                      }}
                    >
                      Cost: ${(core.supplierCostCents / 100).toFixed(2)}
                    </span>

                    {core.supplier ? (
                      <span
                        style={{
                          color: "#899690",
                          fontSize: "13px",
                        }}
                      >
                        Supplier: {core.supplier}
                      </span>
                    ) : null}

                    <span
                      style={{
                        color: "#899690",
                        fontSize: "13px",
                      }}
                    >
                      /{core.slug}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/ring-cores/${core.id}`}
                  style={{
                    minHeight: "42px",
                    padding: "0 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    border: "1px solid rgba(217, 181, 109, 0.45)",
                    color: "#edd08f",
                    textDecoration: "none",
                    fontWeight: "850",
                    whiteSpace: "nowrap",
                  }}
                >
                  Edit
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius: "15px",
        background: "rgba(255, 255, 255, 0.035)",
        padding: "20px",
      }}
    >
      <p
        style={{
          margin: "0 0 7px",
          color: "#98a49f",
          fontSize: "13px",
          fontWeight: "750",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "34px",
          fontWeight: "900",
          color: "#f8f4ea",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ label, type }) {
  const styles = {
    active: {
      background: "rgba(79, 190, 132, 0.14)",
      color: "#7fe0aa",
    },
    inactive: {
      background: "rgba(255, 255, 255, 0.08)",
      color: "#c4cfcb",
    },
    featured: {
      background: "rgba(144, 111, 214, 0.17)",
      color: "#c7afff",
    },
  };

  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "5px 10px",
        fontSize: "12px",
        fontWeight: "850",
        ...(styles[type] || styles.inactive),
      }}
    >
      {label}
    </span>
  );
}