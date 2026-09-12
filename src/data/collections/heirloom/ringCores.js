export const heirloomRingCores = [
  {
    id: "heirloom-ring",

    name: "Heirloom Keepsake Ring",

    description:
      "Elegant 925 sterling silver bezel-set keepsake ring available in white gold, yellow gold, and rose gold plated finishes.",

    featured: true,

    material: "Sterling Silver",

    finish: "White Gold Plated",

    color: "Silver",

    style: "Bezel Ring",

    supplier: "LancelotDIY",

    widths: [],

    finishes: [
      "White Gold Plated",
      "Yellow Gold Plated",
      "Rose Gold Plated",
    ],

    ringSizes: Array.from({ length: 15 }, (_, i) =>
      (4 + i * 0.5).toString()
    ),

    bezelSizes: [
      "4x6",
      "6x8",
      "8x10",
      "10x14",
    ],
  },
];