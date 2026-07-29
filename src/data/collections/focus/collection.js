import { focusRingCores } from "./ringCores";
import { focusPricing } from "./pricing";
import { focusRingPhotos } from "./ringPhotos";

export const focusCollection = {
  id: "focus",
  slug: "focus",

  name: "Focus Collection",

  description:
    "A modern titanium memorial ring featuring a bold center inlay paired with a refined band inlay. Customize each inlay independently using cremation ashes, sand, soil, or a natural mineral. Each inlay may also have its own glow powder color.",

  heroImage: "/hero/focus-hero.png",

  startingPrice: 130,

  builder: "focus",

  ringCores: focusRingCores,
  pricing: focusPricing,
  ringPhotos: focusRingPhotos,

  availableInlayStyles: [
    "focus-custom-inlays",
  ],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "sand",
        "soil",
      ],
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