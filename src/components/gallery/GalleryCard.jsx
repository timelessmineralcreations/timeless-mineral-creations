import Link from "next/link";

import {
  getGalleryImages,
  getPrimaryGalleryImage,
} from "@/lib/gallery";

export default function GalleryCard({
  item,
}) {
  const images = getGalleryImages(item);
  const primaryImage =
    getPrimaryGalleryImage(item);

  return (
    <Link
      href={`/gallery/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/55 hover:shadow-[0_20px_50px_rgba(0,0,0,.35)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#090909]">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={
              primaryImage.altText ||
              item.title
            }
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-5xl text-white/30">
            📸
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

        {images.length > 1 ? (
          <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            {images.length} photos
          </div>
        ) : null}

        {item.featured ? (
          <div className="absolute left-3 top-3 rounded-full bg-[#d4af37] px-3 py-1 text-xs font-black text-black">
            Featured
          </div>
        ) : null}
      </div>

      <div className="p-5">
        {item.collection?.name ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37]">
            {item.collection.name}
          </p>
        ) : null}

        <h2 className="text-xl font-bold text-white transition group-hover:text-[#e8b947]">
          {item.title}
        </h2>

        {item.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">
            {item.description}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/55">
            View details
          </span>

          <span className="font-bold text-[#e8b947] transition duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}