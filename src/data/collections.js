import { dualChannelCollection } from "./collections/dual-channel/collection";
import { mountainCollection } from "./collections/mountain/collection";
import { oceanCollection } from "./collections/ocean/collection";
import { tripleCollection } from "./collections/triple/collection";
import { aztecCollection } from "./collections/aztec/collection";
import { dragonCollection } from "./collections/dragon/collection";
import { greekCollection } from "./collections/greek/collection";
import { pawCollection } from "./collections/paw/collection";
import { pawTrailCollection } from "./collections/paw-trail/collection";
import { puzzleCollection } from "./collections/puzzle/collection";
import { honeycombCollection } from "./collections/honeycomb/collection";
import { leafCollection } from "./collections/leaf/collection";
import { nativeCollection } from "./collections/native/collection";
import { ribbonCollection } from "./collections/ribbon/collection";
import { offsetCollection } from "./collections/offset/collection";
import { dualOffsetCollection } from "./collections/dual-offset/collection";
import { twinOffsetCollection } from "./collections/twin-offset/collection";
import { celticCollection } from "./collections/celtic/collection";
import { quadCollection } from "./collections/quad/collection";
import { cobblestoneCollection } from "./collections/cobblestone/collection";
import { focusCollection } from "./collections/focus/collection";
import { companionCollection } from "./collections/companion/collection";
import { horizonMountainCollection } from "./collections/horizon-mountain/collection";
import { cornerstoneCollection } from "./collections/cornerstone/collection";

