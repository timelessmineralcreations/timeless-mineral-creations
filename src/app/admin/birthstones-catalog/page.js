import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BirthstonesCatalogPage() {
  const birthstones = await prisma.birthstone.findMany({
    orderBy: [
      {
        monthNumber: "asc",
      },
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        <div>
          <p
            style={{
              color: "#d9b56d",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            ADMIN
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
            }}
          >
            Birthstones
          </h1>
        </div>

        <Link
          href="/admin/birthstones-catalog/new"
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          + New Birthstone
        </Link>
      </div>

      {birthstones.length === 0 ? (
        <div
          style={{
            padding: "50px",
            border: "1px dashed #555",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2>No Birthstones Yet</h2>

          <p>Create your first CZ birthstone.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {birthstones.map((stone) => (
            <Link
              key={stone.id}
              href={`/admin/birthstones-catalog/${stone.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
                padding: "18px",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: "14px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  minWidth: 0,
                }}
              >
                {stone.imageUrl ? (
                  <img
                    src={stone.imageUrl}
                    alt={stone.name}
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,.14)",
                      background: "rgba(255,255,255,.04)",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "12px",
                      background: stone.colorHex || "#444",
                      border: "1px solid rgba(255,255,255,.14)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontSize: "24px",
                      flexShrink: 0,
                    }}
                  >
                    ◇
                  </div>
                )}

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px",
                      textTransform: "capitalize",
                    }}
                  >
                    {stone.name}
                  </h3>

                  <div
                    style={{
                      color: "#9aa5a0",
                      fontSize: "14px",
                    }}
                  >
                    {stone.monthName} • {stone.stoneType}
                  </div>

                  {(stone.shape || stone.size) && (
                    <div
                      style={{
                        color: "#7f8c87",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {[stone.shape, stone.size]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {stone.featured ? (
                  <span
                    style={{
                      color: "#d9b56d",
                    }}
                  >
                    ★ Featured
                  </span>
                ) : null}

                <span>
                  {stone.active ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}