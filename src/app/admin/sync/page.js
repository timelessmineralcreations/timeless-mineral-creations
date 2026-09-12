import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { collections } from "@/data/collections";

export const dynamic = "force-dynamic";

function getStartingPrice(collection) {
  const explicitPrice = Number(
    collection?.startingPrice
  );

  if (Number.isFinite(explicitPrice)) {
    return explicitPrice;
  }

  const baseProduct = Number(
    collection?.pricing?.baseProduct || 0
  );

  const profit = Number(
    collection?.pricing?.profit || 0
  );

  return baseProduct + profit;
}

function getProductType(collection) {
  const productType =
    collection?.productType ||
    collection?.category ||
    "Ring";

  return String(productType);
}

function getCardImage(collection) {
  return (
    collection?.cardImage ||
    collection?.heroImage ||
    collection?.images?.[0] ||
    collection?.ringPhotos?.[0]?.image ||
    collection?.ringPhotos?.[0]?.src ||
    collection?.necklacePhotos?.[0]?.image ||
    collection?.necklacePhotos?.[0]?.src ||
    null
  );
}

function serializePricing(pricing) {
  if (
    !pricing ||
    typeof pricing !== "object"
  ) {
    return null;
  }

  return JSON.stringify(
    pricing,
    null,
    2
  );
}

