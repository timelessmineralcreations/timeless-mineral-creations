"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const SETTINGS_ID = "site-settings";

function getNullableString(formData, name) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

export async function updateContactSettings(formData) {
  await requireAdmin();

  const data = {
    contactEmail: getNullableString(formData, "contactEmail"),
    contactCreatorImageUrl: getNullableString(
      formData,
      "contactCreatorImageUrl"
    ),
    contactCreatorHeading: getNullableString(
      formData,
      "contactCreatorHeading"
    ),
    contactCreatorIntro: getNullableString(
      formData,
      "contactCreatorIntro"
    ),
    contactCreatorBodyOne: getNullableString(
      formData,
      "contactCreatorBodyOne"
    ),
    contactCreatorBodyTwo: getNullableString(
      formData,
      "contactCreatorBodyTwo"
    ),
    contactLocationText: getNullableString(
      formData,
      "contactLocationText"
    ),
    contactResponseTimeText: getNullableString(
      formData,
      "contactResponseTimeText"
    ),
    contactClosingText: getNullableString(
      formData,
      "contactClosingText"
    ),
    contactClosingThankYouText: getNullableString(
      formData,
      "contactClosingThankYouText"
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

  revalidatePath("/admin/contact");
  revalidatePath("/contact");

  redirect("/admin/contact?saved=1");
}
