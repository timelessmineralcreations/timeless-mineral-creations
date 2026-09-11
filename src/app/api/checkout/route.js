import Stripe from "stripe";
import { checkoutRateLimit } from "@/lib/checkout-rate-limit";
import { prisma } from "@/lib/prisma";
import { accentMaterials } from "@/data/accentMaterials";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const STRIPE_ALLOWED_SHIPPING_COUNTRIES =
  "AD AE AF AG AI AL AM AO AQ AR AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VN VU WF WS YE YT ZA ZM ZW".split(" ");

function normalizeSalePercent(value) {
  const percent =
    Number(value);

  if (
    !Number.isFinite(
      percent
    )
  ) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round(
        percent
      )
    )
  );
}

function normalizeKey(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "object") {
    return normalizeKey(
      value.id ??
      value.slug ??
      value.key ??
      value.value ??
      value.name ??
      ""
    );
  }

  return String(value)
    .trim()
    .toLowerCase();
}

function normalizeBezelKey(value) {
  return normalizeKey(value)
    .replace(/\s+/g, "")
    .replace(/×/g, "x")
    .replace(/-?mm$/, "");
}

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function asArray(value) {
  return Array.isArray(value)
    ? value
    : value === null ||
      value === undefined ||
      value === ""
      ? []
      : [value];
}

function uniqueKeys(values) {
  return [
    ...new Set(
      values
        .map(normalizeKey)
        .filter(Boolean)
    ),
  ];
}

function getGlowSelections(item) {
  const selections = [];

  if (
    item.glow &&
    normalizeKey(item.glow) !== "none"
  ) {
    selections.push(item.glow);
  }

  if (
    item.channels &&
    typeof item.channels === "object"
  ) {
    for (const selection of Object.values(
      item.channels
    )) {
      const glow =
        selection?.glow;

      if (
        glow &&
        normalizeKey(glow) !== "none"
      ) {
        selections.push(glow);
      }
    }
  }

  return selections;
}

class CheckoutValidationError extends Error {
  constructor(message) {
    super(message);
    this.name =
      "CheckoutValidationError";
  }
}

function parseJsonObject(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed =
      JSON.parse(value);

    return (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    )
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function getJsonOptionKeys(value) {
  return uniqueKeys(
    parseJsonArray(value).flatMap(
      (entry) => {
        if (
          entry === null ||
          entry === undefined
        ) {
          return [];
        }

        if (
          typeof entry !== "object"
        ) {
          return [entry];
        }

        return [
          entry.id,
          entry.slug,
          entry.key,
          entry.value,
          entry.name,
          entry.label,
          entry.width,
          entry.widthMm,
          entry.size,
        ];
      }
    )
  );
}

function getPricingRuleKeys(
  collection,
  categories
) {
  const categorySet =
    new Set(
      categories.map(
        normalizeCategory
      )
    );

  return uniqueKeys(
    (
      collection.pricingRules ||
      []
    )
      .filter(
        (rule) =>
          rule.active &&
          categorySet.has(
            normalizeCategory(
              rule.category
            )
          )
      )
      .map(
        (rule) =>
          rule.optionKey
      )
  );
}

function assertAllowedKeys(
  label,
  selectedValues,
  allowedValues
) {
  const selectedKeys =
    uniqueKeys(
      selectedValues
    ).filter(
      (key) =>
        key !== "none"
    );

  if (!selectedKeys.length) {
    return;
  }

  const allowedKeys =
    new Set(
      uniqueKeys(
        allowedValues
      )
    );

  for (const key of selectedKeys) {
    if (!allowedKeys.has(key)) {
      throw new CheckoutValidationError(
        `Invalid ${label} selection.`
      );
    }
  }
}

function getChannelSelections(
  item,
  keys
) {
  if (
    !item.channels ||
    typeof item.channels !==
    "object" ||
    Array.isArray(item.channels)
  ) {
    return [];
  }

  const values = [];

  for (const selection of
    Object.values(item.channels)) {
    if (
      !selection ||
      typeof selection !== "object"
    ) {
      continue;
    }

    for (const key of keys) {
      const value =
        selection[key];

      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        values.push(value);
      }
    }
  }

  return values;
}

