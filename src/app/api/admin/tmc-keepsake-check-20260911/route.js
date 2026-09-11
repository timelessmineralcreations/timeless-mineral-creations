import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseConfiguration(value) {
  if (!value) return {};

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function isAuthorizedAdmin() {
  const session = await auth();

  const sessionEmail =
    session?.user?.email?.toLowerCase();

  const adminEmail =
    process.env.ADMIN_EMAIL?.toLowerCase();

  return Boolean(
    sessionEmail &&
      adminEmail &&
      sessionEmail === adminEmail
  );
}

export async function GET() {
  if (!(await isAuthorizedAdmin())) {
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

export async function POST(request) {
  if (!(await isAuthorizedAdmin())) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (
    body?.confirm !==
    "SYNC_KEEP_BRANCH_NECKLACE_20260911"
  ) {
    return Response.json(
      { error: "Confirmation token is required." },
      { status: 400 }
    );
  }

  const collection =
    await prisma.collection.findUnique({
      where: {
        slug: "keepsake-branch-necklace",
      },

      select: {
        id: true,
        configurationJson: true,
      },
    });

  if (!collection) {
    return Response.json(
      { error: "Keepsake Branch Necklace not found." },
      { status: 404 }
    );
  }

  const configuration =
    parseConfiguration(
      collection.configurationJson
    );

  const existingOptions =
    configuration.options &&
    typeof configuration.options === "object" &&
    !Array.isArray(configuration.options)
      ? configuration.options
      : {};

  const nextConfiguration = {
    ...configuration,

    options: {
      ...existingOptions,

      keepsakeMaterials: {
        enabled: true,
        allowed: [
          "breastMilk",
          "cremation",
          "specialRequest",
        ],
        max: 1,
      },
    },
  };

  const rules = [
    {
      optionKey: "breastMilk",
      label: "Breast Milk",
      amountCents: 0,
    },
    {
      optionKey: "cremation",
      label: "Cremation Ashes",
      amountCents: 0,
    },
    {
      optionKey: "specialRequest",
      label: "Special Request",
      amountCents: 3000,
    },
  ];

  await prisma.$transaction(
    async (transaction) => {
      await transaction.collection.update({
        where: {
          id: collection.id,
        },

        data: {
          configurationJson:
            JSON.stringify(
              nextConfiguration
            ),
        },
      });

      await transaction.collectionPricingRule.deleteMany({
        where: {
          collectionId: collection.id,
          category: "keepsakeMaterials",
        },
      });

      for (
        let index = 0;
        index < rules.length;
        index += 1
      ) {
        const rule = rules[index];

        await transaction.collectionPricingRule.create({
          data: {
            collectionId: collection.id,
            category: "keepsakeMaterials",
            optionKey: rule.optionKey,
            label: rule.label,
            amountCents: rule.amountCents,
            active: true,
            sortOrder: index,
          },
        });
      }
    }
  );

  return Response.json({
    ok: true,
    slug: "keepsake-branch-necklace",
    keepsakeMaterials:
      nextConfiguration.options
        .keepsakeMaterials,
    pricingRules: rules,
  });
}