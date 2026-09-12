export const remiRingCores = [
  {
    id: "remi-ring",

    name: "Remi Ring",

    productType: "ring",

    material: "Sterling Silver",

    color: "Silver",

    style: "Oval Bezel",

    description:
      "Elegant oval keepsake ring available in sterling silver and gold plated finishes.",

    featured: true,

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

    supplier: "LancelotDIY",

    supplierModel: "Remi Ring",

    supplierCost: 28.21,

    estimatedShippingCost: 10,

    landedCost: 38.21,
  },
];