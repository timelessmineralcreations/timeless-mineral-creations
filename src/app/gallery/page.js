import fs from "fs";
import path from "path";

import { prisma } from "@/lib/prisma";
import GalleryClient from "@/components/GalleryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery | Timeless Mineral Creations",
  description:
    "Browse handcrafted memorial rings and custom mineral jewelry created by Timeless Mineral Creations.",
};

function formatLabel(value = "") {
  return value
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function getLegacyGalleryPhotos() {
  const ringsDirectory = path.join(
    process.cwd(),
    "public",
    "rings"
  );

  if (!fs.existsSync(ringsDirectory)) {
    return [];
  }

  const folders = fs
    .readdirSync(ringsDirectory, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  const photos = [];

  folders.forEach((folder) => {
    const folderPath = path.join(
      ringsDirectory,
      folder.name
    );

    const files = fs
      .readdirSync(folderPath, {
        withFileTypes: true,
      })
      .filter(
        (entry) =>
          entry.isFile() &&
          /\.(png|jpg|jpeg|webp|gif)$/i.test(
            entry.name
          )
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    files.forEach((file) => {
      photos.push({
        id: `legacy-${folder.name}-${file.name}`,
        collectionId: folder.name,
        collectionName: formatLabel(
          folder.name
        ),
        image: `/rings/${folder.name}/${file.name}`,
        title: formatLabel(file.name),
        filename: file.name,
        source: "legacy",
      });
    });
  });

  return photos;
}

async function getDatabaseGalleryPhotos() {
  const photos =
    await prisma.collectionPhoto.findMany({
      where: {
        active: true,
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

      select: {
        id: true,
        imageUrl: true,
        altText: true,
        caption: true,
        featured: true,
        sortOrder: true,

        collection: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

  return photos
    .filter((photo) => photo.imageUrl)
    .map((photo) => ({
      id: `database-${photo.id}`,

      collectionId:
        photo.collection?.slug ||
        photo.collection?.id ||
        "collection",

      collectionName:
        photo.collection?.name ||
        "Timeless Mineral Creations",

      image: photo.imageUrl,

      title:
        photo.caption ||
        photo.altText ||
        photo.collection?.name ||
        "Memorial Jewelry",

      filename:
        photo.imageUrl
          .split("/")
          .pop()
          ?.split("?")[0] || "",

      featured: photo.featured,
      sortOrder: photo.sortOrder,
      source: "database",
    }));
}

export default async function GalleryPage() {
  const databasePhotos =
    await getDatabaseGalleryPhotos();

  const legacyPhotos =
    getLegacyGalleryPhotos();

  // Admin/database photos take priority.
  const seenImages = new Set();

  const photos = [
    ...databasePhotos,
    ...legacyPhotos,
  ].filter((photo) => {
    if (!photo.image) {
      return false;
    }

    if (seenImages.has(photo.image)) {
      return false;
    }

    seenImages.add(photo.image);

    return true;
  });

  return <GalleryClient photos={photos} />;
}