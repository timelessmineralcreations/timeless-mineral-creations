import { ringCores } from "./ringCores";
import { ringPhotos } from "./ringPhotos";
import { keepsakeBranchRingPricing } from "./pricing";

export const keepsakeBranchRingCollection = {
  id: "keepsake-branch-ring",
  slug: "keepsake-branch-ring",

  name: "Keepsake Branch Ring",

  category: "keepsake",
  productType: "adjustable-ring",
  builder: "keepsake-branch-ring",

  shortDescription:
    "An adjustable sterling silver branch ring featuring a marquise keepsake setting.",

  description:
    "The Keepsake Branch Ring is an elegant adjustable open-band ring handcrafted with your choice of breast milk, cremation ashes, or another meaningful keepsake material. Its flexible design can be gently adjusted wider or smaller for a comfortable fit.",

  heroImage: "/hero/keepsake-branch-ring-hero.png",

  startingPrice:
    keepsakeBranchRingPricing.baseProduct +
    keepsakeBranchRingPricing.profit,

  ringCores,
  ringPhotos,

  pricing: keepsakeBranchRingPricing,

  options: {
    metalFinishes: {
      enabled: true,
      choices: [
        {
          id: "white-gold",
          name: "White Gold Plated",
        },
        {
          id: "yellow-gold",
          name: "Yellow Gold Plated",
        },
        {
          id: "rose-gold",
          name: "Rose Gold Plated",
        },
      ],
    },

    keepsakeMaterials: {
      enabled: true,
      max: 1,
      choices: [
        {
          id: "breastMilk",
          name: "Breast Milk",
          description:
            "Your breast milk is carefully preserved to create a soft pearl-white keepsake inlay.",
        },
        {
          id: "cremation",
          name: "Cremation Ashes",
          description:
            "A small amount of cremation ashes is carefully incorporated into the marquise setting.",
        },
        {
          id: "specialRequest",
          name: "Special Request",
          description:
            "Choose this option for another meaningful keepsake material. Contact us to confirm suitability.",
        },
      ],
    },

    adjustableSize: {
      enabled: true,
      displayName: "Adjustable",
      description:
        "The flexible open-band design can be gently adjusted wider or smaller for a comfortable fit.",
    },

    engraving: {
      enabled: false,
    },

    glow: {
      enabled: false,
    },

    minerals: {
      enabled: false,
    },

    birthstones: {
      enabled: false,
    },
  },

  productDetails: [
    "Solid 925 Sterling Silver",
    "Adjustable open-band design",
    "One 2 × 4 mm marquise keepsake setting",
    "Available in white gold, yellow gold, and rose gold plated finishes",
    "Handcrafted in North Carolina",
  ],
};