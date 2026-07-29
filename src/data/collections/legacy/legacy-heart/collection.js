import { legacyHeartPendantCores } from "./pendantCores";
import { legacyHeartPricing } from "./pricing";
import { legacyHeartPhotos } from "./photos";

export const legacyHeartCollection = {
  id: "legacy-heart",
  slug: "legacy-heart",
  name: "Legacy Heart Necklace",

  category: "necklace",
  productType: "necklace",

  description:
    "A timeless sterling silver heart keepsake necklace handcrafted with your choice of cremation ashes, breast milk, sand, soil, or a natural mineral base. Personalize your pendant with hair, natural minerals, decorative accents, glow powder, or create a one-of-a-kind heirloom to celebrate love, remembrance, and life's most meaningful moments.",

  heroImage: "/hero/legacy-heart-hero.png",
  cardImagePosition: "center 80%",

  startingPrice: 140,

  builder: "remi",

  pendantCores: legacyHeartPendantCores,
  pricing: legacyHeartPricing,
  pendantPhotos: legacyHeartPhotos,

  options: {
    keepsakeMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "breastMilk",
        "sand",
        "soil",
        "mineralBase",
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