export const remiRingCores = [
  {
    id: "remi-ring",
    name: "Remi Ring",
    description:
      "Elegant oval keepsake ring available in sterling silver and gold plated finishes.",
    featured: true,

    widths: [],

    finishes: [
      "Sterling Silver",
      "Yellow Gold Plated Sterling Silver",
      "Rose Gold Plated Sterling Silver",
    ],

    ringSizes: Array.from({ length: 17 }, (_, i) =>
      (4 + i * 0.5).toString()
    ),

    bezelSizes: [
      "7x5",
      "8x6",
      "9x7",
      "10x8",
      "11x9",
    ],
  },
];