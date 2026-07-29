import { dualChannelRingPhotos } from "./ringPhotos";
import { dualChannelRingCores } from "./ringCores";
import { dualChannelPricing } from "./pricing";

export const dualChannelCollection = {
  id: "dual-channel",
  slug: "dual-channel",
  name: "Dual Channel Collection",

  description:
    "Create a meaningful custom ring with two separate inlay channels. Combine memorial materials, natural minerals, glow powder, and engraving to create a truly personal keepsake.",

  heroImage: "/hero/dual-channel-hero.png",
  startingPrice: 130,

  builder: "dual-channel",

  ringCores: dualChannelRingCores,
  pricing: dualChannelPricing,
  ringPhotos: dualChannelRingPhotos,

  availableInlayStyles: [
    "dual-channel-memorial-mineral",
    "dual-channel-twin-memorial",
    "dual-channel-memorial-hair",
    "dual-channel-mineral-alternating",
    "dual-channel-mineral-center-double",
    "dual-channel-solid-mineral",
  ],

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