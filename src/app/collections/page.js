import Link from "next/link";
import { collections } from "@/data/collections";
import { keepsakeBranchCollection } from "@/data/collections/keepsake-branch/keepsake-branch-necklace/collection";

export default function CollectionsPage() {
  const allCollections = [
  ...collections,
  keepsakeBranchCollection,
];
  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "50px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        Collections
      </h1>

      <p
        style={{
          fontSize: "18px",
          opacity: 0.75,
          textAlign: "center",
          maxWidth: "700px",
          margin: "0 auto 50px",
          lineHeight: 1.6,
        }}
      >
        Choose a collection below and begin designing a one-of-a-kind memorial piece handcrafted just for you.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 340px))",
          justifyContent: "center",
          gap: "30px",
        }}
      >
        {allCollections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: "18px",
                overflow: "hidden",
                background: "rgba(255,255,255,.04)",
                transition: "all .25s ease",
                cursor: "pointer",
              }}
            >
             <img
  src={collection.heroImage}
  alt={collection.name}
  style={{
    width: "100%",
    height: "190px",
    objectFit: "cover",
    objectPosition: collection.cardImagePosition || "center",
    display: "block",
  }}
/>
              <div style={{ padding: "20px" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    marginBottom: "10px",
                  }}
                >
                  {collection.name}
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    opacity: 0.75,
                    lineHeight: 1.5,
                    minHeight: "45px",
                    marginBottom: "20px",
                  }}
                >
                  {collection.shortDescription || collection.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#D4AF37",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    From ${collection.startingPrice}
                  </span>

                  <span
                    style={{
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    Customize →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}