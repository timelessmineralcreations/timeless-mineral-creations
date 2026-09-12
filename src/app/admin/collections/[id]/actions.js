"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

function getUniqueIds(formData, fieldName) {
  return [
    ...new Set(
      formData
        .getAll(fieldName)
        .map((value) => String(value).trim())
        .filter(Boolean)
    ),
  ];
}

function getFiniteNumber(
  formData,
  fieldName,
  fallback
) {
  const value = Number(
    formData.get(fieldName)
  );

  return Number.isFinite(value)
    ? value
    : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return session;
}

async function validateSelectedIds({
  ids,
  model,
  errorMessage,
}) {
  if (ids.length === 0) {
    return;
  }

  const records = await model.findMany({
    where: {
      id: {
        in: ids,
      },
      active: true,
    },
    select: {
      id: true,
    },
  });

  if (records.length !== ids.length) {
    throw new Error(errorMessage);
  }
}

async function syncAssignments({
  transaction,
  modelName,
  collectionId,
  selectedIds,
  foreignKey,
  compoundKey,
}) {
  const model = transaction[modelName];

  await model.deleteMany({
    where: {
      collectionId,
      [foreignKey]: {
        notIn: selectedIds,
      },
    },
  });

  for (
    let index = 0;
    index < selectedIds.length;
    index += 1
  ) {
    const selectedId = selectedIds[index];

    await model.upsert({
      where: {
        [compoundKey]: {
          collectionId,
          [foreignKey]: selectedId,
        },
      },

      update: {
        active: true,
        sortOrder: index,
      },

      create: {
        collectionId,
        [foreignKey]: selectedId,
        active: true,
        sortOrder: index,
      },
    });
  }
}

