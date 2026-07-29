import { signatureRingPhotos } from "./ringPhotos";
import { signatureRingCores } from "./ringCores";
import { signaturePricing } from "./pricing";

export const signatureCollection = {
  id: "signature",
  slug: "signature",
  name: "Signature Collection",

  description:
    "Design a one-of-a-kind memorial ring by selecting your ring material, edge style, width, memorial material, minerals, glow, and engraving.",

  heroImage: "/hero/signature-hero.png",
  startingPrice: 130,

  builder: "signature",

  ringCores: signatureRingCores,
  pricing: signaturePricing,
  ringPhotos: signatureRingPhotos,

  availableInlayStyles: [
    "signature-alternating",
    "memorial-base-sprinkle",
    "solid-memorial",
    "mineral-center",
    "solid-mineral",
    "fabric-memorial",
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
        "fabric",
        "specialRequest",
      ],
      max: 2,
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