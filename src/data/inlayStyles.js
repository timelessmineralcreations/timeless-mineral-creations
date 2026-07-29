export const inlayStyles = [
  {
    id: "signature-alternating",
    name: "⭐ Signature Alternating Design",
    shortDescription: "Our Most Popular Design",
    description:
  "Your memorial material and selected minerals are arranged in a beautifully balanced alternating design. The layout automatically adapts to the number of minerals you choose, ensuring the most visually pleasing pattern while showcasing each selected stone. Whether you choose one mineral or four, every ring is thoughtfully handcrafted to create a harmonious and unique keepsake.\n\n• 1 Mineral → 4 memorial sections alternating with 4 sections of your chosen mineral.\n• 2 Minerals → 4 memorial sections alternating with 4 mineral sections, evenly split between your two selected minerals.\n• 3 Minerals → 3 memorial sections alternating with 3 mineral sections, featuring one section of each selected mineral.\n• 4 Minerals → 4 memorial sections alternating with 4 mineral sections, featuring one section of each selected mineral.",

    featured: true,

    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
        "sand",
        "soil",
      ],
      max: 2,
    },

    minerals: {
      enabled: true,
      max: 4,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "memorial-base-sprinkle",
    name: "Memorial Base + Mineral Sprinkle",
    shortDescription: "Memorial Base with Minerals on Top",
    description:
      "A memorial material base with up to four selected minerals sprinkled on top. Hair, pet fur, or horse hair may also be placed on top.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
        "sand",
        "soil",
      ],
      max: 2,
    },

    minerals: {
      enabled: true,
      max: 4,
    },

    accentMaterials: {
      enabled: true,
      allowed: ["goldFoil", "silverFoil"],
      max: 1,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "solid-memorial",
    name: "Solid Memorial",
    shortDescription: "Memorial Material Only",
    description:
      "A full inlay crafted entirely from cremation ashes, sand, or soil.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      max: 1,
    },

    minerals: {
      enabled: false,
      max: 0,
    },

    accentMaterials: {
  enabled: true,
  allowed: ["goldFoil", "silverFoil"],
  max: 1,
},

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "mineral-center",
    name: "Mineral Center",
    shortDescription: "One Mineral with Memorial Material",
    description:
      "One selected mineral in the center with your memorial material on both sides.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
        "sand",
        "soil",
      ],
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 1,
    },

    accentMaterials: {
  enabled: true,
  allowed: ["goldFoil", "silverFoil"],
  max: 1,
},

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "solid-mineral",
    name: "Solid Mineral",
    shortDescription: "Mineral Only",
    description:
      "A full mineral inlay. If multiple minerals are selected, they will be arranged in an alternating pattern.",

    featured: false,

    memorialMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    minerals: {
      enabled: true,
      max: 8,
    },

    accentMaterials: {
  enabled: true,
  allowed: ["goldFoil", "silverFoil"],
  max: 1,
},

    glow: {
      enabled: false,
      max: 0,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "fabric-memorial",
    name: "Fabric Memorial",
    shortDescription: "Fabric Only",
    description:
      "A memorial design created using fabric. Minerals and glow powder are not available for this design.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["fabric"],
      max: 1,
      locked: true,
    },

    minerals: {
      enabled: false,
      max: 0,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: false,
      max: 0,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "tornado-split",
    name: "Tornado Split Design",
    shortDescription:
      "One memorial material and one mineral intertwined through the ring.",
    description:
      "A unique twisted design featuring cremation ashes, sand, or soil on one side and your selected natural mineral on the opposite side.",

    featured: true,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      max: 1,
    },

    minerals: {
      enabled: true,
      max: 1,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "tornado-solid-mineral",
    name: "Solid Mineral",
    shortDescription:
      "Two beautiful natural minerals, one on each side of the Tornado inlay.",
    description:
      "Create a vibrant Tornado ring featuring a natural mineral on each side of the inlay. Choose the same mineral for a matching look or select two different minerals for a unique, one-of-a-kind design.",

    featured: false,

    memorialMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    minerals: {
      enabled: true,
      min: 2,
      max: 2,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "dual-mineral-memorial-blend",
    name: "Dual Mineral Memorial Blend",
    shortDescription:
      "Up to two blended minerals on one side with cremation ashes on the other.",
    description:
      "One side features a custom blend of one or two natural minerals. The opposite side contains cremation ashes, with the option to include one type of hair, pet fur, or horse hair.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "hair", "fur", "horseHair"],
      min: 1,
      max: 2,
      required: ["ashes"],
    },

    minerals: {
      enabled: true,
      min: 1,
      max: 2,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },  {
    id: "tornado-twin-memorial",
    name: "Twin Memorial",
    shortDescription:
      "Choose one memorial material for each side of the Tornado inlay.",
    description:
      "Honor two loved ones or combine meaningful memorial materials in one handcrafted Tornado ring. Choose cremation ashes, sand, or soil separately for each side of the twisted inlay.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      min: 2,
      max: 2,
      separateSides: true,
    },

    minerals: {
      enabled: false,
      min: 0,
      max: 0,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },  {
  id: "dual-channel-memorial-mineral",
  name: "⭐ Memorial + Mineral",
  shortDescription:
    "One memorial channel and one natural mineral channel.",
  description:
    "One channel contains your selected memorial material while the second channel features one natural mineral.",

  featured: true,

  channels: [
    {
      id: "channel-one",
      name: "Channel One",
      description:
        "Choose the memorial material for the first channel.",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: false,
        max: 0,
      },
    },

    {
      id: "channel-two",
      name: "Channel Two",
      description:
        "Choose the natural mineral for the second channel.",

      memorialMaterials: {
        enabled: false,
        allowed: [],
        max: 0,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: true,
    min: 1,
    max: 1,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

  {
  id: "dual-channel-twin-memorial",
  name: "Twin Memorial",
  shortDescription:
    "Choose one memorial material for each separate channel.",
  description:
    "Honor two loved ones or combine two meaningful memorial materials, with one memorial material placed in each channel.",

  featured: false,

  channels: [
    {
      id: "channel-one",
      name: "Channel One",
      description:
        "Choose the memorial material for the first channel.",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: false,
        max: 0,
      },
    },

    {
      id: "channel-two",
      name: "Channel Two",
      description:
        "Choose the memorial material for the second channel.",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: false,
        max: 0,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    min: 2,
    max: 2,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

  {
    id: "dual-channel-memorial-hair",
    name: "Memorial + Hair",
    shortDescription:
      "Cremation ashes in one channel and one type of hair in the other.",
    description:
      "One channel contains cremation ashes while the second channel contains your choice of human hair, pet fur, or horse hair.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: [
        "ashes",
        "hair",
        "fur",
        "horseHair",
      ],
      min: 2,
      max: 2,
      required: ["ashes"],
      separateChannels: true,
      hairChannel: true,
    },

    minerals: {
      enabled: false,
      min: 0,
      max: 0,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
  id: "dual-channel-mineral-alternating",
  name: "Dual Cremation + Dual Mineral Alternating",
  shortDescription:
    "Cremation and one mineral alternating in each channel.",
  description:
    "Each channel features an alternating pattern of cremation ashes and one selected natural mineral. Choose the mineral separately for Channel One and Channel Two.",

  featured: false,

  channels: [
    {
      id: "channel-one",
      name: "Channel One",
      description:
        "Choose cremation ashes and one natural mineral for the first channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "channel-two",
      name: "Channel Two",
      description:
        "Choose cremation ashes and one natural mineral for the second channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes"],
    min: 2,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 2,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },

},

  {
  id: "dual-channel-mineral-center-double",
  name: "Mineral Center ×2",
  shortDescription:
    "A centered mineral surrounded by cremation in each channel.",
  description:
    "Each channel features one selected natural mineral centered between cremation ashes. Choose the mineral separately for Channel One and Channel Two.",

  featured: false,

  channels: [
    {
      id: "channel-one",
      name: "Channel One",
      description:
        "Choose cremation ashes and one centered natural mineral for the first channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "channel-two",
      name: "Channel Two",
      description:
        "Choose cremation ashes and one centered natural mineral for the second channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes"],
    min: 2,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 2,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

  {
    id: "dual-channel-solid-mineral",
    name: "Solid Mineral",
    shortDescription:
      "Both channels filled completely with natural minerals.",
    description:
      "Fill both channels with natural minerals. Choose the same mineral for both channels or select two different minerals for a contrasting design.",

    featured: false,

    memorialMaterials: {
      enabled: false,
      allowed: [],
      min: 0,
      max: 0,
    },

    minerals: {
      enabled: true,
      min: 1,
      max: 2,
      separateChannels: true,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },  {
    id: "mountain-memorial",
    name: "⭐ Mountain Memorial",
    shortDescription: "Memorial Landscape with Mineral Peaks",
    description:
      "Your selected memorial material forms the landscape beneath the mountain peaks, while one natural mineral fills the mountain design.",

    featured: true,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      min: 1,
      max: 1,
    },

    minerals: {
      enabled: true,
      min: 1,
      max: 1,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "mountain-mineral-sprinkle",
    name: "Memorial Base + Mineral Sprinkle",
    shortDescription: "Memorial Base with Minerals on Top",
    description:
      "A base of cremation ashes, sand, or soil with up to four selected natural minerals delicately sprinkled throughout the Mountain Range inlay.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      min: 1,
      max: 1,
    },

    minerals: {
      enabled: true,
      min: 1,
      max: 4,
    },

    accentMaterials: {
      enabled: true,
      allowed: ["goldFoil", "silverFoil"],
      max: 1,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "mountain-solid-memorial",
    name: "Solid Memorial",
    shortDescription: "Memorial Material Only",
    description:
      "The Mountain Range inlay is crafted entirely from your selected cremation ashes, sand, or soil.",

    featured: false,

    memorialMaterials: {
      enabled: true,
      allowed: ["ashes", "sand", "soil"],
      min: 1,
      max: 1,
    },

    minerals: {
      enabled: false,
      min: 0,
      max: 0,
    },

    accentMaterials: {
      enabled: true,
      allowed: ["goldFoil", "silverFoil"],
      max: 1,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },

  {
    id: "mountain-solid-mineral",
    name: "Solid Mineral",
    shortDescription: "Alternating Mineral Sections Only",
    description:
      "A mineral-only Mountain Range inlay featuring up to four selected natural minerals arranged in alternating sections. Choose one mineral for a uniform design or multiple minerals for a unique alternating pattern.",

    featured: false,

    memorialMaterials: {
      enabled: false,
      allowed: [],
      min: 0,
      max: 0,
    },

    minerals: {
      enabled: true,
      min: 1,
      max: 4,
    },

    accentMaterials: {
      enabled: false,
      allowed: [],
      max: 0,
    },

    glow: {
      enabled: true,
      max: 1,
    },

    engraving: {
      enabled: true,
    },

    specialRequest: {
      enabled: true,
      requiresApproval: true,
    },
  },
  {
  id: "triple-channel-custom",
  name: "⭐ Custom Triple Channel",

  shortDescription:
    "Customize the top, middle, and bottom channels independently.",

  description:
    "Choose a memorial material or natural mineral separately for the top, middle, and bottom channels of your ring.",

  featured: true,

  channels: [
    {
      id: "top-channel",
      name: "Top Channel",
      description:
        "Choose a memorial material or natural mineral for the top channel.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "middle-channel",
      name: "Middle Channel",
      description:
        "Choose a memorial material or natural mineral for the middle channel.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "bottom-channel",
      name: "Bottom Channel",
      description:
        "Choose a memorial material or natural mineral for the bottom channel.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    min: 0,
    max: 3,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 3,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "triple-channel-alternating",

  name: "⭐ Signature Triple Alternating",

  shortDescription:
    "Our Signature Design • Alternating memorial material and one natural mineral in every channel.",

  description:
    "Our Signature Triple Channel design. Each channel alternates between your chosen memorial material and one selected natural mineral, creating a balanced and timeless look across the top, middle, and bottom channels.",

  featured: false,

  channels: [
    {
      id: "top-channel",
      name: "Top Channel",
      description:
        "Choose one memorial material and one natural mineral for the top channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "middle-channel",
      name: "Middle Channel",
      description:
        "Choose one memorial material and one natural mineral for the middle channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "bottom-channel",
      name: "Bottom Channel",
      description:
        "Choose one memorial material and one natural mineral for the bottom channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "sand",
      "soil",
    ],
    min: 3,
    max: 3,
  },

  minerals: {
    enabled: true,
    min: 3,
    max: 3,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "triple-channel-mineral-center",
  name: "⭐ Triple Mineral Center",

  shortDescription:
    "Our centered mineral design for all three channels.",

  description:
    "Each channel features one centered natural mineral surrounded by your chosen memorial material, creating a clean and symmetrical design across the top, middle, and bottom channels.",

  featured: false,

  channels: [
    {
      id: "top-channel",
      name: "Top Channel",
      description:
        "Choose one memorial material and one centered natural mineral for the top channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "middle-channel",
      name: "Middle Channel",
      description:
        "Choose one memorial material and one centered natural mineral for the middle channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "bottom-channel",
      name: "Bottom Channel",
      description:
        "Choose one memorial material and one centered natural mineral for the bottom channel.",

      selectionMode: "both",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "sand",
      "soil",
    ],
    min: 3,
    max: 3,
  },

  minerals: {
    enabled: true,
    min: 3,
    max: 3,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "aztec-solid-memorial",
  name: "⭐ Aztec Memorial Design",

  shortDescription:
    "A bold Aztec pattern filled with your selected memorial material.",

  description:
    "The full Aztec-pattern inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "dragon-solid-memorial",
  name: "⭐ Dragon Scale Memorial Design",

  shortDescription:
    "A bold Dragon Scale pattern filled with your selected memorial material.",

  description:
    "The full Dragon Scale inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "greek-solid-memorial",
  name: "⭐ Greek Mosaic Memorial Design",

  shortDescription:
    "A timeless Greek Mosaic pattern filled with your selected memorial material.",

  description:
    "The full Greek Mosaic inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "paw-solid-memorial",
  name: "⭐ Paw Print Memorial Design",

  shortDescription:
    "A meaningful paw print pattern filled with your selected memorial material.",

  description:
    "The full paw print inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "paw-trail-solid-memorial",

  name: "⭐ Paw Trail Memorial Design",

  shortDescription:
    "A continuous paw trail pattern filled with your selected memorial material.",

  description:
    "The full paw trail inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "puzzle-solid-memorial",

  name: "⭐ Puzzle Piece Memorial Design",

  shortDescription:
    "A meaningful puzzle piece pattern filled with your selected memorial material.",

  description:
    "The full puzzle piece inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},{
  id: "honeycomb-solid-memorial",

  name: "⭐ Honeycomb Memorial Design",

  shortDescription:
    "A honeycomb pattern filled with your selected memorial material.",

  description:
    "The full honeycomb inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "leaf-solid-memorial",

  name: "⭐ Leaf Memorial Design",

  shortDescription:
    "A flowing leaf pattern filled with your selected memorial material.",

  description:
    "The full leaf-pattern inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "native-solid-memorial",

  name: "⭐ Native Blanket Memorial Design",

  shortDescription:
    "A Native Blanket inspired pattern filled with your selected memorial material.",

  description:
    "The full Native Blanket inspired inlay is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},

  {
  id: "ribbon-glow-memorial",

  name: "⭐ Glow Ribbon",

  shortDescription:
    "Our Signature Awareness Ribbon",

  description:
    "Your loved one's cremation ashes are carefully blended with your selected glow powder to create the awareness ribbon. The surrounding titanium is left clean and polished for a timeless memorial.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    required: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "offset-solid-memorial",

  name: "⭐ Offset Memorial Design",

  shortDescription:
    "A modern offset memorial channel filled with your selected memorial material.",

  description:
    "The offset channel is handcrafted using cremation ashes, sand, or soil. Add one glow powder color and optional inside engraving to create a meaningful personalized keepsake.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "dual-offset-custom",

  name: "⭐ Custom Dual Offset",

  shortDescription:
    "Customize the outer and inner offset channels separately.",

  description:
    "Choose a memorial material or natural mineral independently for the outer and inner channels of the ring.",

  featured: true,

  channels: [
    {
      id: "outer-channel",
      name: "Outer Channel",
      description:
        "Choose a memorial material or natural mineral for the channel closest to the outside edge of the ring.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "inner-channel",
      name: "Inner Channel",
      description:
        "Choose a memorial material or natural mineral for the channel closer to the center of the ring.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    min: 0,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "twin-offset-cremation-mineral",

  name: "⭐ Cremation + Mineral",

  shortDescription:
    "Cremation ashes paired with one natural mineral.",

  description:
    "A twin offset design featuring cremation ashes and one selected natural mineral. Add optional glow powder and inside engraving.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: true,
    min: 1,
    max: 1,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: false,
    requiresApproval: false,
  },
},
{
  id: "celtic-alternating",

  name: "⭐ Signature Alternating Design",

  shortDescription: "Our Most Popular Celtic Knot Design",

  description:
    "Alternating sections of your memorial material and one selected natural mineral woven throughout the Celtic Knot pattern. Because each ring size contains a different number of Celtic Knot segments, some sizes may naturally finish with two mineral sections together rather than a perfectly alternating sequence. This is a normal characteristic of the handcrafted design and ensures the knot pattern remains continuous and visually balanced around the entire ring.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: true,
    min: 1,
    max: 1,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

{
  id: "celtic-solid-memorial",

  name: "Solid Memorial",

  shortDescription: "A Solid Celtic Knot Memorial Design",

  description:
    "The entire Celtic Knot pattern is handcrafted using your selected cremation ashes, sand, or soil for a clean and timeless memorial design. Optional glow powder and inside engraving are available.",

  featured: false,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "quad-custom-sections",

  name: "⭐ Custom Four-Section Design",

  shortDescription:
    "Customize each rectangular inlay section independently.",

  description:
    "Choose a memorial material or one natural mineral for each of the four rectangular inlay sections. Section 1 and Section 4 meet where the design wraps around the ring, so consider how those two selections will look beside one another.",

  featured: true,

  channels: [
    {
      id: "section-one",
      name: "Section 1",
      description:
        "Choose a memorial material or natural mineral for the first section. This section meets Section 4 where the design wraps around the ring.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "section-two",
      name: "Section 2",
      description:
        "Choose a memorial material or natural mineral for the second section.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "section-three",
      name: "Section 3",
      description:
        "Choose a memorial material or natural mineral for the third section.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "section-four",
      name: "Section 4",
      description:
        "Choose a memorial material or natural mineral for the fourth section. This section meets Section 1 where the design wraps around the ring.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: [
          "ashes",
          "hair",
          "fur",
          "horseHair",
          "sand",
          "soil",
        ],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: [
      "ashes",
      "hair",
      "fur",
      "horseHair",
      "sand",
      "soil",
    ],
    min: 0,
    max: 4,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 4,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "cobblestone-memorial",

  name: "⭐ Cobblestone Memorial Design",

  shortDescription: "A handcrafted cobblestone memorial pattern.",

  description:
    "The Cobblestone pattern is handcrafted using your selected cremation ashes, sand, or soil. Add optional glow powder, inside engraving, or submit a special request.",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "focus-custom-inlays",

  name: "⭐ Custom Focus Design",

  shortDescription:
    "Customize the center inlay and band inlay independently.",

  description:
    "Choose cremation ashes, sand, soil, or one natural mineral separately for the center inlay and band inlay. Each inlay may also have its own optional glow powder color.",

  featured: true,

  channels: [
    {
      id: "center-inlay",
      name: "Center Inlay",
      description:
        "Choose one memorial material or natural mineral for the center inlay.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "band-inlay",
      name: "Band Inlay",
      description:
        "Choose one memorial material or natural mineral for the band inlay.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 0,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: false,
    max: 0,
  },

  engraving: {
    enabled: false,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "companion-custom-inlays",

  name: "⭐ Custom Companion Design",

  shortDescription:
    "Customize the paw print and band inlays independently.",

  description:
    "Choose cremation ashes, sand, soil, or one natural mineral separately for the paw print inlay and band inlay. Each inlay may also have its own optional glow powder color.",

  featured: true,

  channels: [
    {
      id: "center-inlay",

      name: "Paw Print Inlay",

      description:
        "Choose one memorial material or natural mineral for the paw print inlay.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "band-inlay",

      name: "Band Inlay",

      description:
        "Choose one memorial material or natural mineral for the band inlay.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 0,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: false,
    max: 0,
  },

  engraving: {
    enabled: false,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "horizon-mountain-custom-inlays",

  name: "⭐ Horizon Mountain Design",

  shortDescription:
    "Customize the Sky and Landscape independently.",

  description:
    "Choose cremation ashes, sand, soil, or one natural mineral separately for the Sky Inlay and Landscape Inlay. Each inlay may also have its own optional glow powder color.",

  featured: true,

  channels: [
    {
      id: "sky-inlay",

      name: "Sky Inlay",

      description:
        "Choose one memorial material or one natural mineral for the sky above the mountains.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },

    {
      id: "landscape-inlay",

      name: "Landscape Inlay",

      description:
        "Choose one memorial material or one natural mineral for the landscape below the mountains.",

      selectionMode: "either",

      memorialMaterials: {
        enabled: true,
        allowed: ["ashes", "sand", "soil"],
        max: 1,
      },

      minerals: {
        enabled: true,
        max: 1,
      },

      glow: {
        enabled: true,
        max: 1,
      },
    },
  ],

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 0,
    max: 2,
  },

  minerals: {
    enabled: true,
    min: 0,
    max: 2,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: false,
    max: 0,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
{
  id: "cornerstone-signature",

  name: "⭐ Signature Cornerstone",

  shortDescription:
    "Alternating memorial material and one natural mineral. Artisan Design • +$50",

  description:
    "Each brick is individually handcrafted in an alternating arrangement using your selected memorial material and one natural mineral. Depending on ring size, the pattern may begin or end with either material to create the most balanced finished design.",

  image:
    "/design-examples/cornerstone-signature.png",

  featured: true,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: true,
    min: 1,
    max: 1,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

{
  id: "cornerstone-memorial-foundation",

  name: "🕊 Memorial Foundation",

  shortDescription:
    "The entire brick pattern filled with one memorial material. Included.",

  description:
    "Every brick is handcrafted using your selected cremation ashes, sand, or soil, creating a clean and timeless memorial design throughout the entire ring.",

  image:
    "/design-examples/cornerstone-memorial-foundation.png",

  featured: false,

  memorialMaterials: {
    enabled: true,
    allowed: ["ashes", "sand", "soil"],
    min: 1,
    max: 1,
  },

  minerals: {
    enabled: false,
    min: 0,
    max: 0,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},

{
  id: "cornerstone-natural-foundation",

  name: "✨ Natural Foundation",

  shortDescription:
    "The entire brick pattern filled with one natural mineral. Artisan Design • +$50",

  description:
    "Every brick is individually handcrafted using one selected natural mineral, showcasing its natural color and texture throughout the entire ring.",

  image:
    "/design-examples/cornerstone-natural-foundation.png",

  featured: false,

  memorialMaterials: {
    enabled: false,
    allowed: [],
    min: 0,
    max: 0,
  },

  minerals: {
    enabled: true,
    min: 1,
    max: 1,
  },

  accentMaterials: {
    enabled: false,
    allowed: [],
    max: 0,
  },

  glow: {
    enabled: true,
    max: 1,
  },

  engraving: {
    enabled: true,
  },

  specialRequest: {
    enabled: true,
    requiresApproval: true,
  },
},
]