export async function updateCollection(formData) {
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const productType = String(
    formData.get("productType") || "Ring"
  ).trim();

  const startingPrice = Number(
    formData.get("startingPrice") || 0
  );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const cardImage = String(
    formData.get("cardImage") || ""
  ).trim();

  const heroImage = String(
    formData.get("heroImage") || ""
  ).trim();

  const cardImageScale = clamp(
    getFiniteNumber(
      formData,
      "cardImageScale",
      1
    ),
    0.2,
    4
  );

  const cardImageX = clamp(
    getFiniteNumber(
      formData,
      "cardImageX",
      0
    ),
    -100,
    100
  );

  const cardImageY = clamp(
    getFiniteNumber(
      formData,
      "cardImageY",
      0
    ),
    -100,
    100
  );

  const heroImageScale = clamp(
    getFiniteNumber(
      formData,
      "heroImageScale",
      1
    ),
    0.2,
    4
  );

  const heroImageX = clamp(
    getFiniteNumber(
      formData,
      "heroImageX",
      0
    ),
    -100,
    100
  );

  const heroImageY = clamp(
    getFiniteNumber(
      formData,
      "heroImageY",
      0
    ),
    -100,
    100
  );

  const seoTitle = String(
    formData.get("seoTitle") || ""
  ).trim();

  const seoDescription = String(
    formData.get("seoDescription") || ""
  ).trim();

  const published =
    formData.get("published") === "on";

  const comingSoon =
    formData.get("comingSoon") === "on";

  const featured =
    formData.get("featured") === "on";

  const selectedProductBaseIds =
    getUniqueIds(
      formData,
      "productBaseIds"
    );

  const selectedInlayStyleIds =
    getUniqueIds(
      formData,
      "inlayStyleIds"
    );

  const selectedMineralIds =
    getUniqueIds(
      formData,
      "mineralIds"
    );

  const selectedGlowPowderIds =
    getUniqueIds(
      formData,
      "glowPowderIds"
    );

  const selectedBirthstoneIds =
    getUniqueIds(
      formData,
      "birthstoneIds"
    );

  const showBirthstoneGuide =
    formData.get("showBirthstoneGuide") ===
    "on";

  const selectedBezelSizeSlugs =
    getUniqueIds(
      formData,
      "bezelSizeSlugs"
    );

  const selectedChainOptionSlugs =
    getUniqueIds(
      formData,
      "chainOptionSlugs"
    );

  const selectedEngravingOptionSlugs =
    getUniqueIds(
      formData,
      "engravingOptionSlugs"
    );

  const selectedMemorialMaterialIds =
    getUniqueIds(
      formData,
      "memorialMaterialIds"
    );

  const selectedHairPlacementIds =
    getUniqueIds(
      formData,
      "hairPlacementIds"
    );

  const selectedAccentMaterialIds =
    getUniqueIds(
      formData,
      "accentMaterialIds"
    );

  const selectedAccentStyleIds =
    getUniqueIds(
      formData,
      "accentStyleIds"
    );

  if (!id) {
    throw new Error(
      "Collection ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Collection name is required."
    );
  }

  if (!description) {
    throw new Error(
      "Collection description is required."
    );
  }

  if (
    !Number.isFinite(startingPrice) ||
    startingPrice < 0
  ) {
    throw new Error(
      "Starting price must be a valid positive number."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  if (!slug) {
    throw new Error(
      "A valid collection URL slug could not be created."
    );
  }

  const duplicateSlug =
    await prisma.collection.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateSlug) {
    throw new Error(
      "That collection URL already exists. Please use a different slug."
    );
  }

  const existingCollection =
    await prisma.collection.findUnique({
      where: {
        id,
      },

      select: {
        configurationJson: true,

        pricingRules: {
          where: {
            category:
              "memorialMaterials",
            active: true,
          },

          select: {
            optionKey: true,
            label: true,
            amountCents: true,
          },
        },
      },
    });

  if (!existingCollection) {
    throw new Error(
      "Collection could not be found."
    );
  }

  const existingMemorialRuleMap =
    new Map(
      (
        existingCollection.pricingRules ||
        []
      ).map((rule) => [
        rule.optionKey,
        rule,
      ])
    );

  const activeMemorialMaterials =
    selectedMemorialMaterialIds.length > 0
      ? await prisma.configuratorOption.findMany({
        where: {
          category:
            "memorial-material",
          active: true,

          slug: {
            in: selectedMemorialMaterialIds,
          },
        },

        select: {
          slug: true,
          name: true,
        },
      })
      : [];

  const activeMemorialMaterialMap =
    new Map(
      activeMemorialMaterials.map(
        (option) => [
          option.slug,
          option,
        ]
      )
    );

  const invalidMemorialMaterialIds =
    selectedMemorialMaterialIds.filter(
      (optionKey) =>
        !activeMemorialMaterialMap.has(
          optionKey
        ) &&
        !existingMemorialRuleMap.has(
          optionKey
        )
    );

  if (
    invalidMemorialMaterialIds.length > 0
  ) {
    throw new Error(
      "One or more selected memorial materials are no longer active or do not exist."
    );
  }

  await Promise.all([
    validateSelectedIds({
      ids: selectedProductBaseIds,
      model: prisma.productBase,
      errorMessage:
        "One or more selected Product Bases are no longer active or do not exist.",
    }),

    validateSelectedIds({
      ids: selectedInlayStyleIds,
      model: prisma.inlayStyle,
      errorMessage:
        "One or more selected inlay styles are no longer active or do not exist.",
    }),

    validateSelectedIds({
      ids: selectedMineralIds,
      model: prisma.mineral,
      errorMessage:
        "One or more selected minerals are no longer active or do not exist.",
    }),

    validateSelectedIds({
      ids: selectedGlowPowderIds,
      model: prisma.glowPowder,
      errorMessage:
        "One or more selected glow powders are no longer active or do not exist.",
    }),

    validateSelectedIds({
      ids: selectedBirthstoneIds,
      model: prisma.birthstone,
      errorMessage:
        "One or more selected birthstones are no longer active or do not exist.",
    }),

    (async () => {
      if (
        selectedBezelSizeSlugs.length === 0
      ) {
        return;
      }

      const validBezelSizes =
        await prisma.configuratorOption.findMany({
          where: {
            category: "bezel-size",
            active: true,

            slug: {
              in: selectedBezelSizeSlugs,
            },
          },

          select: {
            slug: true,
          },
        });

      if (
        validBezelSizes.length !==
        selectedBezelSizeSlugs.length
      ) {
        throw new Error(
          "One or more selected bezel sizes are no longer active or do not exist."
        );
      }
    })(),

    (async () => {
      if (
        selectedChainOptionSlugs.length === 0
      ) {
        return;
      }

      const validChainOptions =
        await prisma.configuratorOption.findMany({
          where: {
            category: "chain-option",
            active: true,

            slug: {
              in: selectedChainOptionSlugs,
            },
          },

          select: {
            slug: true,
          },
        });

      if (
        validChainOptions.length !==
        selectedChainOptionSlugs.length
      ) {
        throw new Error(
          "One or more selected chain options are no longer active or do not exist."
        );
      }
    })(),

    (async () => {
      if (
        selectedEngravingOptionSlugs.length === 0
      ) {
        return;
      }

      const validEngravingOptions =
        await prisma.configuratorOption.findMany({
          where: {
            category: "engraving-option",
            active: true,

            slug: {
              in: selectedEngravingOptionSlugs,
            },
          },

          select: {
            slug: true,
          },
        });

      if (
        validEngravingOptions.length !==
        selectedEngravingOptionSlugs.length
      ) {
        throw new Error(
          "One or more selected engraving options are no longer active or do not exist."
        );
      }
    })(),
  ]);

  const existingConfiguration =
    parseJsonObject(
      existingCollection.configurationJson
    );

  const existingOptions =
    existingConfiguration.options &&
      typeof existingConfiguration.options ===
      "object" &&
      !Array.isArray(existingConfiguration.options)
      ? existingConfiguration.options
      : {};

  const existingHair =
    existingOptions.hair &&
      typeof existingOptions.hair === "object" &&
      !Array.isArray(existingOptions.hair)
      ? existingOptions.hair
      : {};

  const existingBezelSize =
    existingOptions.bezelSize &&
      typeof existingOptions.bezelSize ===
      "object" &&
      !Array.isArray(
        existingOptions.bezelSize
      )
      ? existingOptions.bezelSize
      : {};

  const existingChain =
    existingOptions.chain &&
      typeof existingOptions.chain ===
      "object" &&
      !Array.isArray(
        existingOptions.chain
      )
      ? existingOptions.chain
      : {};

  const existingEngraving =
    existingOptions.engraving &&
      typeof existingOptions.engraving ===
      "object" &&
      !Array.isArray(
        existingOptions.engraving
      )
      ? existingOptions.engraving
      : {};

  const existingBirthstones =
    existingOptions.birthstones &&
      typeof existingOptions.birthstones ===
      "object" &&
      !Array.isArray(
        existingOptions.birthstones
      )
      ? existingOptions.birthstones
      : {};

  const existingDecorativeAccents =
    existingOptions.decorativeAccents &&
      typeof existingOptions.decorativeAccents ===
      "object" &&
      !Array.isArray(
        existingOptions.decorativeAccents
      )
      ? existingOptions.decorativeAccents
      : {};

  const nextConfiguration = {
    ...existingConfiguration,

    options: {
      ...existingOptions,

      bezelSize: {
        ...existingBezelSize,

        allowed:
          selectedBezelSizeSlugs,
      },

      chain: {
        ...existingChain,

        allowed:
          selectedChainOptionSlugs,
      },

      engraving: {
        ...existingEngraving,

        allowed:
          selectedEngravingOptionSlugs,
      },

      birthstones: {
        ...existingBirthstones,

        showGuide:
          showBirthstoneGuide,
      },

      hair: {
        ...existingHair,
        allowedStyles:
          selectedHairPlacementIds,
      },

      decorativeAccents: {
        ...existingDecorativeAccents,

        allowed:
          selectedAccentMaterialIds,

        allowedStyles:
          selectedAccentStyleIds,
      },
    },
  };

  await prisma.$transaction(
    async (transaction) => {
      await transaction.collection.update({
        where: {
          id,
        },

        data: {
          name,
          slug,
          description,

          productType:
            productType || "Ring",

          startingPrice,

          sortOrder:
            Number.isFinite(sortOrder)
              ? sortOrder
              : 0,

          cardImage:
            cardImage || null,

          heroImage:
            heroImage || null,

          cardImageScale,
          cardImageX,
          cardImageY,

          heroImageScale,
          heroImageX,
          heroImageY,

          seoTitle:
            seoTitle || null,

          seoDescription:
            seoDescription || null,

          published,
          comingSoon,
          featured,

          configurationJson:
            JSON.stringify(
              nextConfiguration
            ),
        },
      });

      await syncAssignments({
        transaction,
        modelName:
          "collectionProductBase",
        collectionId: id,
        selectedIds:
          selectedProductBaseIds,
        foreignKey: "productBaseId",
        compoundKey:
          "collectionId_productBaseId",
      });

      await transaction.collectionPricingRule.deleteMany({
        where: {
          collectionId: id,
          category: "memorialMaterials",
        },
      });

      for (
        let index = 0;
        index <
        selectedMemorialMaterialIds.length;
        index += 1
      ) {
        const optionKey =
          selectedMemorialMaterialIds[index];

        const masterMaterial =
          activeMemorialMaterialMap.get(
            optionKey
          );

        const existingRule =
          existingMemorialRuleMap.get(
            optionKey
          );

        const label =
          masterMaterial?.name ||
          existingRule?.label ||
          optionKey;

        const priceDollars = Number(
          formData.get(
            `memorialMaterialPrice_${optionKey}`
          ) || 0
        );

        const amountCents = Math.round(
          priceDollars * 100
        );

        await transaction.collectionPricingRule.create({
          data: {
            collectionId: id,
            category:
              "memorialMaterials",
            optionKey,
            label,
            amountCents:
              Number.isFinite(
                amountCents
              )
                ? amountCents
                : 0,
            active: true,
            sortOrder: index,
          },
        });
      }

      await syncAssignments({
        transaction,
        modelName:
          "collectionInlayStyle",
        collectionId: id,
        selectedIds:
          selectedInlayStyleIds,
        foreignKey: "inlayStyleId",
        compoundKey:
          "collectionId_inlayStyleId",
      });

      await syncAssignments({
        transaction,
        modelName:
          "collectionMineral",
        collectionId: id,
        selectedIds:
          selectedMineralIds,
        foreignKey: "mineralId",
        compoundKey:
          "collectionId_mineralId",
      });

      await syncAssignments({
        transaction,
        modelName:
          "collectionGlowPowder",
        collectionId: id,
        selectedIds:
          selectedGlowPowderIds,
        foreignKey: "glowPowderId",
        compoundKey:
          "collectionId_glowPowderId",
      });

      await syncAssignments({
        transaction,
        modelName:
          "collectionBirthstone",
        collectionId: id,
        selectedIds:
          selectedBirthstoneIds,
        foreignKey: "birthstoneId",
        compoundKey:
          "collectionId_birthstoneId",
      });
    }
  );

  revalidatePath("/collections");

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    `/admin/collections/${id}`
  );

  revalidatePath(
    `/collections/${slug}`
  );

  redirect("/admin/collections");
}

