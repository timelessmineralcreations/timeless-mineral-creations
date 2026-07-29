import fs from "fs";
import path from "path";
import GalleryClient from "@/components/GalleryClient";

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

function getGalleryPhotos() {
  const ringsDirectory = path.join(process.cwd(), "public", "rings");

  if (!fs.existsSync(ringsDirectory)) {
    return [];
  }

  const folders = fs
    .readdirSync(ringsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const photos = [];

  folders.forEach((folder) => {
    const folderPath = path.join(ringsDirectory, folder.name);

    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isFile() &&
          /\.(png|jpg|jpeg|webp|gif)$/i.test(entry.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    files.forEach((file) => {
      photos.push({
        id: `${folder.name}-${file.name}`,
        collectionId: folder.name,
        collectionName: formatLabel(folder.name),
        image: `/rings/${folder.name}/${file.name}`,
        title: formatLabel(file.name),
        filename: file.name,
      });
    });
  });

  return photos;
}

export default function GalleryPage() {
  const photos = getGalleryPhotos();

  return <GalleryClient photos={photos} />;
}