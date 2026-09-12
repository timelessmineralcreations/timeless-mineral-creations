import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeSalePercent(value) {
  const percent = Number(value);

  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round(percent)
    )
  );
}

export async function GET() {
  try {
    const settings =
      await prisma.siteSettings.findUnique({
        where: {
          id: "site-settings",
        },

        select: {
          sitewideSaleEnabled: true,
          sitewideSalePercent: true,
          sitewideSaleName: true,
        },
      });

    const percent =
      normalizeSalePercent(
        settings?.sitewideSalePercent
      );

    const enabled =
      Boolean(
        settings?.sitewideSaleEnabled
      ) &&
      percent > 0;

    return Response.json(
      {
        enabled,
        percent,
        name:
          settings?.sitewideSaleName ||
          "",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Could not load site-wide sale settings:",
      error
    );

    return Response.json(
      {
        enabled: false,
        percent: 0,
        name: "",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}