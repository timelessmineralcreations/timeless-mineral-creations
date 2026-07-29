import { evermoreNecklaceCores } from "./necklaceCores";
import { evermoreNecklacePricing } from "./pricing";
import { evermoreNecklacePhotos } from "./necklacePhotos";

export const evermoreNecklaceCollection = {
  id: "evermore-necklace",
  slug: "evermore-necklace",

  builder: "evermore-necklace",

  category: "keepsake",

  name: "Evermore Necklace",

  description:
    "A handcrafted keepsake necklace featuring three marquise settings that can preserve meaningful memorial materials and be accented with your choice of birthstones.",

  heroImage: "/hero/evermore-necklace-hero.png",
  cardImagePosition: "center 85%",

  images: [
    "/necklaces/evermore-necklace/evermore-necklace-garnet-silver.png",
    "/necklaces/evermore-necklace/evermore-necklace-garnet-rose-gold.png",
  ],

  startingPrice: 140,

  necklaceCores: evermoreNecklaceCores,

  pricing: evermoreNecklacePricing,

  necklacePhotos: evermoreNecklacePhotos,

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