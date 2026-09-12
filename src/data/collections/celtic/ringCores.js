function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes6To13 = halfSizes(6, 13);

export const celticRingCores = [
  {
    id: "celtic-titanium-ringsupplies",

    name: "Titanium Celtic Knot",

    description:
      "Polished titanium comfort-fit ring featuring an engraved Celtic knot pattern with a 4mm memorial inlay channel.",

    material: "Titanium",
    finish: "Polished",
    color: "Silver",
    style: "Celtic Knot",

    supplier: "RingSupplies",
    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/products/horse-hair-inlay-channel-titanium-ring-core",

    widths: [
      {
        width: 8,

        channel: 4,

        sizes: sizes6To13,
      },
    ],
  },
];