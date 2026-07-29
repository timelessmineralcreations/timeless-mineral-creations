import { createPatternCollection } from "../patternCollectionTemplate";
import { nativeRingCores } from "./ringCores";
import { nativePricing } from "./pricing";
import { nativeRingPhotos } from "./ringPhotos";

export const nativeCollection = createPatternCollection({
  id: "native",

  name: "Native Blanket Memorial Collection",

  description:
    "A beautiful titanium memorial ring featuring a Native Blanket inspired pattern handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/rings/native/native-place-holder.png",

  startingPrice: 135,

  ringCores: nativeRingCores,
  pricing: nativePricing,
  ringPhotos: nativeRingPhotos,

  inlayStyleId: "native-solid-memorial",
});