function validateTrustedSelections(
  item,
  collection
) {
  const configuration =
    parseJsonObject(
      collection.configurationJson
    );

  const options =
    configuration.options &&
      typeof configuration.options ===
      "object" &&
      !Array.isArray(
        configuration.options
      )
      ? configuration.options
      : {};

  const validationCollectionKey =
    normalizeCategory(
      collection.slug ||
      collection.id ||
      collection.name
    );

  const isKeepsakeValidation =
    [
      "evermorering",
      "evermorebracelet",
      "evermorenecklace",
      "keepsakebranch",
      "keepsakebranchring",
      "keepsakebranchnecklace",
      "keepsake",
    ].includes(
      validationCollectionKey
    );

  const isRemiValidation =
    [
      "remi",
      "theremiring",
      "heirloom",
      "heirloomnecklace",
      "legacycross",
      "legacyheart",
    ].includes(
      validationCollectionKey
    ) ||
    normalizeCategory(
      collection.name
    ).includes(
      "remi"
    );

  /*
   * MINERALS
   */
  const allowedMinerals =
    uniqueKeys(
      (
        collection.minerals ||
        []
      ).flatMap(
        (entry) => [
          entry?.mineral?.id,
          entry?.mineral?.slug,
          entry?.mineral?.name,
        ]
      )
    );

  assertAllowedKeys(
    "mineral",
    [
      ...asArray(
        item.minerals
      ),
      item.mineral,
      item.naturalMineral,
      item.naturalMineralId,

      ...getChannelSelections(
        item,
        ["mineral"]
      ),
    ],
    allowedMinerals
  );

  /*
   * GLOW POWDERS
   */
  const allowedGlowPowders =
    uniqueKeys(
      (
        collection.glowPowders ||
        []
      ).flatMap(
        (entry) => [
          entry?.glowPowder?.id,
          entry?.glowPowder?.slug,
          entry?.glowPowder?.name,
        ]
      )
    );

  assertAllowedKeys(
    "glow powder",
    getGlowSelections(item),
    allowedGlowPowders
  );

  /*
   * INLAY STYLE / DESIGN
   */
  const allowedInlayStyles =
    uniqueKeys(
      (
        collection.inlayStyles ||
        []
      ).flatMap(
        (entry) => [
          entry?.inlayStyle?.id,
          entry?.inlayStyle?.slug,
          entry?.inlayStyle?.name,
        ]
      )
    );

  const selectedDesign =
    typeof item.design ===
      "object"
      ? (
        item.design?.id ??
        item.design?.slug ??
        item.design?.name
      )
      : item.design;

  const designIsBirthstoneLabel =
    isKeepsakeValidation &&
    Boolean(item.birthstone);

  if (
    selectedDesign &&
    !designIsBirthstoneLabel
  ) {
    assertAllowedKeys(
      "inlay style",
      [selectedDesign],
      allowedInlayStyles
    );
  }

  /*
   * PRODUCT BASE
   */
  const allowedProductBases =
    uniqueKeys(
      (
        collection.productBases ||
        []
      ).flatMap(
        (entry) => [
          entry?.productBase?.id,
          entry?.productBase?.slug,
          entry?.productBase?.name,
        ]
      )
    );

  if (
    item.productBase ||
    item.productBaseId
  ) {
    assertAllowedKeys(
      "product base",
      [
        item.productBase,
        item.productBaseId,
      ],
      allowedProductBases
    );
  }

  /*
   * RING CORE
   *
   * Current customer ring cores are
   * created from Product Base
   * assignments. Older collections can
   * still use legacy RingCore records,
   * so both trusted sources are allowed.
   */
  const legacyCores =
    (
      collection.ringCores ||
      []
    )
      .map(
        (entry) =>
          entry?.ringCore
      )
      .filter(
        (core) =>
          core &&
          core.active !== false
      );

  const productBaseCores =
    (
      collection.productBases ||
      []
    )
      .map(
        (assignment) => {
          const productBase =
            assignment?.productBase;

          if (
            !productBase ||
            productBase.active ===
            false
          ) {
            return null;
          }

          const variants =
            productBase.variants ||
            [];

          const widths =
            variants
              .filter(
                (variant) =>
                  variant &&
                  variant.active !==
                  false &&
                  variant.widthMm !=
                  null
              )
              .map(
                (variant) => ({
                  width:
                    Number(
                      variant.widthMm
                    ),

                  channel:
                    variant
                      .channelWidthMm !=
                      null
                      ? Number(
                        variant
                          .channelWidthMm
                      )
                      : null,

                  sizes:
                    parseJsonArray(
                      variant.sizesJson
                    )
                      .map(Number)
                      .filter(
                        Number.isFinite
                      ),

                  variantId:
                    variant.id,

                  variantKey:
                    variant.variantKey,
                })
              );

          const flexibleSizes = [
            ...new Set(
              variants
                .filter(
                  (variant) =>
                    variant &&
                    variant.active !==
                    false &&
                    variant.widthMm ==
                    null
                )
                .flatMap(
                  (variant) =>
                    parseJsonArray(
                      variant.sizesJson
                    )
                      .map(Number)
                      .filter(
                        Number.isFinite
                      )
                )
            ),
          ];

          return {
            id:
              productBase.slug,

            databaseId:
              productBase.id,

            slug:
              productBase.slug,

            name:
              assignment.displayName ||
              productBase.name,

            material:
              productBase.material ||
              "",

            finish:
              productBase.finish ||
              "",

            color:
              productBase.color ||
              null,

            style:
              productBase.style ||
              null,

            edge:
              productBase.edge ||
              null,

            comfortFit:
              productBase
                .comfortFit ??
              null,

            allowEngraving:
              productBase
                .allowEngraving ===
              true,

            widths,

            sizes:
              flexibleSizes,
          };
        }
      )
      .filter(Boolean);

  const activeCores = [
    ...productBaseCores,
    ...legacyCores,
  ];

  let trustedCore =
    null;

  if (item.core) {
    const selectedCoreKey =
      normalizeKey(
        isRemiValidation
          ? (
            item.finish ||
            item.core?.finish ||
            item.core
          )
          : item.core
      );

    trustedCore =
      activeCores.find(
        (core) =>
          uniqueKeys([
            core.id,
            core.databaseId,
            core.slug,
            core.name,
            isRemiValidation
              ? core.finish
              : null,
          ]).includes(
            selectedCoreKey
          )
      );

    if (!trustedCore) {
      throw new CheckoutValidationError(
        "Invalid ring core selection."
      );
    }

    if (isRemiValidation) {
      item.core = {
        ...(typeof item.core === "object"
          ? item.core
          : {}),

        id:
          trustedCore.slug ||
          trustedCore.id,

        databaseId:
          trustedCore.databaseId ||
          trustedCore.id,

        slug:
          trustedCore.slug ||
          trustedCore.id,

        name:
          trustedCore.name,

        material:
          trustedCore.material,

        finish:
          trustedCore.finish,

        color:
          trustedCore.color,
      };

      if (trustedCore.material) {
        item.material =
          trustedCore.material;
      }

      if (
        trustedCore.finish ||
        trustedCore.color
      ) {
        item.finish =
          trustedCore.finish ||
          trustedCore.color;
      }
    }

    if (
      item.material &&
      trustedCore.material &&
      normalizeKey(
        item.material
      ) !==
      normalizeKey(
        trustedCore.material
      )
    ) {
      throw new CheckoutValidationError(
        "Selected material does not match the selected ring core."
      );
    }

    if (
      typeof item.core ===
      "object" &&
      item.core.material &&
      trustedCore.material &&
      normalizeKey(
        item.core.material
      ) !==
      normalizeKey(
        trustedCore.material
      )
    ) {
      throw new CheckoutValidationError(
        "Ring core material mismatch."
      );
    }

    if (
      typeof item.core ===
      "object" &&
      item.core.finish &&
      trustedCore.finish &&
      normalizeKey(
        item.core.finish
      ) !==
      normalizeKey(
        trustedCore.finish
      )
    ) {
      throw new CheckoutValidationError(
        "Ring core finish mismatch."
      );
    }

    if (
      typeof item.core ===
      "object" &&
      item.core.color &&
      trustedCore.color &&
      normalizeKey(
        item.core.color
      ) !==
      normalizeKey(
        trustedCore.color
      )
    ) {
      throw new CheckoutValidationError(
        "Ring core color mismatch."
      );
    }
  }

  /*
   * MATERIAL
   */
  const allowedMaterials =
    uniqueKeys([
      ...activeCores.map(
        (core) =>
          core.material
      ),

      ...(
        collection.productBases ||
        []
      ).map(
        (entry) =>
          entry?.productBase
            ?.material
      ),

      ...getPricingRuleKeys(
        collection,
        [
          "metal",
          "material",
          "materials",
        ]
      ),
    ]);

  if (
    item.material &&
    allowedMaterials.length
  ) {
    assertAllowedKeys(
      "material",
      [item.material],
      allowedMaterials
    );
  }

  /*
   * WIDTH
   */
  const selectedWidth =
    typeof item.width ===
      "object"
      ? (
        item.width?.width ??
        item.width?.widthMm ??
        item.width?.value ??
        item.width?.id ??
        item.width?.slug
      )
      : item.width;

  if (
    selectedWidth !== null &&
    selectedWidth !==
    undefined &&
    selectedWidth !== ""
  ) {
    const coresForWidth =
      trustedCore
        ? [trustedCore]
        : activeCores;

    const allowedWidths =
      uniqueKeys([
        ...coresForWidth.flatMap(
          (core) => [
            ...getJsonOptionKeys(
              core.widthsJson
            ),

            ...getJsonOptionKeys(
              core.widths
            ),
          ]
        ),

        ...getPricingRuleKeys(
          collection,
          [
            "width",
            "widths",
          ]
        ),
      ]);

    if (
      allowedWidths.length
    ) {
      assertAllowedKeys(
        "width",
        [selectedWidth],
        allowedWidths
      );
    }
  }

  /*
   * RING SIZE
   */
  const selectedSize =
    item.size ??
    item.ringSize;

  if (
    selectedSize !== null &&
    selectedSize !==
    undefined &&
    selectedSize !== ""
  ) {
    const coresForSize =
      trustedCore
        ? [trustedCore]
        : activeCores;

    const allowedSizes =
      uniqueKeys(
        coresForSize.flatMap(
          (core) => [
            ...getJsonOptionKeys(
              core.sizesJson
            ),

            ...getJsonOptionKeys(
              core.sizes
            ),

            ...asArray(
              core.widths
            ).flatMap(
              (width) =>
                asArray(
                  width?.sizes
                )
            ),
          ]
        )
      );

    if (
      allowedSizes.length
    ) {
      assertAllowedKeys(
        "ring size",
        [selectedSize],
        allowedSizes
      );
    }
  }

  /*
   * MEMORIAL MATERIALS
   */
  const allowedMemorialMaterials =
    uniqueKeys([
      ...asArray(
        options
          ?.memorialMaterials
          ?.allowed
      ),

      ...getPricingRuleKeys(
        collection,
        [
          "memorialMaterials",
          "memorialMaterial",
        ]
      ),
    ]);

  const submittedMemorialMaterials =
    isKeepsakeValidation
      ? []
      : [
        ...asArray(
          item.memorialMaterials
        ),

        ...getChannelSelections(
          item,
          ["memorial"]
        ),
      ];

  if (
    submittedMemorialMaterials
      .length
  ) {
    assertAllowedKeys(
      "memorial material",
      submittedMemorialMaterials,
      allowedMemorialMaterials
    );
  }

  /*
   * KEEPSAKE MATERIAL
   */
  const selectedKeepsakeMaterial =
    normalizeKey(
      item.keepsakeMaterial ||
      item.keepsakeMaterialId
    );

  const selectedMineralKey =
    normalizeKey(
      item.mineral
    );

  const validMineralBase =
    selectedKeepsakeMaterial ===
    "mineralbase" &&
    Boolean(selectedMineralKey) &&
    (
      collection.minerals ||
      []
    ).some(
      (assignment) => {
        const mineral =
          assignment?.mineral;

        return (
          mineral &&
          uniqueKeys([
            mineral.id,
            mineral.slug,
            mineral.name,
          ]).includes(
            selectedMineralKey
          )
        );
      }
    );

  const allowedKeepsakeMaterials =
    uniqueKeys([
      ...asArray(
        options
          ?.keepsakeMaterials
          ?.allowed
      ),

     ...getPricingRuleKeys(
  collection,
  [
    "keepsakeMaterials",
    "keepsakeMaterial",
    "memorialMaterials",
    "memorialMaterial",
  ]
),

      ...(validMineralBase
        ? ["mineralBase"]
        : []),
    ]);

  if (
    item.keepsakeMaterial ||
    item.keepsakeMaterialId
  ) {
    assertAllowedKeys(
      "keepsake material",
      [
        item.keepsakeMaterial,
        item.keepsakeMaterialId,
      ],
      allowedKeepsakeMaterials
    );
  }

  if (isKeepsakeValidation) {
    const canonicalKeepsakeMaterial =
      item.keepsakeMaterial ||
      item.keepsakeMaterialId ||
      null;

    item.memorialMaterials =
      canonicalKeepsakeMaterial
        ? [canonicalKeepsakeMaterial]
        : [];
  }

  /*
 * BEZEL SIZE
 */
  if (
    item.bezelSize ||
    item.bezelSizeId
  ) {
    const selectedBezelKeys =
      uniqueKeys([
        item.bezelSize,
        item.bezelSizeId,
      ]).map(
        normalizeBezelKey
      );

    const allowedBezelKeys =
      uniqueKeys([
        ...asArray(
          options
            ?.bezelSize
            ?.allowed
        ),

        ...getPricingRuleKeys(
          collection,
          [
            "bezel",
            "bezelSize",
            "bezelSizes",
          ]
        ),
      ]).map(
        normalizeBezelKey
      );

    assertAllowedKeys(
      "bezel size",
      selectedBezelKeys,
      allowedBezelKeys
    );
  }

  /*
   * CHAIN
   */
  if (
    item.chain ||
    item.chainId
  ) {
    assertAllowedKeys(
      "chain",
      [
        item.chainId ||
        item.chain,
      ],
      [
        ...asArray(
          options
            ?.chain
            ?.allowed
        ),

        ...getPricingRuleKeys(
          collection,
          [
            "chain",
            "chains",
            "chainOption",
            "chainOptions",
          ]
        ),
      ]
    );
  }

  /*
   * HAIR PLACEMENT
   */
  const submittedHairPlacements =
  uniqueKeys([
    item.hairPlacement,
    item.hairPlacementId,
  ]).filter(
    (key) =>
      ![
        "none",
        "nohair",
      ].includes(
        normalizeCategory(key)
      )
  );

if (
  submittedHairPlacements.length
) {
  assertAllowedKeys(
    "hair placement",
    submittedHairPlacements,
    [
      ...asArray(
        options
          ?.hair
          ?.allowedStyles
      ),

      ...(
        collection.configuratorOptions ||
        []
      )
        .filter(
          (option) =>
            option.category ===
            "hair-placement"
        )
        .flatMap(
          (option) => [
            option.slug,
            option.name,
          ]
        ),

      ...getPricingRuleKeys(
        collection,
        [
          "hairPlacement",
          "hairPlacements",
        ]
      ),
    ]
  );
}

  /*
   * DECORATIVE ACCENTS
   */
  const submittedAccents =
    [
      ...asArray(
        item.accentMaterials
      ),

      item.decorativeAccent,
      item.decorativeAccentId,

      ...getChannelSelections(
        item,
        [
          "accent",
          "accentMaterial",
        ]
      ),
    ];

  const configuredAccents =
    uniqueKeys([
      ...asArray(
        options
          ?.decorativeAccents
          ?.allowed
      ),

      ...(
        collection.configuratorOptions ||
        []
      )
        .filter(
          (option) =>
            option.category ===
            "decorative-accent"
        )
        .flatMap(
          (option) => [
            option.slug,
            option.name,
          ]
        ),

      ...getPricingRuleKeys(
        collection,
        [
          "accentMaterials",
          "decorativeAccent",
          "decorativeAccents",
        ]
      ),
    ]);

  const allowedAccents =
    configuredAccents.length
      ? configuredAccents
      : uniqueKeys(
        accentMaterials.flatMap(
          (accent) => [
            accent?.id,
            accent?.slug,
            accent?.name,
          ]
        )
      );

  if (
    uniqueKeys(
      submittedAccents
    ).filter(
      (key) =>
        key !== "none"
    ).length
  ) {
    assertAllowedKeys(
      "decorative accent",
      submittedAccents,
      allowedAccents
    );
  }

  /*
   * ACCENT STYLE
   */
  if (
    item.accentStyle ||
    item.accentStyleId
  ) {
    assertAllowedKeys(
      "accent style",
      [
        item.accentStyle,
        item.accentStyleId,
      ],
      [
        ...asArray(
          options
            ?.decorativeAccents
            ?.allowedStyles
        ),

        ...(
          collection.configuratorOptions ||
          []
        )
          .filter(
            (option) =>
              option.category ===
              "accent-style"
          )
          .flatMap(
            (option) => [
              option.slug,
              option.name,
            ]
          ),

        ...getPricingRuleKeys(
          collection,
          [
            "accentStyle",
            "accentStyles",
          ]
        ),
      ]
    );
  }

  /*
   * ENGRAVING
   */
  if (
    item.engravingEnabled
  ) {
    const engravingType =
      item.engravingType ===
        "customSignature"
        ? "customSignature"
        : "standard";

    const allowedEngraving =
      uniqueKeys([
        ...asArray(
          options
            ?.engraving
            ?.allowed
        ),

        ...getPricingRuleKeys(
          collection,
          ["engraving"]
        ),
      ]);

    if (
      allowedEngraving.length
    ) {
      assertAllowedKeys(
        "engraving",
        [engravingType],
        allowedEngraving
      );
    }
  }

  /*
   * BIRTHSTONE
   */
  if (item.birthstone) {
    const allowedBirthstoneValues =
      uniqueKeys([
        ...(
          collection.birthstones ||
          []
        ).flatMap(
          (entry) => [
            entry
              ?.birthstone
              ?.id,

            entry
              ?.birthstone
              ?.slug,

            entry
              ?.birthstone
              ?.name,

            entry
              ?.birthstone
              ?.monthName,

            entry
              ?.birthstone
              ?.monthNumber,
          ]
        ),

        ...(
          collection
            .birthstoneOptions ||
          []
        ).flatMap(
          (entry) => [
            entry
              ?.birthstoneMonth
              ?.id,

            entry
              ?.birthstoneMonth
              ?.name,

            entry
              ?.birthstoneMonth
              ?.monthNumber,

            entry
              ?.mineral
              ?.id,

            entry
              ?.mineral
              ?.slug,

            entry
              ?.mineral
              ?.name,
          ]
        ),
      ]);

    const submittedBirthstoneValues =
      typeof item.birthstone ===
        "object"
        ? [
          item.birthstone.id,
          item.birthstone.slug,
          item.birthstone.name,
          item.birthstone.month,
          item.birthstone.stone,
        ]
        : [
          item.birthstone,
        ];

    for (
      const value of
      submittedBirthstoneValues
    ) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        assertAllowedKeys(
          "birthstone",
          [value],
          allowedBirthstoneValues
        );
      }
    }
  }
}

