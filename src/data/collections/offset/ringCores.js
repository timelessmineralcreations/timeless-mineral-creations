function halfSizes(start, end) {
  const sizes = [];

  for (let size = start; size <= end; size += 0.5) {
    sizes.push(Number.isInteger(size) ? `${size}` : size.toFixed(1));
  }

  return sizes;
}

const sizes3To17 = halfSizes(3, 17);
const sizes4To12 = halfSizes(4, 12);
const sizes4To15 = halfSizes(4, 15);
const sizes4To17 = halfSizes(4, 17);
const sizes5To15 = halfSizes(5, 15);
const sizes5To16 = halfSizes(5, 16);
const sizes5To17 = halfSizes(5, 17);

export const offsetRingCores = [

  // =========================================================
  // TUNGSTEN
  // =========================================================

  {
    id: "offset-tungsten-hammered-ringsupplies",

    name: "Hammered Tungsten",

    material: "Tungsten",

    finish: "Hammered",

    supplier: "RingSupplies",

    supplierCost: 35,

    supplierUrl:
      "https://ringsupplies.com/products/offset-hammered-tungsten-inlay-ring-core",

    widths: [
      {
        width: 4,
        channel: 1,
        sizes: sizes4To17,
      },
      {
        width: 6,
        channel: 1.5,
        sizes: sizes4To17,
      },
      {
        width: 8,
        channel: 2,
        sizes: sizes4To17,
      },
    ],
  },

  {
    id: "offset-tungsten-smooth-ringsupplies",

    name: "Smooth Tungsten (Wide Channel)",

    material: "Tungsten",

    finish: "Smooth",

    supplier: "RingSupplies",

    supplierCost: 35,

    supplierUrl:
      "https://ringsupplies.com/products/tungsten-offset-inlay-single-1-5mm-channel-ring-core",

    widths: [
      {
        width: 6,
        channel: 2.25,
        sizes: sizes3To17,
      },
      {
        width: 8,
        channel: 2,
        sizes: sizes3To17,
      },
    ],
  },

  {
    id: "offset-tungsten-smooth-patrick",

    name: "Smooth Tungsten",

    material: "Tungsten",

    finish: "Smooth",

    supplier: "Patrick Adair Supplies",

    supplierCost: 35,

    supplierUrl:
      "https://patrickadairsupplies.com/products/tungsten-ring-blank-offset-channel",

    widths: [
      {
        width: 6,
        channel: 1,
        channelDepth: 1,
        sizes: sizes4To12,
      },
      {
        width: 8,
        channel: 1.5,
        channelDepth: 1,
        sizes: sizes5To15,
      },
    ],
  },
    // =========================================================
  // TITANIUM
  // =========================================================

  {
    id: "offset-titanium-ringsupplies",

    name: "Smooth Titanium",

    material: "Titanium",

    finish: "Smooth",

    supplier: "RingSupplies",

    supplierCost: 35,

    supplierUrl:
      "https://ringsupplies.com/products/offset-channel-titanium-ring-core",

    widths: [
      {
        width: 8,
        channel: 2.5,
        sizes: sizes4To15,
      },
    ],
  },

  {
    id: "offset-titanium-patrick",

    name: "Smooth Titanium",

    material: "Titanium",

    finish: "Smooth",

    supplier: "Patrick Adair Supplies",

    supplierCost: 35,

    supplierUrl:
      "https://patrickadairsupplies.com/products/titanium-offset-channel-ring-blank",

    widths: [
      {
        width: 6,
        channel: 1,
        channelDepth: 1,
        sizes: sizes4To12,
      },
      {
        width: 8,
        channel: 1.5,
        channelDepth: 1,
        sizes: sizes5To15,
      },
    ],
  },

  // =========================================================
  // BLACK CERAMIC
  // =========================================================

  {
    id: "offset-black-hammered-ringsupplies",

    name: "Hammered Black Ceramic",

    material: "Black Ceramic",

    finish: "Hammered",

    supplier: "RingSupplies",

    supplierCost: 35,

    supplierUrl:
      "https://ringsupplies.com/products/offset-hammered-black-ceramic-inlay-ring-core",

    widths: [
      {
        width: 8,
        channel: 2,
        sizes: sizes5To17,
      },
    ],
  },

  {
    id: "offset-black-smooth-ringsupplies",

    name: "Smooth Black Ceramic (Wide Channel)",

    material: "Black Ceramic",

    finish: "Smooth",

    supplier: "RingSupplies",

    supplierCost: 35,

    supplierUrl:
      "https://ringsupplies.com/products/black-ceramic-offset-inlay-groove-ring-core",

    widths: [
      {
        width: 8,
        channel: 3,
        sizes: sizes5To16,
      },
    ],
  },

  {
    id: "offset-black-smooth-patrick",

    name: "Smooth Black Ceramic",

    material: "Black Ceramic",

    finish: "Smooth",

    supplier: "Patrick Adair Supplies",

    supplierCost: 35,

    supplierUrl:
      "https://patrickadairsupplies.com/products/black-ceramic-ring-blank-offset-channel",

    widths: [
      {
        width: 6,
        channel: 1,
        channelDepth: 1,
        sizes: sizes4To12,
      },
      {
        width: 8,
        channel: 1.5,
        channelDepth: 1,
        sizes: sizes5To15,
      },
    ],
  },

    // =========================================================
  // WHITE CERAMIC
  // =========================================================

  {
    id: "offset-white-smooth-patrick",

    name: "Smooth White Ceramic",

    material: "White Ceramic",

    finish: "Smooth",

    supplier: "Patrick Adair Supplies",

    supplierCost: 35,

    supplierUrl:
      "https://patrickadairsupplies.com/products/white-ceramic-ring-blank-offset-channel",

    widths: [
      {
        width: 6,
        channel: 1,
        channelDepth: 1,
        sizes: sizes4To12,
      },
      {
        width: 8,
        channel: 1.5,
        channelDepth: 1,
        sizes: sizes5To15,
      },
    ],
  },

];