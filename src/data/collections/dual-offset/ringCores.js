function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes3Point5To17 = halfSizes(3.5, 17);
const sizes4To17 = halfSizes(4, 17);
const sizes5To17 = halfSizes(5, 17);

export const dualOffsetRingCores = [
  {
    id: "dual-offset-tungsten-hammered-ringsupplies",

    name: "Hammered Tungsten",

    material: "Tungsten",

    finish: "Hammered",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/products/2-channel-offset-hammered-tungsten-ring-core",

    widths: [
      {
        width: 8,

        channels: [
          {
            id: "outer-channel",
            name: "Outer Channel",
            channel: 1.5,
          },
          {
            id: "inner-channel",
            name: "Inner Channel",
            channel: 1.5,
          },
        ],

        sizes: sizes4To17,
      },
    ],
  },

  {
    id: "dual-offset-tungsten-smooth-ringsupplies",

    name: "Smooth Tungsten (Large + Small Offset)",

    material: "Tungsten",

    finish: "Smooth",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/collections/rings-1/products/tungsten-2-channel-offset-1-large-1-small-inlay-channel",

    widths: [
      {
        width: 8,

        channels: [
          {
            id: "outer-channel",
            name: "Outer Channel",
            channel: 2.5,
            note: "Wider channel",
          },
          {
            id: "inner-channel",
            name: "Inner Channel",
            channel: 1,
            note: "Narrower accent channel",
          },
        ],

        sizes: sizes3Point5To17,
      },
    ],
  },

  {
    id: "dual-offset-black-ceramic-smooth-ringsupplies",

    name: "Smooth Black Ceramic (Large + Small Offset)",

    material: "Black Ceramic",

    finish: "Smooth",

    supplier: "RingSupplies",

    supplierCost: 30,

    supplierUrl:
      "https://ringsupplies.com/collections/rings-1/products/black-ceramic-2-off-set-channels",

    widths: [
      {
        width: 8,

        channels: [
          {
            id: "outer-channel",
            name: "Outer Channel",
            channel: 3,
            note: "Wider channel",
          },
          {
            id: "inner-channel",
            name: "Inner Channel",
            channel: 1,
            note: "Narrower accent channel",
          },
        ],

        sizes: sizes5To17,
      },
    ],
  },
];