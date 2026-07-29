import { celticRingCores } from "./ringCores";
import { celticPricing } from "./pricing";
import { celticRingPhotos } from "./ringPhotos";

export const celticCollection = {
  id: "celtic",
  slug: "celtic",

  name: "Celtic Knot Memorial Collection",

  description:
    "A polished titanium Celtic Knot memorial ring available with either a solid memorial inlay or an alternating cremation and natural mineral design. Add optional glow powder, inside engraving, or a special request.",

  heroImage: "/hero/celtic-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: celticRingCores,
  pricing: celticPricing,
  ringPhotos: celticRingPhotos,

  availableInlayStyles: [
    "celtic-alternating",
    "celtic-solid-memorial",
    
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