function getSelectedKeysByCategory(
  item
) {
  const core =
    item.core &&
      typeof item.core === "object"
      ? item.core
      : {};

  const width =
    typeof item.width ===
      "object"
      ? item.width?.width
      : item.width;

  const design =
    typeof item.design ===
      "object"
      ? item.design?.id
      : item.design;

  const birthstone =
    item.birthstone &&
      typeof item.birthstone ===
      "object"
      ? [
        item.birthstone.id,
        item.birthstone.slug,
        item.birthstone.stone,
        item.birthstone.month,
      ]
      : [
        item.birthstone,
      ];

  const selected = {
    metal:
      uniqueKeys([
        item.material,
        core.material,
      ]),

    width:
      uniqueKeys([
        width,
      ]),

    inlaystyles:
      uniqueKeys([
        design,
      ]),

    memorialmaterials: uniqueKeys([
      ...asArray(item.memorialMaterials),

      item.specialRequest
        ? "specialRequest"
        : null,

      ...getChannelSelections(
        item,
        ["memorial"]
      ),
    ]),

    keepsakematerials: uniqueKeys([
      item.keepsakeMaterial,
      item.keepsakeMaterialId,
    ]),

    minerals: uniqueKeys([
      ...asArray(item.minerals),
      item.mineral,
      item.naturalMineral,
      item.naturalMineralId,

      ...getChannelSelections(
        item,
        ["mineral"]
      ),
    ]),

    accentmaterials: uniqueKeys([
      ...asArray(item.accentMaterials),

      ...getChannelSelections(
        item,
        [
          "accent",
          "accentMaterial",
        ]
      ),
    ]),

    finishes:
      uniqueKeys([
        item.finish,
        core.finish,
        core.color,
      ]),

    engraving:
      item.engravingEnabled
        ? uniqueKeys([
          item.engravingType ===
            "customSignature"
            ? "customSignature"
            : "standard",
        ])
        : [],

    bezelsizes:
      uniqueKeys([
        normalizeBezelKey(
          item.bezelSize
        ),
        normalizeBezelKey(
          item.bezelSizeId
        ),
      ]),

    chain:
  uniqueKeys([
    item.chain,
    item.chainId,
  ]),

chains:
  uniqueKeys([
    item.chain,
    item.chainId,
  ]),

chainoption:
  uniqueKeys([
    item.chain,
    item.chainId,
  ]),

chainoptions:
  uniqueKeys([
    item.chain,
    item.chainId,
  ]),

    hairplacement:
      uniqueKeys([
        item.hairPlacement,
        item.hairPlacementId,
      ]),

    hairplacements:
      uniqueKeys([
        item.hairPlacement,
        item.hairPlacementId,
      ]),

    decorativeaccent:
      uniqueKeys([
        item.decorativeAccent,
        item.decorativeAccentId,
      ]),

    decorativeaccents:
      uniqueKeys([
        item.decorativeAccent,
        item.decorativeAccentId,
      ]),

    accentstyle:
      uniqueKeys([
        item.accentStyle,
        item.accentStyleId,
      ]),

    accentstyles:
      uniqueKeys([
        item.accentStyle,
        item.accentStyleId,
      ]),

    productbases:
      uniqueKeys([
        item.productBase,
        item.productBaseId,
      ]),

    birthstones:
      uniqueKeys(
        birthstone
      ),
  };

  return selected;
}

