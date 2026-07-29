import { cobblestoneRingCores } from "./ringCores";
import { cobblestonePricing } from "./pricing";
import { cobblestoneRingPhotos } from "./ringPhotos";

export const cobblestoneCollection = {
  id: "cobblestone",
  slug: "cobblestone",

  name: "Cobblestone Memorial Collection",

  description:
    "A handcrafted titanium Cobblestone memorial ring featuring your choice of cremation ashes, sand, or soil. Add optional glow powder, inside engraving, or submit a special request.",

  heroImage: "/hero/cobblestone-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: cobblestoneRingCores,
  pricing: cobblestonePricing,
  ringPhotos: cobblestoneRingPhotos,

  availableInlayStyles: [
    "cobblestone-memorial",
  ],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "sand",
        "soil",
      ],
      max: 1,
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