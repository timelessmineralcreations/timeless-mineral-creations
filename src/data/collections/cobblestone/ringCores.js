function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes6To13 = halfSizes(6, 13);

export const cobblestoneRingCores = [
  {
    id: "cobblestone-titanium-ringsupplies",

    name: "Titanium Cobblestone Pattern",

    description:
      "Polished titanium comfort-fit ring featuring an engraved cobblestone pattern with a 4mm memorial inlay channel.",

    material: "Titanium",
    finish: "Polished",
    color: "Silver",
    style: "Cobblestone Pattern",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/products/cobblestone-inlay-pattern-channel-titanium-ring-core",

    widths: [
      {
        width: 8,

        channel: 4,

        channelDepth: 1.4,

        sizes: sizes6To13,
      },
    ],
  },
];