function generalRuleCount(
  item,
  optionKey,
  selectedKeys,
  glowSelections
) {
  const key =
    normalizeCategory(
      optionKey
    );

  if (!key) {
    return 0;
  }

  if (
    key === "glow"
  ) {
    return glowSelections.length;
  }

  if (
    key ===
    "specialrequest"
  ) {
    return item.specialRequest
      ? 1
      : 0;
  }

  if (
    key === "engraving"
  ) {
    return item.engravingEnabled
      ? 1
      : 0;
  }

  if (
    key === "birthstone"
  ) {
    return item.birthstone
      ? 1
      : 0;
  }

  if (
    key ===
    "hairplacement" &&
    selectedKeys
      .hairplacement
      .length
  ) {
    return 1;
  }

  if (
    key ===
    "decorativeaccent" &&
    selectedKeys
      .decorativeaccent
      .some(
        (value) =>
          value !== "none"
      )
  ) {
    return 1;
  }

  if (
    key ===
    "accentstyle" &&
    selectedKeys
      .accentstyle
      .length
  ) {
    return 1;
  }

  if (
    (
      key === "bezel" ||
      key === "bezelsize"
    ) &&
    selectedKeys
      .bezelsizes
      .length
  ) {
    return 1;
  }

  if (
    (
      key === "chain" ||
      key ===
      "chainoption"
    ) &&
    selectedKeys
      .chains
      .length
  ) {
    return 1;
  }

  const allSelectedKeys =
    Object.values(
      selectedKeys
    ).flat();

  return allSelectedKeys
    .includes(
      normalizeKey(
        optionKey
      )
    )
    ? 1
    : 0;
}

function hasMatchingRule(
  collection,
  categories,
  optionValue
) {
  const categorySet =
    new Set(
      categories.map(
        normalizeCategory
      )
    );

  const key =
    normalizeKey(
      optionValue
    );

  if (!key) {
    return false;
  }

  return (
    collection.pricingRules ||
    []
  ).some(
    (rule) =>
      rule.active &&
      categorySet.has(
        normalizeCategory(
          rule.category
        )
      ) &&
      normalizeKey(
        rule.optionKey
      ) ===
      key
  );
}

function hasGeneralRule(
  collection,
  optionKey
) {
  const key =
    normalizeKey(
      optionKey
    );

  return (
    collection.pricingRules ||
    []
  ).some(
    (rule) =>
      rule.active &&
      normalizeCategory(
        rule.category
      ) === "general" &&
      normalizeKey(
        rule.optionKey
      ) === key
  );
}

function findCatalogAdjustmentCents(
  entries,
  selectedValue,
  nestedKey
) {
  const selectedKey =
    normalizeKey(
      selectedValue
    );

  if (!selectedKey) {
    return 0;
  }

  for (
    const entry of
    entries || []
  ) {
    const value =
      nestedKey
        ? entry?.[nestedKey]
        : entry;

    if (
      !value ||
      value.active === false
    ) {
      continue;
    }

    const candidateKeys =
      uniqueKeys([
        value.id,
        value.slug,
        value.name,
      ]);

    if (
      candidateKeys.includes(
        selectedKey
      )
    ) {
      return Math.round(
        Number(
          value
            .priceAdjustmentCents ||
          0
        )
      );
    }
  }

  return 0;
}

