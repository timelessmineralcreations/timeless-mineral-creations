import { clamRingPhotos } from "./ringPhotos";
import { clamRingCores } from "./ringCores";
import { clamPricing } from "./pricing";

export const clamCollection = {
  id: "clam",
  slug: "clam",
  name: "Clam Shell Collection",

  description:
    "Create a meaningful clam shell memorial ring with your choice of ashes, sand, soil, natural minerals, glow powder, and engraving.",

  heroImage:
    "/rings/clamshell collection/clam-titanium-aquamarine-8mm.png",

  startingPrice: 130,

  builder: "signature",

  ringCores: clamRingCores,
  pricing: clamPricing,
  ringPhotos: clamRingPhotos,

  availableInlayStyles: [
    "signature-alternating",
    "memorial-base-sprinkle",
    "solid-memorial",
    "mineral-center",
    "solid-mineral",
  ],

  inlayStyleOverrides: {
    "signature-alternating": {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },
    },

    "memorial-base-sprinkle": {
      description:
        "A memorial material base featuring up to four natural minerals delicately sprinkled on top, creating a beautifully layered and unique inlay.",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },
    },

    "solid-memorial": {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },
    },

    "mineral-center": {
      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },
    },

    "solid-mineral": {
      memorialMaterials: {
        enabled: false,
        allowed: [],
        max: 0,
      },
    },
  },

  options: {
    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 4,
    },

    accentMaterials: {
      enabled: true,
      allowed: ["goldFoil", "silverFoil"],
      max: 2,
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