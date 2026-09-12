"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import getBestCollectionPhoto from "@/utils/getBestCollectionPhoto";

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

function getEngravingConfig(
  collection,
  selectedCore = null,
  selectedFinish = null
) {
  const pricing =
    (collection?.useDatabasePricing
      ? collection?.databasePricing?.engraving
      : null) ||
    collection?.pricing?.engraving ||
    {};

  const optionConfig =
    collection?.options?.engraving ??
    collection?.engraving ??
    null;

  const productBases =
    Array.isArray(collection?.ringCores)
      ? collection.ringCores
      : [];

  const selectedIds = new Set(
    [
      selectedCore?.id,
      selectedCore?.databaseId,
      selectedFinish?.id,
      selectedFinish?.core?.id,
      selectedFinish?.core?.databaseId,
    ]
      .filter(Boolean)
      .map(String)
  );

  const selectedMaterial = String(
    selectedCore?.material ||
    selectedFinish?.core?.material ||
    ""
  )
    .trim()
    .toLowerCase();

  const selectedFinishName = String(
    selectedFinish?.name ||
    selectedCore?.finish ||
    ""
  )
    .trim()
    .toLowerCase();

  const matchingProductBase =
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

      const baseMaterial = String(
        base?.material || ""
      )
        .trim()
        .toLowerCase();

      const baseFinish = String(
        base?.finish ||
        base?.name ||
        ""
      )
        .trim()
        .toLowerCase();

      const materialMatches =
        selectedMaterial &&
        baseMaterial &&
        selectedMaterial ===
        baseMaterial;

      const finishMatches =
        selectedFinishName &&
        baseFinish &&
        (selectedFinishName ===
          baseFinish ||
          selectedFinishName.includes(
            baseFinish
          ) ||
          baseFinish.includes(
            selectedFinishName
          ));

      return (
        materialMatches &&
        (!selectedFinishName ||
          !baseFinish ||
          finishMatches)
      );
    }) ||
    (productBases.length === 1
      ? productBases[0]
      : null);

  const coreAllowsEngraving =
    matchingProductBase
      ? matchingProductBase.allowEngraving ===
      true
      : selectedCore?.allowEngraving ===
      true;

  return {
    enabled:
      coreAllowsEngraving,

    standardPrice: Number(
      pricing.standard ??
      optionConfig?.standardPrice ??
      optionConfig?.standard ??
      0
    ),

    customSignaturePrice: Number(
      pricing.customSignature ??
      pricing.custom ??
      optionConfig?.customSignaturePrice ??
      optionConfig?.customSignature ??
      0
    ),
  };
}

function getEngravingLabel(
  engravingType
) {
  if (
    engravingType ===
    "standard"
  ) {
    return "Standard Engraving";
  }

  if (
    engravingType ===
    "customSignature"
  ) {
    return "Custom Signature";
  }

  return "No Engraving";
}

const fallbackBirthstoneOptions = [
  {
    id: "january",
    month: "January",
    stone: "Garnet",
  },
  {
    id: "february",
    month: "February",
    stone: "Amethyst",
  },
  {
    id: "march",
    month: "March",
    stone: "Aquamarine",
  },
  {
    id: "april",
    month: "April",
    stone: "Diamond",
  },
  {
    id: "may",
    month: "May",
    stone: "Emerald",
  },
  {
    id: "june",
    month: "June",
    stone: "Alexandrite",
  },
  {
    id: "july",
    month: "July",
    stone: "Ruby",
  },
  {
    id: "august",
    month: "August",
    stone: "Peridot",
  },
  {
    id: "september",
    month: "September",
    stone: "Sapphire",
  },
  {
    id: "october",
    month: "October",
    stone: "Pink Tourmaline",
  },
  {
    id: "november",
    month: "November",
    stone: "Citrine",
  },
  {
    id: "december",
    month: "December",
    stone: "Blue Zircon",
  },
];

