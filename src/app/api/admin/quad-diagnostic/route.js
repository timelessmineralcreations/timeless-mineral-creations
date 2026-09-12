import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseConfiguration(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

async function isAuthorizedAdmin() {
  const session = await auth();

  return (
    session?.user?.email ===
    "timelessmineralcreations@gmail.com"
  );
}

export async function GET() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const collection = await prisma.collection.findFirst({
    where: {
      slug: "quad",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      published: true,
      configurationJson: true,
      pricingRules: {
        where: {
          active: true,
        },
        select: {
          category: true,
          optionKey: true,
          amountCents: true,
          active: true,
        },
      },
    },
  });

  return NextResponse.json({
    collection,
  });
}

export async function POST(request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (
    body?.confirm !==
    "SYNC_QUAD_MEMORIALS_20260912"
  ) {
    return NextResponse.json(
      { error: "Confirmation token is required." },
      { status: 400 }
    );
  }

  const collection = await prisma.collection.findFirst({
    where: {
      slug: "quad",
    },
    select: {
      id: true,
      configurationJson: true,
    },
  });

  if (!collection) {
    return NextResponse.json(
      { error: "Quad collection not found." },
      { status: 404 }
    );
  }

  const configuration = parseConfiguration(
    collection.configurationJson
  );

  const existingOptions =
    configuration.options &&
    typeof configuration.options === "object" &&
    !Array.isArray(configuration.options)
      ? configuration.options
      : {};

  const memorialMaterials = {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    max: 4,
  };

  const nextConfiguration = {
    ...configuration,
    options: {
      ...existingOptions,
      memorialMaterials,
    },
  };

  const rules = [
    {
      optionKey: "ashes",
      label: "Cremation Ashes",
      amountCents: 0,
    },
    {
      optionKey: "hair",
      label: "Hair",
      amountCents: 2000,
    },
    {
      optionKey: "fur",
      label: "Pet Fur",
      amountCents: 2000,
    },
    {
      optionKey: "horseHair",
      label: "Horse Hair",
      amountCents: 2500,
    },
    {
      optionKey: "sand",
      label: "Sand",
      amountCents: 1000,
    },
    {
      optionKey: "soil",
      label: "Soil / Dirt",
      amountCents: 1000,
    },
  ];

  await prisma.$transaction(
    async (transaction) => {
      await transaction.collection.update({
        where: {
          id: collection.id,
        },
        data: {
          configurationJson: JSON.stringify(
            nextConfiguration
          ),
        },
      });

      await transaction.collectionPricingRule.deleteMany({
        where: {
          collectionId: collection.id,
          category: "memorialMaterials",
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
            category: "memorialMaterials",
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

  return NextResponse.json({
    ok: true,
    slug: "quad",
    memorialMaterials,
    pricingRules: rules,
  });
}