function calculateTrustedPriceCents(
  item,
  collection
) {
  const pricingProfile =
    collection.pricingProfile;

  if (
    !pricingProfile?.active
  ) {
    throw new Error(
      `Pricing is not configured for ${collection.name}.`
    );
  }

  /*
   * BASE PRICE
   *
   * Newer collections use:
   * baseProductCents + profitCents
   *
   * Remi and some legacy collections can use:
   * general -> basePrice
   *
   * Prefer the Pricing Profile when it has
   * an actual base value. Otherwise use the
   * trusted general/basePrice rule.
   */
  const profileBaseCents =
    Number(
      pricingProfile
        .baseProductCents ||
      0
    ) +
    Number(
      pricingProfile
        .profitCents ||
      0
    );

  const generalBasePriceRule =
    (
      collection.pricingRules ||
      []
    ).find(
      (rule) =>
        rule.active &&
        normalizeCategory(
          rule.category
        ) === "general" &&
        normalizeKey(
          rule.optionKey
        ) === "baseprice"
    );

  let totalCents =
    profileBaseCents > 0
      ? profileBaseCents
      : Number(
        generalBasePriceRule
          ?.amountCents ||
        0
      );

  const selectedKeys =
    getSelectedKeysByCategory(
      item
    );

  const glowSelections =
    getGlowSelections(
      item
    );

  /*
   * REMI USES THE CONFIGURATOR OPTION
   * CATALOG FOR THESE THREE OPTION GROUPS.
   *
   * The customer-side Remi builder reads
   * hair placement, decorative accent, and
   * accent style prices from ConfiguratorOption.
   *
   * Checkout must use the same trusted
   * server-side source rather than mixing
   * those values with legacy pricing rules.
   */
  const trustedCollectionKey =
    normalizeCategory(
      collection.slug ||
      collection.id ||
      collection.name
    );

  const isRemiCollection =
  [
    "remi",
    "theremiring",
    "heirloom",
    "heirloomnecklace",
    "legacycross",
    "legacyheart",
  ].includes(
    trustedCollectionKey
  ) ||
  normalizeCategory(
    collection.name
  ).includes(
    "remi"
  );

  const remiCatalogCategories =
    new Set([
      "hair",
      "hairplacement",
      "hairplacements",
      "decorativeaccent",
      "decorativeaccents",
      "accentstyle",
      "accentstyles",
    ]);

  const remiGeneralOptionKeys =
    new Set([
      "hairplacement",
      "decorativeaccent",
      "accentstyle",
    ]);

  /*
   * DATABASE PRICING RULES
   */
  for (
    const rule of
    collection.pricingRules ||
    []
  ) {
    if (!rule.active) {
      continue;
    }

    const category =
      normalizeCategory(
        rule.category
      );

    const optionKey =
      (
        category === "bezel" ||
        category === "bezelsize" ||
        category === "bezelsizes"
      )
        ? normalizeBezelKey(
          rule.optionKey
        )
        : normalizeKey(
          rule.optionKey
        );

    /*
     * basePrice was already used above.
     *
     * Never add it a second time.
     */
    if (
      category === "general" &&
      optionKey === "baseprice"
    ) {
      continue;
    }

    /*
     * Remi's hair placement, decorative
     * accent, and accent style are priced
     * from the trusted ConfiguratorOption
     * catalog below.
     *
     * Skip any overlapping legacy pricing
     * rules so the same option can never
     * be charged twice.
     */
    if (
      isRemiCollection &&
      (
        remiCatalogCategories.has(
          category
        ) ||
        (
          category === "general" &&
          remiGeneralOptionKeys.has(
            normalizeCategory(
              rule.optionKey
            )
          )
        )
      )
    ) {
      continue;
    }
    /*
     * SPECIAL REQUEST RULE DEDUPLICATION
     *
     * Prefer the current Admin
     * Memorial Materials -> Special Request
     * rule over older legacy Special Request
     * pricing rules.
     */
    if (
      item.specialRequest &&
      hasMatchingRule(
        collection,
        [
          "memorialMaterials",
          "memorialMaterial",
        ],
        "specialRequest"
      ) &&
      (
  (
    category === "general" &&
    optionKey === "specialrequest"
  ) ||
  category === "specialrequest" ||
  category === "specialrequests" ||
  (
    (
      category === "keepsakematerials" ||
      category === "keepsakematerial"
    ) &&
    optionKey === "specialrequest"
  )
)
    ) {
      continue;
    }
    let count = 0;

    /*
     * GENERAL RULES
     */
    if (
      category === "general"
    ) {
      count =
        generalRuleCount(
          item,
          rule.optionKey,
          selectedKeys,
          glowSelections
        );
    }

    /*
     * GLOW
     */
    else if (
      category === "glow" ||
      category ===
      "glowpowders"
    ) {
      if (
        optionKey === "glow" ||
        optionKey ===
        "default" ||
        optionKey ===
        "standard"
      ) {
        count =
          glowSelections.length;
      } else {
        count =
          glowSelections.filter(
            (glow) =>
              normalizeKey(
                glow
              ) ===
              optionKey
          ).length;
      }
    }

    /*
     * SPECIAL REQUEST
     */
    else if (
      category ===
      "specialrequest" ||
      category ===
      "specialrequests"
    ) {
      count =
        item.specialRequest
          ? 1
          : 0;
    }

    /*
     * REMI HAIR
     *
     * Remi stores the actual placement
     * separately while the price rule is
     * normally:
     *
     * hair -> addHair
     */
    else if (
      category === "hair"
    ) {
      const selectedHair =
        normalizeKey(
          item.hairPlacement ||
          item.hairPlacementId
        );

      const hasHair =
        Boolean(
          selectedHair
        ) &&
        selectedHair !==
        "none" &&
        selectedHair !==
        "no-hair";

      if (
        optionKey ===
        "addhair" ||
        optionKey ===
        "hair" ||
        optionKey ===
        "standard"
      ) {
        count =
          hasHair
            ? 1
            : 0;
      } else {
        count =
          selectedHair ===
            optionKey
            ? 1
            : 0;
      }
    }

    /*
     * NORMAL CATEGORY RULES
     */
    else {
      const selected =
        selectedKeys[
        category
        ] || [];

      count =
        selected.filter(
          (value) =>
            value ===
            optionKey
        ).length;
    }

    if (count > 0) {
      totalCents +=
        Number(
          rule.amountCents ||
          0
        ) *
        count;
    }
  }

  /*
   * REMI CONFIGURATOR OPTION PRICING
   *
   * These values come directly from the
   * trusted ConfiguratorOption table that
   * also feeds RemiConfigurator.
   *
   * Never trust the browser's option price.
   */
  if (isRemiCollection) {
    const configuratorOptions =
      collection.configuratorOptions ||
      [];

    const addConfiguratorOptionPrice =
      (
        category,
        selectedValue,
        label
      ) => {
        const selectedKey =
          normalizeKey(
            selectedValue
          );

        if (
          !selectedKey ||
          selectedKey === "none" ||
          selectedKey === "no-hair"
        ) {
          return;
        }

        const trustedOption =
          configuratorOptions.find(
            (option) =>
              option.active !== false &&
              option.category ===
              category &&
              uniqueKeys([
                option.slug,
                option.name,
              ]).includes(
                selectedKey
              )
          );

        if (!trustedOption) {
          throw new CheckoutValidationError(
            `Invalid ${label} selection.`
          );
        }

        totalCents +=
          Math.round(
            Number(
              trustedOption
                .priceAdjustmentCents ||
              0
            )
          );
      };

    addConfiguratorOptionPrice(
      "hair-placement",
      item.hairPlacement ||
      item.hairPlacementId,
      "hair placement"
    );

    addConfiguratorOptionPrice(
      "decorative-accent",
      item.decorativeAccent ||
      item.decorativeAccentId,
      "decorative accent"
    );

    addConfiguratorOptionPrice(
      "accent-style",
      item.accentStyle ||
      item.accentStyleId,
      "accent style"
    );
  }

  /*
   * TRUSTED MINERAL CATALOG FALLBACK
   *
   * This protects collections where the
   * mineral has a trusted master-catalog
   * price but no collection pricing rule.
   */
  const trustedMineralSelections =
    uniqueKeys([
      ...asArray(
        item.minerals
      ),

      item.mineral,
      item.naturalMineral,
      item.naturalMineralId,

      ...getChannelSelections(
        item,
        ["mineral"]
      ),
    ]);

  for (
    const mineral of
    trustedMineralSelections
  ) {
    if (
      hasMatchingRule(
        collection,
        ["minerals"],
        mineral
      )
    ) {
      continue;
    }

    totalCents +=
      findCatalogAdjustmentCents(
        collection.minerals,
        mineral,
        "mineral"
      );
  }

  /*
   * TRUSTED ACCENT CATALOG FALLBACK
   *
   * Include:
   * - normal accentMaterials
   * - Remi decorativeAccent
   * - nested channel accents
   *
   * uniqueKeys prevents a mirrored value
   * from being charged twice.
   */
  const trustedAccentSelections =
    uniqueKeys([
      ...asArray(
        item.accentMaterials
      ),

      item.decorativeAccent,
      item.decorativeAccentId,

      ...getChannelSelections(
        item,
        [
          "accent",
          "accentMaterial",
        ]
      ),
    ]).filter(
      (value) =>
        value !== "none"
    );

  for (
    const accent of
    trustedAccentSelections
  ) {
    /*
     * If a trusted collection pricing rule
     * already handled this accent, do not
     * charge it again from the catalog.
     */
    if (
      hasMatchingRule(
        collection,
        [
          "accentMaterials",
          "decorativeAccent",
          "decorativeAccents",
        ],
        accent
      )
    ) {
      continue;
    }

    const accentKey =
      normalizeKey(
        accent
      );

    const trustedAccent =
      accentMaterials.find(
        (entry) =>
          uniqueKeys([
            entry?.id,
            entry?.slug,
            entry?.name,
          ]).includes(
            accentKey
          )
      );

    totalCents +=
      Math.round(
        Number(
          trustedAccent
            ?.price ||
          0
        ) * 100
      );
  }

  /*
   * TRUSTED GLOW CATALOG FALLBACK
   */
  const generalGlowRule =
    hasGeneralRule(
      collection,
      "glow"
    );

  const genericGlowRule =
    (
      collection.pricingRules ||
      []
    ).some(
      (rule) => {
        const category =
          normalizeCategory(
            rule.category
          );

        const option =
          normalizeKey(
            rule.optionKey
          );

        return (
          rule.active &&
          (
            category ===
            "glow" ||
            category ===
            "glowpowders"
          ) &&
          (
            option ===
            "glow" ||
            option ===
            "default" ||
            option ===
            "standard"
          )
        );
      }
    );

  if (
    !generalGlowRule &&
    !genericGlowRule
  ) {
    for (
      const glow of
      glowSelections
    ) {
      if (
        hasMatchingRule(
          collection,
          [
            "glow",
            "glowPowders",
          ],
          glow
        )
      ) {
        continue;
      }

      totalCents +=
        findCatalogAdjustmentCents(
          collection
            .glowPowders,
          glow,
          "glowPowder"
        );
    }
  }

  /*
   * ENGRAVING FALLBACK
   *
   * Some existing collections, including
   * Remi, allow engraving but do not yet
   * have collection-level engraving
   * pricing rules.
   *
   * Do NOT apply the fallback if a trusted
   * pricing rule has already priced it.
   */
  const hasTrustedEngravingRule =
    (
      collection.pricingRules ||
      []
    ).some(
      (rule) => {
        if (!rule.active) {
          return false;
        }

        const category =
          normalizeCategory(
            rule.category
          );

        const optionKey =
          normalizeKey(
            rule.optionKey
          );

        return (
          category ===
          "engraving" ||
          (
            category ===
            "general" &&
            optionKey ===
            "engraving"
          )
        );
      }
    );

  if (
    item.engravingEnabled &&
    !hasTrustedEngravingRule
  ) {
    totalCents +=
      item.engravingType ===
        "customSignature"
        ? 5000
        : 2000;
  }

  /*
   * SPECIAL REQUEST FALLBACK
   *
   * Current legacy fallback is $30 only
   * when no trusted database rule has
   * already supplied the price.
   */
  if (
    item.specialRequest &&
    !hasGeneralRule(
      collection,
      "specialRequest"
    ) &&
    !hasMatchingRule(
      collection,
      ["memorialMaterials"],
      "specialRequest"
    ) &&
    !(
      collection.pricingRules ||
      []
    ).some(
      (rule) => {
        if (!rule.active) {
          return false;
        }

        const category =
          normalizeCategory(
            rule.category
          );

        const optionKey =
          normalizeKey(
            rule.optionKey
          );

        return (
          category ===
          "specialrequest" ||
          category ===
          "specialrequests" ||
          (
            (
              category ===
              "memorialmaterials" ||
              category ===
              "memorialmaterial"
            ) &&
            optionKey ===
            "specialrequest"
          )
        );
      }
    )
  ) {
    totalCents += 3000;
  }

  /*
   * FINAL SERVER PRICE SAFETY CHECK
   */
  if (
    !Number.isInteger(
      totalCents
    ) ||
    totalCents <= 0
  ) {
    throw new Error(
      `Invalid server price for ${collection.name}.`
    );
  }

  return totalCents;
}

