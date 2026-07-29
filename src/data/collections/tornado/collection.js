import { tornadoRingPhotos } from "./ringPhotos";
import { tornadoRingCores } from "./ringCores";
import { tornadoPricing } from "./pricing";

export const tornadoCollection = {
  id: "tornado",
  slug: "tornado",
  name: "Tornado Collection",

  description:
    "A handcrafted twisted titanium memorial ring featuring beautifully separated inlay channels. Honor one loved one, two loved ones, or create a meaningful combination of memorial materials and natural minerals.",

  heroImage: "/hero/tornado-hero.png",
  startingPrice: 140,

  builder: "tornado",

  ringCores: tornadoRingCores,
  pricing: tornadoPricing,
  ringPhotos: tornadoRingPhotos,

  availableInlayStyles: [
    "tornado-split",
    "tornado-solid-mineral",
    "dual-mineral-memorial-blend",
    "tornado-twin-memorial",
  ],

  inlayStyleOverrides: {
    "tornado-solid-mineral": {
      memorialMaterials: {
        enabled: false,
        allowed: [],
        max: 0,
      },

      minerals: {
        enabled: true,
        min: 2,
        max: 2,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },

    "dual-mineral-memorial-blend": {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "hair", "fur", "horseHair"],
        min: 1,
        max: 2,
        required: ["ashes"],
      },

      minerals: {
        enabled: true,
        min: 1,
        max: 2,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },

    "tornado-twin-memorial": {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        min: 2,
        max: 2,
        separateSides: true,
      },

      minerals: {
        enabled: false,
        min: 0,
        max: 0,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },
  },

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
        "sand",
        "soil",
      ],
      max: 2,
    },

    minerals: {
      enabled: true,
      max: 2,
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
      enabled: true,
    },
  },
};