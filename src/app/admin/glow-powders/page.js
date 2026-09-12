import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GlowPowdersPage() {
  const glowPowders = await prisma.glowPowder.findMany({
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
            Glow Powders
          </h1>
        </div>

        <Link
          href="/admin/glow-powders/new"
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          + New Glow Powder
        </Link>
      </div>

      {glowPowders.length === 0 ? (
        <div
          style={{
            padding: "50px",
            border: "1px dashed #555",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2>No Glow Powders Yet</h2>

          <p>
            Create your first glow powder to begin building the database.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {glowPowders.map((glowPowder) => (
            <Link
              key={glowPowder.id}
              href={`/admin/glow-powders/${glowPowder.id}`}
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
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background:
                      glowPowder.glowColorHex ||
                      glowPowder.daytimeColorHex ||
                      "#444",
                    border: "1px solid rgba(255,255,255,.18)",
                    boxShadow: glowPowder.glowColorHex
                      ? `0 0 16px ${glowPowder.glowColorHex}`
                      : "none",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h3
                    style={{
                      margin: "0 0 4px",
                    }}
                  >
                    {glowPowder.name}
                  </h3>

                  <div
                    style={{
                      color: "#9aa5a0",
                      fontSize: "14px",
                    }}
                  >
                    {glowPowder.slug}
                  </div>

                  <div
                    style={{
                      color: "#7f8c87",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    ${(glowPowder.priceAdjustmentCents / 100).toFixed(2)} upcharge
                  </div>
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
                {glowPowder.featured ? (
                  <span
                    style={{
                      color: "#d9b56d",
                    }}
                  >
                    ★ Featured
                  </span>
                ) : null}

                <span>
                  {glowPowder.active ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}