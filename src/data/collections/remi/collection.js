import { remiRingCores } from "./ringCores";
import { remiPricing } from "./pricing";
import { remiPhotos } from "./photos";

export const remiCollection = {
  id: "remi",
  slug: "remi",
  name: "The Remi Ring",

  category: "keepsake",

  description:
    "A timeless oval keepsake ring handcrafted with your choice of cremation ashes, breast milk, sand, or soil. Personalize your ring with an optional strand of hair, accent mineral, decorative accent, or glow powder.",

  heroImage: "/rings/remi/remi-cremation-original-opal-hair-2.png",
  cardImagePosition: "center 80%",
  startingPrice: 165,

  builder: "remi",

  ringCores: remiRingCores,
  pricing: remiPricing,
  ringPhotos: remiPhotos,

  options: {
    keepsakeMaterials: {
      enabled: true,
      allowed: ["ashes", "breastMilk", "sand", "soil"],
      max: 1,
    },

    hair: {
      enabled: true,
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 1,
    },

    decorativeAccents: {
      enabled: true,
      allowed: [
        "silverFoil",
        "goldFoil",
        "opalChameleonFlakes",
        "pinkChameleonFlakes",
      ],
      max: 1,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: false,
    },

    specialRequest: {
      enabled: true,
    },
  },
};