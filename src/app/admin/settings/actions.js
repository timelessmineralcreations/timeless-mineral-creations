"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const SETTINGS_ID = "site-settings";

function getString(formData, name) {
  return String(
    formData.get(name) || ""
  ).trim();
}

function getNullableString(
  formData,
  name
) {
  const value = getString(
    formData,
    name
  );

  return value || null;
}

function getPositiveInteger(
  formData,
  name,
  fallback
) {
  const value = Number(
    formData.get(name)
  );

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return Math.round(value);
}

function getPercentage(
  formData,
  name,
  fallback = 0
) {
  const value = Number(
    formData.get(name)
  );

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value)
    )
  );
}

function getCurrencyCents(
  formData,
  name,
  fallbackCents
) {
  const rawValue = String(
    formData.get(name) || ""
  )
    .replace("$", "")
    .replace(",", "")
    .trim();

  const value = Number(
    rawValue
  );

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallbackCents;
  }

  return Math.round(
    value * 100
  );
}

export async function updateSiteSettings(
  formData
) {
  await requireAdmin();
  const businessName =
    getString(
      formData,
      "businessName"
    ) ||
    "Timeless Mineral Creations";

  const turnaroundMinWeeks =
    getPositiveInteger(
      formData,
      "turnaroundMinWeeks",
      2
    );

  const turnaroundMaxWeeks =
    getPositiveInteger(
      formData,
      "turnaroundMaxWeeks",
      10
    );

  if (
    turnaroundMaxWeeks <
    turnaroundMinWeeks
  ) {
    throw new Error(
      "Maximum turnaround time cannot be less than the minimum turnaround time."
    );
  }

  const standardShippingPriceCents =
    getCurrencyCents(
      formData,
      "standardShippingPrice",
      800
    );

  const priorityShippingPriceCents =
    getCurrencyCents(
      formData,
      "priorityShippingPrice",
      1500
    );

  const sitewideSaleEnabled =
    formData.get(
      "sitewideSaleEnabled"
    ) === "on";

  const sitewideSalePercent =
    getPercentage(
      formData,
      "sitewideSalePercent",
      0
    );

  const sitewideSaleName =
    getNullableString(
      formData,
      "sitewideSaleName"
    );

  const data = {
    businessName,

    contactEmail:
      getNullableString(
        formData,
        "contactEmail"
      ),

    contactPhone:
      getNullableString(
        formData,
        "contactPhone"
      ),

    addressLine1:
      getNullableString(
        formData,
        "addressLine1"
      ),

    addressLine2:
      getNullableString(
        formData,
        "addressLine2"
      ),

    city:
      getNullableString(
        formData,
        "city"
      ),

    state:
      getNullableString(
        formData,
        "state"
      ),

    postalCode:
      getNullableString(
        formData,
        "postalCode"
      ),

    country:
      getString(
        formData,
        "country"
      ) || "USA",

    turnaroundMinWeeks,
    turnaroundMaxWeeks,

    usShippingOnly:
      formData.get(
        "usShippingOnly"
      ) === "on",

    standardShippingPriceCents,

    priorityShippingPriceCents,

    shippingInstructions:
      getNullableString(
        formData,
        "shippingInstructions"
      ),

    memorialInstructions:
      getNullableString(
        formData,
        "memorialInstructions"
      ),

    sitewideSaleEnabled,
    sitewideSalePercent,
    sitewideSaleName,

    announcementEnabled:
      formData.get(
        "announcementEnabled"
      ) === "on",

    announcementText:
      getNullableString(
        formData,
        "announcementText"
      ),

    facebookUrl:
      getNullableString(
        formData,
        "facebookUrl"
      ),

    instagramUrl:
      getNullableString(
        formData,
        "instagramUrl"
      ),

    tiktokUrl:
      getNullableString(
        formData,
        "tiktokUrl"
      ),

    etsyUrl:
      getNullableString(
        formData,
        "etsyUrl"
      ),
  };

  await prisma.siteSettings.upsert({
    where: {
      id: SETTINGS_ID,
    },

    update: data,

    create: {
      id: SETTINGS_ID,
      ...data,
    },
  });

  revalidatePath(
    "/admin/settings"
  );

  revalidatePath(
    "/",
    "layout"
  );

  revalidatePath(
    "/collections",
    "page"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );

  revalidatePath(
    "/cart",
    "page"
  );

  redirect(
    "/admin/settings?saved=1"
  );
}