export async function deleteCollection(
  formData
) {
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Collection ID is missing."
    );
  }

  await prisma.collection.delete({
    where: {
      id,
    },
  });

  revalidatePath(
    "/admin/collections"
  );

  redirect("/admin/collections");
}

function getTrimmedValue(
  formData,
  fieldName
) {
  return String(
    formData.get(fieldName) || ""
  ).trim();
}

function getOptionalNumber(
  formData,
  fieldName
) {
  const rawValue = getTrimmedValue(
    formData,
    fieldName
  );

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value)
    ? value
    : null;
}

function getJsonArray(
  formData,
  fieldName
) {
  const values = [
    ...new Set(
      formData
        .getAll(fieldName)
        .map((value) =>
          String(value).trim()
        )
        .filter(Boolean)
    ),
  ];

  return values.length > 0
    ? JSON.stringify(values)
    : null;
}

function getCommaSeparatedJson(
  formData,
  fieldName
) {
  const values = getTrimmedValue(
    formData,
    fieldName
  )
    .split(",")
    .map((value) =>
      value.trim()
    )
    .filter(Boolean);

  const uniqueValues = [
    ...new Set(values),
  ];

  return uniqueValues.length > 0
    ? JSON.stringify(uniqueValues)
    : null;
}

async function getPhotoCollectionSlug(
  collectionId
) {
  const collection =
    await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },

      select: {
        slug: true,
      },
    });

  return collection?.slug || null;
}

