import { legacyCrossPendantCores } from "./pendantCores";
import { legacyCrossPricing } from "./pricing";
import { legacyCrossPhotos } from "./photos";

export const legacyCrossCollection = {
  id: "legacy-cross",
  slug: "legacy-cross",
  name: "Legacy Cross Necklace",

  category: "necklace",
  productType: "necklace",

  description:
    "A timeless sterling silver cross keepsake necklace handcrafted with your choice of breast milk, cremation ashes, sand, soil, or a natural mineral base. Personalize your pendant with hair, natural minerals, decorative accents, or glow powder to create a meaningful piece honoring faith, love, remembrance, and legacy.",

  heroImage: "/hero/legacy-cross.png",
  cardImagePosition: "center 80%",

  startingPrice: 140,

  // Keep this as "remi" so it continues using the working configurator.
  builder: "remi",

  pendantCores: legacyCrossPendantCores,
  pricing: legacyCrossPricing,
  pendantPhotos: legacyCrossPhotos,

  options: {
    // The Legacy Cross is one fixed pendant size.
    bezelSize: {
      enabled: false,
    },

    keepsakeMaterials: {
      enabled: true,
      allowed: [
        "breastMilk",
        "ashes",
        "sand",
        "soil",
        "mineralBase",
      ],
      max: 1,
    },

    hair: {
      enabled: true,
      max: 1,

      // Only scattered hair is available for the cross.
      allowedStyles: ["scattered-hair"],
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

      // Only speckled accents are available for the cross.
      allowedStyles: ["speckled"],
    },

    glow: {
      enabled: true,
      max: 1,
    },

    chain: {
      enabled: true,
      price: 20,
      automaticallyMatchFinish: true,

      options: [
        {
          id: "no-chain",
          name: "Pendant Only — No Chain",
          price: 0,
        },
        {
          id: "matching-chain",
          name: 'Add Matching 16" Chain with 2" Extender',
          price: 20,
        },
      ],
    },

    engraving: {
      enabled: false,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },
};