import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (
    !session?.user?.email ||
    session.user.email !== "timelessmineralcreations@gmail.com"
  ) {
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
