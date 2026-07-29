import { keepsakeBranchNecklaceCores } from "./necklaceCores";
import { keepsakeBranchPricing } from "./pricing";
import { keepsakeBranchPhotos } from "./necklacePhotos";

export const keepsakeBranchCollection = {
  id: "keepsake-branch",
  slug: "keepsake-branch",

  category: "keepsake",

  name: "Keepsake Branch Necklace",

  description:
    "A delicate solid 925 sterling silver branch necklace featuring three marquise keepsake inlays. Choose preserved breast milk, cremation ashes, or submit a special request for another meaningful material.",

  heroImage: "/hero/keepsake-branch-hero.png",

  startingPrice: 140,

  builder: "keepsake-branch-necklace",

  necklaceCores: keepsakeBranchNecklaceCores,
  pricing: keepsakeBranchPricing,
  necklacePhotos: keepsakeBranchPhotos,

  options: {
    keepsakeMaterials: {
      enabled: true,
      allowed: ["breastMilk", "cremation"],
      max: 1,
    },

    metalFinishes: {
      enabled: true,
      allowed: [
        "white-gold-plated",
        "yellow-gold-plated",
        "rose-gold-plated",
      ],
      max: 1,
    },

    birthstones: {
      enabled: false,
      max: 0,
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

    size: {
      enabled: false,
    },

    width: {
      enabled: false,
    },

    specialRequest: {
      enabled: true,
    },
  },
};