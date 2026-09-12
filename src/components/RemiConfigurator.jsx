"use client";

import { useEffect, useMemo, useState } from "react";

import GlowSelector from "@/components/builder/GlowSelector";
import EngravingSelector from "@/components/builder/EngravingSelector";

import { useCart } from "@/context/CartContext";
import getBestCollectionPhoto from "@/utils/getBestCollectionPhoto";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPrice(price = 0) {
  return price > 0 ? `+$${price}` : "Included";
}

function normalizeSalePercent(value) {
  const percent = Number(value);

  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round(percent)
    )
  );
}

function getDiscountedPrice(
  price,
  enabled,
  percent
) {
  const regularCents =
    Math.max(
      0,
      Math.round(
        (Number(price) || 0) *
        100
      )
    );

  if (
    !enabled ||
    percent <= 0
  ) {
    return regularCents / 100;
  }

  const discountedCents =
    Math.round(
      (regularCents *
        (100 - percent)) /
      100
    );

  return discountedCents / 100;
}

function getFinishOptions(collection) {
  const cores =
    collection.pendantCores ||
    collection.ringCores ||
    [];

  const firstCore = cores[0];

  if (Array.isArray(firstCore?.finishes)) {
    return firstCore.finishes.map((finish, index) => {
      if (typeof finish === "string") {
        return {
          id: slugify(finish),
          name: finish,
          price: 0,
          material:
            firstCore?.material || "",
          core: firstCore,
        };
      }

      return {
        id:
          finish.id ||
          slugify(finish.name || finish.finish) ||
          `finish-${index}`,

        name:
          finish.name ||
          finish.finish ||
          `Finish ${index + 1}`,

        price: finish.price || 0,

        material:
          finish.material ||
          firstCore?.material ||
          "",

        core: firstCore,
      };
    });
  }

  if (cores.length > 1) {
    return cores.map((core, index) => ({
      id:
        core.id ||
        slugify(core.finish || core.name) ||
        `finish-${index}`,

      name:
        core.finish ||
        core.name ||
        `Finish ${index + 1}`,

      price: core.price || 0,

      material:
        core.material || "",

      core,
    }));
  }

  return [
    {
      id: "sterling-silver",
      name: "Sterling Silver",
      price: 0,
    },
    {
      id: "yellow-gold-plated",
      name: "Yellow Gold Plated Sterling Silver",
      price: 0,
    },
    {
      id: "rose-gold-plated",
      name: "Rose Gold Plated Sterling Silver",
      price: 0,
    },
  ];
}

function getProductBaseForFinish(
  collection,
  selectedFinish
) {
  const productBases =
    Array.isArray(collection?.ringCores)
      ? collection.ringCores
      : [];

  const directCore =
    selectedFinish?.core || null;



  const selectedIds = new Set(
    [
      selectedFinish?.id,
    ]
      .filter(Boolean)
      .map(String)
  );

  const selectedName = String(
    selectedFinish?.name ||
    directCore?.finish ||
    directCore?.name ||
    ""
  )
    .trim()
    .toLowerCase();

  const selectedMaterial = String(
    selectedFinish?.material ||
    directCore?.material ||
    ""
  )
    .trim()
    .toLowerCase();

  const matched =
    productBases.find((base) => {
      const baseIds = [
        base?.id,
        base?.databaseId,
      ]
        .filter(Boolean)
        .map(String);

      if (
        baseIds.some((id) =>
          selectedIds.has(id)
        )
      ) {
        return true;
      }

      const baseName = String(
        base?.finish ||
        base?.name ||
        ""
      )
        .trim()
        .toLowerCase();

      const baseMaterial = String(
        base?.material || ""
      )
        .trim()
        .toLowerCase();

      const nameMatches =
        selectedName &&
        baseName &&
        (selectedName === baseName ||
          selectedName.includes(
            baseName
          ) ||
          baseName.includes(
            selectedName
          ));

      const materialMatches =
        !selectedMaterial ||
        !baseMaterial ||
        selectedMaterial ===
        baseMaterial ||
        selectedMaterial.includes(
          baseMaterial
        ) ||
        baseMaterial.includes(
          selectedMaterial
        );

      return (
        nameMatches &&
        materialMatches
      );
    }) || null;

  if (matched) {
    return matched;
  }

  return productBases.length === 1
    ? productBases[0]
    : null;
}

function getEngravingPricing(
  collection
) {
  const pricing =
    (collection?.useDatabasePricing
      ? collection?.databasePricing
        ?.engraving
      : null) ||
    collection?.pricing?.engraving ||
    {};

  return {
    standard: Number(
      pricing.standard ?? 20
    ),

    customSignature: Number(
      pricing.customSignature ??
      pricing.custom ??
      50
    ),
  };
}

function getRingSizes(collection) {
  const firstCore =
    collection.ringCores?.[0];

  if (
    Array.isArray(firstCore?.sizes)
  ) {
    return firstCore.sizes.map(String);
  }

  if (
    Array.isArray(firstCore?.ringSizes)
  ) {
    return firstCore.ringSizes.map(String);
  }

  return Array.from(
    { length: 17 },
    (_, index) =>
      (4 + index * 0.5).toString()
  );
}

function getBezelOptions(collection) {
  const firstCore =
    collection.pendantCores?.[0] ||
    collection.ringCores?.[0];

  const coreBezelSizes =
    firstCore?.bezelSizes ||
    firstCore?.bezels ||
    firstCore?.settings ||
    [];

  let options = [];

  if (
    Array.isArray(coreBezelSizes) &&
    coreBezelSizes.length > 0
  ) {
    options = coreBezelSizes.map(
      (bezel, index) => {
        if (
          typeof bezel ===
          "string"
        ) {
          return {
            id:
              slugify(bezel),

            name:
              bezel,

            price:
              collection.pricing
                ?.bezelSizes?.[
              bezel
              ] ||
              collection.pricing
                ?.bezelSizes?.[
              slugify(bezel)
              ] ||
              0,
          };
        }

        return {
          id:
            bezel.id ||
            slugify(
              bezel.name ||
              bezel.size
            ) ||
            `bezel-${index}`,

          name:
            bezel.name ||
            bezel.size ||
            `Bezel ${index + 1}`,

          price:
            bezel.price ||
            collection.pricing
              ?.bezelSizes?.[
            bezel.id
            ] ||
            collection.pricing
              ?.bezelSizes?.[
            slugify(
              bezel.name ||
              bezel.size
            )
            ] ||
            0,
        };
      }
    );
  } else {
    options = [
      {
        id: "7x5",
        name: "7 × 5 mm",
        price: 0,
      },
      {
        id: "8x6",
        name: "8 × 6 mm",
        price: 0,
      },
      {
        id: "9x7",
        name: "9 × 7 mm",
        price: 0,
      },
      {
        id: "10x8",
        name: "10 × 8 mm",
        price: 10,
      },
      {
        id: "11x9",
        name: "11 × 9 mm",
        price: 10,
      },
    ];
  }

  const collectionKey =
    `${collection.id || ""} ${collection.slug || ""
      } ${collection.name || ""
      }`.toLowerCase();

  const isLegacyRound =
    collectionKey.includes(
      "legacy-round"
    ) ||
    collectionKey.includes(
      "legacy round"
    );

  if (isLegacyRound) {
    options.sort((a, b) => {
      const aSize =
        Number.parseFloat(
          String(a.name).match(
            /[\d.]+/
          )?.[0]
        ) || 0;

      const bSize =
        Number.parseFloat(
          String(b.name).match(
            /[\d.]+/
          )?.[0]
        ) || 0;

      return aSize - bSize;
    });
  }

  return options;
}

const keepsakeOptions = [
  {
    id: "ashes",
    name: "Cremation Ashes",
    price: 0,
  },
  {
    id: "breastMilk",
    name: "Breast Milk",
    price: 0,
  },
  {
    id: "sand",
    name: "Sand",
    price: 10,
  },
  {
    id: "soil",
    name: "Soil",
    price: 10,
  },
  {
    id: "mineralBase",
    name: "Mineral Base",
    price: 0,
  },
];

const noHairOption = {
  id: "no-hair",
  name: "No Hair",
  price: 0,
  description:
    "No hair will be included in your keepsake.",
};

const noDecorativeAccentOption = {
  id: "none",
  name: "No Decorative Accent",
  price: 0,
  description:
    "No decorative accent will be added.",
};

