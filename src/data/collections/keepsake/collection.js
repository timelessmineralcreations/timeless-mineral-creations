import { keepsakeRingCores } from "./ringCores";
import { keepsakePricing } from "./pricing";
import { keepsakeRingPhotos } from "./ringPhotos";

export const keepsakeCollection = {
  id: "keepsake",
  slug: "keepsake",

  category: "keepsake",

  name: "Keepsake Collection",

  description:
  "A delicate sterling silver keepsake ring featuring marquise inlays separated by sparkling birthstones. Choose preserved breast milk in a timeless pearl-white appearance or cremation ashes in their natural color, then personalize your ring with your chosen CZ birthstone.",

  heroImage: "/hero/birthstone-keepsake-hero.png",

  startingPrice: 165,

  builder: "keepsake",

  ringCores: keepsakeRingCores,
  pricing: keepsakePricing,
  ringPhotos: keepsakeRingPhotos,

  options: {
    keepsakeMaterials: {
      enabled: true,
      allowed: ["breastMilk", "cremation"],
      max: 1,
    },

    birthstones: {
      enabled: true,
      max: 1,

      guideImage:
        "/design-examples/birthstone-color-guide.png",

      arrangements: {
        single: {
          enabled: true,
          name: "Single Birthstone",
          description:
            "One birthstone color repeats between each keepsake inlay.",
        },

        double: {
          enabled: false,
          name: "Two Birthstones",
          description:
            "Two birthstone colors alternate throughout the ring.",
        },

        custom: {
          enabled: false,
          name: "Custom Birthstone Pattern",
          description:
            "Create a personalized arrangement using multiple birthstone colors.",
        },
      },
    },

    memorialMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
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
      enabled: false,
      max: 0,
    },

    engraving: {
      enabled: false,
    },

    specialRequest: {
      enabled: true,
    },
  },
};