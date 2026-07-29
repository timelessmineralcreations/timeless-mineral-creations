export default function getBestRingPhoto({
  photos = [],
  selectedMaterial,
  selectedCore,
  selectedWidth,
  selectedMinerals = [],
  fallbackImage,
}) {
  const clean = (value) =>
    value?.toString().toLowerCase().trim().replaceAll(" ", "-");

  const material = clean(selectedMaterial);
  const width = selectedWidth?.width;
  const mineral = clean(selectedMinerals?.[0]?.id);
  const color = clean(selectedCore?.color);
  const coreId = selectedCore?.id;

  const normalizedPhotos = photos.map((photo) => ({
    ...photo,
    materialKey: clean(photo.material),
    mineralKey: clean(photo.mineral),
    colorKey: clean(photo.color),
  }));

  const sameMaterial = (photo) => photo.materialKey === material;
  const sameColor = (photo) => !photo.colorKey || photo.colorKey === color;
  const sameWidth = (photo) => photo.width === width;
  const sameMineral = (photo) => photo.mineralKey === mineral;
  const sameCore = (photo) => !photo.coreId || photo.coreId === coreId;

  const exactMatch = normalizedPhotos.find(
    (photo) =>
      sameMaterial(photo) &&
      sameCore(photo) &&
      sameColor(photo) &&
      sameWidth(photo) &&
      sameMineral(photo)
  );

  if (exactMatch) return exactMatch.image;

  const sameMaterialAndWidth = normalizedPhotos.find(
    (photo) =>
      sameMaterial(photo) &&
      sameCore(photo) &&
      sameColor(photo) &&
      sameWidth(photo)
  );

  if (sameMaterialAndWidth) return sameMaterialAndWidth.image;

  const sameMaterialAndMineral = normalizedPhotos.find(
    (photo) =>
      sameMaterial(photo) &&
      sameCore(photo) &&
      sameColor(photo) &&
      sameMineral(photo)
  );

  if (sameMaterialAndMineral) return sameMaterialAndMineral.image;

  const sameMaterialOnly = normalizedPhotos.find(
    (photo) => sameMaterial(photo) && sameCore(photo) && sameColor(photo)
  );

  if (sameMaterialOnly) return sameMaterialOnly.image;

  const sameMaterialAnyColor = normalizedPhotos.find(
    (photo) => photo.materialKey === material && sameCore(photo)
  );

  if (sameMaterialAnyColor) return sameMaterialAnyColor.image;

  return fallbackImage;
}