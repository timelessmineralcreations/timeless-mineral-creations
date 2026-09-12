import { accentMaterials } from "@/data/accentMaterials";

export default function calculateRingPrice({
  collection,
  selectedCore,
  selectedWidth,
  selectedInlayStyle,
  selectedMaterials = [],
  selectedMinerals = [],
  selectedAccentMaterials = [],
  selectedGlow,
  selectedChannels = {},
  engravingEnabled = false,
  engravingType = "standard",
  specialRequest = false,
  selectedMaterial,
}) {
  const pricing =
    collection?.useDatabasePricing &&
    collection?.databasePricing
      ? collection.databasePricing
      : collection?.pricing || {};

  const usingDatabasePricing =
    collection?.useDatabasePricing &&
    collection?.databasePricing;

  let totalPrice = 0;

  /*
   * DATABASE COLLECTIONS
   *
   * Database pricing separates the base product
   * and profit, so include both.
   */
  if (usingDatabasePricing) {
    totalPrice += Number(
      pricing.baseProduct || 0
    );

    totalPrice += Number(
      pricing.profit || 0
    );
  } else {
    /*
     * LEGACY COLLECTIONS
     *
     * Preserve the existing pricing behavior so
     * the older hand-coded collections do not
     * suddenly change price.
     */
    totalPrice += Number(
      pricing.profit || 100
    );
  }

  /*
   * METAL / BAND MATERIAL
   */
  const metal =
    selectedMaterial ||
    selectedCore?.material ||
    collection?.defaults?.metal;

  if (metal) {
    totalPrice += Number(
      pricing.metal?.[metal] || 0
    );
  }

  /*
   * WIDTH
   */
  const width =
    selectedWidth?.width ??
    selectedWidth ??
    collection?.defaults?.width;

  if (width != null) {
    totalPrice += Number(
      pricing.width?.[width] || 0
    );
  }

  /*
   * INLAY STYLE
   */
  const inlayStyleId =
    typeof selectedInlayStyle === "string"
      ? selectedInlayStyle
      : selectedInlayStyle?.id;

  if (inlayStyleId) {
    totalPrice += Number(
      pricing.inlayStyles?.[
        inlayStyleId
      ] || 0
    );
  }

  /*
   * MEMORIAL MATERIALS
   */
  selectedMaterials.forEach(
    (material) => {
      const materialId =
        typeof material === "string"
          ? material
          : material?.id;

      totalPrice += Number(
        pricing.memorialMaterials?.[
          materialId
        ] ??
          material?.price ??
          0
      );
    }
  );

  /*
   * MINERALS
   */
  selectedMinerals.forEach(
    (mineral) => {
      const mineralId =
        typeof mineral === "string"
          ? mineral
          : mineral?.id;

      totalPrice += Number(
        pricing.minerals?.[
          mineralId
        ] ??
          mineral?.price ??
          0
      );
    }
  );

  /*
   * ACCENT MATERIALS
   */
  selectedAccentMaterials.forEach(
    (accent) => {
      const accentId =
        typeof accent === "string"
          ? accent
          : accent?.id;

      const accentData =
        accentMaterials.find(
          (item) =>
            item.id === accentId
        );

      totalPrice += Number(
        pricing.accentMaterials?.[
          accentId
        ] ??
          accent?.price ??
          accentData?.price ??
          0
      );
    }
  );

  /*
   * GLOBAL GLOW
   */
  const hasGlobalGlow =
    selectedGlow &&
    selectedGlow !== "none" &&
    selectedGlow?.id !== "none";

  if (hasGlobalGlow) {
    totalPrice += Number(
      selectedGlow?.price ??
        pricing.glow ??
        0
    );
  }

  /*
   * CHANNEL GLOW
   */
  const channelGlowTotal =
    Object.values(
      selectedChannels
    ).reduce(
      (total, selection) => {
        const glow =
          selection?.glow;

        if (
          !glow ||
          glow === "none" ||
          glow?.id === "none"
        ) {
          return total;
        }

        return (
          total +
          Number(
            glow?.price ??
              pricing.glow ??
              0
          )
        );
      },
      0
    );

  totalPrice += channelGlowTotal;

  /*
 * ENGRAVING
 */
if (engravingEnabled) {
  const engravingPrice =
    engravingType === "customSignature"
      ? pricing.engraving?.customSignature ?? 50
      : pricing.engraving?.standard ?? 25;

  totalPrice += Number(
    engravingPrice
  );
}

  /*
   * SPECIAL REQUEST
   */
  if (specialRequest) {
    totalPrice += Number(
      pricing.specialRequest ?? 30
    );
  }

  return {
    totalPrice,
  };
}