"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateCollection(formData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();

  const productType = String(
    formData.get("productType") || "Ring"
  ).trim();

  const startingPrice = Number(
    formData.get("startingPrice") || 0
  );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const cardImage = String(
    formData.get("cardImage") || ""
  ).trim();

  const heroImage = String(
    formData.get("heroImage") || ""
  ).trim();

  const seoTitle = String(
    formData.get("seoTitle") || ""
  ).trim();

  const seoDescription = String(
    formData.get("seoDescription") || ""
  ).trim();

  const published = formData.get("published") === "on";
  const comingSoon = formData.get("comingSoon") === "on";
  const featured = formData.get("featured") === "on";

  const selectedRingCoreIds = [
    ...new Set(
      formData
        .getAll("ringCoreIds")
        .map((value) => String(value).trim())
        .filter(Boolean)
    ),
  ];

  if (!id) {
    throw new Error("Collection ID is missing.");
  }

  if (!name) {
    throw new Error("Collection name is required.");
  }

  if (!description) {
    throw new Error("Collection description is required.");
  }

  if (
    !Number.isFinite(startingPrice) ||
    startingPrice < 0
  ) {
    throw new Error(
      "Starting price must be a valid positive number."
    );
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error(
      "A valid collection URL slug could not be created."
    );
  }

  const duplicateSlug = await prisma.collection.findFirst({
    where: {
      slug,
      NOT: {
        id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateSlug) {
    throw new Error(
      "That collection URL already exists. Please use a different slug."
    );
  }

  if (selectedRingCoreIds.length > 0) {
    const validRingCores = await prisma.ringCore.findMany({
      where: {
        id: {
          in: selectedRingCoreIds,
        },
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (
      validRingCores.length !== selectedRingCoreIds.length
    ) {
      throw new Error(
        "One or more selected ring cores are no longer active or do not exist."
      );
    }
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.collection.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description,
        productType: productType || "Ring",
        startingPrice,
        sortOrder: Number.isFinite(sortOrder)
          ? sortOrder
          : 0,
        cardImage: cardImage || null,
        heroImage: heroImage || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        published,
        comingSoon,
        featured,
      },
    });

    await transaction.collectionRingCore.deleteMany({
      where: {
        collectionId: id,
        ringCoreId: {
          notIn: selectedRingCoreIds,
        },
      },
    });

    for (
      let index = 0;
      index < selectedRingCoreIds.length;
      index += 1
    ) {
      const ringCoreId = selectedRingCoreIds[index];

      await transaction.collectionRingCore.upsert({
        where: {
          collectionId_ringCoreId: {
            collectionId: id,
            ringCoreId,
          },
        },
        update: {
          active: true,
          sortOrder: index,
        },
        create: {
          collectionId: id,
          ringCoreId,
          active: true,
          sortOrder: index,
        },
      });
    }
  });

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath(`/collections/${slug}`);

  redirect("/admin/collections");
}

export async function deleteCollection(formData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Collection ID is missing.");
  }

  await prisma.collection.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/collections");

  redirect("/admin/collections");
}