async function syncCollections() {
  "use server";
  await requireAdmin();

  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  if (!Array.isArray(collections)) {
    throw new Error(
      "The collections export is not an array."
    );
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const errors = [];

  for (const collection of collections) {
    try {
      const slug = String(
        collection?.slug ||
          collection?.id ||
          ""
      ).trim();

      const name = String(
        collection?.name || ""
      ).trim();

      const description = String(
        collection?.description ||
          collection?.shortDescription ||
          ""
      ).trim();

      if (!slug || !name) {
        skipped += 1;

        errors.push(
          `Skipped collection with missing name or slug: ${
            name || slug || "Unknown collection"
          }`
        );

        continue;
      }

      const existingCollection =
        await prisma.collection.findUnique({
          where: {
            slug,
          },

          select: {
            id: true,
          },
        });

      const startingPrice =
        getStartingPrice(collection);

      const pricingJson =
        serializePricing(
          collection.pricing
        );

      const sharedData = {
        name,
        description:
          description ||
          `${name} from Timeless Mineral Creations.`,

        heroImage:
          collection.heroImage ||
          null,

        cardImage:
          getCardImage(collection),

        startingPrice,

        pricingJson,

        pricingUpdatedAt:
          pricingJson
            ? new Date()
            : null,

        productType:
          getProductType(
            collection
          ),
      };

      if (existingCollection) {
        const visibilityUpdates = {};

        if (
          typeof collection.published ===
          "boolean"
        ) {
          visibilityUpdates.published =
            collection.published;
        }

        if (
          typeof collection.comingSoon ===
          "boolean"
        ) {
          visibilityUpdates.comingSoon =
            collection.comingSoon;
        }

        if (
          typeof collection.featured ===
          "boolean"
        ) {
          visibilityUpdates.featured =
            collection.featured;
        }

        if (
          Number.isFinite(
            Number(
              collection.sortOrder
            )
          )
        ) {
          visibilityUpdates.sortOrder =
            Number(
              collection.sortOrder
            );
        }

        await prisma.collection.update({
          where: {
            slug,
          },

          data: {
            ...sharedData,
            ...visibilityUpdates,
          },
        });

        updated += 1;
      } else {
        await prisma.collection.create({
          data: {
            slug,
            ...sharedData,

            published:
              typeof collection.published ===
              "boolean"
                ? collection.published
                : false,

            comingSoon:
              typeof collection.comingSoon ===
              "boolean"
                ? collection.comingSoon
                : false,

            featured:
              typeof collection.featured ===
              "boolean"
                ? collection.featured
                : false,

            sortOrder:
              Number.isFinite(
                Number(
                  collection.sortOrder
                )
              )
                ? Number(
                    collection.sortOrder
                  )
                : 0,
          },
        });

        created += 1;
      }
    } catch (error) {
      failed += 1;

      errors.push(
        `${
          collection?.name ||
          collection?.slug ||
          "Unknown collection"
        }: ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );
    }
  }

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/admin/sync"
  );

  revalidatePath(
    "/collections"
  );

  revalidatePath("/");

  const params =
    new URLSearchParams({
      success: "true",
      total: String(
        collections.length
      ),
      created: String(created),
      updated: String(updated),
      skipped: String(skipped),
      failed: String(failed),
    });

  if (errors.length > 0) {
    params.set(
      "errors",
      errors
        .slice(0, 10)
        .join(" | ")
    );
  }

  redirect(
    `/admin/sync?${params.toString()}`
  );
}

export default async function CollectionSyncPage({
  searchParams,
}) {
  const params =
    await searchParams;

  const syncCompleted =
    params?.success === "true";

  const summary = {
    total: Number(
      params?.total || 0
    ),

    created: Number(
      params?.created || 0
    ),

    updated: Number(
      params?.updated || 0
    ),

    skipped: Number(
      params?.skipped || 0
    ),

    failed: Number(
      params?.failed || 0
    ),
  };

  const errors = String(
    params?.errors || ""
  )
    .split(" | ")
    .filter(Boolean);

  const collectionsWithPricing =
    collections.filter(
      (collection) =>
        collection?.pricing &&
        typeof collection.pricing ===
          "object"
    ).length;

  const collectionsWithoutPricing =
    collections.length -
    collectionsWithPricing;

  return (
    <main
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding:
          "40px 24px 80px",
      }}
    >
      <Link
        href="/admin/dashboard"
        style={{
          color: "#d9b56d",
          fontWeight: "800",
          textDecoration: "none",
        }}
      >
        ← Back to Dashboard
      </Link>

      <p
        style={{
          margin: "30px 0 8px",
          color: "#d9b56d",
          fontSize: "12px",
          fontWeight: "900",
          letterSpacing:
            "0.15em",
          textTransform:
            "uppercase",
        }}
      >
        Development Tools
      </p>

      <h1
        style={{
          margin: 0,
          color: "#eef3f0",
          fontSize: "40px",
        }}
      >
        Sync Collections
      </h1>

      <p
        style={{
          maxWidth: "780px",
          margin: "12px 0 0",
          color: "#98a49f",
          lineHeight: 1.7,
        }}
      >
        Copy collection information and
        pricing from your existing
        JavaScript collection files into
        the database. Existing database
        records are matched by slug.
      </p>

      {syncCompleted ? (
        <section
          style={{
            marginTop: "26px",
            padding: "20px",
            border:
              summary.failed > 0
                ? "1px solid rgba(248, 113, 113, 0.35)"
                : "1px solid rgba(134, 239, 172, 0.3)",

            borderRadius: "16px",

            background:
              summary.failed > 0
                ? "rgba(248, 113, 113, 0.08)"
                : "rgba(134, 239, 172, 0.07)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color:
                summary.failed > 0
                  ? "#fca5a5"
                  : "#86efac",
              fontSize: "21px",
            }}
          >
            Collection sync completed
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <ResultCard
              label="Processed"
              value={summary.total}
            />

            <ResultCard
              label="Created"
              value={summary.created}
            />

            <ResultCard
              label="Updated"
              value={summary.updated}
            />

            <ResultCard
              label="Skipped"
              value={summary.skipped}
            />

            <ResultCard
              label="Failed"
              value={summary.failed}
            />
          </div>

          {errors.length > 0 ? (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "11px",
                background:
                  "rgba(0, 0, 0, 0.18)",
              }}
            >
              <strong
                style={{
                  color: "#fca5a5",
                }}
              >
                Sync messages
              </strong>

              <ul
                style={{
                  margin:
                    "10px 0 0",
                  paddingLeft: "20px",
                  color: "#d5ddd9",
                  lineHeight: 1.7,
                }}
              >
                {errors.map(
                  (error) => (
                    <li key={error}>
                      {error}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section
        style={{
          display: "grid",
          gap: "18px",
          marginTop: "26px",
          padding: "22px",
          border:
            "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          background:
            "rgba(255, 255, 255, 0.025)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#eef3f0",
              fontSize: "22px",
            }}
          >
            Collection source summary
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#98a49f",
              lineHeight: 1.6,
            }}
          >
            These numbers come directly
            from the current{" "}
            <code>
              collections
            </code>{" "}
            export.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <SummaryCard
            label="Total Collections"
            value={
              collections.length
            }
          />

          <SummaryCard
            label="With Pricing"
            value={
              collectionsWithPricing
            }
          />

          <SummaryCard
            label="Without Pricing"
            value={
              collectionsWithoutPricing
            }
          />
        </div>

        <div
          style={{
            padding: "15px",
            border:
              "1px solid rgba(217, 181, 109, 0.22)",
            borderRadius: "12px",
            background:
              "rgba(217, 181, 109, 0.06)",
            color: "#cbd4cf",
            fontSize: "13px",
            lineHeight: 1.7,
          }}
        >
          Existing collection visibility
          settings are preserved unless a
          JavaScript collection explicitly
          defines{" "}
          <code>published</code>,{" "}
          <code>comingSoon</code>, or{" "}
          <code>featured</code>. This
          prevents the sync from
          accidentally publishing unfinished
          collections.
        </div>

        <form action={syncCollections}>
          <button
            type="submit"
            style={{
              width: "100%",
              minHeight: "52px",
              border: 0,
              borderRadius: "12px",
              background:
                "linear-gradient(90deg, #efc15c, #c99425)",
              color: "#111814",
              fontSize: "15px",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            Sync All Collections and Pricing
          </button>
        </form>
      </section>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/collections"
          style={{
            display: "inline-flex",
            minHeight: "44px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 17px",
            border:
              "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            color: "#dfe7e3",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          View Database Collections
        </Link>

        <Link
          href="/collections"
          style={{
            display: "inline-flex",
            minHeight: "44px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 17px",
            border:
              "1px solid rgba(217, 181, 109, 0.35)",
            borderRadius: "10px",
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          View Public Collections
        </Link>
      </div>
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
          "rgba(0, 0, 0, 0.14)",
      }}
    >
      <div
        style={{
          color: "#98a49f",
          fontSize: "12px",
          fontWeight: "800",
          letterSpacing:
            "0.07em",
          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "8px",
          color: "#eef3f0",
          fontSize: "30px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "11px",
        background:
          "rgba(0, 0, 0, 0.17)",
      }}
    >
      <div
        style={{
          color: "#98a49f",
          fontSize: "11px",
          fontWeight: "800",
          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "#eef3f0",
          fontSize: "23px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}