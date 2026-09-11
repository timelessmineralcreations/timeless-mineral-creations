import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseConfiguration(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function GET() {
  const session = await auth();

  const sessionEmail =
    session?.user?.email?.toLowerCase();

  const adminEmail =
    process.env.ADMIN_EMAIL?.toLowerCase();

  if (
    !sessionEmail ||
    !adminEmail ||
    sessionEmail !== adminEmail
  ) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const collections =
    await prisma.collection.findMany({
      where: {
        slug: {
          in: [
            "keepsake-branch-necklace",
            "keepsake-branch-ring",
          ],
        },
      },

      select: {
        id: true,
        name: true,
        slug: true,
        published: true,
        configurationJson: true,

        pricingRules: {
          orderBy: [
            { category: "asc" },
            { sortOrder: "asc" },
          ],

          select: {
            category: true,
            optionKey: true,
            label: true,
            amountCents: true,
            active: true,
          },
        },
      },
    });

  return Response.json({
    collections: collections.map(
      (collection) => ({
        ...collection,
        configurationJson:
          parseConfiguration(
            collection.configurationJson
          ),
      })
    ),
  });
}
