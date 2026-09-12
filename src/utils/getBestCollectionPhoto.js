function normalizeValue(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (
        value &&
        typeof value === "object"
      ) {
        return normalizeValue(
          value.id ||
            value.slug ||
            value.name ||
            value.value
        );
      }

      return normalizeValue(value);
    })
    .filter(Boolean);
}

function getPhotoImage(photo) {
  if (!photo) {
    return null;
  }

  if (typeof photo === "string") {
    return photo;
  }

  return (
    photo.image ||
    photo.imageUrl ||
    photo.src ||
    null
  );
}

function getPhotoArray(
  photo,
  pluralField,
  singularField
) {
  const plural = photo?.[pluralField];

  if (
    Array.isArray(plural) &&
    plural.length > 0
  ) {
    return normalizeArray(plural);
  }

  const singular =
    photo?.[singularField];

  if (singular) {
    return [
      normalizeValue(singular),
    ].filter(Boolean);
  }

  return [];
}

function getWidthValue(width) {
  if (
    width &&
    typeof width === "object"
  ) {
    return Number(
      width.width ??
        width.widthMm ??
        width.value
    );
  }

  return Number(width);
}

function arraysOverlap(a, b) {
  return a.some((value) =>
    b.includes(value)
  );
}

function allPhotoValuesSelected(
  photoValues,
  selectedValues
) {
  if (photoValues.length === 0) {
    return true;
  }

  return photoValues.every((value) =>
    selectedValues.includes(value)
  );
}

