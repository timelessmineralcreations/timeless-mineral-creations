import { createPatternCollection } from "../patternCollectionTemplate";
import { offsetRingCores } from "./ringCores";
import { offsetPricing } from "./pricing";
import { offsetRingPhotos } from "./ringPhotos";

export const offsetCollection = createPatternCollection({
  id: "offset",

  name: "Offset Memorial Collection",

  description:
    "A modern offset channel memorial ring handcrafted with cremation ashes, hair, pet fur, horse hair, sand, or soil. Personalize it with glow powder, engraving, or request a custom design.",

  heroImage: "/hero/offset-hero.png",
  

  startingPrice: 130,

  ringCores: offsetRingCores,
  pricing: offsetPricing,
  ringPhotos: offsetRingPhotos,

  inlayStyleId: "offset-solid-memorial",
});