"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const CATEGORY = "decorative-accent";
const BASE_PATH = "/admin/decorative-accents";

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

export async function createDecorativeAccent(formData) {
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
      "Decorative accent name is required."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  if (!slug) {
    throw new Error(
      "A valid slug could not be created."
    );
  }

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
      "A decorative accent with that slug already exists."
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

export async function updateDecorativeAccent(formData) {
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
      "Decorative accent information is missing."
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
      "A decorative accent with that slug already exists."
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

export async function deleteDecorativeAccent(formData) {
  await requireAdmin();
  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Decorative accent ID is missing."
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

export async function importExistingDecorativeAccents() {
  await requireAdmin();
  const options = [
    {
      name: "Silver Foil",
      slug: "silver-foil",
      description:
        "Decorative silver foil added throughout the inlay.",
      priceAdjustmentCents: 1000,
      sortOrder: 10,
    },
    {
      name: "Gold Foil",
      slug: "gold-foil",
      description:
        "Decorative gold foil added throughout the inlay.",
      priceAdjustmentCents: 1000,
      sortOrder: 20,
    },
    {
      name: "Opal Chameleon",
      slug: "opal-chameleon",
      description:
        "Color-shifting opal chameleon accent.",
      priceAdjustmentCents: 1000,
      sortOrder: 30,
    },
    {
      name: "Pink Chameleon",
      slug: "pink-chameleon",
      description:
        "Color-shifting pink chameleon accent.",
      priceAdjustmentCents: 1000,
      sortOrder: 40,
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