import { heirloomNecklacePendantCores } from "./pendantCores";
import { heirloomNecklacePricing } from "./pricing";
import { heirloomNecklacePhotos } from "./photos";

export const heirloomNecklaceCollection = {
  id: "heirloom-necklace",
  slug: "heirloom-necklace",
  name: "Heirloom Necklace",

  category: "necklace",
  productType: "necklace",

  description:
    "An elegant sterling silver oval keepsake necklace handcrafted with your choice of cremation ashes, breast milk, sand, or soil. Personalize your pendant with hair, natural minerals, decorative accents, glow powder, or create a truly one-of-a-kind design that will be treasured for generations.",

  heroImage: "/hero/heirloom-necklace-hero.png",
  cardImagePosition: "center 65%",

  startingPrice: 140,

  builder: "remi",

  pendantCores: heirloomNecklacePendantCores,
  pricing: heirloomNecklacePricing,
  pendantPhotos: heirloomNecklacePhotos,

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
    },
  },
};