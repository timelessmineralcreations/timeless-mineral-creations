import { companionRingCores } from "./ringCores";
import { companionPricing } from "./pricing";
import { companionRingPhotos } from "./ringPhotos";

export const companionCollection = {
  id: "companion",
  slug: "companion",

  name: "Companion Collection",

  description:
    "A handcrafted titanium memorial ring featuring a paw print inlay paired with a coordinating band inlay. Personalize each inlay independently using cremation ashes, sand, soil, or a natural mineral. Each inlay may also have its own optional glow powder color.",

  heroImage: "/hero/companion-hero.png",

  startingPrice: 130,

  builder: "focus",

  ringCores: companionRingCores,
  pricing: companionPricing,
  ringPhotos: companionRingPhotos,

  availableInlayStyles: ["companion-custom-inlays"],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      max: 2,
    },

    minerals: {
      enabled: true,
      max: 2,
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

    specialRequest: {
      enabled: true,
    },
  },
};