function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes4To13 = halfSizes(4, 13);

export const quadRingCores = [
  {
    id: "quad-titanium-ringsupplies",

    name: "Brushed Titanium",

    material: "Titanium",

    finish: "Brushed",

    style: "Quad Channel",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/collections/titanium-ring-cores/products/long-rectangle-inlay-channels-titanium-ring-core",

    notes:
      "Titanium ring featuring four independent rectangular inlay channels.",

    widths: [
      {
        width: 8,

        channelDepth: 1.4,

        channels: [
          {
            id: "channel-one",
            name: "Channel One",
          },
          {
            id: "channel-two",
            name: "Channel Two",
          },
          {
            id: "channel-three",
            name: "Channel Three",
          },
          {
            id: "channel-four",
            name: "Channel Four",
          },
        ],

        sizes: sizes4To13,
      },
    ],
  },
];