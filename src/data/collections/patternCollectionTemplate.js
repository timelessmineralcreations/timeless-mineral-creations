export function createPatternCollection({
  id,
  name,
  description,
  heroImage,
  startingPrice,
  ringCores,
  pricing,
  ringPhotos,
  inlayStyleId,
}) {
  return {
    id,
    slug: id,

    name,
    description,
    heroImage,
    startingPrice,

    builder: "standard",

    ringCores,
    pricing,
    ringPhotos,

    availableInlayStyles: [inlayStyleId],

    options: {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: false,
        max: 0,
      },

      accentMaterials: {
        enabled: false,
        allowed: [],
        max: 0,
      },

      glow: {
        enabled: true,
        max: 1,
      },

      engraving: {
        enabled: true,
        maxCharacters: 25,
      },

      specialRequest: {
        enabled: false,
      },
    },
  };
}