import { createPatternCollection } from "../patternCollectionTemplate";
import { aztecRingCores } from "./ringCores";
import { aztecPricing } from "./pricing";
import { aztecRingPhotos } from "./ringPhotos";

export const aztecCollection = createPatternCollection({
  id: "aztec",

  name: "Aztec Memorial Collection",

  description:
    "A bold geometric titanium memorial ring handcrafted with cremation ashes, sand, or soil. Personalize it with your choice of glow powder and inside engraving.",

  heroImage: "/hero/aztec-hero.png",
  

  startingPrice: 135,

  ringCores: aztecRingCores,
  pricing: aztecPricing,
  ringPhotos: aztecRingPhotos,

  inlayStyleId: "aztec-solid-memorial",
});