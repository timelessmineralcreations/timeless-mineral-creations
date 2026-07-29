import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      photos: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07110f 0%, #0b1714 45%, #08100e 100%)",
        color: "#f5f5f5",
        padding: "40px 20px 80px",
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
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#d9b56d",
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Timeless Mineral Creations Admin
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(32px, 5vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              Collections
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#b9c4c0",
                maxWidth: "650px",
                lineHeight: 1.6,
              }}
            >
              Create, edit, organize, publish, and temporarily hide the
              collections displayed on your website.
            </p>
          </div>

          <Link
            href="/admin/collections/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              padding: "0 20px",
              borderRadius: "12px",
              background: "#d9b56d",
              color: "#111814",
              textDecoration: "none",
              fontWeight: "800",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
            }}
          >
            + New Collection
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <StatCard label="Total Collections" value={collections.length} />

          <StatCard
            label="Published"
            value={collections.filter((collection) => collection.published).length}
          />

          <StatCard
            label="Coming Soon"
            value={
              collections.filter((collection) => collection.comingSoon).length
            }
          />

          <StatCard
            label="Hidden Drafts"
            value={
              collections.filter(
                (collection) =>
                  !collection.published && !collection.comingSoon
              ).length
            }
          />
        </section>

        {collections.length === 0 ? (
          <section
            style={{
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.035)",
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(217, 181, 109, 0.12)",
                border: "1px solid rgba(217, 181, 109, 0.35)",
                fontSize: "30px",
              }}
            >
              💍
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "26px",
              }}
            >
              No dashboard collections yet
            </h2>

            <p
              style={{
                margin: "0 auto 24px",
                color: "#b9c4c0",
                maxWidth: "560px",
                lineHeight: 1.65,
              }}
            >
              Your current website collections still come from your JavaScript
              data files. We will import them into this database after the
              collection form is working.
            </p>

            <Link
              href="/admin/collections/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "46px",
                padding: "0 18px",
                borderRadius: "11px",
                background: "#d9b56d",
                color: "#111814",
                textDecoration: "none",
                fontWeight: "800",
              }}
            >
              Create the First Collection
            </Link>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {collections.map((collection) => {
              const image =
                collection.cardImage ||
                collection.heroImage ||
                collection.photos[0]?.imageUrl ||
                null;

              const status = collection.published
                ? "Published"
                : collection.comingSoon
                  ? "Coming Soon"
                  : "Draft";

              return (
                <article
                  key={collection.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px minmax(0, 1fr) auto",
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
                      width: "120px",
                      height: "90px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "rgba(255, 255, 255, 0.06)",
                      display: "grid",
                      placeItems: "center",
                      color: "#7e8b86",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={collection.name}
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
                        gap: "10px",
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
                        {collection.name}
                      </h2>

                      <span
                        style={{
                          borderRadius: "999px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: "800",
                          background:
                            status === "Published"
                              ? "rgba(79, 190, 132, 0.14)"
                              : status === "Coming Soon"
                                ? "rgba(217, 181, 109, 0.14)"
                                : "rgba(255, 255, 255, 0.08)",
                          color:
                            status === "Published"
                              ? "#7fe0aa"
                              : status === "Coming Soon"
                                ? "#e9c77e"
                                : "#c4cfcb",
                        }}
                      >
                        {status}
                      </span>

                      {collection.featured && (
                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            fontWeight: "800",
                            background: "rgba(144, 111, 214, 0.17)",
                            color: "#c7afff",
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#9eaaa6",
                        fontSize: "14px",
                      }}
                    >
                      /collections/{collection.slug}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#d9b56d",
                        fontWeight: "800",
                      }}
                    >
                      From ${collection.startingPrice.toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href={`/admin/collections/${collection.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "42px",
                      padding: "0 16px",
                      borderRadius: "10px",
                      border: "1px solid rgba(217, 181, 109, 0.45)",
                      color: "#edd08f",
                      textDecoration: "none",
                      fontWeight: "800",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit
                  </Link>
                </article>
              );
            })}
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
          margin: "0 0 6px",
          color: "#9eaaa6",
          fontSize: "14px",
          fontWeight: "700",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          color: "#f8f4ea",
          fontSize: "34px",
          fontWeight: "900",
        }}
      >
        {value}
      </p>
    </div>
  );
}