export default function RemiConfigurator({
  collection,
}) {
  const { addItem } =
    useCart();

  const isNecklace =
    collection.productType ===
    "necklace";

  const isLegacyCross =
    collection.slug ===
    "legacy-cross";

  const productLabel =
    isNecklace
      ? "Necklace"
      : "Ring";

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    selectedRingSize,
    setSelectedRingSize,
  ] = useState("");

  const [
    selectedKeepsake,
    setSelectedKeepsake,
  ] = useState("ashes");

  const [
    selectedHair,
    setSelectedHair,
  ] = useState("no-hair");

  const [
    selectedDecorativeAccent,
    setSelectedDecorativeAccent,
  ] = useState("none");

  const [
    selectedAccentStyle,
    setSelectedAccentStyle,
  ] = useState("");

  const [
    selectedMineralId,
    setSelectedMineralId,
  ] = useState("");

  const [
    mineralSearch,
    setMineralSearch,
  ] = useState("");

  const [
    mineralPickerOpen,
    setMineralPickerOpen,
  ] = useState(false);

  const [
    selectedBaseMineralId,
    setSelectedBaseMineralId,
  ] = useState("");

  const [
    baseMineralSearch,
    setBaseMineralSearch,
  ] = useState("");

  const [
    baseMineralPickerOpen,
    setBaseMineralPickerOpen,
  ] = useState(false);

  const [
    selectedGlow,
    setSelectedGlow,
  ] = useState(null);

  const [
    engravingEnabled,
    setEngravingEnabled,
  ] = useState(false);

  const [
    engravingType,
    setEngravingType,
  ] = useState("standard");

  const [
    engravingText,
    setEngravingText,
  ] = useState("");

  const [
    selectedEngravingFont,
    setSelectedEngravingFont,
  ] = useState({
    id: "arial",
    name: "Arial",
    fontFamily:
      "Arial, sans-serif",
  });

  const [
    specialRequest,
    setSpecialRequest,
  ] = useState(false);

  const [
    selectedChainId,
    setSelectedChainId,
  ] = useState("no-chain");

  const [
    cartButtonText,
    setCartButtonText,
  ] = useState(
    "Add to Cart"
  );

  const [
    saveButtonText,
    setSaveButtonText,
  ] = useState(
    "Save My Design"
  );

  const finishOptions =
    useMemo(
      () =>
        getFinishOptions(
          collection
        ),
      [collection]
    );

  const ringSizes =
    useMemo(
      () =>
        getRingSizes(
          collection
        ),
      [collection]
    );

  const bezelOptions =
    useMemo(
      () =>
        getBezelOptions(
          collection
        ),
      [collection]
    );

  const chainOptions =
    useMemo(
      () =>
        collection.options
          ?.chain?.options ||
        [],
      [collection]
    );

  const availableMinerals =
    useMemo(() => {
      return Array.isArray(
        collection.minerals
      )
        ? collection.minerals.filter(
          (mineral) =>
            mineral?.active !== false
        )
        : [];
    }, [
      collection.minerals,
    ]);

  const availableGlowPowders =
    useMemo(() => {
      return Array.isArray(
        collection.glowPowders
      )
        ? collection.glowPowders.filter(
          (glow) =>
            glow?.active !== false
        )
        : [];
    }, [
      collection.glowPowders,
    ]);

  const hairOptions =
    useMemo(() => {
      const databaseOptions =
        collection
          .configuratorOptions
          ?.hairPlacements ||
        [];

      return [
        noHairOption,

        ...databaseOptions.map(
          (option) => ({
            ...option,

            id:
              option.id ||
              option.slug,

            price:
              Number(
                option.price
              ) || 0,
          })
        ),
      ];
    }, [
      collection
        .configuratorOptions
        ?.hairPlacements,
    ]);

  const decorativeAccentOptions =
    useMemo(() => {
      const databaseOptions =
        collection
          .configuratorOptions
          ?.decorativeAccents ||
        [];

      return [
        noDecorativeAccentOption,

        ...databaseOptions.map(
          (option) => ({
            ...option,

            id:
              option.id ||
              option.slug,

            price:
              Number(
                option.price
              ) || 0,
          })
        ),
      ];
    }, [
      collection
        .configuratorOptions
        ?.decorativeAccents,
    ]);

  const accentStyleOptions =
    useMemo(() => {
      const databaseOptions =
        collection
          .configuratorOptions
          ?.accentStyles ||
        [];

      return databaseOptions.map(
        (option) => ({
          ...option,

          id:
            option.id ||
            option.slug,

          price:
            Number(
              option.price
            ) || 0,
        })
      );
    }, [
      collection
        .configuratorOptions
        ?.accentStyles,
    ]);

  const availableHairOptions =
    useMemo(() => {
      const allowed =
        collection.options
          ?.hair
          ?.allowedStyles;

      const allowedIds =
        Array.isArray(
          allowed
        )
          ? allowed
          : [];

      return hairOptions.filter(
        (hair) =>
          hair.id ===
          "no-hair" ||
          allowedIds.includes(
            hair.id
          )
      );
    }, [
      collection,
      hairOptions,
    ]);

  const availableDecorativeAccentOptions =
    useMemo(() => {
      const allowed =
        collection.options
          ?.decorativeAccents
          ?.allowed;

      const allowedIds =
        Array.isArray(
          allowed
        )
          ? allowed
          : [];

      return decorativeAccentOptions.filter(
        (accent) =>
          accent.id ===
          "none" ||
          allowedIds.includes(
            accent.id
          )
      );
    }, [
      collection,
      decorativeAccentOptions,
    ]);

  const availableAccentStyleOptions =
    useMemo(() => {
      const allowed =
        collection.options
          ?.decorativeAccents
          ?.allowedStyles;

      const allowedIds =
        Array.isArray(
          allowed
        )
          ? allowed
          : [];

      return accentStyleOptions.filter(
        (style) =>
          allowedIds.includes(
            style.id
          )
      );
    }, [
      collection,
      accentStyleOptions,
    ]);

  const [
    selectedFinishId,
    setSelectedFinishId,
  ] = useState(
    finishOptions[0]?.id ||
    ""
  );

  const [
    selectedBezelId,
    setSelectedBezelId,
  ] = useState(
    bezelOptions[0]?.id ||
    ""
  );

  const selectedFinish =
    finishOptions.find(
      (finish) =>
        finish.id ===
        selectedFinishId
    ) ||
    finishOptions[0];

  const selectedProductBase =
    getProductBaseForFinish(
      collection,
      selectedFinish
    );

  const engravingAvailable =
    selectedProductBase
      ?.allowEngraving ===
    true;

  const effectiveEngravingEnabled =
    engravingAvailable &&
    engravingEnabled;

  const engravingPricing =
    getEngravingPricing(
      collection
    );

  const selectedBezel =
    bezelOptions.find(
      (bezel) =>
        bezel.id ===
        selectedBezelId
    ) ||
    bezelOptions[0];

  const selectedChain =
    chainOptions.find(
      (chain) =>
        chain.id ===
        selectedChainId
    ) ||
    chainOptions[0] ||
    null;

  const selectedMineral =
    availableMinerals.find(
      (mineral) =>
        mineral.id ===
        selectedMineralId
    ) ||
    null;

  const selectedBaseMineral =
    availableMinerals.find(
      (mineral) =>
        mineral.id ===
        selectedBaseMineralId
    ) ||
    null;

  const hasHair =
    selectedHair !==
    "no-hair";

  const remiPhotos =
    isNecklace
      ? collection.pendantPhotos
        ?.length
        ? collection.pendantPhotos
        : collection.photos?.length
          ? collection.photos
          : []
      : collection.ringPhotos
        ?.length
        ? collection.ringPhotos
        : collection.photos?.length
          ? collection.photos
          : [];

  const matchingRemiPhoto =
    useMemo(() => {
      const photos =
        remiPhotos;

      const activeMineralId =
        selectedKeepsake ===
          "mineralBase"
          ? selectedBaseMineralId
          : selectedMineralId;

      return getBestCollectionPhoto({
        photos,

        selectedMaterial:
          selectedFinish
            ?.material ||
          "Sterling Silver",

        selectedFinish:
          selectedFinish
            ?.name ||
          "",

        selectedCore:
          collection
            .pendantCores?.[0] ||
          collection
            .ringCores?.[0] ||
          null,

        selectedMinerals:
          activeMineralId
            ? [
              activeMineralId,
            ]
            : [],

        selectedMemorialMaterials:
          [
            selectedKeepsake,

            hasHair
              ? "hair"
              : null,
          ].filter(
            Boolean
          ),

        selectedAccentMaterials:
          selectedDecorativeAccent &&
            selectedDecorativeAccent !==
            "none"
            ? [
              selectedDecorativeAccent,
            ]
            : [],

        selectedGlow,

        fallbackImage:
          collection.heroImage,
      });
    }, [
      collection,
      remiPhotos,
      selectedFinish,
      selectedKeepsake,
      selectedMineralId,
      selectedBaseMineralId,
      selectedDecorativeAccent,
      selectedGlow,
      hasHair,
    ]);

  const displayedImages =
    useMemo(() => {
      const photoImages =
        remiPhotos
          .map(
            (photo) =>
              typeof photo ===
                "string"
                ? photo
                : photo?.image ||
                photo?.imageUrl ||
                photo?.src
          )
          .filter(
            Boolean
          );

      const images = [
        matchingRemiPhoto,
        collection.heroImage,
        ...photoImages,
      ].filter(
        Boolean
      );

      return [
        ...new Set(
          images
        ),
      ];
    }, [
      collection.heroImage,
      matchingRemiPhoto,
      remiPhotos,
    ]);

  useEffect(() => {
    setSelectedImageIndex(
      0
    );
  }, [
    selectedFinishId,
    selectedKeepsake,
    selectedMineralId,
    selectedBaseMineralId,
    selectedHair,
  ]);

  useEffect(() => {
    if (
      engravingAvailable
    ) {
      return;
    }

    setEngravingEnabled(
      false
    );

    setEngravingType(
      "standard"
    );

    setEngravingText(
      ""
    );

    setSelectedEngravingFont({
      id: "arial",
      name: "Arial",
      fontFamily:
        "Arial, sans-serif",
    });
  }, [
    engravingAvailable,
  ]);

  useEffect(() => {
    if (
      !availableHairOptions.some(
        (hair) =>
          hair.id ===
          selectedHair
      )
    ) {
      setSelectedHair(
        "no-hair"
      );
    }
  }, [
    availableHairOptions,
    selectedHair,
  ]);

  useEffect(() => {
    if (
      !availableDecorativeAccentOptions.some(
        (accent) =>
          accent.id ===
          selectedDecorativeAccent
      )
    ) {
      setSelectedDecorativeAccent(
        "none"
      );

      setSelectedAccentStyle(
        ""
      );
    }
  }, [
    availableDecorativeAccentOptions,
    selectedDecorativeAccent,
  ]);

  useEffect(() => {
    if (
      selectedDecorativeAccent ===
      "none"
    ) {
      if (
        selectedAccentStyle
      ) {
        setSelectedAccentStyle(
          ""
        );
      }

      return;
    }

    if (
      availableAccentStyleOptions.length ===
      0
    ) {
      if (
        selectedAccentStyle
      ) {
        setSelectedAccentStyle(
          ""
        );
      }

      return;
    }

    if (
      !availableAccentStyleOptions.some(
        (style) =>
          style.id ===
          selectedAccentStyle
      )
    ) {
      setSelectedAccentStyle(
        availableAccentStyleOptions[
          0
        ].id
      );
    }
  }, [
    selectedDecorativeAccent,
    selectedAccentStyle,
    availableAccentStyleOptions,
  ]);

  useEffect(() => {
    if (
      selectedMineralId &&
      !availableMinerals.some(
        (mineral) =>
          mineral.id ===
          selectedMineralId
      )
    ) {
      setSelectedMineralId("");
    }

    if (
      selectedBaseMineralId &&
      !availableMinerals.some(
        (mineral) =>
          mineral.id ===
          selectedBaseMineralId
      )
    ) {
      setSelectedBaseMineralId("");
    }

    if (
      selectedGlow &&
      !availableGlowPowders.some(
        (glow) =>
          glow.id ===
          selectedGlow.id
      )
    ) {
      setSelectedGlow(null);
    }
  }, [
    availableMinerals,
    availableGlowPowders,
    selectedMineralId,
    selectedBaseMineralId,
    selectedGlow,
  ]);

  const currentImage =
    displayedImages[
    selectedImageIndex
    ] ||
    displayedImages[0] ||
    collection.heroImage;

  const filteredMinerals =
    useMemo(() => {
      const search =
        mineralSearch
          .trim()
          .toLowerCase();

      return [
        ...availableMinerals,
      ]
        .filter(
          (mineral) => {
            if (
              !search
            ) {
              return true;
            }

            return (
              mineral.name
                .toLowerCase()
                .includes(
                  search
                ) ||
              mineral.category
                .toLowerCase()
                .includes(
                  search
                )
            );
          }
        )
        .sort(
          (a, b) => {
            if (
              a.popular !==
              b.popular
            ) {
              return (
                Number(
                  b.popular
                ) -
                Number(
                  a.popular
                )
              );
            }

            return a.name.localeCompare(
              b.name
            );
          }
        );
    }, [
      mineralSearch,
      availableMinerals,
    ]);

  const filteredBaseMinerals =
    useMemo(() => {
      const search =
        baseMineralSearch
          .trim()
          .toLowerCase();

      return [
        ...availableMinerals,
      ]
        .filter((mineral) => {
          const isNoMineral =
            String(mineral?.name || "")
              .trim()
              .toLowerCase() === "no mineral";

          if (isNoMineral) {
            return false;
          }

          if (!search) return true;

          return (
            mineral.name.toLowerCase().includes(search) ||
            mineral.category.toLowerCase().includes(search)
          );
        })
        .sort(
          (a, b) => {
            if (
              a.popular !==
              b.popular
            ) {
              return (
                Number(
                  b.popular
                ) -
                Number(
                  a.popular
                )
              );
            }

            return a.name.localeCompare(
              b.name
            );
          }
        );
    }, [
      baseMineralSearch,
      availableMinerals,
    ]);

  const popularBaseMinerals =
    filteredBaseMinerals.filter(
      (mineral) =>
        mineral.popular
    );

  const otherBaseMinerals =
    filteredBaseMinerals.filter(
      (mineral) =>
        !mineral.popular
    );

  const isNoMineral = (mineral) =>
    String(mineral?.name || "")
      .trim()
      .toLowerCase() === "no mineral";

  const popularMinerals = filteredMinerals
    .filter(
      (mineral) =>
        mineral.popular ||
        isNoMineral(mineral)
    )
    .sort((a, b) => {
      if (isNoMineral(a)) return -1;
      if (isNoMineral(b)) return 1;

      return a.name.localeCompare(b.name);
    });

  const otherMinerals = filteredMinerals.filter(
    (mineral) =>
      !mineral.popular &&
      !isNoMineral(mineral)
  );

  const basePrice =
    collection.pricing
      ?.basePrice ??
    collection.startingPrice ??
    0;

  const finishPrice =
    collection.pricing
      ?.finishes?.[
    selectedFinish?.id
    ] ??
    collection.pricing
      ?.finishes?.[
    selectedFinish?.name
    ] ??
    selectedFinish?.price ??
    0;

  const bezelPrice =
    collection.pricing
      ?.bezelSizes?.[
    selectedBezel?.id
    ] ??
    collection.pricing
      ?.bezelSizes?.[
    selectedBezel?.name
    ] ??
    selectedBezel?.price ??
    0;

  const keepsakePrice =
    keepsakeOptions.find(
      (option) =>
        option.id ===
        selectedKeepsake
    )?.price ??
    0;

  const hairPrice =
    hairOptions.find(
      (option) =>
        option.id ===
        selectedHair
    )?.price ??
    0;

  const mineralPrice =
    selectedKeepsake ===
      "mineralBase"
      ? 0
      : selectedMineral
        ?.price ??
      0;

  const baseMineralPrice =
    selectedKeepsake ===
      "mineralBase"
      ? selectedBaseMineral
        ?.price ??
      0
      : 0;

  const decorativeAccentPrice =
    decorativeAccentOptions.find(
      (option) =>
        option.id ===
        selectedDecorativeAccent
    )?.price ??
    0;

  const accentStylePrice =
    selectedDecorativeAccent !==
      "none"
      ? accentStyleOptions.find(
        (option) =>
          option.id ===
          selectedAccentStyle
      )?.price ??
      0
      : 0;

  const glowPrice =
    selectedGlow?.price ??
    0;

  const engravingPrice =
    effectiveEngravingEnabled
      ? engravingType ===
        "customSignature"
        ? engravingPricing
          .customSignature
        : engravingPricing
          .standard
      : 0;

  const specialRequestPrice =
    specialRequest
      ? 30
      : 0;

  const chainPrice =
    isNecklace
      ? selectedChain?.price ??
      0
      : 0;

  /*
   * NORMAL FULL CONFIGURED PRICE
   */
  const totalPrice =
    basePrice +
    finishPrice +
    bezelPrice +
    keepsakePrice +
    hairPrice +
    mineralPrice +
    baseMineralPrice +
    glowPrice +
    decorativeAccentPrice +
    accentStylePrice +
    engravingPrice +
    specialRequestPrice +
    chainPrice;

  /*
   * SITE-WIDE SALE
   *
   * Discount the complete configured
   * jewelry price after every option
   * and add-on has been included.
   */
  const sitewideSalePercent =
    normalizeSalePercent(
      collection.siteSettings
        ?.sitewideSalePercent
    );

  const sitewideSaleEnabled =
    Boolean(
      collection.siteSettings
        ?.sitewideSaleEnabled
    ) &&
    sitewideSalePercent >
    0;

  const sitewideSaleName =
    String(
      collection.siteSettings
        ?.sitewideSaleName ||
      ""
    ).trim() ||
    "Site-Wide Sale";

  const customerPrice =
    getDiscountedPrice(
      totalPrice,
      sitewideSaleEnabled,
      sitewideSalePercent
    );

  const saleActive =
    sitewideSaleEnabled &&
    customerPrice <
    totalPrice;

  const requiredSelectionsComplete =
    Boolean(
      selectedFinishId &&
      (!isNecklace
        ? selectedRingSize
        : true) &&
      (isLegacyCross ||
        selectedBezelId) &&
      selectedKeepsake &&
      (selectedKeepsake ===
        "mineralBase"
        ? selectedBaseMineralId
        : selectedMineralId)
    );

  function selectMineral(
    mineralId
  ) {
    setSelectedMineralId(
      mineralId
    );

    setMineralPickerOpen(
      false
    );

    setMineralSearch(
      ""
    );
  }

  function selectBaseMineral(
    mineralId
  ) {
    setSelectedBaseMineralId(
      mineralId
    );

    setBaseMineralPickerOpen(
      false
    );

    setBaseMineralSearch(
      ""
    );
  }

  function getCurrentDesign() {
    return {
      productId:
        collection.id ||
        collection.slug ||
        "remi",

      productName:
        collection.name,

      image:
        currentImage,

      finishId:
        selectedFinishId,

      finish:
        selectedFinish?.name ||
        "",

      ringSize:
        isNecklace
          ? ""
          : selectedRingSize,

      bezelId:
        selectedBezelId,

      bezelSize:
        selectedBezel?.name ||
        "",

      keepsakeBase:
        selectedKeepsake,

      keepsakeBaseName:
        selectedKeepsake ===
          "mineralBase"
          ? selectedBaseMineral
            ?.name ||
          ""
          : keepsakeOptions.find(
            (option) =>
              option.id ===
              selectedKeepsake
          )?.name ||
          "",

      naturalMineralId:
        selectedKeepsake ===
          "mineralBase"
          ? ""
          : selectedMineralId,

      naturalMineral:
        selectedKeepsake ===
          "mineralBase"
          ? ""
          : selectedMineral
            ?.name ||
          "",

      hairPlacement:
        selectedHair,

      hairPlacementName:
        hairOptions.find(
          (option) =>
            option.id ===
            selectedHair
        )?.name ||
        "",

      decorativeAccent:
        selectedDecorativeAccent,

      decorativeAccentName:
        decorativeAccentOptions.find(
          (option) =>
            option.id ===
            selectedDecorativeAccent
        )?.name ||
        "",

      accentStyle:
        selectedAccentStyle,

      accentStyleName:
        accentStyleOptions.find(
          (option) =>
            option.id ===
            selectedAccentStyle
        )?.name ||
        "",

      glowId:
        selectedGlow?.id ||
        "none",

      glow:
        selectedGlow?.name ||
        "No Glow",

      engravingEnabled:
        effectiveEngravingEnabled,

      engravingType:
        effectiveEngravingEnabled
          ? engravingType
          : "none",

      engravingText:
        effectiveEngravingEnabled
          ? engravingText
          : "",

      engravingFont:
        effectiveEngravingEnabled
          ? selectedEngravingFont
            ?.name ||
          ""
          : "",

      engravingPrice,

      specialRequest,

      specialRequestPrice,

      chainId:
        isNecklace
          ? selectedChainId
          : "",

      chain:
        isNecklace
          ? selectedChain?.name ||
          "Pendant Only — No Chain"
          : "",

      chainPrice,

      totalPrice:
        customerPrice,

      regularPrice:
        totalPrice,

      sitewideSale:
        saleActive
          ? {
            name:
              sitewideSaleName,

            percent:
              sitewideSalePercent,
          }
          : null,
    };
  }

  function handleAddToCart() {
    if (
      !requiredSelectionsComplete
    ) {
      return;
    }

    const itemId =
      typeof crypto !==
        "undefined" &&
        typeof crypto.randomUUID ===
        "function"
        ? crypto.randomUUID()
        : `remi-${Date.now()}`;

    try {
      addItem({
        id:
          itemId,

        collectionId:
          collection.id ||
          collection.slug ||
          "remi",

        collectionSlug:
          collection.slug ||
          "remi",

        collectionName:
          collection.name,

        productType:
          collection.productType ||
          "ring",

        image:
          currentImage ||
          collection.heroImage,

        material:
          selectedFinish?.material ||
          selectedProductBase?.material ||
          "Sterling Silver",

        productBaseId:
          selectedProductBase?.databaseId ||
          null,

        productBase:
          selectedProductBase?.id ||
          selectedProductBase?.slug ||
          null,

        material:
          selectedProductBase?.material ||
          selectedFinish?.material ||
          "Sterling Silver",

        core: {
          id:
            selectedProductBase?.id ||
            selectedProductBase?.slug ||
            selectedFinishId,

          databaseId:
            selectedProductBase?.databaseId ||
            null,

          name:
            selectedProductBase?.name ||
            selectedFinish?.name ||
            productLabel,

          finish:
            selectedProductBase?.finish ||
            selectedFinish?.name ||
            "",

          material:
            selectedProductBase?.material ||
            selectedFinish?.material ||
            "Sterling Silver",
        },

        finish:
          selectedFinish?.name ||
          "",

        size:
          isNecklace
            ? ""
            : selectedRingSize,

        bezelSize:
          isLegacyCross
            ? ""
            : selectedBezelId,

        bezelSizeId:
          isLegacyCross
            ? ""
            : selectedBezelId,

        bezelSizeName:
          isLegacyCross
            ? ""
            : selectedBezel?.name ||
            "",

        pendantSize:
          isLegacyCross
            ? "7 × 5 mm"
            : "",

        keepsakeMaterial:
          selectedKeepsake,

        keepsakeMaterialName:
          selectedKeepsake ===
            "mineralBase"
            ? selectedBaseMineral
              ?.name ||
            "Mineral Base"
            : keepsakeOptions.find(
              (option) =>
                option.id ===
                selectedKeepsake
            )?.name ||
            "",

        mineral:
          selectedKeepsake ===
            "mineralBase"
            ? selectedBaseMineral
            : selectedMineral,

        hairPlacement:
          selectedHair,

        hairPlacementName:
          hairOptions.find(
            (option) =>
              option.id ===
              selectedHair
          )?.name ||
          "",

        decorativeAccent:
          selectedDecorativeAccent,

        decorativeAccentName:
          decorativeAccentOptions.find(
            (option) =>
              option.id ===
              selectedDecorativeAccent
          )?.name ||
          "",

        accentStyle:
          selectedAccentStyle,

        accentStyleName:
          accentStyleOptions.find(
            (option) =>
              option.id ===
              selectedAccentStyle
          )?.name ||
          "",

        glow:
          selectedGlow,

        engravingEnabled:
          effectiveEngravingEnabled,

        engravingType:
          effectiveEngravingEnabled
            ? engravingType
            : "none",

        engravingText:
          effectiveEngravingEnabled
            ? engravingText
            : "",

        engravingFont:
          effectiveEngravingEnabled
            ? selectedEngravingFont
              ?.name ||
            ""
            : "",

        engraving:
          effectiveEngravingEnabled
            ? {
              type:
                engravingType,

              name:
                engravingType ===
                  "customSignature"
                  ? "Custom Signature"
                  : "Standard Engraving",

              text:
                engravingText,

              font:
                selectedEngravingFont
                  ?.name ||
                "",

              price:
                engravingPrice,
            }
            : null,

        engravingPrice,

        specialRequest,

        specialRequestPrice,

        chainId:
          isNecklace
            ? selectedChainId
            : "",

        chain:
          isNecklace
            ? selectedChain
              ?.name ||
            "Pendant Only — No Chain"
            : "",

        chainPrice,

        /*
         * Customer-facing sale price.
         */
        price:
          customerPrice,

        /*
         * Full configured normal price.
         */
        regularPrice:
          totalPrice,

        sitewideSale:
          saleActive
            ? {
              name:
                sitewideSaleName,

              percent:
                sitewideSalePercent,
            }
            : null,

        quantity:
          1,
      });

      setCartButtonText(
        "Added to Cart ✓"
      );

      window.setTimeout(
        () =>
          setCartButtonText(
            "Add to Cart"
          ),
        2200
      );
    } catch (error) {
      console.error(
        "Unable to add the Remi design to the cart:",
        error
      );

      setCartButtonText(
        "Unable to Add — Try Again"
      );

      window.setTimeout(
        () =>
          setCartButtonText(
            "Add to Cart"
          ),
        2600
      );
    }
  }

  async function handleSaveDesign() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const design =
      getCurrentDesign();

    const savedDesignUrl =
      `${window.location.origin}${window.location.pathname}?design=${encodeURIComponent(
        JSON.stringify(
          design
        )
      )}`;

    try {
      await navigator.clipboard.writeText(
        savedDesignUrl
      );

      setSaveButtonText(
        "Design Link Copied ✓"
      );
    } catch {
      window.prompt(
        "Copy your saved design link:",
        savedDesignUrl
      );

      setSaveButtonText(
        "Design Saved ✓"
      );
    }

    window.setTimeout(
      () =>
        setSaveButtonText(
          "Save My Design"
        ),
      2400
    );
  }

  return (
    <main
      style={{
        maxWidth:
          "1180px",

        margin:
          "0 auto",

        padding:
          "45px 20px 80px",
      }}
    >
      <div
        className="remi-layout"
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "minmax(0, 1fr) 330px",

          gap:
            "24px",

          alignItems:
            "start",
        }}
      >
        <section>
          <img
            src={
              currentImage
            }
            alt={
              collection.name
            }
            style={{
              width:
                "100%",

              maxHeight:
                "520px",

              objectFit:
                "contain",

              borderRadius:
                "20px",

              border:
                "1px solid rgba(255,255,255,.12)",

              background:
                "rgba(255,255,255,.03)",

              display:
                "block",
            }}
          />

          {displayedImages.length >
            1 && (
              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",

                  gap:
                    "12px",

                  marginTop:
                    "14px",
                }}
              >
                {displayedImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                      style={{
                        padding:
                          0,

                        border:
                          selectedImageIndex ===
                            index
                            ? "2px solid #d4af37"
                            : "1px solid rgba(255,255,255,.15)",

                        borderRadius:
                          "12px",

                        overflow:
                          "hidden",

                        background:
                          "transparent",

                        cursor:
                          "pointer",
                      }}
                    >
                      <img
                        src={
                          image
                        }
                        alt={`${collection.name} view ${index + 1
                          }`}
                        style={{
                          width:
                            "100%",

                          height:
                            "120px",

                          objectFit:
                            "contain",

                          objectPosition:
                            "center",

                          display:
                            "block",

                          background:
                            "rgba(255,255,255,.03)",

                          padding:
                            "6px",
                        }}
                      />
                    </button>
                  )
                )}
              </div>
            )}

          <h1
            style={{
              fontSize:
                "44px",

              margin:
                "28px 0 12px",
            }}
          >
            {
              collection.name
            }
          </h1>

          <p
            style={{
              fontSize:
                "17px",

              lineHeight:
                1.7,

              opacity:
                0.82,

              maxWidth:
                "850px",
            }}
          >
            {
              collection.description
            }
          </p>

          <OptionSection
            title="Choose Metal Finish"
            description={`Select the finish for your sterling silver ${collection.name}.`}
          >
            <div
              style={
                optionGridStyle
              }
            >
              {finishOptions.map(
                (finish) => (
                  <ChoiceButton
                    key={
                      finish.id
                    }
                    selected={
                      selectedFinishId ===
                      finish.id
                    }
                    onClick={() =>
                      setSelectedFinishId(
                        finish.id
                      )
                    }
                    title={
                      finish.name
                    }
                    description={formatPrice(
                      collection.pricing
                        ?.finishes?.[
                      finish.id
                      ] ??
                      collection.pricing
                        ?.finishes?.[
                      finish.name
                      ] ??
                      finish.price
                    )}
                  />
                )
              )}
            </div>
          </OptionSection>

          {!isNecklace && (
            <OptionSection
              title="Choose Ring Size"
              description="Available in whole and half sizes from 4 through 12."
            >
              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(74px, 1fr))",

                  gap:
                    "10px",
                }}
              >
                {ringSizes.map(
                  (size) => (
                    <ChoiceButton
                      key={
                        size
                      }
                      selected={
                        selectedRingSize ===
                        size
                      }
                      onClick={() =>
                        setSelectedRingSize(
                          size
                        )
                      }
                      title={
                        size
                      }
                      compact
                      centered
                    />
                  )
                )}
              </div>
            </OptionSection>
          )}

          {!isLegacyCross &&
            collection.options
              ?.bezelSize
              ?.enabled !==
            false && (
              <OptionSection
                title="Choose Bezel Size"
                description={
                  isNecklace
                    ? "Choose any available bezel size at no additional cost."
                    : "Larger 10 × 8 mm and 11 × 9 mm bezels add $10."
                }
              >
                <div
                  style={
                    optionGridStyle
                  }
                >
                  {bezelOptions.map(
                    (bezel) => {
                      const price =
                        collection.pricing
                          ?.bezelSizes?.[
                        bezel.id
                        ] ??
                        collection.pricing
                          ?.bezelSizes?.[
                        bezel.name
                        ] ??
                        bezel.price;

                      return (
                        <ChoiceButton
                          key={
                            bezel.id
                          }
                          selected={
                            selectedBezelId ===
                            bezel.id
                          }
                          onClick={() =>
                            setSelectedBezelId(
                              bezel.id
                            )
                          }
                          title={
                            bezel.name
                          }
                          description={formatPrice(
                            price
                          )}
                        />
                      );
                    }
                  )}
                </div>
              </OptionSection>
            )}

          {isNecklace &&
            collection.options
              ?.chain
              ?.enabled && (
              <OptionSection
                title="Choose Chain Option"
                description="Select the pendant by itself or add a matching chain. The chain finish will automatically match your pendant finish."
              >
                <div
                  style={
                    optionGridStyle
                  }
                >
                  {chainOptions.map(
                    (chain) => (
                      <ChoiceButton
                        key={
                          chain.id
                        }
                        selected={
                          selectedChainId ===
                          chain.id
                        }
                        onClick={() =>
                          setSelectedChainId(
                            chain.id
                          )
                        }
                        title={
                          chain.name
                        }
                        description={formatPrice(
                          chain.price
                        )}
                      />
                    )
                  )}
                </div>
              </OptionSection>
            )}

          <OptionSection
            title="Choose Keepsake Base"
            description={`Select the primary material that will create the foundation of your ${productLabel.toLowerCase()} keepsake. Breast milk is finished with our signature pearl appearance, while cremation ashes, sand, and soil retain their natural color for a timeless and authentic keepsake.`}
          >
            <div
              style={
                optionGridStyle
              }
            >
              {keepsakeOptions.map(
                (material) => (
                  <ChoiceButton
                    key={
                      material.id
                    }
                    selected={
                      selectedKeepsake ===
                      material.id
                    }
                    onClick={() => {
                      setSelectedKeepsake(
                        material.id
                      );

                      if (
                        material.id ===
                        "mineralBase"
                      ) {
                        setSelectedMineralId(
                          ""
                        );

                        setMineralPickerOpen(
                          false
                        );

                        setMineralSearch(
                          ""
                        );
                      } else {
                        setSelectedBaseMineralId(
                          ""
                        );

                        setBaseMineralPickerOpen(
                          false
                        );

                        setBaseMineralSearch(
                          ""
                        );
                      }
                    }}
                    title={
                      material.name
                    }
                    description={formatPrice(
                      material.price
                    )}
                  />
                )
              )}
            </div>
          </OptionSection>

          {selectedKeepsake ===
            "mineralBase" && (
              <OptionSection
                title="Choose Base Mineral"
                description={`Choose the mineral that will form the entire base of your ${productLabel.toLowerCase()} keepsake.`}
              >
                {selectedBaseMineral &&
                  !baseMineralPickerOpen && (
                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        gap:
                          "16px",

                        padding:
                          "16px",

                        borderRadius:
                          "16px",

                        border:
                          "2px solid #d4af37",

                        background:
                          "rgba(212,175,55,.1)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "14px",

                          minWidth:
                            0,
                        }}
                      >
                        <img
                          src={
                            selectedBaseMineral.image
                          }
                          alt={
                            selectedBaseMineral.name
                          }
                          style={{
                            width:
                              "68px",

                            height:
                              "68px",

                            objectFit:
                              "cover",

                            borderRadius:
                              "12px",

                            flexShrink:
                              0,
                          }}
                        />

                        <div
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",

                              fontSize:
                                "18px",

                              marginBottom:
                                "4px",
                            }}
                          >
                            {
                              selectedBaseMineral.name
                            }
                          </strong>

                          <span
                            style={{
                              fontSize:
                                "14px",

                              opacity:
                                0.72,
                            }}
                          >
                            {
                              selectedBaseMineral.category
                            }{" "}
                            ·{" "}
                            {formatPrice(
                              selectedBaseMineral.price
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setBaseMineralPickerOpen(
                            true
                          )
                        }
                        style={
                          secondaryButtonStyle
                        }
                      >
                        Change Mineral
                      </button>
                    </div>
                  )}

                {!selectedBaseMineral &&
                  !baseMineralPickerOpen && (
                    <button
                      type="button"
                      onClick={() =>
                        setBaseMineralPickerOpen(
                          true
                        )
                      }
                      style={{
                        ...secondaryButtonStyle,

                        width:
                          "100%",

                        padding:
                          "16px",

                        fontSize:
                          "16px",
                      }}
                    >
                      Choose a Base Mineral
                    </button>
                  )}

                {baseMineralPickerOpen && (
                  <div
                    style={{
                      padding:
                        "18px",

                      borderRadius:
                        "18px",

                      border:
                        "1px solid rgba(255,255,255,.14)",

                      background:
                        "rgba(255,255,255,.025)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        gap:
                          "12px",

                        marginBottom:
                          "18px",

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <input
                        type="search"
                        value={
                          baseMineralSearch
                        }
                        onChange={(
                          event
                        ) =>
                          setBaseMineralSearch(
                            event.target
                              .value
                          )
                        }
                        placeholder="Search minerals..."
                        style={{
                          flex:
                            "1 1 260px",

                          minWidth:
                            0,

                          padding:
                            "13px 14px",

                          borderRadius:
                            "10px",

                          border:
                            "1px solid rgba(255,255,255,.18)",

                          background:
                            "rgba(255,255,255,.05)",

                          color:
                            "#fff",

                          fontSize:
                            "15px",

                          outline:
                            "none",
                        }}
                      />

                      {selectedBaseMineral && (
                        <button
                          type="button"
                          onClick={() => {
                            setBaseMineralPickerOpen(
                              false
                            );

                            setBaseMineralSearch(
                              ""
                            );
                          }}
                          style={
                            secondaryButtonStyle
                          }
                        >
                          Close
                        </button>
                      )}
                    </div>

                    {popularBaseMinerals.length >
                      0 && (
                        <MineralGroup
                          title="Popular Minerals"
                          mineralsToShow={
                            popularBaseMinerals
                          }
                          selectedMineralId={
                            selectedBaseMineralId
                          }
                          onSelect={
                            selectBaseMineral
                          }
                        />
                      )}

                    {otherBaseMinerals.length >
                      0 && (
                        <MineralGroup
                          title={
                            baseMineralSearch.trim()
                              ? "More Matching Minerals"
                              : "All Minerals"
                          }
                          mineralsToShow={
                            otherBaseMinerals
                          }
                          selectedMineralId={
                            selectedBaseMineralId
                          }
                          onSelect={
                            selectBaseMineral
                          }
                        />
                      )}

                    {filteredBaseMinerals.length ===
                      0 && (
                        <p
                          style={{
                            textAlign:
                              "center",

                            opacity:
                              0.7,

                            padding:
                              "24px 0 8px",
                          }}
                        >
                          No minerals match your search.
                        </p>
                      )}
                  </div>
                )}
              </OptionSection>
            )}

          <OptionSection
            title="Hair Placement"
            description="Choose how you would like your loved one's hair to be displayed within your keepsake. Only one option may be selected."
          >
            <div
              style={
                optionGridStyle
              }
            >
              {availableHairOptions.map(
                (hair) => (
                  <ChoiceButton
                    key={
                      hair.id
                    }
                    selected={
                      selectedHair ===
                      hair.id
                    }
                    onClick={() =>
                      setSelectedHair(
                        hair.id
                      )
                    }
                    title={
                      hair.name
                    }
                    description={`${hair.description} ${formatPrice(
                      hair.price
                    )}`}
                  />
                )
              )}
            </div>
          </OptionSection>

          {selectedKeepsake !==
            "mineralBase" && (
              <OptionSection
                title="Choose Natural Mineral"
                description="Select one natural mineral to complement your keepsake base. Your chosen mineral will be carefully crushed into small pieces and artistically sprinkled over the surface, adding beautiful natural color and texture while allowing your keepsake base to remain the centerpiece."
              >
                {selectedMineral &&
                  !mineralPickerOpen && (
                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        gap:
                          "16px",

                        padding:
                          "16px",

                        borderRadius:
                          "16px",

                        border:
                          "2px solid #d4af37",

                        background:
                          "rgba(212,175,55,.1)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "14px",

                          minWidth:
                            0,
                        }}
                      >
                        <img
                          src={
                            selectedMineral.image
                          }
                          alt={
                            selectedMineral.name
                          }
                          style={{
                            width:
                              "68px",

                            height:
                              "68px",

                            objectFit:
                              "cover",

                            borderRadius:
                              "12px",

                            flexShrink:
                              0,
                          }}
                        />

                        <div
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",

                              fontSize:
                                "18px",

                              marginBottom:
                                "4px",
                            }}
                          >
                            {
                              selectedMineral.name
                            }
                          </strong>

                          <span
                            style={{
                              fontSize:
                                "14px",

                              opacity:
                                0.72,
                            }}
                          >
                            {
                              selectedMineral.category
                            }{" "}
                            ·{" "}
                            {formatPrice(
                              selectedMineral.price
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMineralPickerOpen(
                            true
                          )
                        }
                        style={
                          secondaryButtonStyle
                        }
                      >
                        Change Natural Mineral
                      </button>
                    </div>
                  )}

                {!selectedMineral &&
                  !mineralPickerOpen && (
                    <button
                      type="button"
                      onClick={() =>
                        setMineralPickerOpen(
                          true
                        )
                      }
                      style={{
                        ...secondaryButtonStyle,

                        width:
                          "100%",

                        padding:
                          "16px",

                        fontSize:
                          "16px",
                      }}
                    >
                      Choose a Natural Mineral
                    </button>
                  )}

                {mineralPickerOpen && (
                  <div
                    style={{
                      padding:
                        "18px",

                      borderRadius:
                        "18px",

                      border:
                        "1px solid rgba(255,255,255,.14)",

                      background:
                        "rgba(255,255,255,.025)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        gap:
                          "12px",

                        marginBottom:
                          "18px",

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <input
                        type="search"
                        value={
                          mineralSearch
                        }
                        onChange={(
                          event
                        ) =>
                          setMineralSearch(
                            event.target
                              .value
                          )
                        }
                        placeholder="Search minerals..."
                        style={{
                          flex:
                            "1 1 260px",

                          minWidth:
                            0,

                          padding:
                            "13px 14px",

                          borderRadius:
                            "10px",

                          border:
                            "1px solid rgba(255,255,255,.18)",

                          background:
                            "rgba(255,255,255,.05)",

                          color:
                            "#fff",

                          fontSize:
                            "15px",

                          outline:
                            "none",
                        }}
                      />

                      {selectedMineral && (
                        <button
                          type="button"
                          onClick={() => {
                            setMineralPickerOpen(
                              false
                            );

                            setMineralSearch(
                              ""
                            );
                          }}
                          style={
                            secondaryButtonStyle
                          }
                        >
                          Close
                        </button>
                      )}
                    </div>

                    {popularMinerals.length >
                      0 && (
                        <MineralGroup
                          title="Popular Minerals"
                          mineralsToShow={
                            popularMinerals
                          }
                          selectedMineralId={
                            selectedMineralId
                          }
                          onSelect={
                            selectMineral
                          }
                        />
                      )}

                    {otherMinerals.length >
                      0 && (
                        <MineralGroup
                          title={
                            mineralSearch.trim()
                              ? "More Matching Minerals"
                              : "All Minerals"
                          }
                          mineralsToShow={
                            otherMinerals
                          }
                          selectedMineralId={
                            selectedMineralId
                          }
                          onSelect={
                            selectMineral
                          }
                        />
                      )}

                    {filteredMinerals.length ===
                      0 && (
                        <p
                          style={{
                            textAlign:
                              "center",

                            opacity:
                              0.7,

                            padding:
                              "24px 0 8px",
                          }}
                        >
                          No minerals match your search.
                        </p>
                      )}
                  </div>
                )}
              </OptionSection>
            )}

          <OptionSection
            title="Decorative Accent"
            description="Choose one optional decorative accent to complement your keepsake."
          >
            <div
              style={
                optionGridStyle
              }
            >
              {availableDecorativeAccentOptions.map(
                (accent) => (
                  <ChoiceButton
                    key={
                      accent.id
                    }
                    selected={
                      selectedDecorativeAccent ===
                      accent.id
                    }
                    onClick={() => {
                      setSelectedDecorativeAccent(
                        accent.id
                      );

                      if (
                        accent.id ===
                        "none"
                      ) {
                        setSelectedAccentStyle(
                          ""
                        );
                      } else if (
                        !selectedAccentStyle
                      ) {
                        setSelectedAccentStyle(
                          availableAccentStyleOptions[
                            0
                          ]?.id ||
                          ""
                        );
                      }
                    }}
                    title={
                      accent.name
                    }
                    description={formatPrice(
                      accent.price
                    )}
                  />
                )
              )}
            </div>
          </OptionSection>

          {selectedDecorativeAccent !==
            "none" &&
            availableAccentStyleOptions.length >
            0 && (
              <OptionSection
                title="Accent Style"
                description="Choose one style for your decorative accent."
              >
                <div
                  style={
                    optionGridStyle
                  }
                >
                  {availableAccentStyleOptions.map(
                    (style) => (
                      <ChoiceButton
                        key={
                          style.id
                        }
                        selected={
                          selectedAccentStyle ===
                          style.id
                        }
                        onClick={() =>
                          setSelectedAccentStyle(
                            style.id
                          )
                        }
                        title={
                          style.name
                        }
                        description={`${style.description || ""} ${formatPrice(
                          style.price
                        )}`.trim()}
                      />
                    )
                  )}
                </div>

                {selectedAccentStyle ===
                  "crescent-moon" &&
                  selectedHair ===
                  "crescent-hair" && (
                    <p
                      style={{
                        marginTop:
                          "14px",

                        padding:
                          "13px 15px",

                        borderRadius:
                          "12px",

                        background:
                          "rgba(212,175,55,.1)",

                        border:
                          "1px solid rgba(212,175,55,.35)",

                        fontSize:
                          "14px",

                        lineHeight:
                          1.55,
                      }}
                    >
                      The decorative crescent will automatically be placed on the opposite side of the hair to create a balanced and complementary design.
                    </p>
                  )}
              </OptionSection>
            )}

          {engravingAvailable && (
            <EngravingSelector
              engravingEnabled={
                engravingEnabled
              }
              engravingType={
                engravingType
              }
              engravingText={
                engravingText
              }
              selectedEngravingFont={
                selectedEngravingFont
              }
              onToggleEngraving={() => {
                setEngravingEnabled(
                  (current) => {
                    if (
                      current
                    ) {
                      setEngravingText(
                        ""
                      );
                    }

                    return !current;
                  }
                );
              }}
              onChangeEngravingType={(
                type
              ) => {
                setEngravingType(
                  type
                );

                if (
                  type ===
                  "customSignature"
                ) {
                  setEngravingText(
                    ""
                  );
                }
              }}
              onChangeEngraving={
                setEngravingText
              }
              onChangeEngravingFont={
                setSelectedEngravingFont
              }
            />
          )}

          <OptionSection
            title="Special Request"
            description="Select this option if you would like something different from the choices shown above. Please message us before ordering so we can confirm your request can be completed."
          >
            <div
              style={
                optionGridStyle
              }
            >
              <ChoiceButton
                selected={
                  !specialRequest
                }
                onClick={() =>
                  setSpecialRequest(
                    false
                  )
                }
                title="No Special Request"
                description="Included"
              />

              <ChoiceButton
                selected={
                  specialRequest
                }
                onClick={() =>
                  setSpecialRequest(
                    true
                  )
                }
                title="⭐ Add Special Request"
                description="+$30"
              />
            </div>
          </OptionSection>

          <GlowSelector
            glowPowders={
              availableGlowPowders
            }
            selectedGlow={
              selectedGlow
            }
            onSelectGlow={
              setSelectedGlow
            }
          />
        </section>

        <aside
          style={{
            position:
              "sticky",

            top:
              "110px",

            maxHeight:
              "calc(100vh - 130px)",

            overflowY:
              "auto",

            scrollbarGutter:
              "stable",

            padding:
              "22px",

            borderRadius:
              "18px",

            border:
              "1px solid rgba(255,255,255,.18)",

            background:
              "rgba(255,255,255,.045)",
          }}
        >
          <h2
            style={{
              fontSize:
                "27px",

              marginBottom:
                "20px",
            }}
          >
            Your{" "}
            {
              collection.name
            }
          </h2>

          <SummaryRow
            label="Product"
            value={
              collection.name
            }
          />

          <SummaryRow
            label="Metal Finish"
            value={
              selectedFinish?.name ||
              "Not selected"
            }
          />

          {!isNecklace && (
            <SummaryRow
              label="Ring Size"
              value={
                selectedRingSize ||
                "Not selected"
              }
            />
          )}

          <SummaryRow
            label={
              isLegacyCross
                ? "Pendant Size"
                : "Bezel Size"
            }
            value={
              isLegacyCross
                ? "7 × 5 mm"
                : selectedBezel?.name ||
                "Not selected"
            }
          />

          {isNecklace && (
            <SummaryRow
              label="Chain"
              value={
                selectedChain?.name ||
                "Pendant Only — No Chain"
              }
            />
          )}

          <SummaryRow
            label="Keepsake Base"
            value={
              selectedKeepsake ===
                "mineralBase"
                ? selectedBaseMineral
                  ? `${selectedBaseMineral.name} Mineral`
                  : "Mineral Base — not selected"
                : keepsakeOptions.find(
                  (option) =>
                    option.id ===
                    selectedKeepsake
                )?.name ||
                "Not selected"
            }
          />

          <SummaryRow
            label="Hair"
            value={
              hairOptions.find(
                (option) =>
                  option.id ===
                  selectedHair
              )?.name ||
              "Not selected"
            }
          />

          {selectedKeepsake !==
            "mineralBase" && (
              <SummaryRow
                label="Natural Mineral"
                value={
                  selectedMineral?.name ||
                  "Not selected"
                }
              />
            )}

          <SummaryRow
            label="Decorative Accent"
            value={
              decorativeAccentOptions.find(
                (option) =>
                  option.id ===
                  selectedDecorativeAccent
              )?.name ||
              "Not selected"
            }
          />

          {selectedDecorativeAccent !==
            "none" && (
              <SummaryRow
                label="Accent Style"
                value={
                  accentStyleOptions.find(
                    (option) =>
                      option.id ===
                      selectedAccentStyle
                  )?.name ||
                  "Not selected"
                }
              />
            )}

          {engravingAvailable && (
            <>
              <SummaryRow
                label="Engraving"
                value={
                  effectiveEngravingEnabled
                    ? engravingType ===
                      "customSignature"
                      ? "Custom Signature"
                      : "Standard Engraving"
                    : "No Engraving"
                }
              />

              {effectiveEngravingEnabled && (
                <SummaryRow
                  label="Engraving Price"
                  value={`+$${engravingPrice.toFixed(
                    2
                  )}`}
                />
              )}

              {effectiveEngravingEnabled &&
                engravingText && (
                  <SummaryRow
                    label={
                      engravingType ===
                        "customSignature"
                        ? "Engraving Notes"
                        : "Engraving Text"
                    }
                    value={
                      engravingText
                    }
                  />
                )}

              {effectiveEngravingEnabled &&
                engravingType ===
                "standard" && (
                  <SummaryRow
                    label="Engraving Font"
                    value={
                      selectedEngravingFont
                        ?.name ||
                      "Arial"
                    }
                  />
                )}
            </>
          )}

          <SummaryRow
            label="Glow Effect"
            value={
              selectedGlow?.name ||
              "No Glow"
            }
          />

          <SummaryRow
            label="Special Request"
            value={
              specialRequest
                ? "Yes (+$30)"
                : "None"
            }
          />

          {saleActive && (
            <div
              style={{
                marginTop:
                  "18px",

                marginBottom:
                  "4px",

                padding:
                  "10px 12px",

                borderRadius:
                  "10px",

                border:
                  "1px solid rgba(212,175,55,.35)",

                background:
                  "rgba(212,175,55,.08)",

                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  color:
                    "#d4af37",

                  fontSize:
                    "13px",

                  fontWeight:
                    800,
                }}
              >
                {
                  sitewideSaleName
                }
              </div>

              <div
                style={{
                  marginTop:
                    "3px",

                  fontSize:
                    "12px",

                  opacity:
                    0.75,
                }}
              >
                {sitewideSalePercent}% off your configured jewelry
              </div>
            </div>
          )}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              borderTop:
                "1px solid rgba(255,255,255,.15)",

              marginTop:
                "20px",

              paddingTop:
                "20px",
            }}
          >
            <strong
              style={{
                fontSize:
                  "18px",
              }}
            >
              Total
            </strong>

            <div
              style={{
                textAlign:
                  "right",
              }}
            >
              {saleActive && (
                <div
                  style={{
                    fontSize:
                      "15px",

                    opacity:
                      0.5,

                    textDecoration:
                      "line-through",

                    marginBottom:
                      "2px",
                  }}
                >
                  $
                  {totalPrice.toFixed(
                    2
                  )}
                </div>
              )}

              <strong
                style={{
                  display:
                    "block",

                  fontSize:
                    "28px",

                  color:
                    "#d4af37",
                }}
              >
                $
                {customerPrice.toFixed(
                  2
                )}
              </strong>
            </div>
          </div>

          <button
            type="button"
            disabled={
              !requiredSelectionsComplete
            }
            onClick={
              handleAddToCart
            }
            style={{
              width:
                "100%",

              marginTop:
                "20px",

              padding:
                "15px",

              border:
                "none",

              borderRadius:
                "10px",

              background:
                cartButtonText ===
                  "Added to Cart ✓"
                  ? "#2e7d32"
                  : cartButtonText ===
                    "Unable to Add — Try Again"
                    ? "#b71c1c"
                    : requiredSelectionsComplete
                      ? "#d4af37"
                      : "rgba(212,175,55,.4)",

              color:
                cartButtonText ===
                  "Added to Cart ✓" ||
                  cartButtonText ===
                  "Unable to Add — Try Again"
                  ? "#fff"
                  : "#111",

              fontSize:
                "17px",

              fontWeight:
                800,

              cursor:
                requiredSelectionsComplete
                  ? "pointer"
                  : "not-allowed",

              opacity:
                requiredSelectionsComplete
                  ? 1
                  : 0.72,

              transition:
                "background 0.2s ease, color 0.2s ease",
            }}
          >
            {!isNecklace &&
              !selectedRingSize
              ? "Choose a Ring Size"
              : selectedKeepsake ===
                "mineralBase" &&
                !selectedBaseMineralId
                ? "Choose a Base Mineral"
                : selectedKeepsake !==
                  "mineralBase" &&
                  !selectedMineralId
                  ? "Choose a Natural Mineral"
                  : cartButtonText}
          </button>

          <button
            type="button"
            onClick={
              handleSaveDesign
            }
            style={{
              width:
                "100%",

              marginTop:
                "10px",

              padding:
                "15px",

              border:
                "1px solid rgba(212,175,55,.65)",

              borderRadius:
                "10px",

              background:
                "rgba(255,255,255,.035)",

              color:
                "#fff",

              fontSize:
                "16px",

              fontWeight:
                800,

              cursor:
                "pointer",
            }}
          >
            {
              saveButtonText
            }
          </button>

          <p
            style={{
              fontSize:
                "13px",

              lineHeight:
                1.5,

              opacity:
                0.68,

              textAlign:
                "center",

              marginTop:
                "16px",
            }}
          >
            Carefully handcrafted in North Carolina.
            Estimated completion time is{" "}
            {collection.siteSettings
              ?.turnaroundMinWeeks ??
              2}
            –
            {collection.siteSettings
              ?.turnaroundMaxWeeks ??
              10}{" "}
            weeks.
          </p>
        </aside>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .remi-layout {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 24px !important;
    }
  }
