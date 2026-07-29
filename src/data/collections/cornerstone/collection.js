import { cornerstoneRingCores } from "./ringCores";
import { cornerstonePricing } from "./pricing";
import { cornerstoneRingPhotos } from "./ringPhotos";

export const cornerstoneCollection = {
  id: "cornerstone",
  slug: "cornerstone",

  name: "Cornerstone Collection",

  description:
    "A handcrafted titanium memorial ring inspired by the strength and permanence of traditional stonework. Choose an alternating memorial and mineral design, a solid memorial foundation, or a natural mineral foundation. Optional glow powder, inside engraving, and special requests are available.",

  heroImage: "/hero/cornerstone-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: cornerstoneRingCores,
  pricing: cornerstonePricing,
  ringPhotos: cornerstoneRingPhotos,

  availableInlayStyles: [
    "cornerstone-signature",
    "cornerstone-memorial-foundation",
    "cornerstone-natural-foundation",
  ],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 1,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
      maxCharacters: 25,
    },

    specialRequest: {
      enabled: true,
    },
  },
};