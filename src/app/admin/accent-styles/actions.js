"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const CATEGORY = "accent-style";
const BASE_PATH = "/admin/accent-styles";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPriceAdjustmentCents(formData) {
  const dollars = Number(
    formData.get("priceAdjustment") || 0
  );

  return Number.isFinite(dollars)
    ? Math.round(dollars * 100)
    : 0;
}

export async function createAccentStyle(formData) {
  await requireAdmin();
  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  const active =
    formData.get("active") === "on";

  const featured =
    formData.get("featured") === "on";

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  if (!name) {
    throw new Error(
      "Accent style name is required."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  const existing =
    await prisma.configuratorOption.findUnique({
      where: {
        category_slug: {
          category: CATEGORY,
          slug,
        },
      },
    });

  if (existing) {
    throw new Error(
      "An accent style with that slug already exists."
    );
  }

  await prisma.configuratorOption.create({
    data: {
      category: CATEGORY,
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      priceAdjustmentCents:
        getPriceAdjustmentCents(formData),
      active,
      featured,
      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
    },
  });

  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateAccentStyle(formData) {
  await requireAdmin();
  const id = String(
    formData.get("id") || ""
  ).trim();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  const active =
    formData.get("active") === "on";

  const featured =
    formData.get("featured") === "on";

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  if (!id || !name) {
    throw new Error(
      "Accent style information is missing."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  const duplicate =
    await prisma.configuratorOption.findFirst({
      where: {
        category: CATEGORY,
        slug,
        NOT: {
          id,
        },
      },
    });

  if (duplicate) {
    throw new Error(
      "An accent style with that slug already exists."
    );
  }

  await prisma.configuratorOption.update({
    where: {
      id,
    },
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      priceAdjustmentCents:
        getPriceAdjustmentCents(formData),
      active,
      featured,
      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
    },
  });

  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${id}`);

  redirect(BASE_PATH);
}

export async function deleteAccentStyle(formData) {
  await requireAdmin();
  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Accent style ID is missing."
    );
  }

  await prisma.configuratorOption.delete({
    where: {
      id,
    },
  });

  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function importExistingAccentStyles() {
  await requireAdmin();
  const options = [
    {
      name: "Speckled",
      slug: "speckled",
      description:
        "Decorative accent distributed in a scattered speckled pattern.",
      priceAdjustmentCents: 0,
      sortOrder: 10,
    },
    {
      name: "Crescent Moon",
      slug: "crescent-moon",
      description:
        "Decorative accent arranged in a crescent moon design.",
      priceAdjustmentCents: 0,
      sortOrder: 20,
    },
  ];

  for (const option of options) {
    await prisma.configuratorOption.upsert({
      where: {
        category_slug: {
          category: CATEGORY,
          slug: option.slug,
        },
      },
      update: {},
      create: {
        category: CATEGORY,
        ...option,
        active: true,
        featured: false,
      },
    });
  }

  revalidatePath(BASE_PATH);
}