`}</style>
    </main>
  );
}

const optionGridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",

  gap:
    "14px",
};

const secondaryButtonStyle = {
  padding:
    "11px 14px",

  borderRadius:
    "10px",

  border:
    "1px solid rgba(255,255,255,.18)",

  background:
    "rgba(255,255,255,.06)",

  color:
    "#fff",

  fontWeight:
    750,

  cursor:
    "pointer",
};

function OptionSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        marginTop:
          "36px",
      }}
    >
      <h2
        style={{
          fontSize:
            "23px",

          marginBottom:
            description
              ? "8px"
              : "15px",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            fontSize:
              "14px",

            lineHeight:
              1.5,

            opacity:
              0.7,

            marginBottom:
              "15px",
          }}
        >
          {
            description
          }
        </p>
      )}

      {children}
    </section>
  );
}

function ChoiceButton({
  selected,
  onClick,
  title,
  description,
  compact = false,
  centered = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      style={{
        padding:
          compact
            ? "14px"
            : "18px",

        borderRadius:
          "14px",

        textAlign:
          centered
            ? "center"
            : "left",

        cursor:
          "pointer",

        color:
          "#fff",

        background:
          selected
            ? "rgba(212,175,55,.14)"
            : "rgba(255,255,255,.04)",

        border:
          selected
            ? "2px solid #d4af37"
            : "1px solid rgba(255,255,255,.14)",
      }}
    >
      <strong
        style={{
          display:
            "block",

          fontSize:
            compact
              ? "16px"
              : "17px",

          marginBottom:
            description
              ? "5px"
              : 0,
        }}
      >
        {title}
      </strong>

      {description && (
        <span
          style={{
            display:
              "block",

            fontSize:
              compact
                ? "13px"
                : "14px",

            lineHeight:
              1.5,

            opacity:
              0.75,
          }}
        >
          {
            description
          }
        </span>
      )}
    </button>
  );
}

function MineralGroup({
  title,
  mineralsToShow,
  selectedMineralId,
  onSelect,
}) {
  return (
    <div
      style={{
        marginTop:
          "18px",
      }}
    >
      <h3
        style={{
          fontSize:
            "17px",

          marginBottom:
            "12px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(145px, 1fr))",

          gap:
            "12px",
        }}
      >
        {mineralsToShow.map(
          (mineral) => {
            const selected =
              selectedMineralId ===
              mineral.id;

            return (
              <button
                key={
                  mineral.id
                }
                type="button"
                onClick={() =>
                  onSelect(
                    mineral.id
                  )
                }
                style={{
                  padding:
                    "8px",

                  borderRadius:
                    "14px",

                  overflow:
                    "hidden",

                  textAlign:
                    "left",

                  cursor:
                    "pointer",

                  color:
                    "#fff",

                  background:
                    selected
                      ? "rgba(212,175,55,.14)"
                      : "rgba(255,255,255,.04)",

                  border:
                    selected
                      ? "2px solid #d4af37"
                      : "1px solid rgba(255,255,255,.14)",
                }}
              >
                <img
                  src={
                    mineral.image
                  }
                  alt={
                    mineral.name
                  }
                  style={{
                    width:
                      "100%",

                    aspectRatio:
                      "1 / 1",

                    objectFit:
                      "cover",

                    display:
                      "block",

                    borderRadius:
                      "9px",

                    background:
                      "rgba(255,255,255,.04)",
                  }}
                />

                <div
                  style={{
                    padding:
                      "10px 6px 6px",
                  }}
                >
                  <strong
                    style={{
                      display:
                        "block",

                      fontSize:
                        "14px",

                      lineHeight:
                        1.3,

                      marginBottom:
                        "5px",
                    }}
                  >
                    {
                      mineral.name
                    }
                  </strong>

                  <span
                    style={{
                      display:
                        "block",

                      fontSize:
                        "12px",

                      opacity:
                        0.68,

                      marginBottom:
                        "4px",
                    }}
                  >
                    {
                      mineral.category
                    }
                  </span>

                  <span
                    style={{
                      display:
                        "block",

                      fontSize:
                        "13px",

                      fontWeight:
                        800,

                      color:
                        "#d4af37",
                    }}
                  >
                    {formatPrice(
                      mineral.price
                    )}
                  </span>
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div
      style={{
        marginBottom:
          "14px",

        paddingBottom:
          "14px",

        borderBottom:
          "1px solid rgba(255,255,255,.1)",
      }}
    >
      <span
        style={{
          display:
            "block",

          fontSize:
            "11px",

          fontWeight:
            800,

          letterSpacing:
            ".08em",

          textTransform:
            "uppercase",

          opacity:
            0.58,

          marginBottom:
            "5px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          display:
            "block",

          fontSize:
            "15px",

          fontWeight:
            650,
        }}
      >
        {value}
      </span>
    </div>
  );
}