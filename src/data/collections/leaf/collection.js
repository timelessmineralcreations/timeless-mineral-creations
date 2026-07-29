import { createPatternCollection } from "../patternCollectionTemplate";
import { leafRingCores } from "./ringCores";
import { leafPricing } from "./pricing";
import { leafRingPhotos } from "./ringPhotos";

export const leafCollection = createPatternCollection({
  id: "leaf",

  name: "Leaf Memorial Collection",

  description:
    "A graceful titanium memorial ring featuring a flowing leaf pattern handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/leaf-hero.png",

  startingPrice: 135,

  ringCores: leafRingCores,
  pricing: leafPricing,
  ringPhotos: leafRingPhotos,

  inlayStyleId: "leaf-solid-memorial",
});