import { evermoreRingCollection } from "./collections/evermore/evermore-ring/collection";
import { evermoreBraceletCollection } from "./collections/evermore/evermore-bracelet/collection";
import { evermoreNecklaceCollection } from "./collections/evermore/evermore-necklace/collection";
import { keepsakeBranchRingCollection } from "./collections/keepsake-branch/keepsake-branch-ring/collection";
import { remiCollection } from "./collections/remi/collection";
import { heirloomNecklaceCollection } from "./collections/heirloom-necklace/collection";
import { heirloomCollection } from "./collections/heirloom/collection";
import { legacyCrossCollection } from "./collections/legacy/legacy-cross/collection";
import { legacyHeartCollection } from "./collections/legacy/legacy-heart/collection";
export const collections = [
  {
    id: "signature",
    slug: "signature",

    name: "Signature Collection",

    description:
      "A timeless beveled edge flat inlay band that can be customized with memorial materials and your choice of minerals.",

    images: [
      "/rings/signature/signature-turquoise-original.png",
    ],

    heroImage:
      "/rings/signature/signature-stainless-steel-turquoise-howlite-8mm.png",

    startingPrice: 130,

    defaults: {
      metal: "Tungsten",
      width: 8,
    },

    metals: [
      "Tungsten",
      "Titanium",
      "Black Ceramic",
      "White Ceramic",
    ],

    widthsByMetal: {
      Tungsten: [4, 6, 8, 10],
      Titanium: [6, 8],
      "Black Ceramic": [4, 6, 8],
      "White Ceramic": [4, 6, 8],
    },

    sizesByMetalAndWidth: {
      Tungsten: {
        4: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
        ],

        6: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
        ],

        8: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
          "16.5",
          "17",
          "17.5",
          "18",
          "18.5",
          "19",
          "19.5",
          "20",
        ],

        10: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
          "16.5",
          "17",
          "17.5",
          "18",
          "18.5",
          "19",
          "19.5",
          "20",
        ],
      },

      Titanium: {
        4: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
        ],

        6: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
        ],

        8: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
          "16.5",
          "17",
          "17.5",
          "18",
          "18.5",
          "19",
          "19.5",
          "20",
        ],

        10: [
          "3",
          "3.5",
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
          "13.5",
          "14",
          "14.5",
          "15",
          "15.5",
          "16",
          "16.5",
          "17",
          "17.5",
          "18",
          "18.5",
          "19",
          "19.5",
          "20",
        ],
      },

      "Black Ceramic": {
        8: [
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
        ],
      },

      "White Ceramic": {
        8: [
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
        ],
      },
    },

    availableMemorialMaterials: {
      ashes: true,
      hair: true,
      fur: true,
      flowers: true,
      breastMilk: false,
      sand: true,
      soil: true,
      fabric: true,
      horseHair: true,
    },

    availableMinerals: "all",

    availableInlayStyles: [
      "alternating-channel",
      "solid-cremation",
      "mineral-center",
      "solid-mineral",
    ],

    availableGlow: {
      pink: true,
      blue: true,
      aqua: true,
      green: true,
      white: true,
      red: true,
      purple: true,
      orange: true,
    },

    availableFonts: {
      comicSans: true,
      arial: true,
      freestyleScript: true,
      sitka: true,
      papyrus: true,
      century: true,
      timesNewRoman: true,
      customSignature: true,
    },

    pricing: {
      profit: 100,

      metal: {
        Tungsten: 30,
        Titanium: 40,
        Ceramic: 35,
        "Sterling Silver": 60,
        "Stainless Steel": 30,
      },

      width: {
        4: 0,
        6: 0,
        8: 0,
        10: 0,
      },

      memorialMaterials: {
        ashes: 0,
        hair: 20,
        fur: 20,
        flowers: 10,
        breastMilk: 50,
        sand: 10,
        soil: 10,
        fabric: 15,
        horseHair: 25,
      },

      glow: 15,

      engraving: {
        standard: 25,
        customSignature: 50,
      },
    },
  },

  {
    id: "tornado",
    slug: "tornado",

    name: "Tornado Collection",

    description:
      "A twisted titanium ring featuring cremation, sand, or soil on one side and your selected mineral on the other.",

    images: [
      "/hero/tornado-hero.png",
    ],

    heroImage: "/hero/tornado-hero.png",

    startingPrice: 140,

    defaults: {
      metal: "Titanium",
      width: 6,
    },

    metals: ["Titanium"],

    widthsByMetal: {
      Titanium: [6],
    },

    sizesByMetalAndWidth: {
      Titanium: {
        6: [
          "4",
          "4.5",
          "5",
          "5.5",
          "6",
          "6.5",
          "7",
          "7.5",
          "8",
          "8.5",
          "9",
          "9.5",
          "10",
          "10.5",
          "11",
          "11.5",
          "12",
          "12.5",
          "13",
        ],
      },
    },

    availableMemorialMaterials: {
      ashes: true,
      hair: false,
      fur: false,
      flowers: false,
      breastMilk: false,
      sand: true,
      soil: true,
      fabric: false,
      horseHair: false,
    },

    availableMinerals: "all",

    availableInlayStyles: [
      "tornado-split",
      "solid-mineral",
    ],

    availableGlow: {
      pink: true,
      blue: true,
      aqua: true,
      green: true,
      white: true,
      red: true,
      purple: true,
      orange: true,
    },

    availableFonts: {
      comicSans: true,
      arial: true,
      freestyleScript: true,
      sitka: true,
      papyrus: true,
      century: true,
      timesNewRoman: true,
      customSignature: true,
    },

    specialRequest: {
      enabled: true,
    },

    pricing: {
      profit: 100,

      metal: {
        Titanium: 40,
      },

      width: {
        6: 0,
      },

      memorialMaterials: {
        ashes: 0,
        sand: 10,
        soil: 10,
      },

      glow: 15,

      engraving: {
        standard: 25,
        customSignature: 50,
      },
    },
  },

  {
    id: "clam",
    slug: "clam",

    name: "Clam Shell Collection",

    description:
      "A beautiful titanium clam shell ring customized with memorial materials, minerals, glow powder, and engraving.",

    images: [
      "/rings/clamshell collection/clam-titanium-blue-opal-2-8mm.png",
    ],

    heroImage:
      "/rings/clamshell collection/clam-titanium-blue-opal-2-8mm.png",

    startingPrice: 130,
  },

  dualChannelCollection,
  mountainCollection,
  oceanCollection,
  tripleCollection,
  aztecCollection,
  dragonCollection,
  greekCollection,
  pawCollection,
  pawTrailCollection,
  puzzleCollection,
  honeycombCollection,
  leafCollection,
  nativeCollection,
  ribbonCollection,
  offsetCollection,
  dualOffsetCollection,
  twinOffsetCollection,
  celticCollection,
  quadCollection,
  cobblestoneCollection,
  focusCollection,
  companionCollection,
  horizonMountainCollection,
  cornerstoneCollection,

  evermoreRingCollection,
  evermoreBraceletCollection,
  evermoreNecklaceCollection,
  keepsakeBranchRingCollection,
  remiCollection,
  heirloomCollection,
  heirloomNecklaceCollection,
 legacyCrossCollection,
 legacyHeartCollection,
];