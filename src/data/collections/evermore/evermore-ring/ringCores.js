function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(
      Number.isInteger(size)
        ? `${size}`
        : size.toFixed(1)
    );
  }

  return sizes;
}

const sizes5To10 = halfSizes(5, 10);

export const evermoreRingCores = [
  {
    id: "keepsake-white-gold-plated-sterling-silver",

    name: "Sterling Silver",

    material: "Sterling Silver",

    finish: "White Gold Plated",

    supplier: "LancelotDIY",

    supplierCost: 28.21,

    estimatedShippingCost: 10,

    landedCost: 38.21,

    supplierModel: "1294238",

    supplierUrl:
      "https://www.lancelotdiy.com/keepsake-mothers-milk-resin-ring-settings-solid-925-sterling-silver-rose-gold-plated-2x4mm-marquise-bezel-with-2mm-cz-stone-stackable-ring-bezel-1294238-p-8526.html",

    widths: [
      {
        width: null,
        sizes: sizes5To10,
      },
    ],

    notes:
      "2x4mm marquise keepsake bezels with 2mm CZ birthstones. No engraving.",

    ringDetails: {
      settingQuantity: 8,
      settingShape: "Marquise",
      settingSize: "2 × 4 mm",
      birthstoneSize: "2 mm CZ",
    },
  },

  {
    id: "keepsake-rose-gold-plated-sterling-silver",

    name: "Rose Gold Plated Sterling Silver",

    material: "Sterling Silver",

    finish: "Rose Gold Plated",

    supplier: "LancelotDIY",

    supplierCost: 28.21,

    estimatedShippingCost: 10,

    landedCost: 38.21,

    supplierModel: "1294238",

    supplierUrl:
      "https://www.lancelotdiy.com/keepsake-mothers-milk-resin-ring-settings-solid-925-sterling-silver-rose-gold-plated-2x4mm-marquise-bezel-with-2mm-cz-stone-stackable-ring-bezel-1294238-p-8526.html",

    widths: [
      {
        width: null,
        sizes: sizes5To10,
      },
    ],

    notes:
      "2x4mm marquise keepsake bezels with 2mm CZ birthstones. No engraving.",

    ringDetails: {
      settingQuantity: 8,
      settingShape: "Marquise",
      settingSize: "2 × 4 mm",
      birthstoneSize: "2 mm CZ",
    },
  },

  {
    id: "keepsake-yellow-gold-plated-sterling-silver",

    name: "Yellow Gold Plated Sterling Silver",

    material: "Sterling Silver",

    finish: "Yellow Gold Plated",

    supplier: "LancelotDIY",

    supplierCost: 28.21,

    estimatedShippingCost: 10,

    landedCost: 38.21,

    supplierModel: "1294238",

    supplierUrl:
      "https://www.lancelotdiy.com/keepsake-mothers-milk-resin-ring-settings-solid-925-sterling-silver-rose-gold-plated-2x4mm-marquise-bezel-with-2mm-cz-stone-stackable-ring-bezel-1294238-p-8526.html",

    widths: [
      {
        width: null,
        sizes: sizes5To10,
      },
    ],

    notes:
      "2x4mm marquise keepsake bezels with 2mm CZ birthstones. No engraving.",

    ringDetails: {
      settingQuantity: 8,
      settingShape: "Marquise",
      settingSize: "2 × 4 mm",
      birthstoneSize: "2 mm CZ",
    },
  },
];