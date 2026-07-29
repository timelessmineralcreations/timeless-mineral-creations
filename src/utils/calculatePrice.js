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
  const pricing = collection?.pricing || {};

  let totalPrice = Number(pricing.profit || 100);

  // Ring metal / band cost
  const metal =
    selectedMaterial ||
    selectedCore?.material ||
    collection?.defaults?.metal;

  totalPrice += Number(pricing.metal?.[metal] || 0);

  // Width upgrade
  const width =
    selectedWidth?.width ??
    selectedWidth ??
    collection?.defaults?.width;

  totalPrice += Number(pricing.width?.[width] || 0);

  // Selected inlay design price
  const inlayStyleId =
    typeof selectedInlayStyle === "string"
      ? selectedInlayStyle
      : selectedInlayStyle?.id;

  totalPrice += Number(
    pricing.inlayStyles?.[inlayStyleId] || 0
  );

  // Memorial materials
  selectedMaterials.forEach((material) => {
    const materialId =
      typeof material === "string"
        ? material
        : material?.id;

    totalPrice += Number(
      pricing.memorialMaterials?.[materialId] ||
        material?.price ||
        0
    );
  });

  // Minerals
  selectedMinerals.forEach((mineral) => {
    totalPrice += Number(mineral?.price || 0);
  });

  // Accent materials such as gold foil and silver foil
  selectedAccentMaterials.forEach((accent) => {
    const accentId =
      typeof accent === "string"
        ? accent
        : accent?.id;

    const accentData = accentMaterials.find(
      (item) => item.id === accentId
    );

    totalPrice += Number(
      pricing.accentMaterials?.[accentId] ??
        accent?.price ??
        accentData?.price ??
        0
    );
  });

  // Global glow powder used by standard collections
  const hasGlobalGlow =
    selectedGlow &&
    selectedGlow !== "none" &&
    selectedGlow?.id !== "none";

  if (hasGlobalGlow) {
    totalPrice += Number(
      selectedGlow?.price ?? pricing.glow ?? 0
    );
  }

  // Individual glow powders used inside channels or inlays
  const channelGlowTotal = Object.values(
    selectedChannels
  ).reduce((total, selection) => {
    const glow = selection?.glow;

    if (
      !glow ||
      glow === "none" ||
      glow?.id === "none"
    ) {
      return total;
    }

    return (
      total +
      Number(glow?.price ?? pricing.glow ?? 0)
    );
  }, 0);

  totalPrice += channelGlowTotal;

  // Engraving
  if (engravingEnabled) {
    totalPrice += Number(
      engravingType === "customSignature"
        ? pricing.engraving?.customSignature || 0
        : pricing.engraving?.standard || 0
    );
  }

  // Special request
  if (specialRequest) {
    totalPrice += Number(pricing.specialRequest || 30);
  }

  return {
    totalPrice,
  };
}