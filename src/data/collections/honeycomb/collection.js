import { createPatternCollection } from "../patternCollectionTemplate";
import { honeycombRingCores } from "./ringCores";
import { honeycombPricing } from "./pricing";
import { honeycombRingPhotos } from "./ringPhotos";

export const honeycombCollection = createPatternCollection({
  id: "honeycomb",

  name: "Honeycomb Memorial Collection",

  description:
    "A beautiful titanium memorial ring featuring a honeycomb pattern handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/honeycomb-hero.png",

  startingPrice: 135,

  ringCores: honeycombRingCores,
  pricing: honeycombPricing,
  ringPhotos: honeycombRingPhotos,

  inlayStyleId: "honeycomb-solid-memorial",
});