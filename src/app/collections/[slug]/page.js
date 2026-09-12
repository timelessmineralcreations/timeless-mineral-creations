import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import CollectionConfigurator from "@/components/CollectionConfigurator";
import KeepsakeConfigurator from "@/components/KeepsakeConfigurator";
import RemiConfigurator from "@/components/RemiConfigurator";

import { signatureCollection } from "@/data/collections/signature/collection";
import { tornadoCollection } from "@/data/collections/tornado/collection";
import { clamCollection } from "@/data/collections/clam/collection";
import { dualChannelCollection } from "@/data/collections/dual-channel/collection";
import { mountainCollection } from "@/data/collections/mountain/collection";
import { oceanCollection } from "@/data/collections/ocean/collection";
import { tripleCollection } from "@/data/collections/triple/collection";
import { aztecCollection } from "@/data/collections/aztec/collection";
import { dragonCollection } from "@/data/collections/dragon/collection";
import { greekCollection } from "@/data/collections/greek/collection";
import { pawCollection } from "@/data/collections/paw/collection";
import { pawTrailCollection } from "@/data/collections/paw-trail/collection";
import { puzzleCollection } from "@/data/collections/puzzle/collection";
import { honeycombCollection } from "@/data/collections/honeycomb/collection";
import { leafCollection } from "@/data/collections/leaf/collection";
import { nativeCollection } from "@/data/collections/native/collection";
import { ribbonCollection } from "@/data/collections/ribbon/collection";
import { offsetCollection } from "@/data/collections/offset/collection";
import { dualOffsetCollection } from "@/data/collections/dual-offset/collection";
import { twinOffsetCollection } from "@/data/collections/twin-offset/collection";
import { celticCollection } from "@/data/collections/celtic/collection";
import { quadCollection } from "@/data/collections/quad/collection";
import { cobblestoneCollection } from "@/data/collections/cobblestone/collection";
import { focusCollection } from "@/data/collections/focus/collection";
import { companionCollection } from "@/data/collections/companion/collection";
import { horizonMountainCollection } from "@/data/collections/horizon-mountain/collection";
import { cornerstoneCollection } from "@/data/collections/cornerstone/collection";

import { evermoreRingCollection } from "@/data/collections/evermore/evermore-ring/collection";
import { evermoreBraceletCollection } from "@/data/collections/evermore/evermore-bracelet/collection";
import { evermoreNecklaceCollection } from "@/data/collections/evermore/evermore-necklace/collection";

import { keepsakeBranchCollection } from "@/data/collections/keepsake-branch/keepsake-branch-necklace/collection";
import { keepsakeBranchRingCollection } from "@/data/collections/keepsake-branch/keepsake-branch-ring/collection";

import { remiCollection } from "@/data/collections/remi/collection";
import { heirloomCollection } from "@/data/collections/heirloom/collection";
import { heirloomNecklaceCollection } from "@/data/collections/heirloom-necklace/collection";

import { legacyCrossCollection } from "@/data/collections/legacy/legacy-cross/collection";
import { legacyHeartCollection } from "@/data/collections/legacy/legacy-heart/collection";
import { legacyRoundCollection } from "@/data/collections/legacy/legacy-round/collection";
import { legacyTeardropCollection } from "@/data/collections/legacy/legacy-teardrop/collection";

export const dynamic = "force-dynamic";

const collections = [
  signatureCollection,
  tornadoCollection,
  clamCollection,
  dualChannelCollection,
  mountainCollection,
  oceanCollection,
  tripleCollection,
  aztecCollection,
  dragonCollection,
  greekCollection,
  pawCollection,
  pawTrailCollection,
  puzzleCollection,
  honeycombCollection,
  leafCollection,
  nativeCollection,
  ribbonCollection,
  offsetCollection,
  dualOffsetCollection,
  twinOffsetCollection,
  celticCollection,
  quadCollection,
  cobblestoneCollection,
  focusCollection,
  companionCollection,
  horizonMountainCollection,
  cornerstoneCollection,

  evermoreRingCollection,
  evermoreBraceletCollection,
  evermoreNecklaceCollection,

  remiCollection,
  heirloomCollection,
  heirloomNecklaceCollection,

  keepsakeBranchRingCollection,
  keepsakeBranchCollection,

  legacyCrossCollection,
  legacyHeartCollection,
  legacyRoundCollection,
  legacyTeardropCollection,
];

const keepsakeBuilders = [
  "evermore-ring",
  "evermore-bracelet",
  "evermore-necklace",
  "keepsake-branch-ring",
  "keepsake-branch-necklace",
  "keepsake",
];

