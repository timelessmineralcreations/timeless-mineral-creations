function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes5To15 = halfSizes(5, 15);

export const twinOffsetRingCores = [
  {
    id: "twin-offset-tungsten-hammered-ringsupplies",

    name: "Hammered Tungsten",

    material: "Tungsten",

    finish: "Hammered",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/products/tungsten-double-offset-1-5mm-channel",

    widths: [
      {
        width: 6,
        channel: 1,
        sizes: sizes5To15,
      },
      {
        width: 8,
        channel: 1.5,
        sizes: sizes5To15,
      },
    ],
  },
];