export const legacyCrossPricing = {
  basePrice: 140,

  // These two fields are included for compatibility with configurators
  // that calculate the base price as baseProduct + profit.
  baseProduct: 40,
  profit: 100,

  finishes: {
    "legacy-cross-white-gold-plated": 0,
    "legacy-cross-yellow-gold-plated": 0,
    "legacy-cross-rose-gold-plated": 0,

    "white-gold-plated": 0,
    "yellow-gold-plated": 0,
    "rose-gold-plated": 0,
  },

  keepsakeMaterials: {
    breastMilk: 0,
    ashes: 0,
    sand: 0,
    soil: 0,
    mineralBase: 0,
  },

  hair: {
    none: 0,
    "no-hair": 0,
    "scattered-hair": 15,
  },

  decorativeAccents: {
    none: 0,
    silverFoil: 10,
    goldFoil: 10,
    opalChameleonFlakes: 10,
    pinkChameleonFlakes: 10,

    "silver-foil": 10,
    "gold-foil": 10,
    "opal-chameleon": 10,
    "pink-chameleon": 10,
  },

  glow: 15,

  chain: {
    "no-chain": 0,
    "matching-chain": 20,
  },

  engraving: {
    enabled: false,
    standard: 0,
    customSignature: 0,
  },

  specialRequest: {
    price: 0,
    requiresApproval: true,
  },
};