const memorialMaterialCatalog = {
  ashes: {
    id: "ashes",
    name: "Cremation Ashes",
    description:
      "A small portion of your loved one’s cremation ashes is carefully preserved within the jewelry.",
  },

  hair: {
    id: "hair",
    name: "Hair",
    description:
      "Human hair incorporated into the keepsake.",
  },

  fur: {
    id: "fur",
    name: "Pet Fur",
    description:
      "Pet fur incorporated into the keepsake.",
  },

  horseHair: {
    id: "horseHair",
    name: "Horse Hair",
    description:
      "Horse hair incorporated into the keepsake.",
  },

  sand: {
    id: "sand",
    name: "Sand",
    description:
      "Meaningful sand supplied by the customer.",
  },

  soil: {
    id: "soil",
    name: "Soil",
    description:
      "Meaningful soil supplied by the customer.",
  },

  breastMilk: {
    id: "breastMilk",
    name: "Breast Milk",
    description:
      "Your preserved breast milk is transformed into a timeless pearl-white keepsake inlay.",
  },

  specialRequest: {
    id: "specialRequest",
    name: "Special Request",
    description:
      "Choose this option for another meaningful keepsake material and describe your request after ordering.",
  },
};

const legacyKeepsakeChoices = [
  memorialMaterialCatalog.breastMilk,
  memorialMaterialCatalog.ashes,
  memorialMaterialCatalog.specialRequest,
];

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function normalizeFinishOption(
  finish,
  index = 0
) {
  if (
    typeof finish ===
    "string"
  ) {
    return {
      id:
        slugify(finish) ||
        `finish-${index}`,

      name:
        finish,

      materialDescription:
        "",

      raw:
        finish,
    };
  }

  return {
    id:
      finish?.id ||
      slugify(
        finish?.name ||
        finish?.finish
      ) ||
      `finish-${index}`,

    name:
      finish?.name ||
      finish?.finish ||
      `Finish ${index + 1}`,

    materialDescription:
      finish?.materialDescription ||
      finish?.description ||
      "",

    raw:
      finish,
  };
}

function getProductType(
  collection
) {
  const explicitType = (
    collection.productType ||
    collection.type ||
    collection.categoryType ||
    ""
  ).toLowerCase();

  if (
    explicitType.includes(
      "bracelet"
    )
  ) {
    return "bracelet";
  }

  if (
    explicitType.includes(
      "necklace"
    )
  ) {
    return "necklace";
  }

  if (
    explicitType.includes(
      "ring"
    )
  ) {
    return "ring";
  }

  const builder = (
    collection.builder ||
    ""
  ).toLowerCase();

  if (
    builder.includes(
      "bracelet"
    )
  ) {
    return "bracelet";
  }

  if (
    builder.includes(
      "necklace"
    )
  ) {
    return "necklace";
  }

  if (
    builder.includes(
      "ring"
    )
  ) {
    return "ring";
  }

  return "jewelry";
}

function getCoreList(
  collection,
  productType
) {
  if (
    productType ===
    "ring"
  ) {
    return (
      collection.ringCores ||
      collection.productCores ||
      collection.cores ||
      []
    );
  }

  if (
    productType ===
    "bracelet"
  ) {
    return (
      collection.braceletCores ||
      collection.productCores ||
      collection.ringCores ||
      collection.cores ||
      []
    );
  }

  if (
    productType ===
    "necklace"
  ) {
    if (
      Array.isArray(
        collection.ringCores
      ) &&
      collection.ringCores.length >
      0
    ) {
      return collection.ringCores;
    }

    return (
      collection.necklaceCores ||
      collection.productCores ||
      collection.cores ||
      []
    );
  }

  return (
    collection.productCores ||
    collection.cores ||
    []
  );
}

function getPhotoList(
  collection,
  productType
) {
  if (
    productType ===
    "ring"
  ) {
    return (
      collection.ringPhotos ||
      collection.productPhotos ||
      collection.photos ||
      []
    );
  }

  if (
    productType ===
    "bracelet"
  ) {
    return (
      collection.braceletPhotos ||
      collection.ringPhotos ||
      collection.productPhotos ||
      collection.photos ||
      []
    );
  }

  if (
    productType ===
    "necklace"
  ) {
    return (
      collection.necklacePhotos ||
      collection.productPhotos ||
      collection.photos ||
      []
    );
  }

  return (
    collection.productPhotos ||
    collection.photos ||
    []
  );
}

