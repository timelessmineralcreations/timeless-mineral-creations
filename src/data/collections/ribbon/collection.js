import { ribbonRingCores } from "./ringCores";
import { ribbonPricing } from "./pricing";
import { ribbonRingPhotos } from "./ringPhotos";

export const ribbonCollection = {
  id: "ribbon",
  slug: "ribbon",

  name: "Ribbon Memorial Collection",

  description:
    "A meaningful titanium memorial ring featuring an awareness ribbon created with cremation ashes and your selected glow powder color. Personalize it with optional inside engraving or request a custom mineral ribbon design.",

  heroImage:
    "/rings/ribbon/ribbon-titanium-6mm-pink-tourmaline.png",
    cardImagePosition: "center 80%",

  startingPrice: 135,

  builder: "standard",

  ringCores: ribbonRingCores,
  pricing: ribbonPricing,
  ringPhotos: ribbonRingPhotos,

  availableInlayStyles: [
    "ribbon-glow-memorial",
  ],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes"],
      min: 1,
      max: 1,
    },

    minerals: {
      enabled: false,
      min: 0,
      max: 0,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      required: true,
      max: 1,
    },

    engraving: {
      enabled: true,
      maxCharacters: 25,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
      price: 30,
    },
  },
};