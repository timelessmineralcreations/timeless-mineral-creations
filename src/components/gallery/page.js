import Link from "next/link";

import { prisma } from "@/lib/prisma";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Memorial Jewelry Gallery | Timeless Mineral Creations",
  description:
    "Browse handcrafted memorial rings, necklaces, bracelets, and keepsakes created with cremation ashes, hair, fur, meaningful minerals, and other treasured materials.",
};

export default async function GalleryPage({
  searchParams,
}) {
  const resolvedSearchParams =
    await searchParams;

  const search = String(
    resolvedSearchParams?.q || ""
  ).trim();

  const collectionId = String(
    resolvedSearchParams?.collection || ""
  ).trim();

  const [galleryItems, collections] =
    await Promise.all([
      prisma.galleryItem.findMany({
        where: {
          active: true,

          ...(collectionId
            ? {
                collectionId,
              }
            : {}),

          ...(search
            ? {
                OR: [
                  {
                    title: {
                      contains: search,
                    },
                  },
                  {
                    description: {
                      contains: search,
                    },
                  },
                  {
                    collection: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                ],
              }
            : {}),
        },

        include: {
          collection: true,

          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },

        orderBy: [
          {
            featured: "desc",
          },
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      prisma.collection.findMany({
        where: {
          galleryItems: {
            some: {
              active: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  const filtersActive =
    Boolean(search || collectionId);

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1450px]">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#e1ad43]">
            Handcrafted Keepsakes
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Memorial Gallery
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
            Explore completed memorial and
            keepsake jewelry created to preserve
            meaningful memories, materials, and
            stories.
          </p>
        </section>

        <form
          method="get"
          className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[minmax(0,1fr)_280px_auto]"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              Search
            </span>

            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search rings, minerals, or collections..."
              className="min-h-12 rounded-xl border border-white/12 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#d4af37]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              Collection
            </span>

            <select
              name="collection"
              defaultValue={collectionId}
              className="min-h-12 rounded-xl border border-white/12 bg-[#111] px-4 text-white outline-none transition focus:border-[#d4af37]"
            >
              <option value="">
                All collections
              </option>

              {collections.map(
                (collection) => (
                  <option
                    key={collection.id}
                    value={collection.id}
                  >
                    {collection.name}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-[#efc15c] to-[#c99425] px-6 font-black text-black transition hover:brightness-110"
            >
              Search
            </button>

            {filtersActive ? (
              <Link
                href="/gallery"
                className="grid min-h-12 place-items-center rounded-xl border border-white/15 px-5 font-bold text-white/70 transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            {galleryItems.length}{" "}
            {galleryItems.length === 1
              ? "piece"
              : "pieces"}
          </p>

          <Link
            href="/collections"
            className="font-bold text-[#e1ad43] transition hover:text-white"
          >
            Explore Collections →
          </Link>
        </div>

        <GalleryGrid
          items={galleryItems}
        />
      </div>
    </main>
  );
}