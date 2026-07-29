import { evermoreRingCores } from "./ringCores";
import { evermoreRingPricing } from "./pricing";
import { evermoreRingPhotos } from "./ringPhotos";

export const evermoreRingCollection = {
  id: "evermore-ring",
  slug: "evermore-ring",

  category: "keepsake",

  name: "Evermore Ring",

  description:
    "A delicate sterling silver keepsake ring featuring marquise inlays separated by sparkling birthstones. Choose preserved breast milk in a timeless pearl-white appearance or cremation ashes in their natural color, then personalize your ring with your chosen CZ birthstone.",

  heroImage: "/hero/evermore-ring-hero.png",

  startingPrice: 140,

  builder: "evermore-ring",

  ringCores: evermoreRingCores,
pricing: evermoreRingPricing,
ringPhotos: evermoreRingPhotos,

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