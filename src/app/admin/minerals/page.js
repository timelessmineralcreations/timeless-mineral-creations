import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MineralsPage() {
  const minerals = await prisma.mineral.findMany({
    orderBy: [
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
            Minerals
          </h1>
        </div>

        <Link
          href="/admin/minerals/new"
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          + New Mineral
        </Link>
      </div>

      {minerals.length === 0 ? (
        <div
          style={{
            padding: "50px",
            border: "1px dashed #555",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2>No Minerals Yet</h2>

          <p>
            Create your first mineral to begin building the database.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {minerals.map((mineral) => (
            <Link
              key={mineral.id}
              href={`/admin/minerals/${mineral.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: mineral.colorHex || "#444",
                    border: "1px solid rgba(255,255,255,.18)",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h3
                    style={{
                      margin: "0 0 4px",
                    }}
                  >
                    {mineral.name}
                  </h3>

                  <div
                    style={{
                      color: "#9aa5a0",
                      fontSize: "14px",
                    }}
                  >
                    {mineral.slug}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                {mineral.featured && (
                  <span
                    style={{
                      color: "#d9b56d",
                    }}
                  >
                    ★ Featured
                  </span>
                )}

                <span>
                  {mineral.active ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}