function revalidateCollectionPhotoPaths({
  collectionId,
  slug,
}) {
  revalidatePath(
    `/admin/collections/${collectionId}`
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath("/collections");

  if (slug) {
    revalidatePath(
      `/collections/${slug}`
    );
  }
}

export async function createCollectionPhoto(
  formData
) {
  await requireAdmin();

  const collectionId =
    getTrimmedValue(
      formData,
      "collectionId"
    );

  const imageUrl =
    getTrimmedValue(
      formData,
      "imageUrl"
    );

  if (!collectionId) {
    throw new Error(
      "Collection ID is missing."
    );
  }

  if (!imageUrl) {
    throw new Error(
      "An image path is required."
    );
  }

  const collection =
    await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },

      select: {
        id: true,
        slug: true,

        _count: {
          select: {
            photos: true,
          },
        },
      },
    });

  if (!collection) {
    throw new Error(
      "Collection could not be found."
    );
  }

  const featured =
    formData.get("featured") === "on";

  await prisma.$transaction(
    async (transaction) => {
      if (featured) {
        await transaction.collectionPhoto.updateMany({
          where: {
            collectionId,
          },

          data: {
            featured: false,
          },
        });
      }

      await transaction.collectionPhoto.create({
        data: {
          collectionId,
          imageUrl,

          altText:
            getTrimmedValue(
              formData,
              "altText"
            ) || null,

          caption:
            getTrimmedValue(
              formData,
              "caption"
            ) || null,

          material:
            getTrimmedValue(
              formData,
              "material"
            ) || null,

          finish:
            getTrimmedValue(
              formData,
              "finish"
            ) || null,

          coreId:
            getTrimmedValue(
              formData,
              "coreId"
            ) || null,

          widthMm:
            getOptionalNumber(
              formData,
              "widthMm"
            ),

          inlayStyleId:
            getTrimmedValue(
              formData,
              "inlayStyleId"
            ) || null,

          mineralIdsJson:
            getJsonArray(
              formData,
              "mineralIds"
            ),

          memorialMaterialIdsJson:
            getCommaSeparatedJson(
              formData,
              "memorialMaterials"
            ),

          accentMaterialIdsJson:
            getCommaSeparatedJson(
              formData,
              "accentMaterials"
            ),

          glowPowderIdsJson:
            getJsonArray(
              formData,
              "glowPowderIds"
            ),

          tagsJson:
            getCommaSeparatedJson(
              formData,
              "tags"
            ),

          sortOrder:
            collection._count.photos,

          featured,

          active:
            formData.get("active") ===
            "on",
        },
      });
    }
  );

  revalidateCollectionPhotoPaths({
    collectionId,
    slug: collection.slug,
  });
}