function centsToDollars(cents) {
  const amount = Number(cents);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount / 100;
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

function setNestedPricingValue(
  pricing,
  category,
  optionKey,
  amount
) {
  if (category === "general") {
    pricing[optionKey] = amount;
    return;
  }

  const categoryParts = String(category)
    .split(".")
    .filter(Boolean);

  let currentObject = pricing;

  for (const categoryPart of categoryParts) {
    if (
      !currentObject[categoryPart] ||
      typeof currentObject[categoryPart] !==
      "object"
    ) {
      currentObject[categoryPart] = {};
    }

    currentObject =
      currentObject[categoryPart];
  }

  currentObject[optionKey] = amount;
}

function buildDatabasePricing(
  pricingProfile,
  pricingRules = []
) {
  if (!pricingProfile?.active) {
    return null;
  }

  const pricing = {
    baseProduct: centsToDollars(
      pricingProfile.baseProductCents
    ),

    profit: centsToDollars(
      pricingProfile.profitCents
    ),
  };

  for (const rule of pricingRules) {
    if (!rule.active) {
      continue;
    }

    setNestedPricingValue(
      pricing,
      rule.category,
      rule.optionKey,
      centsToDollars(
        rule.amountCents
      )
    );
  }

  return pricing;
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function convertBezelCatalogOption(
  option
) {
  return {
    id: option.slug,
    slug: option.slug,
    name: option.name,

    description:
      option.description || "",

    imageUrl:
      option.imageUrl || null,

    price: centsToDollars(
      option.priceAdjustmentCents
    ),

    priceAdjustmentCents:
      option.priceAdjustmentCents,

    active: option.active,
    sortOrder: option.sortOrder,
  };
}

function convertChainCatalogOption(
  option
) {
  return {
    id: option.slug,
    slug: option.slug,
    name: option.name,

    description:
      option.description || "",

    imageUrl:
      option.imageUrl || null,

    price: centsToDollars(
      option.priceAdjustmentCents
    ),

    priceAdjustmentCents:
      option.priceAdjustmentCents,

    active: option.active,
    sortOrder: option.sortOrder,
  };
}

function convertEngravingCatalogOption(
  option
) {
  return {
    id: option.slug,
    slug: option.slug,
    name: option.name,

    description:
      option.description || "",

    imageUrl:
      option.imageUrl || null,

    price: centsToDollars(
      option.priceAdjustmentCents
    ),

    priceAdjustmentCents:
      option.priceAdjustmentCents,

    active: option.active,
    sortOrder: option.sortOrder,
  };
}

function convertMemorialMaterialCatalogOption(
  option,
  collectionPriceCents
) {
  const effectivePriceCents =
    Number.isFinite(
      Number(collectionPriceCents)
    )
      ? Number(collectionPriceCents)
      : option.priceAdjustmentCents;

  return {
    id: option.slug,
    slug: option.slug,
    name: option.name,

    description:
      option.description || "",

    imageUrl:
      option.imageUrl || null,

    price: centsToDollars(
      effectivePriceCents
    ),

    defaultPrice: centsToDollars(
      option.priceAdjustmentCents
    ),

    priceAdjustmentCents:
      effectivePriceCents,

    defaultPriceAdjustmentCents:
      option.priceAdjustmentCents,

    active: option.active,
    sortOrder: option.sortOrder,
  };
}

function applyBezelSizesToCores(
  cores,
  bezelOptions
) {
  if (!Array.isArray(cores)) {
    return cores;
  }

  return cores.map((core) => ({
    ...core,

    bezelSizes:
      bezelOptions,
  }));
}

function convertDatabasePhoto(photo) {
  const mineralIds =
    parseJsonArray(
      photo.mineralIdsJson
    );

  const memorialMaterialIds =
    parseJsonArray(
      photo.memorialMaterialIdsJson
    );

  const accentMaterialIds =
    parseJsonArray(
      photo.accentMaterialIdsJson
    );

  const glowPowderIds =
    parseJsonArray(
      photo.glowPowderIdsJson
    );

  const tags =
    parseJsonArray(
      photo.tagsJson
    );

  const hasHair =
    memorialMaterialIds.includes(
      "hair"
    ) ||
    tags.includes("hair");

  return {
    id: photo.id,

    image: photo.imageUrl,
    imageUrl: photo.imageUrl,

    altText:
      photo.altText || "",

    caption:
      photo.caption || "",

    material:
      photo.material || null,

    finish:
      photo.finish || null,

    coreId:
      photo.coreId || null,

    width:
      photo.widthMm ?? null,

    widthMm:
      photo.widthMm ?? null,

    inlayStyleId:
      photo.inlayStyleId || null,

    mineral:
      mineralIds[0] || null,

    minerals:
      mineralIds,

    mineralIds,

    keepsakeMaterial:
      memorialMaterialIds[0] ||
      null,

    memorialMaterials:
      memorialMaterialIds,

    accentMaterials:
      accentMaterialIds,

    glow:
      glowPowderIds[0] ||
      null,

    glowPowders:
      glowPowderIds,

    tags,

    hair: hasHair,

    featured:
      photo.featured,

    active:
      photo.active,

    sortOrder:
      photo.sortOrder,
  };
}

function convertGalleryItemToPhoto(item) {
  return {
    id: `gallery-${item.id}`,

    image: item.imageUrl,
    imageUrl: item.imageUrl,

    altText:
      item.altText ||
      item.title ||
      "",

    caption:
      item.description ||
      item.title ||
      "",

    material: null,
    finish: null,
    coreId: null,

    width: null,
    widthMm: null,

    inlayStyleId: null,

    mineral: null,
    minerals: [],
    mineralIds: [],

    keepsakeMaterial: null,
    memorialMaterials: [],

    accentMaterials: [],

    glow: null,
    glowPowders: [],

    tags: [
      "gallery",
    ],

    hair: false,

    featured:
      Boolean(
        item.featured
      ),

    active:
      Boolean(
        item.active
      ),

    sortOrder:
      item.sortOrder ?? 0,

    source:
      "gallery",
  };
}

function mergeUniquePhotos(
  ...photoGroups
) {
  const seen =
    new Set();

  return photoGroups
    .flat()
    .filter((photo) => {
      const imageUrl =
        photo?.imageUrl ||
        photo?.image;

      if (
        !imageUrl ||
        seen.has(imageUrl)
      ) {
        return false;
      }

      seen.add(
        imageUrl
      );

      return true;
    });
}

export default async function CollectionPage({
  params,
}) {
  const { slug } =
    await params;

  const [
    siteSettings,
    bezelSizeCatalog,
    chainOptionCatalog,
    memorialMaterialCatalog,
    engravingOptionCatalog,
    birthstoneGuide,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: {
        id: "site-settings",
      },

      select: {
        turnaroundMinWeeks:
          true,

        turnaroundMaxWeeks:
          true,

        sitewideSaleEnabled:
          true,

        sitewideSalePercent:
          true,

        sitewideSaleName:
          true,
      },
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "bezel-size",

        active: true,
      },

      orderBy: [
        {
          sortOrder:
            "asc",
        },
        {
          name:
            "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "chain-option",

        active: true,
      },

      orderBy: [
        {
          sortOrder:
            "asc",
        },
        {
          name:
            "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "memorial-material",

        active: true,
      },

      orderBy: [
        {
          sortOrder:
            "asc",
        },
        {
          name:
            "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "engraving-option",

        active: true,
      },

      orderBy: [
        {
          sortOrder:
            "asc",
        },
        {
          name:
            "asc",
        },
      ],
    }),

    prisma.configuratorOption.findUnique({
      where: {
        category_slug: {
          category:
            "birthstone-guide",

          slug:
            "default",
        },
      },

      select: {
        imageUrl:
          true,

        active:
          true,
      },
    }),
  ]);

  const sourceCollection =
    collections.find(
      (item) =>
        item.slug === slug
    ) || null;

  const databaseCollection =
    await prisma.collection.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        startingPrice: true,
        productType: true,
        configurationJson: true,
        published: true,
        comingSoon: true,

        heroImage: true,
        heroImageScale: true,
        heroImageX: true,
        heroImageY: true,

        productBases: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            displayName:
              true,

            configurationJson:
              true,

            defaultSelected:
              true,

            productBase: {
              select: {
                id: true,
                slug: true,
                name: true,
                productType:
                  true,

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

                imageUrl:
                  true,

                supplierCostCents:
                  true,

                supplierUrl:
                  true,

                active:
                  true,

                variants: {
                  where: {
                    active:
                      true,
                  },

                  orderBy: {
                    sortOrder:
                      "asc",
                  },

                  select: {
                    id: true,

                    variantKey:
                      true,

                    name:
                      true,

                    widthMm:
                      true,

                    channelWidthMm:
                      true,

                    channelLayout:
                      true,

                    finish:
                      true,

                    sizesJson:
                      true,

                    supplierCostOverrideCents:
                      true,

                    priceAdjustmentCents:
                      true,

                    inStock:
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

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            inlayStyle: {
              select: {
                id: true,
                name: true,
                slug: true,

                shortDescription:
                  true,

                description:
                  true,

                imageUrl:
                  true,

                featured:
                  true,

                active:
                  true,

                sortOrder:
                  true,

                configurationJson:
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

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            mineral: {
              select: {
                id: true,
                slug: true,
                name: true,

                category:
                  true,

                popular:
                  true,

                imageUrl:
                  true,

                priceAdjustmentCents:
                  true,

                active:
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

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            glowPowder: {
              select: {
                id: true,
                slug: true,
                name: true,

                imageUrl:
                  true,

                priceAdjustmentCents:
                  true,

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

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            birthstone: {
              select: {
                id: true,

                monthName:
                  true,

                name:
                  true,

                colorName:
                  true,

                colorHex:
                  true,

                imageUrl:
                  true,

                priceAdjustmentCents:
                  true,

                active:
                  true,
              },
            },
          },
        },

        photos: {
          where: {
            active:
              true,
          },

          orderBy: [
            {
              featured:
                "desc",
            },
            {
              sortOrder:
                "asc",
            },
            {
              createdAt:
                "asc",
            },
          ],

          select: {
            id:
              true,

            imageUrl:
              true,

            altText:
              true,

            caption:
              true,

            material:
              true,

            finish:
              true,

            coreId:
              true,

            widthMm:
              true,

            inlayStyleId:
              true,

            mineralIdsJson:
              true,

            memorialMaterialIdsJson:
              true,

            accentMaterialIdsJson:
              true,

            glowPowderIdsJson:
              true,

            tagsJson:
              true,

            sortOrder:
              true,

            featured:
              true,

            active:
              true,
          },
        },

        galleryItems: {
          where: {
            active:
              true,
          },

          orderBy: [
            {
              featured:
                "desc",
            },
            {
              sortOrder:
                "asc",
            },
            {
              createdAt:
                "asc",
            },
          ],

          select: {
            id:
              true,

            title:
              true,

            description:
              true,

            imageUrl:
              true,

            altText:
              true,

            featured:
              true,

            active:
              true,

            sortOrder:
              true,
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

            startingPriceOverrideCents:
              true,
          },
        },

        pricingRules: {
          where: {
            active:
              true,
          },

          orderBy: [
            {
              category:
                "asc",
            },
            {
              sortOrder:
                "asc",
            },
          ],

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

  if (
    databaseCollection &&
    !databaseCollection.published &&
    !databaseCollection.comingSoon
  ) {
    notFound();
  }

  let collection =
    sourceCollection ||
    (databaseCollection
      ? {
        id:
          databaseCollection.id,

        slug:
          databaseCollection.slug,

        name:
          databaseCollection.name,

        description:
          databaseCollection.description ||
          "",

        heroImage:
          databaseCollection.heroImage ||
          null,

        startingPrice:
          databaseCollection.startingPrice ||
          0,

        productType:
          databaseCollection.productType ||
          "Ring",

        builder:
          "standard",

        ringCores: [],
        ringPhotos: [],
        photos: [],

        availableInlayStyles:
          [],

        pricing: {
          baseProduct:
            databaseCollection.startingPrice ||
            0,

          profit:
            0,
        },

        options:
          {},
      }
      : null);

  if (!collection) {
    notFound();
  }

  if (databaseCollection) {
    /*
     * CUSTOMER MEMORIAL MATERIAL GATE
     *
     * Only materials that are active in the
     * Memorial Materials master catalog can
     * reach the customer configurator.
     */
    const activeMemorialMaterialSlugSet =
      new Set(
        memorialMaterialCatalog.map(
          (option) => option.slug
        )
      );

    /*
     * Preserve every normal pricing rule,
     * but remove memorial-material rules
     * whose master option is inactive.
     *
     * This means disabling a material in
     * Admin → Memorial Materials prevents
     * it from appearing to customers.
     */
    const customerPricingRules =
      databaseCollection.pricingRules.filter(
        (rule) =>
          rule.category !==
          "memorialMaterials" ||
          activeMemorialMaterialSlugSet.has(
            rule.optionKey
          )
      );

    const databasePricing =
      buildDatabasePricing(
        databaseCollection.pricingProfile,
        customerPricingRules
      );

    /*
     * Collection-level memorial material
     * assignment is still controlled by the
     * existing CollectionPricingRule rows.
     */
    const memorialMaterialRuleMap =
      new Map(
        databaseCollection.pricingRules
          .filter(
            (rule) =>
              rule.category ===
              "memorialMaterials" &&
              rule.active &&
              activeMemorialMaterialSlugSet.has(
                rule.optionKey
              )
          )
          .map((rule) => [
            rule.optionKey,
            rule,
          ])
      );

    /*
     * Build the actual customer-facing
     * memorial material catalog.
     *
     * Name + description:
     *   Memorial Materials master Admin
     *
     * Availability + collection price:
     *   Collection Editor
     */
    const adminMemorialMaterialOptions =
      memorialMaterialCatalog
        .filter((option) =>
          memorialMaterialRuleMap.has(
            option.slug
          )
        )
        .map((option) => {
          const rule =
            memorialMaterialRuleMap.get(
              option.slug
            );

          return convertMemorialMaterialCatalogOption(
            option,
            rule?.amountCents
          );
        });

    const databaseConfiguration =
      parseJsonObject(
        databaseCollection.configurationJson
      );

    const databaseOptions =
      databaseConfiguration.options &&
        typeof databaseConfiguration.options ===
        "object" &&
        !Array.isArray(
          databaseConfiguration.options
        )
        ? databaseConfiguration.options
        : {};

    /*
     * BIRTHSTONE COLOR GUIDE
     *
     * The global image is stored once in
     * ConfiguratorOption.
     *
     * Each collection decides whether it
     * should be shown using:
     *
     * options.birthstones.showGuide
     */
    const databaseBirthstoneOptions =
      databaseOptions.birthstones &&
        typeof databaseOptions.birthstones ===
        "object" &&
        !Array.isArray(
          databaseOptions.birthstones
        )
        ? databaseOptions.birthstones
        : {};

    const showBirthstoneGuide =
      databaseBirthstoneOptions.showGuide ===
      true;

    const databaseBezelSize =
      databaseOptions.bezelSize &&
        typeof databaseOptions.bezelSize ===
        "object" &&
        !Array.isArray(
          databaseOptions.bezelSize
        )
        ? databaseOptions.bezelSize
        : {};

    const hasAdminBezelAssignment =
      Array.isArray(
        databaseBezelSize.allowed
      );

    const allowedBezelSlugs =
      hasAdminBezelAssignment
        ? databaseBezelSize.allowed
          .map((value) =>
            String(
              value
            ).trim()
          )
          .filter(Boolean)
        : [];

    const allowedBezelSlugSet =
      new Set(
        allowedBezelSlugs
      );

    const adminBezelOptions =
      hasAdminBezelAssignment
        ? bezelSizeCatalog
          .filter(
            (option) =>
              allowedBezelSlugSet.has(
                option.slug
              )
          )
          .map(
            convertBezelCatalogOption
          )
        : [];

    const databaseChain =
      databaseOptions.chain &&
        typeof databaseOptions.chain ===
        "object" &&
        !Array.isArray(
          databaseOptions.chain
        )
        ? databaseOptions.chain
        : {};

    const hasAdminChainAssignment =
      Array.isArray(
        databaseChain.allowed
      );

    const allowedChainSlugs =
      hasAdminChainAssignment
        ? databaseChain.allowed
          .map((value) =>
            String(
              value
            ).trim()
          )
          .filter(Boolean)
        : [];

    const allowedChainSlugSet =
      new Set(
        allowedChainSlugs
      );

    const adminChainOptions =
      hasAdminChainAssignment
        ? chainOptionCatalog
          .filter(
            (option) =>
              allowedChainSlugSet.has(
                option.slug
              )
          )
          .map(
            convertChainCatalogOption
          )
        : [];

    /*
     * CUSTOMER ENGRAVING GATE
     *
     * Master Engraving Options control which
     * engraving methods exist and are active.
     *
     * The Collection Editor controls which of
     * those active methods belong to this
     * collection.
     */
    const databaseEngraving =
      databaseOptions.engraving &&
        typeof databaseOptions.engraving ===
        "object" &&
        !Array.isArray(
          databaseOptions.engraving
        )
        ? databaseOptions.engraving
        : {};

    const hasAdminEngravingAssignment =
      Array.isArray(
        databaseEngraving.allowed
      );

    const allowedEngravingSlugs =
      hasAdminEngravingAssignment
        ? databaseEngraving.allowed
          .map((value) =>
            String(
              value
            ).trim()
          )
          .filter(Boolean)
        : engravingOptionCatalog.map(
          (option) => option.slug
        );

    const allowedEngravingSlugSet =
      new Set(
        allowedEngravingSlugs
      );

    /*
     * Existing collections that have never
     * saved collection-level engraving rules
     * keep all active master engraving methods.
     *
     * Once engraving.allowed exists, even an
     * empty array is authoritative.
     */
    const adminEngravingOptions =
      engravingOptionCatalog
        .filter(
          (option) =>
            allowedEngravingSlugSet.has(
              option.slug
            )
        )
        .map(
          convertEngravingCatalogOption
        );



    const databaseRingCores =
      databaseCollection.productBases
        .map(
          (assignment) => {
            const productBase =
              assignment.productBase;

            if (!productBase) {
              return null;
            }

            const widths =
              productBase.variants
                .filter(
                  (variant) =>
                    variant.widthMm != null
                )
                .map(
                  (variant) => ({
                    width:
                      variant.widthMm,

                    channel:
                      variant.channelWidthMm != null
                        ? Number(
                          variant.channelWidthMm
                        )
                        : null,

                    sizes:
                      parseJsonArray(
                        variant.sizesJson
                      ).map(
                        Number
                      ),

                    variantId:
                      variant.id,

                    variantKey:
                      variant.variantKey,
                  })
                );

            /*
             * FLEXIBLE RING SIZE SUPPORT
             *
             * Product Bases such as Evermore
             * can have sizes without a width.
             */
            const flexibleSizes = [
              ...new Set(
                productBase.variants
                  .filter(
                    (variant) =>
                      variant.widthMm ==
                      null
                  )
                  .flatMap((variant) =>
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
                productBase.comfortFit ??
                null,

              allowEngraving:
                productBase.allowEngraving ===
                true,

              image:
                productBase.imageUrl ||
                null,

              supplierCost:
                centsToDollars(
                  productBase.supplierCostCents
                ),

              supplierUrl:
                productBase.supplierUrl ||
                null,

              ...(widths.length === 0 &&
                flexibleSizes.length > 0
                ? {
                  sizes:
                    flexibleSizes,
                }
                : {}),

              widths,
            };
          }
        )
        .filter(
          Boolean
        );

    const databaseInlayStyles =
      databaseCollection.inlayStyles
        .map(
          ({
            inlayStyle,
          }) => {
            if (!inlayStyle) {
              return null;
            }

            const configuration =
              parseJsonObject(
                inlayStyle.configurationJson
              );

            return {
              ...configuration,

              id:
                inlayStyle.slug,

              databaseId:
                inlayStyle.id,

              name:
                inlayStyle.name,

              shortDescription:
                inlayStyle.shortDescription ||
                configuration.shortDescription ||
                "",

              description:
                inlayStyle.description ||
                configuration.description ||
                "",

              preview:
                inlayStyle.imageUrl ||
                configuration.preview ||
                null,

              image:
                inlayStyle.imageUrl ||
                configuration.image ||
                null,

              featured:
                inlayStyle.featured,

              active:
                inlayStyle.active,
            };
          }
        )
        .filter(
          Boolean
        );

    const databaseMinerals =
      databaseCollection.minerals
        .map(
          ({
            mineral,
          }) => {
            if (!mineral) {
              return null;
            }

            return {
              id:
                mineral.slug,

              databaseId:
                mineral.id,

              name:
                mineral.name,

              category:
                mineral.category ||
                "",

              popular:
                mineral.popular === true,

              image:
                mineral.imageUrl ||
                null,

              imageUrl:
                mineral.imageUrl ||
                null,

              price:
                centsToDollars(
                  mineral.priceAdjustmentCents
                ),

              priceAdjustmentCents:
                mineral.priceAdjustmentCents,

              active:
                mineral.active,
            };
          }
        )
        .filter(
          Boolean
        );

    const databaseGlowPowders =
      databaseCollection.glowPowders
        .map(
          ({
            glowPowder,
          }) => {
            if (
              !glowPowder
            ) {
              return null;
            }

            return {
              id:
                glowPowder.slug,

              databaseId:
                glowPowder.id,

              name:
                glowPowder.name,

              image:
                glowPowder.imageUrl ||
                null,

              imageUrl:
                glowPowder.imageUrl ||
                null,

              price:
                centsToDollars(
                  glowPowder.priceAdjustmentCents
                ),

              priceAdjustmentCents:
                glowPowder.priceAdjustmentCents,

              active:
                glowPowder.active,
            };
          }
        )
        .filter(
          Boolean
        );

    const databaseBirthstones =
      databaseCollection.birthstones
        .map(
          ({
            birthstone,
          }) => {
            if (
              !birthstone
            ) {
              return null;
            }

            return {
              id:
                birthstone.id,

              month:
                birthstone.monthName,

              stone:
                birthstone.name,

              colorName:
                birthstone.colorName ||
                null,

              colorHex:
                birthstone.colorHex ||
                null,

              image:
                birthstone.imageUrl ||
                null,

              imageUrl:
                birthstone.imageUrl ||
                null,

              priceAdjustment:
                centsToDollars(
                  birthstone.priceAdjustmentCents
                ),
            };
          }
        )
        .filter(
          Boolean
        );

    const databasePhotos =
      databaseCollection.photos.map(
        convertDatabasePhoto
      );

    const galleryPhotos =
      databaseCollection.galleryItems.map(
        convertGalleryItemToPhoto
      );

    const customerPhotos =
      mergeUniquePhotos(
        databasePhotos,
        galleryPhotos
      );

    const hasAdminPhotos =
      customerPhotos.length > 0;

    const existingRingPhotos =
      Array.isArray(
        collection.ringPhotos
      )
        ? collection.ringPhotos
        : [];

    const existingPendantPhotos =
      Array.isArray(
        collection.pendantPhotos
      )
        ? collection.pendantPhotos
        : [];

    const existingPhotos =
      Array.isArray(
        collection.photos
      )
        ? collection.photos
        : [];

    const baseRingCores =
      databaseRingCores.length >
        0
        ? databaseRingCores
        : collection.ringCores ||
        [];

    const basePendantCores =
      Array.isArray(
        collection.pendantCores
      )
        ? collection.pendantCores
        : [];

    const baseNecklaceCores =
      Array.isArray(
        collection.necklaceCores
      )
        ? collection.necklaceCores
        : [];

    const baseProductCores =
      Array.isArray(
        collection.productCores
      )
        ? collection.productCores
        : [];

    const ringCores =
      hasAdminBezelAssignment
        ? applyBezelSizesToCores(
          baseRingCores,
          adminBezelOptions
        )
        : baseRingCores;

    const pendantCores =
      hasAdminBezelAssignment
        ? applyBezelSizesToCores(
          basePendantCores,
          adminBezelOptions
        )
        : basePendantCores;

    const necklaceCores =
      hasAdminBezelAssignment
        ? applyBezelSizesToCores(
          baseNecklaceCores,
          adminBezelOptions
        )
        : baseNecklaceCores;

    const productCores =
      hasAdminBezelAssignment
        ? applyBezelSizesToCores(
          baseProductCores,
          adminBezelOptions
        )
        : baseProductCores;

    collection = {
      ...collection,

      configurationJson:
        databaseCollection.configurationJson ||
        collection.configurationJson ||
        null,

      options: {
        ...(collection.options ||
          {}),

        ...databaseOptions,

        bezelSize: {
          ...(collection.options
            ?.bezelSize ||
            {}),

          ...(databaseOptions.bezelSize ||
            {}),

          ...(hasAdminBezelAssignment
            ? {
              enabled:
                adminBezelOptions.length >
                0,

              options:
                adminBezelOptions,
            }
            : {}),
        },

        chain: {
          ...(collection.options
            ?.chain ||
            {}),

          ...(databaseOptions.chain ||
            {}),

          ...(hasAdminChainAssignment
            ? {
              enabled:
                adminChainOptions.length >
                0,

              options:
                adminChainOptions,
            }
            : {}),
        },

        engraving: {
          ...(collection.options
            ?.engraving ||
            {}),

          ...(databaseOptions.engraving ||
            {}),

          enabled:
            adminEngravingOptions.length >
            0,

          allowed:
            allowedEngravingSlugs,

          options:
            adminEngravingOptions,
        },

        /*
         * Only expose guideImage when this
         * collection has its Admin checkbox on.
         *
         * This also means older configurators
         * that simply check guideImage will
         * still obey the new toggle correctly.
         */
        birthstones: {
          ...(collection.options
            ?.birthstones ||
            {}),

          ...databaseBirthstoneOptions,

          showGuide:
            showBirthstoneGuide,

          guideImage:
            showBirthstoneGuide &&
              birthstoneGuide?.active
              ? birthstoneGuide.imageUrl ||
              null
              : null,
        },

        hair: {
          ...(collection.options
            ?.hair ||
            {}),

          ...(databaseOptions.hair ||
            {}),
        },

        decorativeAccents:
        {
          ...(collection.options
            ?.decorativeAccents ||
            {}),

          ...(databaseOptions.decorativeAccents ||
            {}),
        },
      },

      databaseId:
        databaseCollection.id,

      ringCores,

      pendantCores:
        pendantCores.length >
          0
          ? pendantCores
          : collection.pendantCores,

      necklaceCores:
        necklaceCores.length >
          0
          ? necklaceCores
          : collection.necklaceCores,

      productCores:
        productCores.length >
          0
          ? productCores
          : collection.productCores,

      bezelSizes:
        hasAdminBezelAssignment
          ? adminBezelOptions
          : collection.bezelSizes,

      memorialMaterials:
        adminMemorialMaterialOptions,

      /*
       * This is the customer-facing engraving
       * catalog consumed by CollectionConfigurator.
       */
      engravingOptions:
        adminEngravingOptions,

      availableInlayStyles:
        databaseInlayStyles,

      minerals:
        databaseMinerals,

      glowPowders:
        databaseGlowPowders,

      birthstones:
        databaseBirthstones.length >
          0
          ? databaseBirthstones
          : collection.birthstones ||
          [],

      heroImage:
        databaseCollection.heroImage ||
        null,

      heroImageScale:
        databaseCollection.heroImageScale ??
        1,

      heroImageX:
        databaseCollection.heroImageX ??
        0,

      heroImageY:
        databaseCollection.heroImageY ??
        0,

      databasePhotos:
        customerPhotos,

      galleryPhotos,

      ringPhotos:
        hasAdminPhotos
          ? customerPhotos
          : existingRingPhotos,

      pendantPhotos:
        hasAdminPhotos
          ? customerPhotos
          : existingPendantPhotos,

      photos:
        hasAdminPhotos
          ? customerPhotos
          : existingPhotos,

      ...(databasePricing && {
        databasePricing,

        useDatabasePricing:
          true,
      }),
    };
  }

  if (
    collection.builder ===
    "remi"
  ) {
    const remiConfiguratorOptions =
      await prisma.configuratorOption.findMany({
        where: {
          active:
            true,

          category: {
            in: [
              "hair-placement",
              "decorative-accent",
              "accent-style",
            ],
          },
        },

        orderBy: [
          {
            sortOrder:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      });

    function convertConfiguratorOption(
      option
    ) {
      return {
        id:
          option.slug,

        slug:
          option.slug,

        name:
          option.name,

        description:
          option.description ||
          "",

        imageUrl:
          option.imageUrl ||
          null,

        price:
          centsToDollars(
            option.priceAdjustmentCents
          ),

        featured:
          option.featured,

        active:
          option.active,

        sortOrder:
          option.sortOrder,
      };
    }

    collection = {
      ...collection,

      configuratorOptions:
      {
        memorialMaterials:
          Array.isArray(
            collection.memorialMaterials
          )
            ? collection.memorialMaterials
            : [],

        hairPlacements:
          remiConfiguratorOptions
            .filter(
              (
                option
              ) =>
                option.category ===
                "hair-placement"
            )
            .map(
              convertConfiguratorOption
            ),

        decorativeAccents:
          remiConfiguratorOptions
            .filter(
              (
                option
              ) =>
                option.category ===
                "decorative-accent"
            )
            .map(
              convertConfiguratorOption
            ),

        accentStyles:
          remiConfiguratorOptions
            .filter(
              (
                option
              ) =>
                option.category ===
                "accent-style"
            )
            .map(
              convertConfiguratorOption
            ),
      },
    };
  }

  const sitewideSalePercent =
    normalizeSalePercent(
      siteSettings
        ?.sitewideSalePercent
    );

  collection = {
    ...collection,

    siteSettings: {
      turnaroundMinWeeks:
        siteSettings
          ?.turnaroundMinWeeks ??
        2,

      turnaroundMaxWeeks:
        siteSettings
          ?.turnaroundMaxWeeks ??
        10,

      sitewideSaleEnabled:
        Boolean(
          siteSettings
            ?.sitewideSaleEnabled
        ) &&
        sitewideSalePercent > 0,

      sitewideSalePercent,

      sitewideSaleName:
        siteSettings
          ?.sitewideSaleName ||
        "",
    },
  };

  const usesKeepsakeConfigurator =
    collection.category ===
    "keepsake" ||
    keepsakeBuilders.includes(
      collection.builder
    );

  return (
    <main
      style={{
        maxWidth:
          "1400px",

        margin:
          "0 auto",

        padding:
          "40px 20px",
      }}
    >
      {collection.builder ===
        "remi" ? (
        <RemiConfigurator
          collection={
            collection
          }
        />
      ) : usesKeepsakeConfigurator ? (
        <KeepsakeConfigurator
          collection={
            collection
          }
        />
      ) : (
        <CollectionConfigurator
          collection={
            collection
          }
        />
      )}
    </main>
  );
}