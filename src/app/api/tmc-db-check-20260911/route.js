import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    "unknown";

  const collection =
    await prisma.collection.findFirst({
      where: {
        slug: "tornado",
      },

      select: {
        name: true,
        slug: true,

        inlayStyles: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            active: true,
            sortOrder: true,

            inlayStyle: {
              select: {
                slug: true,
                name: true,
                active: true,
              },
            },
          },
        },
      },
    });

  if (!collection) {
    return Response.json(
      {
        ok: false,
        commit,
        error: "Tornado collection not found",
      },
      {
        status: 404,
      }
    );
  }

  return Response.json({
    ok: true,
    commit,

    collection: {
      name: collection.name,
      slug: collection.slug,
    },

    inlayStyles:
      collection.inlayStyles.map(
        (entry) => ({
          slug: entry.inlayStyle.slug,
          name: entry.inlayStyle.name,
          relationActive: entry.active,
          styleActive: entry.inlayStyle.active,
          sortOrder: entry.sortOrder,
        })
      ),
  });
}
