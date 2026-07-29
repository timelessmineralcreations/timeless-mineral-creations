export const heirloomRingCores = [
  {
    id: "heirloom-ring",

    name: "Heirloom Ring",

    description:
      "Elegant sterling silver bezel-set keepsake ring available in white gold, yellow gold, and rose gold plated finishes.",

    featured: true,

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