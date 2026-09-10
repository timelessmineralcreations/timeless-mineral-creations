import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import CollectionEditor from "./components/CollectionEditor";

import {
  deleteCollection,
  updateCollection,
} from "./actions";

import {
  eyebrowStyle,
  pageDescriptionStyle,
  pageHeaderStyle,
  pageInnerStyle,
  pageStyle,
  pageTitleStyle,
  secondaryButtonStyle,
} from "./components/styles";

export const dynamic = "force-dynamic";

function parseJsonObject(value) {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
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

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function normalizeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return String(number);
}

function getBezelKey(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const width =
      value.widthMm ??
      value.width ??
      null;

    const height =
      value.heightMm ??
      value.height ??
      null;

    if (
      width !== null &&
      height !== null &&
      Number.isFinite(Number(width)) &&
      Number.isFinite(Number(height)) &&
      Number(width) !== Number(height)
    ) {
      return `${normalizeNumber(
        width
      )}x${normalizeNumber(height)}`;
    }

    value =
      value.name ??
      value.label ??
      value.size ??
      value.id ??
      "";
  }

  const text = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (!text) {
    return "";
  }

  const numbers =
    text.match(
      /\d+(?:\.\d+)?/g
    ) || [];

  if (numbers.length >= 2) {
    return `${normalizeNumber(
      numbers[0]
    )}x${normalizeNumber(
      numbers[1]
    )}`;
  }

  if (numbers.length === 1) {
    return normalizeNumber(
      numbers[0]
    );
  }

  return text
    .replace(/millimeters?/g, "")
    .replace(/mm/g, "")
    .replace(/round/g, "")
    .replace(/oval/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getMasterBezelOptionKey(
  option
) {
  return (
    getBezelKey(option?.name) ||
    getBezelKey(option?.slug)
  );
}

function getExistingProductBezelKeys({
  productBases,
  selectedProductBaseIds,
}) {
  const selectedIdSet =
    new Set(
      selectedProductBaseIds
    );

  const keys = new Set();

  for (const productBase of productBases) {
    if (
      !selectedIdSet.has(
        productBase.id
      )
    ) {
      continue;
    }

    for (
      const variant of
        productBase.variants || []
    ) {
      if (variant.bezelSize) {
        const key =
          getBezelKey(
            variant.bezelSize
          );

        if (key) {
          keys.add(key);
        }
      }

      const bezelSizes =
        parseJsonArray(
          variant.bezelSizesJson
        );

      for (const bezel of bezelSizes) {
        const key =
          getBezelKey(bezel);

        if (key) {
          keys.add(key);
        }
      }
    }
  }

  return keys;
}

function getSelectedBezelSizeSlugs({
  collection,
  productBases,
  selectedProductBaseIds,
  bezelSizeOptions,
}) {
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

  const bezelConfiguration =
    options.bezelSize &&
    typeof options.bezelSize ===
      "object" &&
    !Array.isArray(
      options.bezelSize
    )
      ? options.bezelSize
      : {};

  if (
    Array.isArray(
      bezelConfiguration.allowed
    )
  ) {
    const savedValues =
      bezelConfiguration.allowed.map(
        String
      );

    const savedSet =
      new Set(savedValues);

    const savedKeys =
      new Set(
        savedValues
          .map((value) =>
            getBezelKey(value)
          )
          .filter(Boolean)
      );

    return bezelSizeOptions
      .filter((option) => {
        if (
          savedSet.has(
            option.slug
          )
        ) {
          return true;
        }

        const optionKey =
          getMasterBezelOptionKey(
            option
          );

        return (
          optionKey &&
          savedKeys.has(
            optionKey
          )
        );
      })
      .map(
        (option) =>
          option.slug
      );
  }

  const existingBezelKeys =
    getExistingProductBezelKeys({
      productBases,
      selectedProductBaseIds,
    });

  if (
    existingBezelKeys.size === 0
  ) {
    return [];
  }

  return bezelSizeOptions
    .filter((option) => {
      const key =
        getMasterBezelOptionKey(
          option
        );

      return (
        key &&
        existingBezelKeys.has(key)
      );
    })
    .map(
      (option) =>
        option.slug
    );
}

function getChainOptionKey(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const directKey =
      value.id ??
      value.slug ??
      null;

    if (directKey) {
      return String(directKey)
        .trim()
        .toLowerCase();
    }

    value =
      value.name ??
      value.label ??
      value.title ??
      "";
  }

  const text = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (!text) {
    return "";
  }

  return text
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExistingProductChainOptionKeys({
  productBases,
  selectedProductBaseIds,
}) {
  const selectedIdSet =
    new Set(
      selectedProductBaseIds
    );

  const keys = new Set();

  for (const productBase of productBases) {
    if (
      !selectedIdSet.has(
        productBase.id
      )
    ) {
      continue;
    }

    for (
      const variant of
        productBase.variants || []
    ) {
      if (variant.chainOption) {
        const key =
          getChainOptionKey(
            variant.chainOption
          );

        if (key) {
          keys.add(key);
        }
      }

      const chainOptions =
        parseJsonArray(
          variant.chainOptionsJson
        );

      for (
        const chainOption of
          chainOptions
      ) {
        const key =
          getChainOptionKey(
            chainOption
          );

        if (key) {
          keys.add(key);
        }
      }
    }
  }

  return keys;
}

function getSelectedChainOptionSlugs({
  collection,
  productBases,
  selectedProductBaseIds,
  chainOptions,
}) {
  /*
   * ADMIN SOURCE OF TRUTH
   *
   * Once a chain assignment has been
   * saved in the Collection Editor,
   * it lives here:
   *
   * configuration.options.chain.allowed
   *
   * If that array exists, prefer it.
   */
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

  const chainConfiguration =
    options.chain &&
    typeof options.chain ===
      "object" &&
    !Array.isArray(
      options.chain
    )
      ? options.chain
      : {};

  if (
    Array.isArray(
      chainConfiguration.allowed
    )
  ) {
    const savedSet =
      new Set(
        chainConfiguration.allowed
          .map((value) =>
            String(value)
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

    return chainOptions
      .filter((option) =>
        savedSet.has(
          String(
            option.slug || ""
          )
            .trim()
            .toLowerCase()
        )
      )
      .map(
        (option) =>
          option.slug
      );
  }

  /*
   * INITIAL MIGRATION FALLBACK
   *
   * Nothing has been saved in Admin yet,
   * so derive the selections from the
   * currently assigned Product Bases.
   */
  const existingChainKeys =
    getExistingProductChainOptionKeys({
      productBases,
      selectedProductBaseIds,
    });

  if (
    existingChainKeys.size === 0
  ) {
    return [];
  }

  return chainOptions
    .filter((option) =>
      existingChainKeys.has(
        getChainOptionKey(
          option.slug
        )
      )
    )
    .map(
      (option) =>
        option.slug
    );
}

function getSelectedEngravingOptionSlugs({
  collection,
  engravingOptions,
}) {
  /*
   * ADMIN SOURCE OF TRUTH
   *
   * Once engraving methods are saved in
   * the Collection Editor, they live at:
   *
   * configuration.options.engraving.allowed
   */
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

  const engravingConfiguration =
    options.engraving &&
    typeof options.engraving ===
      "object" &&
    !Array.isArray(
      options.engraving
    )
      ? options.engraving
      : {};

  if (
    Array.isArray(
      engravingConfiguration.allowed
    )
  ) {
    const savedSet =
      new Set(
        engravingConfiguration.allowed
          .map((value) =>
            String(value)
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

    return engravingOptions
      .filter((option) =>
        savedSet.has(
          String(
            option.slug || ""
          )
            .trim()
            .toLowerCase()
        )
      )
      .map(
        (option) =>
          option.slug
      );
  }

  /*
   * INITIAL MIGRATION FALLBACK
   *
   * Existing collections did not have
   * collection-level engraving method
   * assignment before this Admin system.
   *
   * Default to all active master engraving
   * methods so current customer behavior is
   * preserved until the collection is saved.
   *
   * Product Base allowEngraving still controls
   * whether the selected physical product can
   * actually be engraved.
   */
  return engravingOptions.map(
    (option) =>
      option.slug
  );
}

export default async function EditCollectionPage({
  params,
}) {
  const { id } = await params;

  const [
    collection,
    productBases,
    inlayStyles,
    minerals,
    glowPowders,
    birthstones,
    bezelSizeOptions,
    chainOptions,
    memorialMaterialOptions,
    engravingOptions,
    hairPlacementOptions,
    decorativeAccentOptions,
    accentStyleOptions,
  ] = await Promise.all([
    prisma.collection.findUnique({
      where: {
        id,
      },

      include: {
        photos: {
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
        },

        productBases: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            productBaseId: true,
          },
        },

        inlayStyles: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            inlayStyleId: true,
          },
        },

        minerals: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            mineralId: true,
          },
        },

        glowPowders: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            glowPowderId: true,
          },
        },

        birthstones: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },

          select: {
            birthstoneId: true,
          },
        },

        pricingRules: {
          where: {
            category:
              "memorialMaterials",
            active: true,
          },

          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    }),

    prisma.productBase.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      include: {
        supplier: true,

        variants: {
          where: {
            active: true,
          },

          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
      },
    }),

    prisma.inlayStyle.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.mineral.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.glowPowder.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.birthstone.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          monthNumber: "asc",
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category: "bezel-size",
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category: "chain-option",
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
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
          sortOrder: "asc",
        },
        {
          name: "asc",
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
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "hair-placement",
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "decorative-accent",
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.configuratorOption.findMany({
      where: {
        category:
          "accent-style",
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const selectedProductBaseIds =
    collection.productBases.map(
      (assignment) =>
        assignment.productBaseId
    );

  const selectedInlayStyleIds =
    collection.inlayStyles.map(
      (assignment) =>
        assignment.inlayStyleId
    );

  const selectedMineralIds =
    collection.minerals.map(
      (assignment) =>
        assignment.mineralId
    );

  const selectedGlowPowderIds =
    collection.glowPowders.map(
      (assignment) =>
        assignment.glowPowderId
    );

  const selectedBirthstoneIds =
    collection.birthstones.map(
      (assignment) =>
        assignment.birthstoneId
    );

  const selectedBezelSizeSlugs =
    getSelectedBezelSizeSlugs({
      collection,
      productBases,
      selectedProductBaseIds,
      bezelSizeOptions,
    });

  const selectedChainOptionSlugs =
    getSelectedChainOptionSlugs({
      collection,
      productBases,
      selectedProductBaseIds,
      chainOptions,
    });

  const selectedEngravingOptionSlugs =
    getSelectedEngravingOptionSlugs({
      collection,
      engravingOptions,
    });

  return (
    <main style={pageStyle}>
      <div style={pageInnerStyle}>
        <div style={pageHeaderStyle}>
          <Link
            href="/admin/collections"
            style={{
              ...secondaryButtonStyle,
              minHeight: "42px",
              marginBottom: "20px",
            }}
          >
            ← Back to Collections
          </Link>

          <p style={eyebrowStyle}>
            Collection Management
          </p>

          <h1 style={pageTitleStyle}>
            Edit {collection.name}
          </h1>

          <p style={pageDescriptionStyle}>
            Update the collection details,
            pricing, images, product bases,
            inlay styles, minerals, glow
            powders, birthstones, bezel
            sizes, chain options, memorial
            materials, engraving options,
            hair placement, decorative
            accents, and accent styles
            available to customers.
          </p>
        </div>

        <CollectionEditor
          collection={collection}
          productBases={productBases}
          inlayStyles={inlayStyles}
          minerals={minerals}
          glowPowders={glowPowders}
          birthstones={birthstones}
          bezelSizeOptions={
            bezelSizeOptions
          }
          chainOptions={
            chainOptions
          }
          memorialMaterialOptions={
            memorialMaterialOptions
          }
          engravingOptions={
            engravingOptions
          }
          hairPlacementOptions={
            hairPlacementOptions
          }
          decorativeAccentOptions={
            decorativeAccentOptions
          }
          accentStyleOptions={
            accentStyleOptions
          }
          memorialMaterialRules={
            collection.pricingRules || []
          }
          selectedProductBaseIds={
            selectedProductBaseIds
          }
          selectedInlayStyleIds={
            selectedInlayStyleIds
          }
          selectedMineralIds={
            selectedMineralIds
          }
          selectedGlowPowderIds={
            selectedGlowPowderIds
          }
          selectedBirthstoneIds={
            selectedBirthstoneIds
          }
          selectedBezelSizeSlugs={
            selectedBezelSizeSlugs
          }
          selectedChainOptionSlugs={
            selectedChainOptionSlugs
          }
          selectedEngravingOptionSlugs={
            selectedEngravingOptionSlugs
          }
          updateAction={
            updateCollection
          }
          deleteAction={
            deleteCollection
          }
        />
      </div>
    </main>
  );
}