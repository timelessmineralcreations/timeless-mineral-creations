import { quadRingCores } from "./ringCores";
import { quadPricing } from "./pricing";
import { quadRingPhotos } from "./ringPhotos";

export const quadCollection = {
  id: "quad",
  slug: "quad",

  name: "Quad Inlay Memorial Collection",

  description:
    "A brushed titanium ring featuring four separate rectangular inlay sections. Customize each section independently with a memorial material or natural mineral. Section 1 and Section 4 meet where the design wraps around the ring.",

  heroImage: "/hero/quad-hero.png",

  startingPrice: 130,

  builder: "multi-channel",

  ringCores: quadRingCores,
  pricing: quadPricing,
  ringPhotos: quadRingPhotos,

  availableInlayStyles: ["quad-custom-sections"],

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
        "sand",
        "soil",
      ],
      max: 4,
    },

    minerals: {
      enabled: true,
      max: 4,
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