async function getTrustedCollection(
  item
) {
  const collectionId =
    String(
      item.collectionId ||
      ""
    ).trim();

  const collectionSlug =
    String(
      item.collectionSlug ||
      ""
    ).trim();

  if (
    !collectionId &&
    !collectionSlug
  ) {
    throw new CheckoutValidationError(
      "Cart item is missing a collection identifier."
    );
  }

  const collectionWhere =
    collectionSlug
      ? {
        slug:
          collectionSlug,
      }
      : {
        OR: [
          {
            id:
              collectionId,
          },
          {
            slug:
              collectionId,
          },
        ],
      };

  const collection =
    await prisma.collection
      .findFirst({
        where:
          collectionWhere,

        select: {
          id: true,
          name: true,
          slug: true,
          published: true,
          configurationJson:
            true,

          ringCores: {
            where: {
              active:
                true,
            },

            select: {
              ringCore: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  material:
                    true,
                  finish:
                    true,
                  color:
                    true,
                  active:
                    true,
                  widthsJson:
                    true,
                  sizesJson:
                    true,
                },
              },
            },
          },

          /*
           * IMPORTANT:
           * Signature and other modern
           * ring builders use these Product
           * Base assignments as the actual
           * customer-side core objects.
           */
          productBases: {
            where: {
              active:
                true,
            },

            select: {
              displayName:
                true,

              productBase: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  material:
                    true,
                  finish:
                    true,
                  color:
                    true,
                  style:
                    true,
                  edge:
                    true,
                  comfortFit:
                    true,
                  allowEngraving:
                    true,
                  active:
                    true,

                  variants: {
                    where: {
                      active:
                        true,
                    },

                    select: {
                      id: true,
                      variantKey:
                        true,
                      widthMm:
                        true,
                      channelWidthMm:
                        true,
                      sizesJson:
                        true,
                      active:
                        true,
                    },
                  },
                },
              },
            },
          },

          inlayStyles: {
            where: {
              active:
                true,
            },

            select: {
              inlayStyle: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  active:
                    true,
                },
              },
            },
          },

          birthstones: {
            where: {
              active:
                true,
            },

            select: {
              birthstone: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  monthName:
                    true,
                  monthNumber:
                    true,
                  shape:
                    true,
                  size:
                    true,
                  active:
                    true,
                },
              },
            },
          },

          birthstoneOptions: {
            where: {
              active:
                true,
            },

            select: {
              birthstoneMonth: {
                select: {
                  id: true,
                  name: true,
                  monthNumber:
                    true,
                  active:
                    true,
                },
              },

              mineral: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  active:
                    true,
                },
              },
            },
          },

          minerals: {
            where: {
              active:
                true,
            },

            select: {
              mineral: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  active:
                    true,
                  priceAdjustmentCents:
                    true,
                },
              },
            },
          },

          glowPowders: {
            where: {
              active:
                true,
            },

            select: {
              glowPowder: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  active:
                    true,
                  priceAdjustmentCents:
                    true,
                },
              },
            },
          },

          pricingProfile: {
            select: {
              active:
                true,
              baseProductCents:
                true,
              profitCents:
                true,
            },
          },

          pricingRules: {
            where: {
              active:
                true,
            },

            select: {
              category:
                true,
              optionKey:
                true,
              amountCents:
                true,
              active:
                true,
            },
          },
        },
      });

  if (!collection) {
    throw new CheckoutValidationError(
      "Cart item references an unknown collection."
    );
  }

  if (
    !collection.published
  ) {
    throw new CheckoutValidationError(
      `${collection.name} is not currently available for checkout.`
    );
  }

  /*
   * REMI CONFIGURATOR OPTIONS
   *
   * RemiConfigurator gets these values
   * from the ConfiguratorOption table.
   * Checkout loads the same trusted rows
   * so its server-side price matches the
   * customer configurator without trusting
   * browser-supplied prices.
   */
  const trustedCollectionKey =
    normalizeCategory(
      collection.slug ||
      collection.id ||
      collection.name
    );

  const isRemiCollection =
  [
    "remi",
    "theremiring",
    "heirloom",
    "heirloomnecklace",
    "legacycross",
    "legacyheart",
  ].includes(
    trustedCollectionKey
  ) ||
  normalizeCategory(
    collection.name
  ).includes(
    "remi"
  );

  const configuratorOptions =
    isRemiCollection
      ? await prisma
        .configuratorOption
        .findMany({
          where: {
            active: true,

            category: {
              in: [
                "hair-placement",
                "decorative-accent",
                "accent-style",
              ],
            },
          },

          select: {
            category:
              true,

            slug:
              true,

            name:
              true,

            priceAdjustmentCents:
              true,

            active:
              true,
          },
        })
      : [];

  return {
    ...collection,
    configuratorOptions,
  };
}

