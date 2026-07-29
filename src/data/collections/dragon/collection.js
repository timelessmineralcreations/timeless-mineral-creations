import { createPatternCollection } from "../patternCollectionTemplate";
import { dragonRingCores } from "./ringCores";
import { dragonPricing } from "./pricing";
import { dragonRingPhotos } from "./ringPhotos";

export const dragonCollection = createPatternCollection({
  id: "dragon",

  name: "Dragon Scale Memorial Collection",

  description:
    "A striking Dragon Scale titanium memorial ring handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/dragon-hero.png",

  startingPrice: 135,

  ringCores: dragonRingCores,
  pricing: dragonPricing,
  ringPhotos: dragonRingPhotos,

  inlayStyleId: "dragon-solid-memorial",
});