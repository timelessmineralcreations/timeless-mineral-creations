import { evermoreBraceletCores } from "./braceletCores";
import { evermoreBraceletPricing } from "./pricing";
import { evermoreBraceletPhotos } from "./braceletPhotos";

export const evermoreBraceletCollection = {
  id: "evermore-bracelet",
  slug: "evermore-bracelet",

  builder: "evermore-bracelet",

  category: "keepsake",

  name: "Evermore Bracelet",

  description:
    "A handcrafted keepsake bracelet featuring three marquise settings that can preserve meaningful memorial materials and be accented with your choice of birthstones.",

  heroImage: "/hero/evermore-bracelet-hero.png",

  images: [
    "/bracelets/evermore-bracelet/evermore-bracelet-garnet-silver.png",
    "/bracelets/evermore-bracelet/evermore-bracelet-garnet-rose-gold.png",
    "/bracelets/evermore-bracelet/evermore-bracelet-garnet-silver2.png",
    "/bracelets/evermore-bracelet/evermore-bracelet-clasp-silver.png",
  ],

  startingPrice: 140,

  ringCores: evermoreBraceletCores,

  pricing: evermoreBraceletPricing,

  ringPhotos: evermoreBraceletPhotos,

  memorialMaterials: [
    "ashes",
    "breastMilk",
    "hair",
    "fur",
    "horseHair",
    "sand",
    "soil",
    "specialRequest",
  ],

  birthstones: {
    enabled: true,
    guideImage: "/design-examples/birthstone-color-guide.png",
  },

  engraving: false,

  available: true,

  featured: true,
};