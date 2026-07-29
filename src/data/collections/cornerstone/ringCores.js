function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes4To15 = halfSizes(4, 15);

export const cornerstoneRingCores = [
  {
    id: "cornerstone-titanium-bentwood",

    name: "Titanium",

    material: "Titanium",

    finish: "Polished",

    supplier: "Bentwood Ring Supplies",

    supplierCost: 30,

    supplierUrl:
      "https://bentwoodringsupplies.com/products/titanium-brick-wall-ring-blank-8mm-width",

    widths: [
      {
        width: 8,
        sizes: sizes4To15,
      },
    ],
  },
];