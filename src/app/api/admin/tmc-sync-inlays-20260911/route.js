import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

const CONFIRMATION =
  "SYNC_TORNADO_OCEAN_INLAYS";

export async function POST(request) {
  try {
    const session = await auth();

    const sessionEmail = String(
      session?.user?.email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !sessionEmail ||
      !ADMIN_EMAIL ||
      sessionEmail !== ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    if (
      body?.confirm !== CONFIRMATION
    ) {
      return NextResponse.json(
        {
          error:
            "Confirmation phrase is required.",
        },
        {
          status: 400,
        }
      );
    }

    const wanted = {
      tornado: [
        "dual-mineral-memorial-blend",
        "tornado-twin-memorial",
      ],

      ocean: [
        "mountain-memorial",
        "mountain-mineral-sprinkle",
        "mountain-solid-memorial",
        "mountain-solid-mineral",
      ],
    };

    const collectionSlugs =
      Object.keys(wanted);

    const styleSlugs =
      [
        ...new Set(
          Object.values(wanted).flat()
        ),
      ];

    const collections =
      await prisma.collection.findMany({
        where: {
          slug: {
            in: collectionSlugs,
          },
        },

        select: {
          id: true,
          slug: true,
          name: true,
        },
      });

    if (
      collections.length !==
      collectionSlugs.length
    ) {
      return NextResponse.json(
        {
          error:
            "Expected production collections were not found.",
          found:
            collections.map(
              (collection) =>
                collection.slug
            ),
        },
        {
          status: 409,
        }
      );
    }

    const styles =
      await prisma.inlayStyle.findMany({
        where: {
          slug: {
            in: styleSlugs,
          },
        },

        select: {
          id: true,
          slug: true,
          name: true,
          active: true,
        },
      });

    if (
      styles.length !==
      styleSlugs.length
    ) {
      return NextResponse.json(
        {
          error:
            "Expected production inlay styles were not found.",
          found:
            styles.map(
              (style) =>
                style.slug
            ),
        },
        {
          status: 409,
        }
      );
    }

    const collectionBySlug =
      Object.fromEntries(
        collections.map(
          (collection) => [
            collection.slug,
            collection,
          ]
        )
      );

    const styleBySlug =
      Object.fromEntries(
        styles.map(
          (style) => [
            style.slug,
            style,
          ]
        )
      );

    let added = 0;
    let reactivated = 0;

    await prisma.$transaction(
      async (tx) => {
        for (
          const [
            collectionSlug,
            wantedStyleSlugs,
          ] of Object.entries(wanted)
        ) {
          const collection =
            collectionBySlug[
              collectionSlug
            ];

          const existing =
            await tx
              .collectionInlayStyle
              .findMany({
                where: {
                  collectionId:
                    collection.id,
                },

                select: {
                  id: true,
                  inlayStyleId: true,
                  sortOrder: true,
                  active: true,
                },
              });

          let nextSortOrder =
            existing.length
              ? Math.max(
                  ...existing.map(
                    (entry) =>
                      entry.sortOrder
                  )
                ) + 1
              : 0;

          for (
            const styleSlug of
            wantedStyleSlugs
          ) {
            const style =
              styleBySlug[
                styleSlug
              ];

            const current =
              existing.find(
                (entry) =>
                  entry.inlayStyleId ===
                  style.id
              );

            if (current) {
              if (!current.active) {
                await tx
                  .collectionInlayStyle
                  .update({
                    where: {
                      id:
                        current.id,
                    },

                    data: {
                      active: true,
                    },
                  });

                reactivated++;
              }

              continue;
            }

            await tx
              .collectionInlayStyle
              .create({
                data: {
                  collectionId:
                    collection.id,

                  inlayStyleId:
                    style.id,

                  sortOrder:
                    nextSortOrder++,

                  active: true,
                },
              });

            added++;
          }
        }
      }
    );

    const verify =
      await prisma.collection.findMany({
        where: {
          slug: {
            in: collectionSlugs,
          },
        },

        select: {
          slug: true,
          name: true,

          inlayStyles: {
            where: {
              active: true,
            },

            orderBy: {
              sortOrder: "asc",
            },

            select: {
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

    return NextResponse.json({
      ok: true,
      added,
      reactivated,

      collections:
        verify.map(
          (collection) => ({
            slug:
              collection.slug,

            styles:
              collection
                .inlayStyles
                .map(
                  (entry) =>
                    entry
                      .inlayStyle
                      .slug
                ),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Production inlay sync failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Production inlay sync failed.",
      },
      {
        status: 500,
      }
    );
  }
}
