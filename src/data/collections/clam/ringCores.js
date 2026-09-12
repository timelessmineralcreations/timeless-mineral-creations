// src/data/collections/clam/ringCores.js
// Clam Shell Collection ring core inventory.

const clamSizes = [
  "4",
  "4.5",
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
  "12.5",
  "13",
];

export const clamRingCores = [
  {
    id: "clam-titanium",

    name: "Titanium Clam Shell Edge",

    description:
      "Polished titanium comfort-fit ring featuring a decorative clam shell edge with a memorial inlay channel.",

    material: "Titanium",
    finish: "Polished",
    color: "Silver",
    style: "Clam Shell Edge",
    edge: "Clam Shell Edge",
    comfortFit: true,

    baseCost: 30,

    image: "",

    widths: [
      {
        width: 4,
        channel: 2,
        sizes: clamSizes,
      },
      {
        width: 7,
        channel: 5,
        sizes: clamSizes,
      },
    ],
  },
];