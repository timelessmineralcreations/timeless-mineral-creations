import { horizonMountainRingCores } from "./ringCores";
import { horizonMountainPricing } from "./pricing";
import { horizonMountainRingPhotos } from "./ringPhotos";

export const horizonMountainCollection = {
  id: "horizon-mountain",
  slug: "horizon-mountain",

  name: "Horizon Mountain Collection",

  description:
    "A handcrafted titanium memorial ring featuring a mountain range that separates two independently customizable inlays. Personalize the Sky Inlay and Landscape Inlay using cremation ashes, sand, soil, or a natural mineral. Add an optional glow powder to each inlay and finish your ring with a custom inside engraving.",

  heroImage: "/hero/horizon-hero.png",

  startingPrice: 130,

  builder: "focus",

  ringCores: horizonMountainRingCores,
  pricing: horizonMountainPricing,
  ringPhotos: horizonMountainRingPhotos,

  availableInlayStyles: [
    "horizon-mountain-custom-inlays",
  ],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
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
      enabled: false,
      max: 0,
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