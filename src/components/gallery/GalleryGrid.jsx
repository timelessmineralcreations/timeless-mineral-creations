import GalleryCard from "./GalleryCard";

export default function GalleryGrid({
  items = [],
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
        <div className="text-5xl">📸</div>

        <h2 className="mt-5 text-2xl font-bold text-white">
          No gallery pieces found
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/55">
          Try a different search or collection
          filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}