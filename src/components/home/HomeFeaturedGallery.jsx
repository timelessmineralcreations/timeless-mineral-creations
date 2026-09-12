import Link from "next/link";

import { prisma } from "@/lib/prisma";
import GalleryCard from "@/components/gallery/GalleryCard";

export default async function HomeFeaturedGallery() {
  const items =
    await prisma.galleryItem.findMany({
      where: {
        active: true,
        homepageFeatured: true,
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
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      take: 6,
    });

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/10 bg-[#0b0b0b] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#e1ad43]">
              Real Completed Pieces
            </p>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Memorial Gallery
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
              Browse handcrafted pieces created
              to honor meaningful memories,
              people, pets, and moments.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-semibold text-[#e1ad43] transition hover:text-white"
          >
            View Full Gallery
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}