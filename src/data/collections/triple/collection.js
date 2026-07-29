import { tripleRingCores } from "./ringCores";
import { triplePricing } from "./pricing";
import { tripleRingPhotos } from "./ringPhotos";

export const tripleCollection = {
  id: "triple",
  slug: "triple",

  name: "Triple Channel Collection",

  description:
    "Create a completely custom three-channel memorial ring. Personalize each separate channel with cremation ashes, hair, fur, horse hair, sand, soil, or your selected natural minerals.",

  heroImage: "/hero/triple-hero.png",

  startingPrice: 130,

  builder: "multi-channel",

  ringCores: tripleRingCores,
  pricing: triplePricing,
  ringPhotos: tripleRingPhotos,

  availableInlayStyles: [
  "triple-channel-custom",
  "triple-channel-alternating",
  "triple-channel-mineral-center",
],
};