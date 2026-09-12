import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  getGalleryImages,
  getPrimaryGalleryImage,
} from "@/lib/gallery";

import GalleryViewer from "@/components/gallery/GalleryViewer";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}) {
  const { id } = await params;

  const item =
    await prisma.galleryItem.findFirst({
      where: {
        id,
        active: true,
      },

      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

  if (!item) {
    return {
      title:
        "Gallery Piece | Timeless Mineral Creations",
    };
  }

  const primaryImage =
    getPrimaryGalleryImage(item);

  return {
    title: `${item.title} | Timeless Mineral Creations`,

    description:
      item.description ||
      `View ${item.title}, a handcrafted memorial keepsake by Timeless Mineral Creations.`,

    openGraph: primaryImage
      ? {
          images: [
            {
              url: primaryImage.imageUrl,
              alt:
                primaryImage.altText ||
                item.title,
            },
          ],
        }
      : undefined,
  };
}

export default async function GalleryDetailPage({
  params,
}) {
  const { id } = await params;

  const item =
    await prisma.galleryItem.findFirst({
      where: {
        id,
        active: true,
      },

      include: {
        collection: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

  if (!item) {
    notFound();
  }

  const images =
    getGalleryImages(item);

  const relatedItems =
    await prisma.galleryItem.findMany({
      where: {
        active: true,
        id: {
          not: item.id,
        },

        ...(item.collectionId
          ? {
              collectionId:
                item.collectionId,
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

      take: 3,
    });

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-12 text-white sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1450px]">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 font-bold text-white/60 transition hover:text-[#d4af37]"
        >
          ← Back to Gallery
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] lg:items-start">
          <GalleryViewer
            title={item.title}
            images={images}
          />

          <section className="lg:sticky lg:top-24">
            {item.collection ? (
              <Link
                href={`/collections/${item.collection.slug}`}
                className="text-sm font-bold uppercase tracking-[0.18em] text-[#e1ad43] transition hover:text-white"
              >
                {item.collection.name}
              </Link>
            ) : (
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e1ad43]">
                Handcrafted Memorial
              </p>
            )}

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {item.title}
            </h1>

            {item.description ? (
              <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/65">
                {item.description}
              </p>
            ) : null}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h2 className="text-lg font-bold">
                Create Your Own Keepsake
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/58">
                Every piece is handcrafted
                around your chosen jewelry,
                memorial materials, minerals,
                colors, and meaningful details.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {item.collection ? (
                  <Link
                    href={`/collections/${item.collection.slug}`}
                    className="rounded-full bg-gradient-to-r from-[#efc15c] to-[#c99425] px-6 py-3 font-black text-black transition hover:brightness-110"
                  >
                    Design This Style
                  </Link>
                ) : (
                  <Link
                    href="/collections"
                    className="rounded-full bg-gradient-to-r from-[#efc15c] to-[#c99425] px-6 py-3 font-black text-black transition hover:brightness-110"
                  >
                    Explore Collections
                  </Link>
                )}

                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  Ask a Question
                </Link>
              </div>
            </div>

            {item.instagramUrl ? (
              <a
                href={item.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex font-bold text-[#e1ad43] transition hover:text-white"
              >
                View on Instagram →
              </a>
            ) : null}
          </section>
        </div>

        {relatedItems.length > 0 ? (
          <section className="mt-20 border-t border-white/10 pt-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e1ad43]">
                  More Inspiration
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Related Memorial Pieces
                </h2>
              </div>

              <Link
                href="/gallery"
                className="font-bold text-[#e1ad43] transition hover:text-white"
              >
                View Full Gallery →
              </Link>
            </div>

            <GalleryGrid
              items={relatedItems}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}