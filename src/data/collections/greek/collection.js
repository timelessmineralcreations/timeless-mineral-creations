import { createPatternCollection } from "../patternCollectionTemplate";
import { greekRingCores } from "./ringCores";
import { greekPricing } from "./pricing";
import { greekRingPhotos } from "./ringPhotos";

export const greekCollection = createPatternCollection({
  id: "greek",

  name: "Greek Mosaic Memorial Collection",

  description:
    "A timeless Greek Mosaic titanium memorial ring handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/greek-hero.png",

  startingPrice: 135,

  ringCores: greekRingCores,
  pricing: greekPricing,
  ringPhotos: greekRingPhotos,

  inlayStyleId: "greek-solid-memorial",
});