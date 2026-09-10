import Link from "next/link";
import { prisma } from "@/lib/prisma";

import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminItemCard from "@/components/admin/ui/AdminItemCard";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const gallery = await prisma.galleryItem.findMany({
    include: {
      collection: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}
    >
      <AdminPageHeader
        eyebrow="Website"
        title="Gallery"
        description="Manage the gallery images displayed throughout your website."
        actionHref="/admin/gallery/new"
        actionLabel="+ New Gallery Image"
      />

      {gallery.length === 0 ? (
        <AdminEmptyState
          title="No Gallery Images"
          description="Upload your first completed memorial piece."
          actionHref="/admin/gallery/new"
          actionLabel="Upload Image"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {gallery.map((item) => (
            <AdminItemCard
              key={item.id}
              href={`/admin/gallery/${item.id}`}
              imageUrl={item.imageUrl}
              imageAlt={item.altText || item.title}
              title={item.title}
              subtitle={item.collection?.name}
              description={item.description}
              featured={item.featured}
              active={item.active}
              fallbackIcon="📸"
            />
          ))}
        </div>
      )}
    </main>
  );
}