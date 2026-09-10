import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import ReviewForm from "../components/ReviewForm";

export const dynamic = "force-dynamic";

function parseReviewImages(formData) {
  const rawValue = String(
    formData.get("reviewImagesJson") || "[]"
  );

  let parsedImages;

  try {
    parsedImages = JSON.parse(rawValue);
  } catch {
    throw new Error(
      "The review image information is invalid."
    );
  }

  if (!Array.isArray(parsedImages)) {
    throw new Error(
      "The review image information is invalid."
    );
  }

  const images = parsedImages
    .filter(
      (image) =>
        typeof image?.imageUrl === "string" &&
        image.imageUrl.trim()
    )
    .map((image, index) => ({
      imageUrl: image.imageUrl.trim(),

      altText:
        typeof image.altText === "string"
          ? image.altText.trim()
          : "",

      caption:
        typeof image.caption === "string"
          ? image.caption.trim()
          : "",

      sortOrder: index,

      primary: Boolean(image.primary),
    }));

  if (images.length === 0) {
    return [];
  }

  const selectedPrimaryIndex =
    images.findIndex(
      (image) => image.primary
    );

  const primaryIndex =
    selectedPrimaryIndex >= 0
      ? selectedPrimaryIndex
      : 0;

  return images.map(
    (image, index) => ({
      ...image,
      primary:
        index === primaryIndex,
    })
  );
}

function parseReviewDate(value) {
  const date = new Date(
    `${value}T12:00:00`
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Enter a valid review date."
    );
  }

  return date;
}

async function createReview(
  formData
) {
  "use server";
  await requireAdmin();

  const session = await auth();

  if (!session?.user?.email) {
    throw new Error(
      "Unauthorized"
    );
  }

  const customerName = String(
    formData.get(
      "customerName"
    ) || ""
  ).trim();

  const customerLocation = String(
    formData.get(
      "customerLocation"
    ) || ""
  ).trim();

  const rating = Number(
    formData.get("rating") || 5
  );

  const title = String(
    formData.get("title") || ""
  ).trim();

  const body = String(
    formData.get("body") || ""
  ).trim();

  const ownerResponse = String(
    formData.get(
      "ownerResponse"
    ) || ""
  ).trim();

  const reviewDateValue = String(
    formData.get(
      "reviewDate"
    ) || ""
  ).trim();

  const collectionId = String(
    formData.get(
      "collectionId"
    ) || ""
  ).trim();

  const galleryItemId = String(
    formData.get(
      "galleryItemId"
    ) || ""
  ).trim();

  const sortOrder = Number(
    formData.get("sortOrder") ||
      0
  );

  const approved =
    formData.get("approved") ===
    "on";

  const verified =
    formData.get("verified") ===
    "on";

  const featured =
    formData.get("featured") ===
    "on";

  const homepageFeatured =
    formData.get(
      "homepageFeatured"
    ) === "on";

  if (!customerName) {
    throw new Error(
      "Customer name is required."
    );
  }

  if (!body) {
    throw new Error(
      "Review text is required."
    );
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5."
    );
  }

  if (
    !Number.isFinite(
      sortOrder
    ) ||
    sortOrder < 0
  ) {
    throw new Error(
      "Sort order must be zero or a positive number."
    );
  }

  const reviewDate =
    parseReviewDate(
      reviewDateValue
    );

  const images =
    parseReviewImages(
      formData
    );

  if (collectionId) {
    const collectionExists =
      await prisma.collection.findUnique(
        {
          where: {
            id: collectionId,
          },

          select: {
            id: true,
          },
        }
      );

    if (!collectionExists) {
      throw new Error(
        "The selected collection no longer exists."
      );
    }
  }

  if (galleryItemId) {
    const galleryItemExists =
      await prisma.galleryItem.findUnique(
        {
          where: {
            id: galleryItemId,
          },

          select: {
            id: true,
          },
        }
      );

    if (!galleryItemExists) {
      throw new Error(
        "The selected gallery item no longer exists."
      );
    }
  }

  await prisma.review.create({
    data: {
      customerName,

      customerLocation:
        customerLocation || null,

      rating,

      title:
        title || null,

      body,

      ownerResponse:
        ownerResponse || null,

      reviewDate,

      collectionId:
        collectionId || null,

      galleryItemId:
        galleryItemId || null,

      sortOrder,

      approved,
      verified,
      featured,
      homepageFeatured,

      images: {
        create: images.map(
          (image) => ({
            imageUrl:
              image.imageUrl,

            altText:
              image.altText ||
              `${customerName} review photo`,

            caption:
              image.caption ||
              null,

            sortOrder:
              image.sortOrder,

            primary:
              image.primary,
          })
        ),
      },
    },
  });

  revalidatePath(
    "/admin/reviews"
  );

  revalidatePath(
    "/reviews"
  );

  revalidatePath("/");

  redirect("/admin/reviews");
}

export default async function NewReviewPage() {
  const [
    collections,
    galleryItems,
  ] = await Promise.all([
    prisma.collection.findMany({
      orderBy: [
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
        published: true,
      },
    }),

    prisma.galleryItem.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],

      select: {
        id: true,
        title: true,
        active: true,
      },
    }),
  ]);

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding:
          "40px 24px 80px",
      }}
    >
      <Link
        href="/admin/reviews"
        style={{
          color: "#d9b56d",
          fontWeight: "800",
          textDecoration: "none",
        }}
      >
        ← Back to Reviews
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
        Customer Trust
      </p>

      <h1
        style={{
          margin: 0,
          color: "#eef3f0",
          fontSize: "38px",
        }}
      >
        New Review
      </h1>

      <p
        style={{
          maxWidth: "760px",
          margin:
            "12px 0 28px",
          color: "#98a49f",
          lineHeight: 1.7,
        }}
      >
        Add a customer review,
        optional photos, related
        products, and public
        visibility settings.
      </p>

      <ReviewForm
        collections={collections}
        galleryItems={
          galleryItems
        }
        saveAction={
          createReview
        }
      />
    </main>
  );
}