export async function updateCollectionPhoto(
  formData
) {
  await requireAdmin();

  const photoId =
    getTrimmedValue(
      formData,
      "photoId"
    );

  const collectionId =
    getTrimmedValue(
      formData,
      "collectionId"
    );

  const imageUrl =
    getTrimmedValue(
      formData,
      "imageUrl"
    );

  if (!photoId) {
    throw new Error(
      "Photo ID is missing."
    );
  }

  if (!collectionId) {
    throw new Error(
      "Collection ID is missing."
    );
  }

  if (!imageUrl) {
    throw new Error(
      "An image path is required."
    );
  }

  const existingPhoto =
    await prisma.collectionPhoto.findFirst({
      where: {
        id: photoId,
        collectionId,
      },

      select: {
        id: true,
      },
    });

  if (!existingPhoto) {
    throw new Error(
      "That collection photo could not be found."
    );
  }

  const featured =
    formData.get("featured") === "on";

  const slug =
    await getPhotoCollectionSlug(
      collectionId
    );

  await prisma.$transaction(
    async (transaction) => {
      if (featured) {
        await transaction.collectionPhoto.updateMany({
          where: {
            collectionId,

            NOT: {
              id: photoId,
            },
          },

          data: {
            featured: false,
          },
        });
      }

      await transaction.collectionPhoto.update({
        where: {
          id: photoId,
        },

        data: {
          imageUrl,

          altText:
            getTrimmedValue(
              formData,
              "altText"
            ) || null,

          caption:
            getTrimmedValue(
              formData,
              "caption"
            ) || null,

          material:
            getTrimmedValue(
              formData,
              "material"
            ) || null,

          finish:
            getTrimmedValue(
              formData,
              "finish"
            ) || null,

          coreId:
            getTrimmedValue(
              formData,
              "coreId"
            ) || null,

          widthMm:
            getOptionalNumber(
              formData,
              "widthMm"
            ),

          inlayStyleId:
            getTrimmedValue(
              formData,
              "inlayStyleId"
            ) || null,

          mineralIdsJson:
            getJsonArray(
              formData,
              "mineralIds"
            ),

          memorialMaterialIdsJson:
            getCommaSeparatedJson(
              formData,
              "memorialMaterials"
            ),

          accentMaterialIdsJson:
            getCommaSeparatedJson(
              formData,
              "accentMaterials"
            ),

          glowPowderIdsJson:
            getJsonArray(
              formData,
              "glowPowderIds"
            ),

          tagsJson:
            getCommaSeparatedJson(
              formData,
              "tags"
            ),

          sortOrder:
            getFiniteNumber(
              formData,
              "sortOrder",
              0
            ),

          featured,

          active:
            formData.get("active") ===
            "on",
        },
      });
    }
  );

  revalidateCollectionPhotoPaths({
    collectionId,
    slug,
  });
}

export async function deleteCollectionPhoto(
  formData
) {
  await requireAdmin();

  const photoId =
    getTrimmedValue(
      formData,
      "photoId"
    );

  const collectionId =
    getTrimmedValue(
      formData,
      "collectionId"
    );

  if (
    !photoId ||
    !collectionId
  ) {
    throw new Error(
      "Photo information is missing."
    );
  }

  const slug =
    await getPhotoCollectionSlug(
      collectionId
    );

  await prisma.collectionPhoto.deleteMany({
    where: {
      id: photoId,
      collectionId,
    },
  });

  revalidateCollectionPhotoPaths({
    collectionId,
    slug,
  });
}