function getBirthstonesEnabled(
  collection
) {
  if (
    Array.isArray(
      collection.birthstones
    )
  ) {
    return (
      collection.birthstones
        .length > 0
    );
  }

  return (
    collection.options
      ?.birthstones ===
    true ||
    collection.options
      ?.birthstones
      ?.enabled === true ||
    collection.birthstones ===
    true ||
    collection.birthstones
      ?.enabled === true
  );
}

function getFinishOptions(
  cores
) {
  if (
    !Array.isArray(cores) ||
    cores.length === 0
  ) {
    return [];
  }

  if (
    cores.length > 1
  ) {
    return cores.map(
      (core, index) => ({
        id:
          core.id ||
          slugify(
            core.finish ||
            core.name
          ) ||
          `core-${index}`,

        name:
          core.finish ||
          core.name ||
          `Finish ${index + 1
          }`,

        materialDescription:
          core.materialDescription ||
          core.description ||
          (core.material
            ? `${core.material}${core.finish
              ? ` with ${core.finish} finish`
              : ""
            }`
            : ""),

        core,
      })
    );
  }

  const firstCore =
    cores[0];

  const nestedFinishes =
    firstCore?.finishes ||
    [];

  if (
    nestedFinishes.length >
    0
  ) {
    return nestedFinishes.map(
      (finish, index) => ({
        ...normalizeFinishOption(
          finish,
          index
        ),

        core:
          firstCore,
      })
    );
  }

  return [
    {
      id:
        firstCore.id ||
        slugify(
          firstCore.finish ||
          firstCore.name
        ) ||
        "default-finish",

      name:
        firstCore.finish ||
        firstCore.name ||
        "Sterling Silver",

      materialDescription:
        firstCore.materialDescription ||
        firstCore.description ||
        (firstCore.material
          ? `${firstCore.material}${firstCore.finish
            ? ` with ${firstCore.finish} finish`
            : ""
          }`
          : ""),

      core:
        firstCore,
    },
  ];
}

function getSelectedCore(
  finish,
  cores
) {
  return (
    finish?.core ||
    cores?.[0] ||
    null
  );
}

function getRingSizes(
  core
) {
  if (!core) {
    return [];
  }

  if (
    Array.isArray(
      core.sizes
    )
  ) {
    return core.sizes;
  }

  if (
    Array.isArray(
      core.widths
    ) &&
    Array.isArray(
      core.widths[0]
        ?.sizes
    )
  ) {
    return (
      core.widths[0]
        .sizes
    );
  }

  return [];
}

function getDetailData(
  core
) {
  return (
    core?.ringDetails ||
    core?.braceletDetails ||
    core?.pendantDetails ||
    core?.necklaceDetails ||
    core?.productDetails ||
    {}
  );
}

function getLengthValue(
  core,
  productType
) {
  if (
    productType ===
    "bracelet"
  ) {
    return (
      core?.braceletLength ||
      core?.chainLength ||
      core?.length ||
      '6" with 1.7" extender'
    );
  }

  if (
    productType ===
    "necklace"
  ) {
    return (
      core?.necklaceLength ||
      core?.chainLength ||
      core?.length ||
      '16" with 2" extender'
    );
  }

  return "";
}

function getPriceForFinish(
  pricing,
  selectedFinishId,
  selectedCore
) {
  const finishPricing =
    pricing?.finishes ||
    {};

  return (
    finishPricing[
    selectedFinishId
    ] ||
    finishPricing[
    slugify(
      selectedCore
        ?.finish
    )
    ] ||
    finishPricing[
    slugify(
      selectedCore
        ?.name
    )
    ] ||
    0
  );
}

