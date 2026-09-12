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

    name: "Hammered Tungsten Dual Offset Ring",

    description:
      "Hammered tungsten memorial ring featuring two offset inlay channels with a rugged exterior and comfort-fit interior.",

    material: "Tungsten",

    finish: "Hammered",

    color: "Silver",

    style: "Dual Offset",

    edge: "Hammered",

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

    name: "Smooth Tungsten Dual Offset Ring",

    description:
      "Polished tungsten memorial ring with one wide offset channel and one narrow accent channel for unique dual-material designs.",

    material: "Tungsten",

    finish: "Polished",

    color: "Silver",

    style: "Dual Offset",

    edge: "Comfort Fit",

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

    name: "Black Ceramic Dual Offset Ring",

    description:
      "Polished black ceramic memorial ring featuring one wide offset channel and one narrow accent channel with a modern comfort-fit design.",

    material: "Black Ceramic",

    finish: "Polished",

    color: "Black",

    style: "Dual Offset",

    edge: "Comfort Fit",

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