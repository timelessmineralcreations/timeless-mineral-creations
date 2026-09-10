import Link from "next/link";

import { prisma } from "@/lib/prisma";

import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";

export const dynamic = "force-dynamic";

function getPrimaryImage(review) {
  return (
    review.images.find(
      (image) => image.primary
    ) ||
    review.images[0] ||
    null
  );
}

function formatReviewDate(
  dateValue
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(dateValue)
  );
}

export default async function ReviewsPage() {
  const reviews =
    await prisma.review.findMany({
      include: {
        collection: {
          select: {
            name: true,
          },
        },

        galleryItem: {
          select: {
            title: true,
          },
        },

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },

      orderBy: [
        {
          approved: "asc",
        },
        {
          sortOrder: "asc",
        },
        {
          reviewDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

  const pendingCount =
    reviews.filter(
      (review) =>
        !review.approved
    ).length;

  const approvedCount =
    reviews.filter(
      (review) =>
        review.approved
    ).length;

  const featuredCount =
    reviews.filter(
      (review) =>
        review.featured
    ).length;

  const homepageCount =
    reviews.filter(
      (review) =>
        review.homepageFeatured
    ).length;

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
        eyebrow="Customer Trust"
        title="Reviews"
        description="Manage customer reviews, photos, featured placement, verified status, and public approval."
        actionHref="/admin/reviews/new"
        actionLabel="+ New Review"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard
          label="Total Reviews"
          value={reviews.length}
        />

        <SummaryCard
          label="Pending"
          value={pendingCount}
        />

        <SummaryCard
          label="Approved"
          value={approvedCount}
        />

        <SummaryCard
          label="Featured"
          value={featuredCount}
        />

        <SummaryCard
          label="Homepage"
          value={homepageCount}
        />
      </div>

      {reviews.length === 0 ? (
        <AdminEmptyState
          title="No Reviews"
          description="Add your first customer review."
          actionHref="/admin/reviews/new"
          actionLabel="Create Review"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {reviews.map(
            (review) => {
              const primaryImage =
                getPrimaryImage(
                  review
                );

              const subtitleParts =
                [
                  review.collection
                    ?.name,
                  review.galleryItem
                    ?.title,
                  `${
                    review.images
                      .length
                  } ${
                    review.images
                      .length === 1
                      ? "photo"
                      : "photos"
                  }`,
                ].filter(Boolean);

              return (
                <Link
                  key={review.id}
                  href={`/admin/reviews/${review.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      primaryImage
                        ? "110px minmax(0, 1fr)"
                        : "minmax(0, 1fr)",
                    gap: "16px",
                    padding: "16px",
                    borderRadius:
                      "15px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "rgba(255, 255, 255, 0.025)",
                    color: "inherit",
                    textDecoration:
                      "none",
                    transition:
                      "border-color 160ms ease, transform 160ms ease",
                  }}
                >
                  {primaryImage ? (
                    <img
                      src={
                        primaryImage.imageUrl
                      }
                      alt={
                        primaryImage.altText ||
                        review.customerName
                      }
                      style={{
                        width:
                          "110px",
                        height:
                          "110px",
                        objectFit:
                          "cover",
                        borderRadius:
                          "11px",
                        background:
                          "#07110f",
                      }}
                    />
                  ) : null}

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
                        <div
                          aria-label={`${review.rating} out of 5 stars`}
                          style={{
                            color:
                              "#d9b56d",
                            fontSize:
                              "18px",
                            letterSpacing:
                              "0.06em",
                          }}
                        >
                          {"★".repeat(
                            review.rating
                          )}

                          <span
                            style={{
                              color:
                                "rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            {"★".repeat(
                              5 -
                                review.rating
                            )}
                          </span>
                        </div>

                        <h2
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#eef3f0",
                            fontSize:
                              "20px",
                          }}
                        >
                          {review.title ||
                            review.customerName}
                        </h2>

                        <div
                          style={{
                            marginTop:
                              "5px",
                            color:
                              "#98a49f",
                            fontSize:
                              "13px",
                          }}
                        >
                          {
                            review.customerName
                          }

                          {review.customerLocation
                            ? ` • ${review.customerLocation}`
                            : ""}

                          {review.reviewDate
                            ? ` • ${formatReviewDate(
                                review.reviewDate
                              )}`
                            : ""}
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "flex-start",
                          gap: "7px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <StatusBadge
                          label={
                            review.approved
                              ? "Approved"
                              : "Pending"
                          }
                          tone={
                            review.approved
                              ? "success"
                              : "warning"
                          }
                        />

                        {review.verified ? (
                          <StatusBadge
                            label="Verified"
                            tone="success"
                          />
                        ) : null}

                        {review.featured ? (
                          <StatusBadge
                            label="Featured"
                            tone="gold"
                          />
                        ) : null}

                        {review.homepageFeatured ? (
                          <StatusBadge
                            label="Homepage"
                            tone="gold"
                          />
                        ) : null}
                      </div>
                    </div>

                    {subtitleParts.length >
                    0 ? (
                      <div
                        style={{
                          marginTop:
                            "10px",
                          color:
                            "#d9b56d",
                          fontSize:
                            "12px",
                          fontWeight:
                            "800",
                        }}
                      >
                        {subtitleParts.join(
                          " • "
                        )}
                      </div>
                    ) : null}

                    <p
                      style={{
                        margin:
                          "12px 0 0",
                        color:
                          "#c5cfca",
                        lineHeight:
                          1.65,
                        display:
                          "-webkit-box",
                        WebkitLineClamp:
                          2,
                        WebkitBoxOrient:
                          "vertical",
                        overflow:
                          "hidden",
                      }}
                    >
                      {review.body}
                    </p>

                    {review.ownerResponse ? (
                      <div
                        style={{
                          marginTop:
                            "12px",
                          padding:
                            "10px 12px",
                          borderLeft:
                            "3px solid #d9b56d",
                          background:
                            "rgba(217, 181, 109, 0.06)",
                          color:
                            "#aeb9b4",
                          fontSize:
                            "12px",
                          lineHeight:
                            1.6,
                        }}
                      >
                        Owner response
                        added
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            }
          )}
        </div>
      )}
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
        padding: "15px",
        borderRadius: "13px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <div
        style={{
          color: "#98a49f",
          fontSize: "12px",
          fontWeight: "800",
          textTransform:
            "uppercase",
          letterSpacing:
            "0.08em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          color: "#eef3f0",
          fontSize: "28px",
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
  tone = "success",
}) {
  const styles = {
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
  };

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "900",
        textTransform:
          "uppercase",
        letterSpacing:
          "0.06em",
        ...styles[tone],
      }}
    >
      {label}
    </span>
  );
}