import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Memorial Jewelry Collections | Timeless Mineral Creations",

  description:
    "Browse handcrafted memorial rings, necklaces, bracelets, and keepsake jewelry collections.",
};

export default async function CollectionsPage() {
  const collections =
    await prisma.collection.findMany({
      where: {
        OR: [
          { published: true },
          { comingSoon: true },
        ],
      },

      orderBy: [
        {
          featured: "desc",
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,

        heroImage: true,
        cardImage: true,

        photos: {
          where: {
            active: true,
          },
          orderBy: [
            {
              featured: "desc",
            },
            {
              sortOrder: "asc",
            },
          ],
          select: {
            imageUrl: true,
          },
        },

        cardImageScale: true,
        cardImageX: true,
        cardImageY: true,

        heroImageScale: true,
        heroImageX: true,
        heroImageY: true,

        startingPrice: true,
        comingSoon: true,
        featured: true,
        productType: true,
      },
    });

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "50px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto 50px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            color: "#d4af37",
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Handcrafted Keepsakes
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "48px",
          }}
        >
          Collections
        </h1>

        <p
          style={{
            margin: "16px auto 0",
            fontSize: "18px",
            opacity: 0.75,
            lineHeight: 1.65,
          }}
        >
          Choose a collection below and begin designing a
          one-of-a-kind memorial piece handcrafted just for you.
        </p>
      </div>

      {collections.length === 0 ? (
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "50px 24px",
            border:
              "1px dashed rgba(255, 255, 255, 0.18)",
            borderRadius: "18px",
            background:
              "rgba(255, 255, 255, 0.025)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            No published collections
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              opacity: 0.68,
              lineHeight: 1.6,
            }}
          >
            Collections will appear here after they are marked
            as published in the admin.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 340px))",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          {collections.map((collection) => {
            const usingCardImage =
              Boolean(collection.cardImage);

            const imageUrl =
              collection.cardImage ||
              collection.photos?.[0]?.imageUrl ||
              collection.heroImage ||
              "/hero-ring.jpg";

            const imageScale =
              usingCardImage
                ? collection.cardImageScale
                : collection.heroImageScale;

            const imageX =
              usingCardImage
                ? collection.cardImageX
                : collection.heroImageX;

            const imageY =
              usingCardImage
                ? collection.cardImageY
                : collection.heroImageY;

            const safeScale =
              Number.isFinite(Number(imageScale))
                ? Number(imageScale)
                : 1;

            const safeX =
              Number.isFinite(Number(imageX))
                ? Number(imageX)
                : 0;

            const safeY =
              Number.isFinite(Number(imageY))
                ? Number(imageY)
                : 0;

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <article
                  style={{
                    height: "100%",
                    overflow: "hidden",

                    border: collection.featured
                      ? "1px solid rgba(212, 175, 55, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.12)",

                    borderRadius: "18px",

                    background:
                      "rgba(255, 255, 255, 0.04)",

                    transition:
                      "transform 180ms ease, border-color 180ms ease",

                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "210px",
                      overflow: "hidden",
                      background: "#0d1210",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={collection.name}
                      draggable={false}
                      style={{
                        position: "absolute",
                        inset: 0,

                        display: "block",
                        width: "100%",
                        height: "100%",

                        objectFit: "contain",
                        objectPosition: "center",

                        transformOrigin: "center",

                        transform: `translate(${safeX}%, ${safeY}%) scale(${safeScale})`,

                        pointerEvents: "none",
                        userSelect: "none",
                        WebkitUserDrag: "none",
                      }}
                    />

                    {collection.featured ? (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",

                          padding: "6px 10px",

                          borderRadius: "999px",

                          background: "#d4af37",
                          color: "#121212",

                          fontSize: "11px",
                          fontWeight: "900",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Featured
                      </span>
                    ) : null}

                    {collection.comingSoon ? (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",

                          padding: "6px 10px",

                          borderRadius: "999px",

                          border:
                            "1px solid rgba(255, 255, 255, 0.22)",

                          background:
                            "rgba(0, 0, 0, 0.72)",

                          color: "#ffffff",

                          fontSize: "11px",
                          fontWeight: "900",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Coming Soon
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      padding: "20px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#d4af37",

                          fontSize: "11px",
                          fontWeight: "800",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {collection.productType ||
                          "Memorial Jewelry"}
                      </p>

                      <h2
                        style={{
                          margin: "7px 0 0",
                          fontSize: "24px",
                        }}
                      >
                        {collection.name}
                      </h2>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        minHeight: "66px",

                        fontSize: "14px",
                        opacity: 0.75,
                        lineHeight: 1.6,

                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {collection.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "4px",
                      }}
                    >
                      <span
                        style={{
                          color: "#d4af37",
                          fontWeight: "800",
                          fontSize: "18px",
                        }}
                      >
                        {Number.isFinite(
                          Number(
                            collection.startingPrice
                          )
                        )
                          ? `From $${Number(
                            collection.startingPrice
                          ).toFixed(2)}`
                          : "Custom Pricing"}
                      </span>

                      <span
                        style={{
                          fontWeight: "700",
                          color: "#ffffff",
                        }}
                      >
                        {collection.comingSoon
                          ? "View →"
                          : "Customize →"}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}