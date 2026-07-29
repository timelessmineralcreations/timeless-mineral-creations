import { createPatternCollection } from "../patternCollectionTemplate";
import { pawRingCores } from "./ringCores";
import { pawPricing } from "./pricing";
import { pawRingPhotos } from "./ringPhotos";

export const pawCollection = createPatternCollection({
  id: "paw",

  name: "Paw Print Memorial Collection",

  description:
    "A heartfelt titanium memorial ring featuring a paw print pattern handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/paw-hero.png",

  startingPrice: 135,

  ringCores: pawRingCores,
  pricing: pawPricing,
  ringPhotos: pawRingPhotos,

  inlayStyleId: "paw-solid-memorial",
});