import { createPatternCollection } from "../patternCollectionTemplate";
import { pawTrailRingCores } from "./ringCores";
import { pawTrailPricing } from "./pricing";
import { pawTrailRingPhotos } from "./ringPhotos";

export const pawTrailCollection = createPatternCollection({
  id: "paw-trail",

  name: "Paw Trail Memorial Collection",

  description:
    "A beautiful titanium memorial ring featuring a continuous paw trail handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/paw-trail-hero.png",

  startingPrice: 135,

  ringCores: pawTrailRingCores,
  pricing: pawTrailPricing,
  ringPhotos: pawTrailRingPhotos,

  inlayStyleId: "paw-trail-solid-memorial",
});