export async function POST(request) {
  /*
   * CHECKOUT RATE LIMIT
   *
   * Limit: 10 checkout attempts per minute
   * per IP address.
   */
  const forwardedFor =
    request.headers.get(
      "x-vercel-forwarded-for"
    ) ||
    request.headers.get(
      "x-forwarded-for"
    ) ||
    "";

  const clientIp =
    forwardedFor
      .split(",")[0]
      .trim() ||
    "unknown";

  try {
    const {
      success,
      limit,
      remaining,
      reset,
    } =
      await checkoutRateLimit.limit(
        clientIp
      );

    if (!success) {
      const retryAfter =
        Math.max(
          1,
          Math.ceil(
            (reset - Date.now()) /
            1000
          )
        );

      return Response.json(
        {
          error:
            "Too many checkout attempts. Please wait a moment and try again.",
        },
        {
          status: 429,

          headers: {
            "Retry-After":
              String(retryAfter),

            "X-RateLimit-Limit":
              String(limit),

            "X-RateLimit-Remaining":
              String(remaining),
          },
        }
      );
    }
  } catch (error) {
    /*
     * Fail open if Upstash is temporarily
     * unavailable so a Redis outage cannot
     * prevent a legitimate customer from
     * checking out.
     */
    console.error(
      "Checkout rate limiter unavailable:",
      error
    );
  }

  try {
    const { cart, customerNote } = await request.json();

    if (!Array.isArray(cart) || cart.length === 0) {
      return Response.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    if (cart.length > 25) {
      return Response.json(
        { error: "Cart contains too many items." },
        { status: 400 }
      );
    }

    const siteSettings =
      await getCheckoutSiteSettings();

    const salePercent =
      siteSettings.sitewideSaleEnabled
        ? normalizeSalePercent(
            siteSettings.sitewideSalePercent
          )
        : 0;

    const lineItems =
      await Promise.all(
        cart.map(async (item) => {
          if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
          ) {
            throw new CheckoutValidationError(
              "Invalid cart item."
            );
          }

          const trustedCollection =
            await getTrustedCollection(item);

          /*
           * SECURITY VALIDATION
           *
           * The browser may carry display values in the
           * cart, but collection/options/pricing are
           * validated and rebuilt from trusted server data
           * before Stripe receives an amount.
           */
          validateTrustedSelections(
            item,
            trustedCollection
          );

          const regularPriceCents =
            calculateTrustedPriceCents(
              item,
              trustedCollection
            );

          const quantity =
            Number(item.quantity ?? 1);

          if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 10
          ) {
            throw new CheckoutValidationError(
              "Invalid item quantity."
            );
          }

          const trustedCollectionKey =
            normalizeCategory(
              trustedCollection.slug ||
              trustedCollection.id ||
              trustedCollection.name
            );

      const isRemi =
        [
          "remi",
          "theremiring",
          "heirloom",
          "heirloomnecklace",
          "legacycross",
          "legacyheart",
        ].includes(trustedCollectionKey) ||
        normalizeCategory(
          trustedCollection.name
        ).includes("remi") ||
        Boolean(
          item.bezelSize ||
          item.hairPlacement ||
          item.decorativeAccent ||
          item.accentStyle
        );

      const isKeepsake =
        [
          "evermorering",
          "evermorebracelet",
          "evermorenecklace",
          "keepsakebranch",
          "keepsakebranchring",
          "keepsakebranchnecklace",
          "keepsake",
        ].includes(
          trustedCollectionKey
        );

      const description = isRemi
        ? buildRemiDescription(item)
        : isKeepsake
          ? buildKeepsakeDescription(item)
          : buildStandardRingDescription(item);

      const unitAmount =
        salePercent > 0
          ? Math.round(
              regularPriceCents *
                ((100 - salePercent) / 100)
            )
          : regularPriceCents;

      if (
        !Number.isInteger(unitAmount) ||
        unitAmount <= 0
      ) {
        throw new Error(
          `Invalid server price for ${trustedCollection.name}.`
        );
      }

      const coreStyle =
        typeof item.core === "object"
          ? [
              item.core?.color,
              item.core?.edge ||
                item.core?.finish,
            ]
              .filter(Boolean)
              .join(" ")
          : "";

      const coreName =
        typeof item.core === "object"
          ? item.core?.name ||
            coreStyle ||
            formatOptionName(item.core?.id) ||
            ""
          : formatOptionName(item.core);

      const designName =
        item.design?.name ||
        item.designName ||
        item.inlayStyleName ||
        "";

      const widthValue =
        typeof item.width === "object"
          ? item.width?.width
          : item.width;

      const channelWidth =
        item.channelWidth ??
        item.width?.channel;

      return {
        price_data: {
          currency: "usd",
          product_data: {
  name:
    trustedCollection.name ||
    "Custom Memorial Jewelry",

  description,

  metadata: {
  collectionName: String(
    trustedCollection.name || ""
  ).slice(0, 500),

  collection: String(
    trustedCollection.slug ||
      trustedCollection.id ||
      ""
  ).slice(0, 500),

  productType: String(
    item.productType ||
      (isRemi ? "remi" : isKeepsake ? "keepsake" : "ring")
  ).slice(0, 500),

  material: String(
    item.material ||
      item.finish ||
      ""
  ).slice(0, 500),

  core: String(coreName).slice(0, 500),

  style: String(
    coreStyle ||
      formatOptionName(item.core?.id) ||
      ""
  ).slice(0, 500),

  design: String(
    designName
  ).slice(0, 500),

  width: String(
    widthValue != null && widthValue !== ""
      ? `${widthValue}mm`
      : ""
  ).slice(0, 500),

  channelWidth: String(
    channelWidth != null && channelWidth !== ""
      ? `${channelWidth}mm`
      : ""
  ).slice(0, 500),

  size: String(
    item.size ?? ""
  ).slice(0, 500),

  memorialMaterials: buildMetadataList(
    item.memorialMaterials,
    formatMemorialMaterial
  ),

  minerals: buildMetadataList(
    item.minerals,
    formatOptionName
  ),

  accentMaterials: buildMetadataList(
    item.accentMaterials,
    formatAccentMaterial
  ),

  glow: String(
    item.glow?.name ||
      item.glow?.id ||
      item.glowName ||
      (typeof item.glow === "string"
        ? item.glow
        : "")
  ).slice(0, 500),

  engraving: String(
    !item.engravingEnabled
      ? ""
      : item.engravingType === "customSignature"
        ? "Handwritten Signature"
        : item.engravingText || "Yes"
  ).slice(0, 500),

  engravingFont: String(
    item.engravingFont?.name ||
      formatOptionName(
        item.engravingFont?.id
      ) ||
      ""
  ).slice(0, 500),

  channels: buildChannelMetadata(item).slice(
    0,
    500
  ),

  regularPriceCents: String(
    regularPriceCents
  ),

  checkoutPriceCents: String(
    unitAmount
  ),

  specialRequest: item.specialRequest
    ? `Yes (+$${Number(
        item.specialRequestPrice || 30
      ).toFixed(0)})`
    : "No",

  itemDescription: description.slice(0, 500),
},
},
unit_amount: unitAmount,
},
quantity,
};
        })
      );

    const origin =
      new URL(request.url).origin;

    const allowedCountries =
      siteSettings.usShippingOnly
        ? ["US"]
        : STRIPE_ALLOWED_SHIPPING_COUNTRIES;

    const shippingOptions = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount:
              siteSettings.standardShippingPriceCents,
            currency: "usd",
          },
          display_name:
            "USPS Ground Advantage",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount:
              siteSettings.priorityShippingPriceCents,
            currency: "usd",
          },
          display_name:
            "USPS Priority Mail",
        },
      },
    ];

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: allowedCountries,
        },
        shipping_options: shippingOptions,
        metadata: {
          customerNote: String(
            customerNote || ""
          ).slice(0, 500),
          saleName: String(
            siteSettings.sitewideSaleName || ""
          ).slice(0, 500),
          salePercent: String(salePercent),
          turnaroundMinWeeks: String(
            siteSettings.turnaroundMinWeeks
          ),
          turnaroundMaxWeeks: String(
            siteSettings.turnaroundMaxWeeks
          ),
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
      });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (
      error instanceof
      CheckoutValidationError
    ) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}

function buildRemiDescription(item) {
  const mineralName =
    item.mineral?.name ||
    item.naturalMineral ||
    item.naturalMineralName ||
    "";

  const keepsakeBase =
    item.keepsakeMaterialName ||
    formatKeepsakeMaterial(item.keepsakeMaterial) ||
    "Not selected";

  const glowName =
    item.glow?.name ||
    item.glowName ||
    (typeof item.glow === "string"
      ? formatOptionName(item.glow)
      : "") ||
    "No Glow";

  const lines = [
    item.finish || item.material
      ? `Metal Finish: ${item.finish || item.material}`
      : null,

    item.size ? `Ring Size: ${item.size}` : null,

    item.bezelSize
      ? `Bezel Size: ${item.bezelSize}`
      : null,

      item.chain
  ? `Chain: ${item.chain}`
  : null,
  
    `Keepsake Base: ${keepsakeBase}`,

    item.hairPlacementName || item.hairPlacement
      ? `Hair Placement: ${
          item.hairPlacementName ||
          formatOptionName(item.hairPlacement)
        }`
      : null,

    item.keepsakeMaterial !== "mineralBase" &&
    mineralName
      ? `Natural Mineral: ${mineralName}`
      : null,

    `Decorative Accent: ${
      item.decorativeAccentName ||
      formatOptionName(item.decorativeAccent) ||
      "None"
    }`,

    item.decorativeAccent !== "none" &&
    (item.accentStyleName || item.accentStyle)
      ? `Accent Style: ${
          item.accentStyleName ||
          formatOptionName(item.accentStyle)
        }`
      : null,

    `Glow Effect: ${glowName}`,

    item.specialRequest
      ? `Special Request: Yes (+$${Number(
          item.specialRequestPrice || 30
        ).toFixed(0)})`
      : null,
  ];

  return lines.filter(Boolean).join(" | ");
}

function buildKeepsakeDescription(item) {
  const lines = [
    item.material
      ? `Material: ${item.material}`
      : null,

    item.size ? `Size: ${item.size}` : null,

    `Keepsake Material: ${formatKeepsakeMaterial(
      item.keepsakeMaterial
    )}`,

    item.birthstone
      ? `Birthstone: ${item.birthstone.month} - ${item.birthstone.stone}`
      : null,

    item.specialRequest
      ? "Special Request: Yes"
      : null,
  ];

  return lines.filter(Boolean).join(" | ");
}

