import Link from "next/link";

import { prisma } from "@/lib/prisma";

import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";

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

function formatMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function PricingPage() {
  const collections =
    await prisma.collection.findMany({
      include: {
        pricingProfile: true,

        _count: {
          select: {
            pricingRules: true,
          },
        },
      },

      orderBy: [
        {
          published: "desc",
        },
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
    });

  const normalizedCount =
    collections.filter(
      (collection) =>
        collection.pricingProfile
    ).length;

  const missingCount =
    collections.length -
    normalizedCount;

  const totalRules =
    collections.reduce(
      (total, collection) =>
        total +
        collection._count
          .pricingRules,
      0
    );

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding:
          "40px 24px 80px",
      }}
    >
      <AdminPageHeader
        eyebrow="Catalog Management"
        title="Pricing"
        description="Manage collection base costs, profit, starting prices, and individual pricing adjustments."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "26px",
        }}
      >
        <SummaryCard
          label="Collections"
          value={collections.length}
        />

        <SummaryCard
          label="Normalized"
          value={normalizedCount}
        />

        <SummaryCard
          label="Missing Pricing"
          value={missingCount}
        />

        <SummaryCard
          label="Pricing Rules"
          value={totalRules}
        />
      </div>

      {collections.length === 0 ? (
        <AdminEmptyState
          title="No Collections"
          description="Sync your collections before managing pricing."
          actionHref="/admin/sync"
          actionLabel="Sync Collections"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {collections.map(
            (collection) => {
              const profile =
                collection.pricingProfile;

              const calculatedBaseCents =
                profile
                  ? profile.baseProductCents +
                    profile.profitCents
                  : null;

              const displayedStartingPrice =
                profile
                  ?.startingPriceOverrideCents ??
                calculatedBaseCents;

              return (
                <Link
                  key={collection.id}
                  href={`/admin/pricing/${collection.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "100px minmax(0, 1fr)",
                    gap: "17px",
                    padding: "16px",
                    borderRadius:
                      "16px",
                    border:
                      collection.featured
                        ? "1px solid rgba(217, 181, 109, 0.45)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "rgba(255, 255, 255, 0.025)",
                    color: "inherit",
                    textDecoration:
                      "none",
                  }}
                >
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      overflow: "hidden",
                      borderRadius:
                        "12px",
                      background:
                        "#07110f",
                    }}
                  >
                    {collection.cardImage ||
                    collection.heroImage ? (
                      <img
                        src={
                          collection.cardImage ||
                          collection.heroImage
                        }
                        alt={
                          collection.name
                        }
                        style={{
                          display:
                            "block",
                          width: "100%",
                          height:
                            "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display:
                            "grid",
                          width: "100%",
                          height:
                            "100%",
                          placeItems:
                            "center",
                          fontSize:
                            "34px",
                          opacity: 0.5,
                        }}
                      >
                        💲
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "14px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color:
                              "#d9b56d",
                            fontSize:
                              "11px",
                            fontWeight:
                              "900",
                            letterSpacing:
                              "0.1em",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {collection.productType ||
                            "Collection"}
                        </p>

                        <h2
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#eef3f0",
                            fontSize:
                              "21px",
                          }}
                        >
                          {
                            collection.name
                          }
                        </h2>

                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            color:
                              "#8f9b96",
                            fontSize:
                              "12px",
                          }}
                        >
                          /collections/
                          {collection.slug}
                        </p>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "7px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <StatusBadge
                          label={
                            collection.published
                              ? "Published"
                              : "Draft"
                          }
                          tone={
                            collection.published
                              ? "success"
                              : "neutral"
                          }
                        />

                        {collection.featured ? (
                          <StatusBadge
                            label="Featured"
                            tone="gold"
                          />
                        ) : null}

                        <StatusBadge
                          label={
                            profile
                              ? "Pricing Ready"
                              : "Missing Pricing"
                          }
                          tone={
                            profile
                              ? "success"
                              : "warning"
                          }
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(135px, 1fr))",
                        gap: "10px",
                        marginTop:
                          "15px",
                      }}
                    >
                      <PricingValue
                        label="Catalog Starting Price"
                        value={formatMoney(
                          collection.startingPrice
                        )}
                      />

                      <PricingValue
                        label="Base Product"
                        value={
                          profile
                            ? formatMoneyFromCents(
                                profile.baseProductCents
                              )
                            : "Not imported"
                        }
                      />

                      <PricingValue
                        label="Profit"
                        value={
                          profile
                            ? formatMoneyFromCents(
                                profile.profitCents
                              )
                            : "Not imported"
                        }
                      />

                      <PricingValue
                        label="Calculated Start"
                        value={
                          displayedStartingPrice !=
                          null
                            ? formatMoneyFromCents(
                                displayedStartingPrice
                              )
                            : "Not available"
                        }
                      />

                      <PricingValue
                        label="Pricing Rules"
                        value={String(
                          collection
                            ._count
                            .pricingRules
                        )}
                      />
                    </div>

                    <div
                      style={{
                        marginTop:
                          "14px",
                        color:
                          "#d9b56d",
                        fontSize:
                          "13px",
                        fontWeight:
                          "900",
                      }}
                    >
                      Edit Pricing →
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "22px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/sync"
          style={{
            display: "inline-flex",
            minHeight: "44px",
            alignItems: "center",
            padding: "0 16px",
            border:
              "1px solid rgba(217, 181, 109, 0.35)",
            borderRadius: "10px",
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          Sync Collection Pricing
        </Link>

        <Link
          href="/admin/collections"
          style={{
            display: "inline-flex",
            minHeight: "44px",
            alignItems: "center",
            padding: "0 16px",
            border:
              "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            color: "#dfe7e3",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          View Collections
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
          "rgba(255, 255, 255, 0.025)",
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

function PricingValue({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "10px",
        background:
          "rgba(0, 0, 0, 0.14)",
      }}
    >
      <div
        style={{
          color: "#83908a",
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing:
            "0.06em",
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
          fontSize: "14px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  tone = "neutral",
}) {
  const tones = {
    success: {
      border:
        "1px solid rgba(134, 239, 172, 0.3)",
      background:
        "rgba(134, 239, 172, 0.1)",
      color: "#86efac",
    },

    warning: {
      border:
        "1px solid rgba(251, 191, 36, 0.3)",
      background:
        "rgba(251, 191, 36, 0.1)",
      color: "#fbbf24",
    },

    gold: {
      border:
        "1px solid rgba(217, 181, 109, 0.35)",
      background:
        "rgba(217, 181, 109, 0.1)",
      color: "#d9b56d",
    },

    neutral: {
      border:
        "1px solid rgba(255, 255, 255, 0.14)",
      background:
        "rgba(255, 255, 255, 0.05)",
      color: "#aeb9b4",
    },
  };

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "900",
        letterSpacing:
          "0.06em",
        textTransform:
          "uppercase",
        ...tones[tone],
      }}
    >
      {label}
    </span>
  );
}