export default function getBestCollectionPhoto({
  photos = [],

  selectedMaterial = "",
  selectedFinish = "",
  selectedCore = null,
  selectedWidth = null,
  selectedInlayStyle = null,

  selectedMinerals = [],
  selectedMemorialMaterials = [],
  selectedAccentMaterials = [],
  selectedGlow = null,

  fallbackImage = null,
}) {
  if (
    !Array.isArray(photos) ||
    photos.length === 0
  ) {
    return fallbackImage;
  }

  const material =
    normalizeValue(selectedMaterial);

  const finish =
    normalizeValue(
      selectedFinish?.name ||
        selectedFinish?.finish ||
        selectedFinish
    );

  const coreId =
    normalizeValue(
      selectedCore?.id ||
        selectedCore?.slug ||
        selectedCore
    );

  const width =
    getWidthValue(selectedWidth);

  const inlayStyleId =
    normalizeValue(
      selectedInlayStyle?.id ||
        selectedInlayStyle?.slug ||
        selectedInlayStyle
    );

  const mineralIds =
    normalizeArray(selectedMinerals);

  const memorialMaterialIds =
    normalizeArray(
      selectedMemorialMaterials
    );

  const accentMaterialIds =
    normalizeArray(
      selectedAccentMaterials
    );

  const glowId =
    normalizeValue(
      selectedGlow?.id ||
        selectedGlow?.slug ||
        selectedGlow
    );

  const scoredPhotos = photos
    .map((photo, originalIndex) => {
      const image = getPhotoImage(photo);

      if (!image) {
        return null;
      }

      /*
       * Plain image strings remain valid
       * fallback/gallery photos.
       */
      if (typeof photo === "string") {
        return {
          photo,
          image,
          score: 0,
          originalIndex,
        };
      }

      let score = 0;
      let incompatible = false;

      /*
       * MATERIAL
       */
      if (photo.material) {
        const photoMaterial =
          normalizeValue(photo.material);

        if (material) {
          if (
            photoMaterial === material
          ) {
            score += 40;
          } else {
            incompatible = true;
          }
        }
      }

      /*
       * FINISH
       */
      if (photo.finish) {
        const photoFinish =
          normalizeValue(photo.finish);

        if (finish) {
          if (
            photoFinish === finish
          ) {
            score += 35;
          } else {
            incompatible = true;
          }
        }
      }

      /*
       * PRODUCT BASE / CORE
       */
      if (photo.coreId) {
        const photoCoreId =
          normalizeValue(photo.coreId);

        if (coreId) {
          if (
            photoCoreId === coreId
          ) {
            score += 50;
          } else {
            incompatible = true;
          }
        }
      }

      /*
       * WIDTH
       */
      const photoWidth =
        Number(
          photo.widthMm ??
            photo.width
        );

      if (
        Number.isFinite(photoWidth) &&
        Number.isFinite(width)
      ) {
        if (photoWidth === width) {
          score += 25;
        } else {
          incompatible = true;
        }
      }

      /*
       * INLAY STYLE
       */
      if (photo.inlayStyleId) {
        const photoStyle =
          normalizeValue(
            photo.inlayStyleId
          );

        if (inlayStyleId) {
          if (
            photoStyle ===
            inlayStyleId
          ) {
            score += 45;
          } else {
            incompatible = true;
          }
        }
      }

      /*
       * MINERALS
       */
      const photoMinerals =
  Array.isArray(photo.minerals) &&
  photo.minerals.length > 0
    ? normalizeArray(photo.minerals)
    : getPhotoArray(
        photo,
        "mineralIds",
        "mineral"
      );

      if (
        photoMinerals.length > 0 &&
        mineralIds.length > 0
      ) {
        if (
          allPhotoValuesSelected(
            photoMinerals,
            mineralIds
          )
        ) {
          score +=
            30 +
            photoMinerals.length * 5;
        } else {
          incompatible = true;
        }
      }

      /*
       * MEMORIAL MATERIALS
       */
      const photoMemorials =
        getPhotoArray(
          photo,
          "memorialMaterials",
          "keepsakeMaterial"
        );

      if (
        photoMemorials.length > 0 &&
        memorialMaterialIds.length > 0
      ) {
        if (
          allPhotoValuesSelected(
            photoMemorials,
            memorialMaterialIds
          )
        ) {
          score +=
            30 +
            photoMemorials.length * 5;
        } else {
          incompatible = true;
        }
      }

      /*
       * ACCENT MATERIALS
       */
      const photoAccents =
        getPhotoArray(
          photo,
          "accentMaterials",
          "accentMaterial"
        );

      if (
        photoAccents.length > 0 &&
        accentMaterialIds.length > 0
      ) {
        if (
          allPhotoValuesSelected(
            photoAccents,
            accentMaterialIds
          )
        ) {
          score +=
            20 +
            photoAccents.length * 4;
        } else {
          incompatible = true;
        }
      }

      /*
       * GLOW
       */
      const photoGlowIds =
        getPhotoArray(
          photo,
          "glowPowders",
          "glow"
        );

      if (
        photoGlowIds.length > 0 &&
        glowId
      ) {
        if (
          photoGlowIds.includes(
            glowId
          )
        ) {
          score += 20;
        } else {
          incompatible = true;
        }
      }

      /*
       * FEATURED
       *
       * Only used as a tie breaker.
       */
      if (photo.featured) {
        score += 2;
      }

      /*
       * More specifically tagged photos
       * should beat generic photos.
       */
      const specificity =
        [
          photo.material,
          photo.finish,
          photo.coreId,
          Number.isFinite(photoWidth)
            ? photoWidth
            : null,
          photo.inlayStyleId,
        ].filter(Boolean).length +
        photoMinerals.length +
        photoMemorials.length +
        photoAccents.length +
        photoGlowIds.length;

      score += specificity;

      return {
        photo,
        image,
        score:
          incompatible
            ? -100000
            : score,
        originalIndex,
      };
    })
    .filter(Boolean)
    .filter(
      (entry) =>
        entry.score > -100000
    );

  if (scoredPhotos.length === 0) {
    return fallbackImage;
  }

  scoredPhotos.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const aSort =
      typeof a.photo === "object"
        ? Number(
            a.photo.sortOrder ?? 0
          )
        : 0;

    const bSort =
      typeof b.photo === "object"
        ? Number(
            b.photo.sortOrder ?? 0
          )
        : 0;

    if (aSort !== bSort) {
      return aSort - bSort;
    }

    return (
      a.originalIndex -
      b.originalIndex
    );
  });

  return (
    scoredPhotos[0]?.image ||
    fallbackImage
  );
}