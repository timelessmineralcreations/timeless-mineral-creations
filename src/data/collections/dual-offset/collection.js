import { dualOffsetRingCores } from "./ringCores";
import { dualOffsetPricing } from "./pricing";
import { dualOffsetRingPhotos } from "./ringPhotos";

export const dualOffsetCollection = {
  id: "dual-offset",
  slug: "dual-offset",

  name: "Dual Offset Memorial Collection",

  description:
    "A modern dual offset channel memorial ring with two separate channels that can each be customized with cremation ashes, hair, pet fur, horse hair, sand, soil, or natural minerals.",

  heroImage: "/hero/dual-offset-hero.png",

  startingPrice: 130,

  builder: "dual-channel",

  ringCores: dualOffsetRingCores,
  pricing: dualOffsetPricing,
  ringPhotos: dualOffsetRingPhotos,

  availableInlayStyles: ["dual-offset-custom"],

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