import { mountainRingCores } from "./ringCores";
import { mountainPricing } from "./pricing";
import { mountainRingPhotos } from "./ringPhotos";

export const mountainCollection = {
  id: "mountain",
  slug: "mountain",
  name: "Mountain Range Collection",

  description:
    "Capture cherished memories with a handcrafted Mountain Range memorial ring. Personalize it with ashes, sand, soil, natural minerals, glow powder, and engraving to create a one-of-a-kind keepsake.",

  heroImage: "/hero/mountain-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: mountainRingCores,
  pricing: mountainPricing,
  ringPhotos: mountainRingPhotos,

  availableInlayStyles: [
    "mountain-memorial",
    "mountain-mineral-sprinkle",
    "mountain-solid-memorial",
    "mountain-solid-mineral",
  ],
};