import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InlayStylesPage() {
  const styles = await prisma.inlayStyle.findMany({
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
            Inlay Styles
          </h1>
        </div>

        <Link
          href="/admin/inlay-styles/new"
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          + New Inlay Style
        </Link>
      </div>

      {styles.length === 0 ? (
        <div
          style={{
            padding: "50px",
            border: "1px dashed #555",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2>No Inlay Styles Yet</h2>

          <p>
            Create your first style to begin building the database.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {styles.map((style) => (
            <Link
              key={style.id}
              href={`/admin/inlay-styles/${style.id}`}
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
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                  }}
                >
                  {style.name}
                </h3>

                <div
                  style={{
                    color: "#9aa5a0",
                    fontSize: "14px",
                  }}
                >
                  {style.slug}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                {style.featured && (
                  <span
                    style={{
                      color: "#d9b56d",
                    }}
                  >
                    ★ Featured
                  </span>
                )}

                <span>
                  {style.active ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}