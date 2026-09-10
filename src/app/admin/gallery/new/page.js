import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import GalleryForm from "../components/GalleryForm";

import {
  backButtonStyle,
  eyebrowStyle,
  pageDescriptionStyle,
  pageHeaderStyle,
  pageInnerStyle,
  pageStyle,
  pageTitleStyle,
} from "../components/styles";

export const dynamic = "force-dynamic";

function parseGalleryImages(
  formData
) {
  const rawValue = String(
    formData.get(
      "galleryImagesJson"
    ) || "[]"
  );

  let parsedImages;

  try {
    parsedImages =
      JSON.parse(rawValue);
  } catch {
    throw new Error(
      "The gallery image information is invalid."
    );
  }

  if (!Array.isArray(parsedImages)) {
    throw new Error(
      "The gallery image information is invalid."
    );
  }

  const images = parsedImages
    .filter(
      (image) =>
        typeof image?.imageUrl ===
          "string" &&
        image.imageUrl.trim()
    )
    .map((image, index) => ({
      imageUrl:
        image.imageUrl.trim(),

      altText:
        typeof image.altText ===
        "string"
          ? image.altText.trim()
          : "",

      caption:
        typeof image.caption ===
        "string"
          ? image.caption.trim()
          : "",

      sortOrder: index,
      primary:
        Boolean(image.primary),
    }));

  if (images.length === 0) {
    throw new Error(
      "Upload at least one image before creating the gallery item."
    );
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

async function createGalleryItem(
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

  const title = String(
    formData.get("title") || ""
  ).trim();

  const description = String(
    formData.get(
      "description"
    ) || ""
  ).trim();

  const instagramUrl = String(
    formData.get(
      "instagramUrl"
    ) || ""
  ).trim();

  const collectionId = String(
    formData.get(
      "collectionId"
    ) || ""
  ).trim();

  const sortOrder = Number(
    formData.get("sortOrder") ||
      0
  );

  const featured =
    formData.get("featured") ===
    "on";

  const homepageFeatured =
    formData.get(
      "homepageFeatured"
    ) === "on";

  const active =
    formData.get("active") ===
    "on";

  if (!title) {
    throw new Error(
      "Gallery title is required."
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

  const images =
    parseGalleryImages(
      formData
    );

  const primaryImage =
    images.find(
      (image) => image.primary
    ) || images[0];

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

  await prisma.galleryItem.create(
    {
      data: {
        title,

        description:
          description || null,

        // Legacy fields retained
        // while older pages are updated.
        imageUrl:
          primaryImage.imageUrl,

        altText:
          primaryImage.altText ||
          title,

        instagramUrl:
          instagramUrl ||
          null,

        collectionId:
          collectionId ||
          null,

        sortOrder,
        featured,
        homepageFeatured,
        active,

        images: {
          create: images.map(
            (image) => ({
              imageUrl:
                image.imageUrl,

              altText:
                image.altText ||
                title,

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
    }
  );

  revalidatePath(
    "/admin/gallery"
  );
  revalidatePath("/gallery");
  revalidatePath("/");

  redirect("/admin/gallery");
}

export default async function NewGalleryItemPage() {
  const collections =
    await prisma.collection.findMany(
      {
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
      }
    );

  return (
    <main style={pageStyle}>
      <div style={pageInnerStyle}>
        <div style={pageHeaderStyle}>
          <Link
            href="/admin/gallery"
            style={backButtonStyle}
          >
            ← Back to Gallery
          </Link>

          <p style={eyebrowStyle}>
            Website Gallery
          </p>

          <h1 style={pageTitleStyle}>
            New Gallery Item
          </h1>

          <p
            style={
              pageDescriptionStyle
            }
          >
            Upload one or more
            images of a completed
            memorial piece and
            choose where it may
            appear throughout the
            website.
          </p>
        </div>

        <GalleryForm
          collections={
            collections
          }
          saveAction={
            createGalleryItem
          }
        />
      </div>
    </main>
  );
}