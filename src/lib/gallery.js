export function getGalleryImages(item) {
  const relationalImages = Array.isArray(
    item?.images
  )
    ? item.images
        .filter((image) => image?.imageUrl)
        .sort(
          (first, second) =>
            first.sortOrder - second.sortOrder
        )
    : [];

  if (relationalImages.length > 0) {
    return relationalImages;
  }

  if (item?.imageUrl) {
    return [
      {
        id: `legacy-${item.id}`,
        imageUrl: item.imageUrl,
        altText:
          item.altText || item.title || "",
        caption: null,
        sortOrder: 0,
        primary: true,
      },
    ];
  }

  return [];
}

export function getPrimaryGalleryImage(item) {
  const images = getGalleryImages(item);

  return (
    images.find((image) => image.primary) ||
    images[0] ||
    null
  );
}