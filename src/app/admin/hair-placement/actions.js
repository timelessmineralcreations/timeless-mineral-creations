"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const CATEGORY = "hair-placement";

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

  if (!Number.isFinite(dollars)) {
    return 0;
  }

  return Math.round(dollars * 100);
}

export async function createHairPlacement(formData) {
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
      "Hair placement name is required."
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
      select: {
        id: true,
      },
    });

  if (existing) {
    throw new Error(
      "A hair placement with that slug already exists."
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

  revalidatePath("/admin/hair-placement");

  redirect("/admin/hair-placement");
}

export async function updateHairPlacement(formData) {
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

  if (!id) {
    throw new Error(
      "Hair placement ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Hair placement name is required."
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

  const duplicate =
    await prisma.configuratorOption.findFirst({
      where: {
        category: CATEGORY,
        slug,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicate) {
    throw new Error(
      "A hair placement with that slug already exists."
    );
  }

  const existing =
    await prisma.configuratorOption.findFirst({
      where: {
        id,
        category: CATEGORY,
      },
      select: {
        id: true,
      },
    });

  if (!existing) {
    throw new Error(
      "Hair placement was not found."
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

  revalidatePath("/admin/hair-placement");
  revalidatePath(
    `/admin/hair-placement/${id}`
  );

  redirect("/admin/hair-placement");
}

export async function deleteHairPlacement(formData) {
  await requireAdmin();
  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Hair placement ID is missing."
    );
  }

  const existing =
    await prisma.configuratorOption.findFirst({
      where: {
        id,
        category: CATEGORY,
      },
      select: {
        id: true,
      },
    });

  if (!existing) {
    throw new Error(
      "Hair placement was not found."
    );
  }

  await prisma.configuratorOption.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/hair-placement");

  redirect("/admin/hair-placement");
}

export async function importExistingHairPlacements() {
  await requireAdmin();
  const existingOptions = [
    {
      name: "Crescent Hair",
      slug: "crescent-hair",
      description:
        "Hair arranged in the Timeless signature crescent placement.",
      priceAdjustmentCents: 1500,
      sortOrder: 10,
    },
    {
      name: "Scattered Hair",
      slug: "scattered-hair",
      description:
        "Hair scattered naturally throughout the memorial inlay.",
      priceAdjustmentCents: 1500,
      sortOrder: 20,
    },
  ];

  for (const option of existingOptions) {
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
        name: option.name,
        slug: option.slug,
        description: option.description,
        priceAdjustmentCents:
          option.priceAdjustmentCents,
        active: true,
        featured: false,
        sortOrder: option.sortOrder,
      },
    });
  }

  revalidatePath("/admin/hair-placement");
}