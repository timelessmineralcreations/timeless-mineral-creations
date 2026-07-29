import { heirloomRingCores } from "./ringCores";
import { heirloomPricing } from "./pricing";
import { heirloomPhotos } from "./photos";

export const heirloomCollection = {
  id: "heirloom",
  slug: "heirloom",
  name: "Heirloom Collection",

  category: "keepsake",

  description:
    "An elegant sterling silver bezel-set keepsake ring handcrafted with your choice of cremation ashes, breast milk, sand, or soil. Personalize your piece with hair, natural minerals, decorative accents, glow powder, or create a truly one-of-a-kind design that will be treasured for generations.",

  heroImage: "/hero/heirloom-hero.png",
  cardImagePosition: "center 25%",

  startingPrice: 140,

  builder: "remi",

  ringCores: heirloomRingCores,
  pricing: heirloomPricing,
  ringPhotos: heirloomPhotos,

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