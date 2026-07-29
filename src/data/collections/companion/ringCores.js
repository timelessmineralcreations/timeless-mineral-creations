function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes4To15 = halfSizes(4, 15);

export const companionRingCores = [
  {
    id: "companion-titanium-bentwood",

    name: "Titanium",

    material: "Titanium",

    finish: "Polished",

    supplier: "Bentwood Ring Supplies",

    supplierCost: 30,

    supplierUrl:
      "https://bentwoodringsupplies.com/products/titanium-paw-print-focus-channel-ring-blank-4-2",

    widths: [
      {
        width: 4,

        channels: [
          {
            id: "center-inlay",
            name: "Paw Print Inlay",
          },
          {
            id: "band-inlay",
            name: "Band Inlay",
          },
        ],

        sizes: sizes4To15,
      },
    ],
  },
];