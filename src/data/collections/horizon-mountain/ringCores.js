function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes4To15 = halfSizes(4, 15);

export const horizonMountainRingCores = [
  {
    id: "horizon-mountain-titanium-bentwood",

    name: "Titanium",

    material: "Titanium",

    finish: "Polished",

    supplier: "Bentwood Ring Supplies",

    supplierCost: 30,

    supplierUrl:
      "https://bentwoodringsupplies.com/products/titanium-mountainrange-ring-blank",

    widths: [
      {
        width: 8,

        channels: [
          {
            id: "sky-inlay",
            name: "Sky Inlay",
          },
          {
            id: "landscape-inlay",
            name: "Landscape Inlay",
          },
        ],

        sizes: sizes4To15,
      },
    ],
  },
];