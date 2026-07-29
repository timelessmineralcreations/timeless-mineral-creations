import { createPatternCollection } from "../patternCollectionTemplate";
import { puzzleRingCores } from "./ringCores";
import { puzzlePricing } from "./pricing";
import { puzzleRingPhotos } from "./ringPhotos";

export const puzzleCollection = createPatternCollection({
  id: "puzzle",

  name: "Puzzle Piece Memorial Collection",

  description:
    "A meaningful titanium memorial ring featuring a puzzle piece pattern handcrafted with cremation ashes, sand, or soil. Personalize it with one glow powder color and optional inside engraving.",

  heroImage: "/hero/puzzle-hero.png",

  startingPrice: 135,

  ringCores: puzzleRingCores,
  pricing: puzzlePricing,
  ringPhotos: puzzleRingPhotos,

  inlayStyleId: "puzzle-solid-memorial",
});