import { oceanRingCores } from "./ringCores";
import { mountainPricing } from "../mountain/pricing";
import { oceanRingPhotos } from "./ringPhotos";

export const oceanCollection = {
  id: "ocean",
  slug: "ocean",

  name: "Ocean Wave Collection",

  description:
    "Capture cherished memories with a handcrafted Ocean Wave memorial ring. Personalize it with ashes, sand, soil, natural minerals, glow powder, and engraving to create a one-of-a-kind keepsake.",

  heroImage: "/hero/ocean-hero.png",

  startingPrice: 130,

  builder: "standard",

  ringCores: oceanRingCores,
  pricing: mountainPricing,
  ringPhotos: oceanRingPhotos,

  availableInlayStyles: [
    "mountain-memorial",
    "mountain-mineral-sprinkle",
    "mountain-solid-memorial",
    "mountain-solid-mineral",
  ],
};