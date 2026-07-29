import { twinOffsetRingCores } from "./ringCores";
import { twinOffsetPricing } from "./pricing";
import { twinOffsetRingPhotos } from "./ringPhotos";

export const twinOffsetCollection = {
  id: "twin-offset",
  slug: "twin-offset",

  name: "Twin Offset Memorial Collection",

  description:
    "A hammered tungsten twin offset ring featuring cremation ashes paired with one natural mineral. Add optional glow powder and inside engraving.",

  heroImage: "/hero/twin-offset-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: twinOffsetRingCores,
  pricing: twinOffsetPricing,
  ringPhotos: twinOffsetRingPhotos,

  availableInlayStyles: ["twin-offset-cremation-mineral"],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes"],
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 1,
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