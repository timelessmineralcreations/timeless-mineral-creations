import {
  heirloomNecklacePendantCores as legacyRoundPendantCores,
} from "./pendantCores";

import {
  heirloomNecklacePricing as legacyRoundPricing,
} from "./pricing";

export const legacyRoundCollection = {
  id: "legacy-round",
  slug: "legacy-round",
  name: "Legacy Round Necklace",

  category: "necklace",
  productType: "necklace",

  description:
    "A timeless round sterling silver keepsake necklace handcrafted to hold meaningful memorial materials and create a lasting tribute to someone you love.",

  // Images are controlled through Admin.
  heroImage: null,

  startingPrice: 140,

  builder: "remi",

  pendantCores: legacyRoundPendantCores,
  pricing: legacyRoundPricing,

  // Product photos are controlled through Admin.
  pendantPhotos: [],

  options: {
    keepsakeMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "breastMilk",
        "sand",
        "soil",
      ],
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
          name:
            'Add Matching 16" Chain with 2" Extender',
          price: 20,
        },
      ],
    },

    engraving: {
      enabled: false,
    },

    specialRequest: {
      enabled: true,
    },
  },
};