export default function KeepsakeConfigurator({
  collection,
}) {
  const { addItem } =
    useCart();

  const [
    addedToCart,
    setAddedToCart,
  ] = useState(false);

  const productType =
    getProductType(
      collection
    );

  const isRing =
    productType ===
    "ring";

  const isBracelet =
    productType ===
    "bracelet";

  const isNecklace =
    productType ===
    "necklace";

  const productName =
    isRing
      ? "Ring"
      : isBracelet
        ? "Bracelet"
        : isNecklace
          ? "Necklace"
          : "Jewelry";

  const cores =
    getCoreList(
      collection,
      productType
    );

  const productPhotos =
    getPhotoList(
      collection,
      productType
    );

  const finishOptions =
    useMemo(
      () =>
        getFinishOptions(
          cores
        ),
      [cores]
    );

  const defaultFinishId =
    collection.defaultFinish ||
    cores?.[0]?.defaultFinish ||
    finishOptions?.[0]?.id ||
    "";

  const [
    selectedFinishId,
    setSelectedFinishId,
  ] = useState(
    defaultFinishId
  );

  const effectivePricing =
    collection.useDatabasePricing
      ? collection.databasePricing ||
      {}
      : collection.pricing ||
      {};

  const memorialMaterialPricing =
    collection.useDatabasePricing
      ? effectivePricing
        .memorialMaterials ||
      {}
      : effectivePricing
        .keepsakeMaterials ||
      {};

  const availableKeepsakeChoices =
    collection.useDatabasePricing
      ? Object.keys(
        memorialMaterialPricing
      )
        .map(
          (id) =>
            memorialMaterialCatalog[
            id
            ]
        )
        .filter(
          Boolean
        )
      : legacyKeepsakeChoices;

  const defaultKeepsakeMaterialId =
    availableKeepsakeChoices[
      0
    ]?.id || "";

  const [
    selectedKeepsakeMaterial,
    setSelectedKeepsakeMaterial,
  ] = useState(
    defaultKeepsakeMaterialId
  );

  const [
    selectedBirthstone,
    setSelectedBirthstone,
  ] = useState(null);

  const [
    selectedRingSize,
    setSelectedRingSize,
  ] = useState("");

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    engravingType,
    setEngravingType,
  ] = useState(
    "none"
  );

  const [
    engravingText,
    setEngravingText,
  ] = useState("");

  const birthstonesEnabled =
    getBirthstonesEnabled(
      collection
    );

  const availableBirthstones =
    Array.isArray(
      collection.birthstones
    )
      ? collection.birthstones.map(
        (birthstone) => ({
          id:
            birthstone.id,

          month:
            birthstone.month ||
            birthstone.monthName ||
            "",

          stone:
            birthstone.stone ||
            birthstone.name ||
            "",

          image:
            birthstone.image ||
            birthstone.imageUrl ||
            null,

          priceAdjustment:
            Number(
              birthstone.priceAdjustment ||
              0
            ),
        })
      )
      : [];

  const selectedFinish =
    finishOptions.find(
      (finish) =>
        finish.id ===
        selectedFinishId
    ) ||
    finishOptions[0];

  const selectedCore =
    getSelectedCore(
      selectedFinish,
      cores
    );

  const ringSizes =
    getRingSizes(
      selectedCore
    );

  const engravingConfig =
    getEngravingConfig(
      collection,
      selectedCore,
      selectedFinish
    );

  const selectedKeepsakeChoice =
    availableKeepsakeChoices.find(
      (choice) =>
        choice.id ===
        selectedKeepsakeMaterial
    ) ||
    availableKeepsakeChoices[
    0
    ] ||
    null;

  const bestMatchingImage =
    useMemo(() => {
      return getBestCollectionPhoto(
        {
          photos:
            productPhotos,

          selectedMaterial:
            selectedCore
              ?.material ||
            "",

          selectedFinish:
            selectedFinish
              ?.name ||
            selectedCore
              ?.finish ||
            "",

          selectedCore,

          selectedMemorialMaterials:
            [
              selectedKeepsakeChoice
                ?.name ||
              selectedKeepsakeMaterial,

              selectedKeepsakeMaterial,
            ],

          fallbackImage:
            collection.heroImage,
        }
      );
    }, [
      productPhotos,
      selectedCore,
      selectedFinish,
      selectedKeepsakeChoice,
      selectedKeepsakeMaterial,
      collection.heroImage,
    ]);

  const displayedImages =
    useMemo(() => {
      const allPhotoPaths =
        productPhotos
          .map((photo) =>
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
        bestMatchingImage,
        collection.heroImage,
        ...allPhotoPaths,
        ...(selectedCore
          ?.images || []),
      ].filter(
        Boolean
      );

      return [
        ...new Set(
          images
        ),
      ];
    }, [
      bestMatchingImage,
      collection.heroImage,
      productPhotos,
      selectedCore,
    ]);

  const currentImage =
    displayedImages[
    selectedImageIndex
    ] ||
    displayedImages[0] ||
    collection.heroImage;

  const pricing =
    effectivePricing;

  const basePrice =
    pricing.profit !==
      undefined ||
      pricing.baseProduct !==
      undefined
      ? (pricing.profit ||
        0) +
      (pricing.baseProduct ||
        0)
      : collection.startingPrice ||
      0;

  const finishPrice =
    getPriceForFinish(
      pricing,
      selectedFinishId,
      selectedCore
    );

  const keepsakePrice =
    Number(
      memorialMaterialPricing[
      selectedKeepsakeMaterial
      ] || 0
    );

  const birthstonePrice =
    selectedBirthstone
      ? Number(
        selectedBirthstone
          .priceAdjustment ??
        pricing.birthstone
          ?.single ??
        pricing.birthstones
          ?.single ??
        0
      )
      : 0;

  const engravingPrice =
    engravingConfig.enabled &&
      engravingType !==
      "none"
      ? engravingType ===
        "customSignature"
        ? engravingConfig
          .customSignaturePrice
        : engravingConfig
          .standardPrice
      : 0;

  /*
   * NORMAL FULL CONFIGURED PRICE
   */
  const totalPrice =
    basePrice +
    finishPrice +
    keepsakePrice +
    birthstonePrice +
    engravingPrice;

  /*
   * SITE-WIDE SALE
   *
   * The discount is applied only after
   * the complete configured jewelry price
   * has been calculated.
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

  const detailData =
    getDetailData(
      selectedCore
    );

  const settingQuantity =
    detailData.settingQuantity ||
    detailData.bezelQuantity ||
    collection.settingQuantity ||
    3;

  const settingShape =
    detailData.settingShape ||
    detailData.bezelShape ||
    collection.settingShape ||
    "Marquise";

  const settingSize =
    detailData.settingSize ||
    detailData.bezelSize ||
    collection.settingSize ||
    (isNecklace
      ? "2 × 3.5 mm"
      : "2 × 4 mm");

  const lengthValue =
    getLengthValue(
      selectedCore,
      productType
    );

  const adjustableLength =
    selectedCore
      ?.adjustableLength ||
    selectedCore
      ?.lengthRange ||
    "";

  const needsRingSize =
    isRing &&
    ringSizes.length >
    0;

  const selectionComplete =
    (availableKeepsakeChoices.length ===
      0 ||
      selectedKeepsakeMaterial) &&
    (!birthstonesEnabled ||
      selectedBirthstone) &&
    (!needsRingSize ||
      selectedRingSize);

  function handleAddToCart() {
    if (
      !selectionComplete
    ) {
      return;
    }

    const itemId =
      typeof crypto !==
        "undefined" &&
        typeof crypto.randomUUID ===
        "function"
        ? crypto.randomUUID()
        : `${collection.id ||
        collection.slug
        }-${Date.now()}`;

    addItem({
      id:
        itemId,

      collectionId:
        collection.id ||
        collection.slug,

      collectionSlug:
        collection.slug,

      collectionName:
        collection.name,

      productType,

      image:
        currentImage ||
        collection.heroImage,

      material:
        selectedCore?.material ||
        selectedFinish
          ?.materialDescription ||
        "925 Sterling Silver",

      core: {
        id:
          selectedCore?.databaseId ||
          selectedCore?.id ||
          selectedFinishId,

        databaseId:
          selectedCore?.databaseId ||
          null,

        name:
          selectedCore?.name ||
          selectedFinish?.name ||
          productName,
      },

      finish:
        selectedFinish?.name ||
        "",

      size:
        isRing
          ? selectedRingSize ||
          selectedCore?.size ||
          selectedCore
            ?.sizeRange ||
          "Adjustable"
          : lengthValue,

      keepsakeMaterial:
        selectedKeepsakeMaterial,

      memorialMaterial:
        selectedKeepsakeMaterial,

      memorialMaterials: [
        selectedKeepsakeMaterial,
      ],

      specialRequest:
        selectedKeepsakeMaterial ===
        "specialRequest",



      birthstone:
        selectedBirthstone
          ? {
            id:
              selectedBirthstone.id,

            month:
              selectedBirthstone.month,

            stone:
              selectedBirthstone.stone,
          }
          : null,

      minerals:
        [],

      glow:
        null,

      engraving:
        engravingConfig.enabled &&
          engravingType !==
          "none"
          ? {
            type:
              engravingType,

            name:
              getEngravingLabel(
                engravingType
              ),

            text:
              engravingText,

            price:
              engravingPrice,
          }
          : null,

      /*
       * Current customer-facing sale price.
       */
      price:
        customerPrice,

      /*
       * Preserve the full configured price.
       * Cart and Stripe use this to calculate
       * the current sale exactly once.
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

    setAddedToCart(
      true
    );

    window.setTimeout(
      () => {
        setAddedToCart(
          false
        );
      },
      2000
    );
  }

  return (
    <main
      style={{
        maxWidth:
          "1400px",

        margin:
          "0 auto",

        padding:
          "45px 20px 80px",
      }}
    >
      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "minmax(0, 1fr) minmax(320px, 390px)",

          gap:
            "34px",

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
                "650px",

              objectFit:
                "cover",

              borderRadius:
                "20px",

              border:
                "1px solid rgba(255,255,255,.12)",

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

          {finishOptions.length >
            0 && (
              <OptionSection
                title="Choose Metal Finish"
              >
                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",

                    gap:
                      "14px",
                  }}
                >
                  {finishOptions.map(
                    (
                      finish
                    ) => {
                      const selected =
                        selectedFinishId ===
                        finish.id;

                      return (
                        <ChoiceButton
                          key={
                            finish.id
                          }
                          selected={
                            selected
                          }
                          onClick={() => {
                            setSelectedFinishId(
                              finish.id
                            );

                            setSelectedImageIndex(
                              0
                            );

                            setSelectedRingSize(
                              ""
                            );

                            const nextCore =
                              getSelectedCore(
                                finish,
                                cores
                              );

                            const nextEngraving =
                              getEngravingConfig(
                                collection,
                                nextCore,
                                finish
                              );

                            if (
                              !nextEngraving
                                .enabled
                            ) {
                              setEngravingType(
                                "none"
                              );

                              setEngravingText(
                                ""
                              );
                            }
                          }}
                          title={
                            finish.name
                          }
                          description={
                            finish.materialDescription
                          }
                        />
                      );
                    }
                  )}
                </div>
              </OptionSection>
            )}

          {needsRingSize && (
            <OptionSection
              title="Choose Ring Size"
            >
              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(90px, 1fr))",

                  gap:
                    "10px",
                }}
              >
                {ringSizes.map(
                  (size) => {
                    const sizeValue =
                      String(
                        size
                      );

                    return (
                      <ChoiceButton
                        key={
                          sizeValue
                        }
                        selected={
                          selectedRingSize ===
                          sizeValue
                        }
                        onClick={() =>
                          setSelectedRingSize(
                            sizeValue
                          )
                        }
                        title={
                          sizeValue
                        }
                        compact
                        centered
                      />
                    );
                  }
                )}
              </div>
            </OptionSection>
          )}

          {availableKeepsakeChoices.length >
            0 && (
              <OptionSection
                title="Choose Keepsake Material"
              >
                <div
                  style={{
                    display:
                      "grid",

                    gap:
                      "14px",
                  }}
                >
                  {availableKeepsakeChoices.map(
                    (
                      choice
                    ) => (
                      <ChoiceButton
                        key={
                          choice.id
                        }
                        selected={
                          selectedKeepsakeMaterial ===
                          choice.id
                        }
                        onClick={() => {
                          setSelectedKeepsakeMaterial(
                            choice.id
                          );

                          setSelectedImageIndex(
                            0
                          );
                        }}
                        title={
                          choice.name
                        }
                        description={
                          choice.description
                        }
                      />
                    )
                  )}
                </div>
              </OptionSection>
            )}

          {birthstonesEnabled && (
            <OptionSection
              title="Choose Birthstone"
              description="Select one birth month for the CZ birthstones."
            >
              {(collection.options
                ?.birthstones
                ?.guideImage ||
                collection
                  .birthstones
                  ?.guideImage) && (
                  <img
                    src={
                      collection.options
                        ?.birthstones
                        ?.guideImage ||
                      collection
                        .birthstones
                        ?.guideImage
                    }
                    alt="Birthstone Color Guide"
                    style={{
                      width:
                        "100%",

                      maxWidth:
                        "700px",

                      borderRadius:
                        "14px",

                      marginBottom:
                        "20px",

                      border:
                        "1px solid rgba(255,255,255,.12)",

                      display:
                        "block",
                    }}
                  />
                )}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",

                  gap:
                    "12px",
                }}
              >
                {availableBirthstones.map(
                  (
                    birthstone
                  ) => (
                    <ChoiceButton
                      key={
                        birthstone.id
                      }
                      selected={
                        selectedBirthstone
                          ?.id ===
                        birthstone.id
                      }
                      onClick={() =>
                        setSelectedBirthstone(
                          birthstone
                        )
                      }
                      title={
                        birthstone.month
                      }
                      description={
                        birthstone.stone
                      }
                      compact
                    />
                  )
                )}
              </div>
            </OptionSection>
          )}

          {engravingConfig.enabled && (
            <OptionSection
              title="Choose Engraving"
              description="Personalize your jewelry with an optional engraving."
            >
              <div
                style={{
                  display:
                    "grid",

                  gap:
                    "12px",
                }}
              >
                <ChoiceButton
                  selected={
                    engravingType ===
                    "none"
                  }
                  onClick={() => {
                    setEngravingType(
                      "none"
                    );

                    setEngravingText(
                      ""
                    );
                  }}
                  title="No Engraving"
                  description="No additional engraving."
                />

                <ChoiceButton
                  selected={
                    engravingType ===
                    "standard"
                  }
                  onClick={() =>
                    setEngravingType(
                      "standard"
                    )
                  }
                  title={`Standard Engraving — +$${engravingConfig.standardPrice.toFixed(
                    2
                  )}`}
                  description="Add personalized text to your jewelry."
                />

                <ChoiceButton
                  selected={
                    engravingType ===
                    "customSignature"
                  }
                  onClick={() =>
                    setEngravingType(
                      "customSignature"
                    )
                  }
                  title={`Custom Signature — +$${engravingConfig.customSignaturePrice.toFixed(
                    2
                  )}`}
                  description="Use a handwritten signature or other approved custom handwriting."
                />
              </div>

              {engravingType !==
                "none" && (
                  <div
                    style={{
                      marginTop:
                        "16px",
                    }}
                  >
                    <label
                      style={{
                        display:
                          "block",

                        fontSize:
                          "14px",

                        fontWeight:
                          700,

                        marginBottom:
                          "8px",
                      }}
                    >
                      {engravingType ===
                        "customSignature"
                        ? "Engraving Notes"
                        : "Engraving Text"}
                    </label>

                    <input
                      type="text"
                      value={
                        engravingText
                      }
                      onChange={(
                        event
                      ) =>
                        setEngravingText(
                          event
                            .target
                            .value
                        )
                      }
                      maxLength={
                        engravingType ===
                          "standard"
                          ? 25
                          : undefined
                      }
                      placeholder={
                        engravingType ===
                          "customSignature"
                          ? "Enter notes for your custom signature"
                          : "Enter engraving text"
                      }
                      style={{
                        width:
                          "100%",

                        boxSizing:
                          "border-box",

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
                      }}
                    />

                    {engravingType ===
                      "standard" && (
                        <p
                          style={{
                            margin:
                              "7px 0 0",

                            fontSize:
                              "12px",

                            opacity:
                              0.65,
                          }}
                        >
                          {
                            engravingText.length
                          }
                          /25 characters
                        </p>
                      )}
                  </div>
                )}
            </OptionSection>
          )}

          <section
            style={{
              marginTop:
                "36px",

              padding:
                "22px",

              borderRadius:
                "16px",

              border:
                "1px solid rgba(255,255,255,.13)",

              background:
                "rgba(255,255,255,.035)",
            }}
          >
            <h2
              style={{
                fontSize:
                  "22px",

                marginBottom:
                  "14px",
              }}
            >
              {productName}{" "}
              Details
            </h2>

            <DetailRow
              label="Metal"
              value={
                selectedCore
                  ?.material ||
                "Solid 925 Sterling Silver"
              }
            />

            {isRing && (
              <DetailRow
                label="Ring Size"
                value={
                  selectedRingSize ||
                  selectedCore
                    ?.size ||
                  selectedCore
                    ?.sizeRange ||
                  (ringSizes.length >
                    0
                    ? "Select a size above"
                    : "Adjustable")
                }
              />
            )}

            {(isBracelet ||
              isNecklace) && (
                <DetailRow
                  label={
                    isBracelet
                      ? "Bracelet Length"
                      : "Necklace Length"
                  }
                  value={
                    lengthValue
                  }
                />
              )}

            {adjustableLength && (
              <DetailRow
                label="Adjustable Length"
                value={
                  adjustableLength
                }
              />
            )}

            <DetailRow
              label="Inlay Settings"
              value={`${settingQuantity} ${settingShape} settings, ${settingSize}`}
            />
          </section>
        </section>

        <aside
          style={{
            position:
              "sticky",

            top:
              "110px",

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
            {productName}
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
              selectedFinish
                ?.name ||
              selectedCore
                ?.finish ||
              "Not selected"
            }
          />

          {availableKeepsakeChoices.length >
            0 && (
              <SummaryRow
                label="Keepsake Material"
                value={
                  selectedKeepsakeChoice
                    ?.name ||
                  "Not selected"
                }
              />
            )}

          {birthstonesEnabled && (
            <SummaryRow
              label="Birthstone"
              value={
                selectedBirthstone
                  ? `${selectedBirthstone.month} — ${selectedBirthstone.stone}`
                  : "Not selected"
              }
            />
          )}

          {isRing && (
            <SummaryRow
              label="Ring Size"
              value={
                selectedRingSize ||
                (ringSizes.length >
                  0
                  ? "Not selected"
                  : selectedCore
                    ?.size ||
                  selectedCore
                    ?.sizeRange ||
                  "Adjustable")
              }
            />
          )}

          {(isBracelet ||
            isNecklace) && (
              <SummaryRow
                label={
                  isBracelet
                    ? "Bracelet Length"
                    : "Necklace Length"
                }
                value={
                  lengthValue
                }
              />
            )}

          {engravingConfig.enabled && (
            <>
              <SummaryRow
                label="Engraving"
                value={
                  engravingType ===
                    "none"
                    ? "No Engraving"
                    : getEngravingLabel(
                      engravingType
                    )
                }
              />

              {engravingType !==
                "none" && (
                  <SummaryRow
                    label="Engraving Price"
                    value={`+$${engravingPrice.toFixed(
                      2
                    )}`}
                  />
                )}

              {engravingType !==
                "none" &&
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
            </>
          )}

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
              !selectionComplete
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
                selectionComplete
                  ? addedToCart
                    ? "#7fb77e"
                    : "#d4af37"
                  : "rgba(212,175,55,.45)",

              color:
                "#111",

              fontSize:
                "17px",

              fontWeight:
                800,

              cursor:
                selectionComplete
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {addedToCart
              ? "Added to Cart ✓"
              : !birthstonesEnabled ||
                selectedBirthstone
                ? needsRingSize &&
                  !selectedRingSize
                  ? "Choose a Ring Size"
                  : "Add to Cart"
                : "Choose a Birthstone"}
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
    </main>
  );
}

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

function DetailRow({
  label,
  value,
}) {
  return (
    <p
      style={{
        margin:
          "7px 0",

        opacity:
          0.82,
      }}
    >
      <strong>
        {label}:
      </strong>{" "}
      {value}
    </p>
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