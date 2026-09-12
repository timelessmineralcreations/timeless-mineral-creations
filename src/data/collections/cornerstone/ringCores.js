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

    name: "Titanium Cornerstone Ring",

    description:
      "Polished titanium memorial ring featuring a distinctive brick wall (cornerstone) pattern with a comfort-fit interior.",

    material: "Titanium",

    finish: "Polished",

    color: "Silver",

    style: "Cornerstone",

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