function buildStandardRingDescription(item) {
  const style =
    `${item.core?.color ? `${item.core.color} ` : ""}${
      item.core?.edge || item.core?.finish || ""
    }`.trim();

  const channelWidth =
    item.channelWidth ?? item.width?.channel;

  const channelDescriptions =
    buildChannelDescriptions(item);

  const accentMaterialNames =
    item.accentMaterials?.length
      ? item.accentMaterials
          .map((accent) => {
            const value =
              typeof accent === "string"
                ? accent
                : accent?.id;

            return (
              accent?.name ||
              formatAccentMaterial(value)
            );
          })
          .filter(Boolean)
          .join(", ")
      : "None";

  const engravingDescription =
    !item.engravingEnabled
      ? "None"
      : item.engravingType === "customSignature"
        ? "Handwritten Signature"
        : item.engravingText || "Yes";

  const hasChannelDescriptions =
    channelDescriptions.length > 0;

  const lines = [
    item.material
      ? `Material: ${item.material}`
      : null,

    style ? `Style: ${style}` : null,

    item.width?.width != null
      ? `Width: ${item.width.width}mm`
      : typeof item.width === "number"
        ? `Width: ${item.width}mm`
        : null,

    channelWidth != null
      ? `Channel Width: ${channelWidth}mm`
      : null,

    item.size ? `Size: ${item.size}` : null,

    item.design?.name
      ? `Design: ${item.design.name}`
      : null,

    ...channelDescriptions,

    !hasChannelDescriptions
      ? buildFlatMemorialDescription(item)
      : null,

    !hasChannelDescriptions
      ? buildFlatMineralDescription(item)
      : null,

    `Accent Materials: ${accentMaterialNames}`,

    !hasChannelDescriptions
      ? `Glow Powder: ${getGlowName(item.glow)}`
      : null,

    `Engraving: ${engravingDescription}`,

    item.engravingEnabled &&
    item.engravingType !== "customSignature"
      ? `Font: ${
          item.engravingFont?.name ||
          formatOptionName(item.engravingFont?.id) ||
          "Not selected"
        }`
      : null,

    item.specialRequest
      ? "Special Request: Yes"
      : null,
  ];

  return lines.filter(Boolean).join(" | ");
}

function buildChannelDescriptions(item) {
  const channelDefinitions =
    item.design?.channels || [];

  if (
    !channelDefinitions.length ||
    !item.channels ||
    typeof item.channels !== "object"
  ) {
    return [];
  }

  return channelDefinitions.map((channel, index) => {
    const selection =
      item.channels[channel.id] || {};

    const channelName =
      channel.name ||
      `Channel ${index + 1}`;

    const memorialValue =
      selection.memorial?.id ||
      selection.memorial;

    const mineralValue =
      selection.mineral?.id ||
      selection.mineral;

    const glowValue =
      selection.glow?.id ||
      selection.glow;

    const accentValue =
      selection.accent?.id ||
      selection.accentMaterial?.id ||
      selection.accent ||
      selection.accentMaterial;

    const memorialName =
      selection.memorial?.name ||
      formatMemorialMaterial(memorialValue) ||
      "None";

    const mineralName =
      selection.mineral?.name ||
      formatOptionName(mineralValue) ||
      "None";

    const glowName =
      selection.glow?.name ||
      formatOptionName(glowValue);

    const accentName =
      selection.accent?.name ||
      selection.accentMaterial?.name ||
      formatAccentMaterial(accentValue);

    const parts = [
      `Memorial: ${memorialName}`,
      `Mineral: ${mineralName}`,
      accentName ? `Accent: ${accentName}` : null,
      glowName ? `Glow: ${glowName}` : null,
    ];

    return `${channelName}: ${parts
      .filter(Boolean)
      .join(", ")}`;
  });
}

function buildFlatMemorialDescription(item) {
  if (!item.memorialMaterials?.length) {
    return "Memorial Material: None";
  }

  const names = item.memorialMaterials
    .map((material) => {
      const value =
        typeof material === "string"
          ? material
          : material?.id;

      return (
        material?.name ||
        formatMemorialMaterial(value)
      );
    })
    .filter(Boolean)
    .join(", ");

  return `Memorial Material: ${names || "None"}`;
}

function buildFlatMineralDescription(item) {
  if (!item.minerals?.length) {
    return "Minerals: None";
  }

  const names = item.minerals
    .map((mineral) => {
      const value =
        typeof mineral === "string"
          ? mineral
          : mineral?.id;

      return (
        mineral?.name ||
        formatOptionName(value)
      );
    })
    .filter(Boolean)
    .join(", ");

  return `Minerals: ${names || "None"}`;
}

function getGlowName(glow) {
  return (
    glow?.name ||
    formatOptionName(glow?.id) ||
    (typeof glow === "string"
      ? formatOptionName(glow)
      : "") ||
    "None"
  );
}

function formatMemorialMaterial(value) {
  if (!value) return "";

  const labels = {
    ashes: "Cremation Ashes",
    cremation: "Cremation Ashes",
    hair: "Hair",
    fur: "Pet Fur",
    horseHair: "Horse Hair",
    sand: "Sand",
    soil: "Soil",
    fabric: "Fabric",
    breastMilk: "Breast Milk",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatAccentMaterial(value) {
  if (!value) return "";

  const labels = {
    goldFoil: "Gold Foil",
    silverFoil: "Silver Foil",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatKeepsakeMaterial(value) {
  const labels = {
    breastMilk: "Breast Milk",
    cremation: "Cremation Ashes",
    ashes: "Cremation Ashes",
    sand: "Sand",
    soil: "Soil",
    mineralBase: "Mineral Base",
  };

  return (
    labels[value] ||
    formatOptionName(value) ||
    "Not selected"
  );
}

function formatOptionName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildMetadataList(
  values,
  formatter = formatOptionName
) {
  if (!Array.isArray(values)) {
    return "";
  }

  return values
    .map((value) => {
      if (typeof value === "string") {
        return (
          formatter(value) ||
          value
        );
      }

      const rawValue =
        value?.id ||
        value?.value ||
        value?.label ||
        "";

      return (
        value?.name ||
        formatter(rawValue) ||
        rawValue
      );
    })
    .filter(Boolean)
    .join(", ")
    .slice(0, 500);
}

function buildChannelMetadata(item) {
  const channelDefinitions = item.design?.channels || [];

  if (
    !channelDefinitions.length ||
    !item.channels ||
    typeof item.channels !== "object"
  ) {
    return "";
  }

  return channelDefinitions
    .map((channel, index) => {
      const selection = item.channels[channel.id] || {};

      const channelName =
        channel.name || `Channel ${index + 1}`;

      const memorialValue =
        selection.memorial?.id ||
        selection.memorial;

      const memorial =
        selection.memorial?.name ||
        formatMemorialMaterial(
          memorialValue
        ) ||
        "None";

      const mineralValue =
        selection.mineral?.id ||
        selection.mineral;

      const mineral =
        selection.mineral?.name ||
        formatOptionName(
          mineralValue
        ) ||
        "None";

      const accentValue =
        selection.accent?.id ||
        selection.accentMaterial?.id ||
        selection.accent ||
        selection.accentMaterial;

      const accent =
        selection.accent?.name ||
        selection.accentMaterial?.name ||
        formatAccentMaterial(
          accentValue
        ) ||
        "";

      const glowValue =
        selection.glow?.id ||
        selection.glow;

      const glow =
        selection.glow?.name ||
        formatOptionName(
          glowValue
        ) ||
        "";

      return [
        channelName,
        `Memorial: ${memorial}`,
        `Mineral: ${mineral}`,
        accent ? `Accent: ${accent}` : null,
        glow ? `Glow: ${glow}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join(" || ");
}

async function getCheckoutSiteSettings() {
  const defaults = {
    turnaroundMinWeeks: 2,
    turnaroundMaxWeeks: 10,
    usShippingOnly: true,
    standardShippingPriceCents: 800,
    priorityShippingPriceCents: 1500,
    sitewideSaleEnabled: false,
    sitewideSalePercent: 0,
    sitewideSaleName: "",
  };

  try {
    const settings =
      await prisma.siteSettings.findUnique({
        where: {
          id: "site-settings",
        },
        select: {
          turnaroundMinWeeks: true,
          turnaroundMaxWeeks: true,
          usShippingOnly: true,
          standardShippingPriceCents: true,
          priorityShippingPriceCents: true,
          sitewideSaleEnabled: true,
          sitewideSalePercent: true,
          sitewideSaleName: true,
        },
      });

    return {
      ...defaults,
      ...(settings || {}),
      standardShippingPriceCents:
        Math.max(
          0,
          Number(
            settings?.standardShippingPriceCents ??
              defaults.standardShippingPriceCents
          ) || 0
        ),
      priorityShippingPriceCents:
        Math.max(
          0,
          Number(
            settings?.priorityShippingPriceCents ??
              defaults.priorityShippingPriceCents
          ) || 0
        ),
    };
  } catch (error) {
    console.error(
      "Unable to load checkout settings:",
      error
    );

    return defaults;
  }
}
