import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  inlayStyles as legacyInlayStyles,
} from "@/data/inlayStyles";
import ChannelBuilder from "./ChannelBuilder";

export const dynamic = "force-dynamic";

const accentMaterialOptions = [
  {
    id: "goldFoil",
    name: "Gold Foil",
  },
  {
    id: "silverFoil",
    name: "Silver Foil",
  },
];

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeParseJson(
  value,
  fallback = {}
) {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : fallback;
  } catch {
    return fallback;
  }
}

function getNumber(
  formData,
  name,
  fallback = 0
) {
  const value = Number(
    formData.get(name)
  );

  return Number.isFinite(value)
    ? value
    : fallback;
}

function getChecked(
  formData,
  name
) {
  return (
    formData.get(name) === "on"
  );
}

function getList(
  formData,
  name
) {
  return formData
    .getAll(name)
    .map((value) =>
      String(value)
    )
    .filter(Boolean);
}

function parseChannelsJson(
  value,
  fallback = []
) {
  const raw = String(
    value || ""
  ).trim();

  if (!raw) {
    return fallback;
  }

  try {
    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error(
        "Channel / section rules must be a JSON array."
      );
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `Channel / section rules are not valid JSON. ${error.message}`
    );
  }
}

function collectMemorialMaterialKeys(
  value,
  target
) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMemorialMaterialKeys(
        item,
        target
      );
    }

    return;
  }

  if (typeof value !== "object") {
    return;
  }

  const memorialMaterials =
    value.memorialMaterials;

  if (
    memorialMaterials &&
    typeof memorialMaterials === "object" &&
    !Array.isArray(
      memorialMaterials
    )
  ) {
    for (
      const listName of [
        "allowed",
        "required",
      ]
    ) {
      const values =
        memorialMaterials[listName];

      if (!Array.isArray(values)) {
        continue;
      }

      for (const item of values) {
        const key = String(
          item || ""
        ).trim();

        if (key) {
          target.add(key);
        }
      }
    }
  }

  for (const child of Object.values(value)) {
    collectMemorialMaterialKeys(
      child,
      target
    );
  }
}

function formatMemorialMaterialKey(
  value
) {
  const text = String(
    value || ""
  ).trim();

  if (!text) {
    return "Unknown Material";
  }

  return text
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2"
    )
    .replace(/[-_]+/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

async function updateInlayStyle(
  formData
) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedSlug =
    String(
      formData.get("slug") || ""
    ).trim();

  const shortDescription =
    String(
      formData.get(
        "shortDescription"
      ) || ""
    ).trim();

  const description =
    String(
      formData.get(
        "description"
      ) || ""
    ).trim();

  const imageUrl =
    String(
      formData.get("imageUrl") ||
        ""
    ).trim();

  const active =
    formData.get("active") ===
    "on";

  const featured =
    formData.get("featured") ===
    "on";

  const sortOrder = Number(
    formData.get("sortOrder") ||
      0
  );

  if (!id) {
    throw new Error(
      "Inlay style ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Inlay style name is required."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  if (!slug) {
    throw new Error(
      "A valid slug could not be created."
    );
  }

  const duplicateStyle =
    await prisma.inlayStyle.findFirst(
      {
        where: {
          slug,

          NOT: {
            id,
          },
        },

        select: {
          id: true,
        },
      }
    );

  if (duplicateStyle) {
    throw new Error(
      "An inlay style with that URL slug already exists."
    );
  }

  const existingStyle =
    await prisma.inlayStyle.findUnique(
      {
        where: {
          id,
        },

        select: {
          slug: true,
          configurationJson: true,
        },
      }
    );

  const existingConfiguration =
    safeParseJson(
      existingStyle
        ?.configurationJson,
      {}
    );

  const legacyStyle =
    legacyInlayStyles.find(
      (style) =>
        style.id ===
        (existingStyle?.slug ||
          slug)
    ) ||
    legacyInlayStyles.find(
      (style) =>
        style.id === slug
    ) ||
    null;

  const fallbackChannels =
    existingConfiguration
      .channels ||
    legacyStyle?.channels ||
    [];

  const channels =
    parseChannelsJson(
      formData.get(
        "channelsJson"
      ),
      fallbackChannels
    );

  /*
   * TEMPORARY LEGACY PRESERVATION
   *
   * Engraving is no longer editable
   * from Inlay Styles.
   *
   * Keep the existing hidden rule
   * temporarily so currently working
   * customer configurators do not lose
   * engraving before the new Product
   * Base + Engraving Options system is
   * connected.
   *
   * We will remove this legacy data
   * after the new engraving system is
   * live.
   */
  const legacyEngravingConfig =
    existingConfiguration
      .engraving ||
    legacyStyle?.engraving ||
    null;

  const memorialMaterialsEnabled =
    getChecked(
      formData,
      "memorialMaterialsEnabled"
    );

  const mineralsEnabled =
    getChecked(
      formData,
      "mineralsEnabled"
    );

  const accentMaterialsEnabled =
    getChecked(
      formData,
      "accentMaterialsEnabled"
    );

  const glowEnabled =
    getChecked(
      formData,
      "glowEnabled"
    );

  const specialRequestEnabled =
    getChecked(
      formData,
      "specialRequestEnabled"
    );

  const selectedMemorialMaterialAllowed =
    memorialMaterialsEnabled
      ? getList(
          formData,
          "memorialMaterialAllowed"
        )
      : [];

  const selectedMemorialMaterialRequired =
    getList(
      formData,
      "memorialMaterialRequired"
    );

  /*
   * MASTER MEMORIAL MATERIAL VALIDATION
   *
   * New memorial material selections must
   * exist in the active master catalog.
   *
   * Existing legacy/inactive keys are allowed
   * to remain so saving an older inlay style
   * does not silently destroy working rules.
   */
  const preservedMemorialMaterialKeys =
    new Set();

  collectMemorialMaterialKeys(
    existingConfiguration,
    preservedMemorialMaterialKeys
  );

  collectMemorialMaterialKeys(
    legacyStyle,
    preservedMemorialMaterialKeys
  );

  const submittedMemorialMaterialKeys =
    [
      ...new Set([
        ...selectedMemorialMaterialAllowed,
        ...selectedMemorialMaterialRequired,
      ]),
    ];

  const newMemorialMaterialKeys =
    submittedMemorialMaterialKeys.filter(
      (key) =>
        !preservedMemorialMaterialKeys.has(
          key
        )
    );

  if (
    newMemorialMaterialKeys.length > 0
  ) {
    const validMasterMaterials =
      await prisma.configuratorOption.findMany({
        where: {
          category:
            "memorial-material",
          active: true,

          slug: {
            in: newMemorialMaterialKeys,
          },
        },

        select: {
          slug: true,
        },
      });

    if (
      validMasterMaterials.length !==
      newMemorialMaterialKeys.length
    ) {
      throw new Error(
        "One or more selected memorial materials are no longer active or do not exist in the Memorial Materials master catalog."
      );
    }
  }

  const configuration = {
    memorialMaterials: {
      enabled:
        memorialMaterialsEnabled,

      allowed:
        selectedMemorialMaterialAllowed,

      min:
        memorialMaterialsEnabled
          ? getNumber(
              formData,
              "memorialMaterialsMin",
              0
            )
          : 0,

      max:
        memorialMaterialsEnabled
          ? getNumber(
              formData,
              "memorialMaterialsMax",
              1
            )
          : 0,

      locked: getChecked(
        formData,
        "memorialMaterialsLocked"
      ),

      required:
        selectedMemorialMaterialRequired,

      separateSides:
        getChecked(
          formData,
          "memorialMaterialsSeparateSides"
        ),

      separateChannels:
        getChecked(
          formData,
          "memorialMaterialsSeparateChannels"
        ),

      hairChannel:
        getChecked(
          formData,
          "memorialMaterialsHairChannel"
        ),
    },

    minerals: {
      enabled:
        mineralsEnabled,

      min: mineralsEnabled
        ? getNumber(
            formData,
            "mineralsMin",
            0
          )
        : 0,

      max: mineralsEnabled
        ? getNumber(
            formData,
            "mineralsMax",
            1
          )
        : 0,

      separateChannels:
        getChecked(
          formData,
          "mineralsSeparateChannels"
        ),
    },

    accentMaterials: {
      enabled:
        accentMaterialsEnabled,

      allowed:
        accentMaterialsEnabled
          ? getList(
              formData,
              "accentMaterialAllowed"
            )
          : [],

      min:
        accentMaterialsEnabled
          ? getNumber(
              formData,
              "accentMaterialsMin",
              0
            )
          : 0,

      max:
        accentMaterialsEnabled
          ? getNumber(
              formData,
              "accentMaterialsMax",
              1
            )
          : 0,
    },

    glow: {
      enabled:
        glowEnabled,

      required:
        glowEnabled &&
        getChecked(
          formData,
          "glowRequired"
        ),

      max: glowEnabled
        ? getNumber(
            formData,
            "glowMax",
            1
          )
        : 0,
    },

    specialRequest: {
      enabled:
        specialRequestEnabled,

      requiresApproval:
        specialRequestEnabled &&
        getChecked(
          formData,
          "specialRequestRequiresApproval"
        ),
    },

    /*
     * Temporary only.
     * Remove after customer
     * configurators use Product Base
     * engraving permissions.
     */
    ...(legacyEngravingConfig
      ? {
          engraving:
            legacyEngravingConfig,
        }
      : {}),

    ...(channels.length > 0
      ? {
          channels,
        }
      : {}),
  };

  await prisma.inlayStyle.update({
    where: {
      id,
    },

    data: {
      name,
      slug,

      shortDescription:
        shortDescription ||
        null,

      description:
        description || null,

      imageUrl:
        imageUrl || null,

      active,
      featured,

      sortOrder:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,

      configurationJson:
        JSON.stringify(
          configuration
        ),
    },
  });

  revalidatePath(
    "/admin/inlay-styles"
  );

  revalidatePath(
    `/admin/inlay-styles/${id}`
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );

  redirect(
    `/admin/inlay-styles/${id}`
  );
}

async function deleteInlayStyle(
  formData
) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Inlay style ID is missing."
    );
  }

  await prisma.inlayStyle.delete(
    {
      where: {
        id,
      },
    }
  );

  revalidatePath(
    "/admin/inlay-styles"
  );

  redirect(
    "/admin/inlay-styles"
  );
}

export default async function EditInlayStylePage({
  params,
}) {
  const { id } =
    await params;

  const [
    inlayStyle,
    activeMemorialMaterialOptions,
  ] = await Promise.all([
    prisma.inlayStyle.findUnique({
      where: {
        id,
      },
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

      select: {
        slug: true,
        name: true,
      },
    }),
  ]);

  if (!inlayStyle) {
    notFound();
  }

  /*
   * DATABASE CONFIGURATION
   */
  const databaseConfiguration =
    safeParseJson(
      inlayStyle
        .configurationJson,
      {}
    );

  /*
   * LEGACY FALLBACK
   */
  const legacyStyle =
    legacyInlayStyles.find(
      (style) =>
        style.id ===
        inlayStyle.slug
    ) || null;

  const configuration =
    inlayStyle
      .configurationJson
      ? databaseConfiguration
      : legacyStyle || {};

  const memorialConfig =
    configuration
      .memorialMaterials ||
    {};

  const mineralConfig =
    configuration.minerals ||
    {};

  const accentConfig =
    configuration
      .accentMaterials ||
    {};

  const glowConfig =
    configuration.glow ||
    {};

  const specialRequestConfig =
    configuration
      .specialRequest ||
    {};

  const channels =
    configuration.channels ||
    [];

  const allowedMemorialMaterials =
    new Set(
      memorialConfig.allowed ||
        []
    );

  const requiredMemorialMaterials =
    new Set(
      memorialConfig.required ||
        []
    );

  /*
   * ACTIVE MASTER OPTIONS + LEGACY SAFETY
   *
   * Active options come from Admin →
   * Memorial Materials.
   *
   * If this inlay style still references an
   * inactive/legacy material such as Fabric,
   * keep that key visible so a normal save
   * does not erase it.
   */
  const activeMemorialMaterialIds =
    new Set(
      activeMemorialMaterialOptions.map(
        (option) => option.slug
      )
    );

  const referencedMemorialMaterialIds =
    new Set([
      ...allowedMemorialMaterials,
      ...requiredMemorialMaterials,
    ]);

  const legacyMemorialMaterialOptions =
    [
      ...referencedMemorialMaterialIds,
    ]
      .filter(
        (key) =>
          !activeMemorialMaterialIds.has(
            key
          )
      )
      .map((key) => ({
        id: key,
        name: `${formatMemorialMaterialKey(
          key
        )} (Inactive in Master)`,
      }));

  const memorialMaterialOptions = [
    ...activeMemorialMaterialOptions.map(
      (option) => ({
        id: option.slug,
        name: option.name,
      })
    ),

    ...legacyMemorialMaterialOptions,
  ];

  const allowedAccentMaterials =
    new Set(
      accentConfig.allowed ||
        []
    );

  return (
    <main
      style={{
        padding:
          "32px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom:
              "28px",
          }}
        >
          <Link
            href="/admin/inlay-styles"
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              color: "#d9b56d",
              textDecoration:
                "none",
              fontWeight: "850",
              marginBottom:
                "18px",
            }}
          >
            ← Back to Inlay
            Styles
          </Link>

          <p
            style={{
              margin:
                "0 0 8px",
              color: "#d9b56d",
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing:
                "0.12em",
              textTransform:
                "uppercase",
            }}
          >
            Product
            Configuration
          </p>

          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            Edit{" "}
            {inlayStyle.name}
          </h1>

          <p
            style={{
              margin:
                "12px 0 0",
              color: "#aab6b1",
              maxWidth:
                "760px",
              lineHeight: 1.65,
            }}
          >
            Control the
            customer-facing design
            information and the
            rules that determine
            which memorial
            materials, minerals,
            accents, glow powders,
            and other options are
            available.
          </p>
        </div>

        <form
          action={
            updateInlayStyle
          }
        >
          <input
            type="hidden"
            name="id"
            value={
              inlayStyle.id
            }
          />

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Style Information"
              description="Edit the name, URL slug, short description, and full customer-facing description."
            >
              <div
                style={
                  twoColumnGridStyle
                }
              >
                <Field
                  label="Inlay Style Name"
                  required
                >
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={
                      inlayStyle.name
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field
                  label="URL Slug"
                  helpText={`Current slug: ${inlayStyle.slug}`}
                >
                  <input
                    name="slug"
                    type="text"
                    defaultValue={
                      inlayStyle.slug
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>

              <Field
                label="Short Description"
                helpText="Used beneath the design name in the customer configurator."
              >
                <input
                  name="shortDescription"
                  type="text"
                  defaultValue={
                    inlayStyle
                      .shortDescription ||
                    legacyStyle
                      ?.shortDescription ||
                    ""
                  }
                  style={
                    inputStyle
                  }
                />
              </Field>

              <Field
                label="Description"
              >
                <textarea
                  name="description"
                  rows={8}
                  defaultValue={
                    inlayStyle
                      .description ||
                    legacyStyle
                      ?.description ||
                    ""
                  }
                  style={{
                    ...inputStyle,
                    minHeight:
                      "180px",
                    resize:
                      "vertical",
                    lineHeight:
                      1.6,
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Memorial & Keepsake Materials"
              description="Choose which customer-supplied memorial materials this design accepts. Active choices come from Admin → Memorial Materials."
            >
              <CheckboxField
                name="memorialMaterialsEnabled"
                label="Enable Memorial Materials"
                description="Show memorial material choices when this design is selected."
                defaultChecked={
                  memorialConfig
                    .enabled ===
                  true
                }
              />

              {memorialMaterialOptions.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "14px",
                    border:
                      "1px solid rgba(255,255,255,.1)",
                    borderRadius:
                      "12px",
                    color:
                      "#98a49f",
                    lineHeight:
                      1.5,
                  }}
                >
                  No active Memorial
                  Materials are available.
                  Add or activate them
                  under Admin → Memorial
                  Materials.
                </div>
              ) : (
                <div
                  style={
                    optionGridStyle
                  }
                >
                  {memorialMaterialOptions.map(
                    (material) => (
                      <CheckOption
                        key={
                          material.id
                        }
                        name="memorialMaterialAllowed"
                        value={
                          material.id
                        }
                        label={
                          material.name
                        }
                        defaultChecked={allowedMemorialMaterials.has(
                          material.id
                        )}
                      />
                    )
                  )}
                </div>
              )}

              <div
                style={
                  twoColumnGridStyle
                }
              >
                <Field
                  label="Minimum Memorial Selections"
                  helpText="Use 0 when memorial material is optional."
                >
                  <input
                    name="memorialMaterialsMin"
                    type="number"
                    min="0"
                    defaultValue={
                      memorialConfig
                        .min ?? 0
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field
                  label="Maximum Memorial Selections"
                  helpText="Example: Signature Alternating allows up to 2."
                >
                  <input
                    name="memorialMaterialsMax"
                    type="number"
                    min="0"
                    defaultValue={
                      memorialConfig
                        .max ?? 1
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gap: "12px",
                }}
              >
                <CheckboxField
                  name="memorialMaterialsLocked"
                  label="Lock Memorial Material"
                  description="Automatically select the allowed memorial material instead of letting the customer change it."
                  defaultChecked={
                    memorialConfig
                      .locked ===
                    true
                  }
                />

                <CheckboxField
                  name="memorialMaterialsSeparateSides"
                  label="Separate Sides"
                  description="Use separate memorial selections for each side of the design."
                  defaultChecked={
                    memorialConfig
                      .separateSides ===
                    true
                  }
                />

                <CheckboxField
                  name="memorialMaterialsSeparateChannels"
                  label="Separate Channels"
                  description="Use separate memorial selections for individual channels."
                  defaultChecked={
                    memorialConfig
                      .separateChannels ===
                    true
                  }
                />

                <CheckboxField
                  name="memorialMaterialsHairChannel"
                  label="Dedicated Hair Channel"
                  description="Marks this design as having a dedicated hair/fur channel."
                  defaultChecked={
                    memorialConfig
                      .hairChannel ===
                    true
                  }
                />
              </div>

              <div>
                <h3
                  style={
                    subheadingStyle
                  }
                >
                  Required Memorial
                  Materials
                </h3>

                <p
                  style={
                    sectionHelpStyle
                  }
                >
                  Use this when a
                  particular material
                  must always be
                  included. For
                  example, some
                  designs require
                  cremation ashes.
                </p>

                {memorialMaterialOptions.length ===
                0 ? null : (
                  <div
                    style={
                      optionGridStyle
                    }
                  >
                    {memorialMaterialOptions.map(
                      (material) => (
                        <CheckOption
                          key={`required-${material.id}`}
                          name="memorialMaterialRequired"
                          value={
                            material.id
                          }
                          label={
                            material.name
                          }
                          defaultChecked={requiredMemorialMaterials.has(
                            material.id
                          )}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection
              title="Minerals"
              description="Control whether natural minerals are used and how many the customer may select."
            >
              <CheckboxField
                name="mineralsEnabled"
                label="Enable Minerals"
                description="Show mineral choices for this design."
                defaultChecked={
                  mineralConfig
                    .enabled ===
                  true
                }
              />

              <div
                style={
                  twoColumnGridStyle
                }
              >
                <Field
                  label="Minimum Minerals"
                  helpText="Use 0 if minerals are optional."
                >
                  <input
                    name="mineralsMin"
                    type="number"
                    min="0"
                    defaultValue={
                      mineralConfig
                        .min ?? 0
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field
                  label="Maximum Minerals"
                  helpText="Example: Signature Alternating allows up to 4."
                >
                  <input
                    name="mineralsMax"
                    type="number"
                    min="0"
                    defaultValue={
                      mineralConfig
                        .max ?? 1
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>

              <CheckboxField
                name="mineralsSeparateChannels"
                label="Separate Mineral Channels"
                description="Allow different mineral selections for individual channels."
                defaultChecked={
                  mineralConfig
                    .separateChannels ===
                  true
                }
              />
            </FormSection>

            <FormSection
              title="Accent Materials"
              description="Control optional decorative accents such as gold or silver foil."
            >
              <CheckboxField
                name="accentMaterialsEnabled"
                label="Enable Accent Materials"
                description="Allow decorative accent selections with this design."
                defaultChecked={
                  accentConfig
                    .enabled ===
                  true
                }
              />

              <div
                style={
                  optionGridStyle
                }
              >
                {accentMaterialOptions.map(
                  (accent) => (
                    <CheckOption
                      key={
                        accent.id
                      }
                      name="accentMaterialAllowed"
                      value={
                        accent.id
                      }
                      label={
                        accent.name
                      }
                      defaultChecked={allowedAccentMaterials.has(
                        accent.id
                      )}
                    />
                  )
                )}
              </div>

              <div
                style={
                  twoColumnGridStyle
                }
              >
                <Field
                  label="Minimum Accents"
                >
                  <input
                    name="accentMaterialsMin"
                    type="number"
                    min="0"
                    defaultValue={
                      accentConfig
                        .min ?? 0
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field
                  label="Maximum Accents"
                >
                  <input
                    name="accentMaterialsMax"
                    type="number"
                    min="0"
                    defaultValue={
                      accentConfig
                        .max ?? 1
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Glow Powder"
              description="Control whether this inlay design supports glow powder."
            >
              <CheckboxField
                name="glowEnabled"
                label="Enable Glow Powder"
                description="Allow the customer to add glow powder to this design."
                defaultChecked={
                  glowConfig
                    .enabled ===
                  true
                }
              />

              <CheckboxField
                name="glowRequired"
                label="Glow Powder Required"
                description="The customer must choose a glow powder for this design."
                defaultChecked={
                  glowConfig
                    .required ===
                  true
                }
              />

              <Field
                label="Maximum Glow Selections"
                helpText="Most designs use 1."
              >
                <input
                  name="glowMax"
                  type="number"
                  min="0"
                  defaultValue={
                    glowConfig.max ??
                    1
                  }
                  style={
                    inputStyle
                  }
                />
              </Field>
            </FormSection>

            <FormSection
              title="Special Requests"
              description="Control whether Special Requests are available with this inlay style."
            >
              <CheckboxField
                name="specialRequestEnabled"
                label="Allow Special Requests"
                description="Show the Special Request option with this design."
                defaultChecked={
                  specialRequestConfig
                    .enabled ===
                  true
                }
              />

              <CheckboxField
                name="specialRequestRequiresApproval"
                label="Special Requests Require Approval"
                description="Customer should contact you before purchasing a custom request."
                defaultChecked={
                  specialRequestConfig
                    .requiresApproval ===
                  true
                }
              />
            </FormSection>

            <FormSection
              title="Channel / Section Rules"
              description="Build the individual channels or sections for multi-channel designs. Use 0 channels for a normal single-inlay style."
            >
              <ChannelBuilder
                initialChannels={
                  channels
                }
                memorialMaterialOptions={
                  memorialMaterialOptions
                }
              />
            </FormSection>

            <FormSection
              title="Image"
              description="Use a path from your public folder for now."
            >
              <Field
                label="Image Path"
                helpText="Example: /rings/inlay-styles/memorial-sprinkle.png"
              >
                <input
                  name="imageUrl"
                  type="text"
                  defaultValue={
                    inlayStyle
                      .imageUrl || ""
                  }
                  style={
                    inputStyle
                  }
                />
              </Field>

              {inlayStyle.imageUrl ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth:
                      "420px",
                    aspectRatio:
                      "4 / 3",
                    overflow:
                      "hidden",
                    borderRadius:
                      "14px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.12)",
                    background:
                      "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <img
                    src={
                      inlayStyle
                        .imageUrl
                    }
                    alt={
                      inlayStyle.name
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "cover",
                    }}
                  />
                </div>
              ) : null}
            </FormSection>

            <FormSection
              title="Organization and Status"
              description="Inactive styles remain saved but cannot be assigned to new collections."
            >
              <Field
                label="Sort Order"
                helpText="Lower numbers appear first."
              >
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={
                    inlayStyle
                      .sortOrder
                  }
                  style={
                    inputStyle
                  }
                />
              </Field>

              <div
                style={{
                  display:
                    "grid",
                  gap: "12px",
                }}
              >
                <CheckboxField
                  name="active"
                  label="Active"
                  description="Available for assignment to collections."
                  defaultChecked={
                    inlayStyle.active
                  }
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or highlighted style."
                  defaultChecked={
                    inlayStyle
                      .featured
                  }
                />
              </div>
            </FormSection>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "12px",
                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="submit"
                formAction={
                  deleteInlayStyle
                }
                style={
                  dangerButtonStyle
                }
              >
                Delete Inlay
                Style
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap:
                    "wrap",
                }}
              >
                <Link
                  href="/admin/inlay-styles"
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  style={
                    primaryButtonStyle
                  }
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        border:
          "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius:
          "18px",
        background:
          "rgba(255, 255, 255, 0.035)",
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom:
            "22px",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 7px",
            fontSize:
              "22px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: 0,
            color:
              "#98a49f",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  helpText,
  children,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      <span
        style={{
          color: "#e8eeeb",
          fontSize: "14px",
          fontWeight: "850",
        }}
      >
        {label}

        {required ? (
          <span
            style={{
              color:
                "#d9b56d",
            }}
          >
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}

      {helpText ? (
        <span
          style={{
            color: "#7f8c87",
            fontSize: "12px",
            lineHeight: 1.45,
          }}
        >
          {helpText}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked = false,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems:
          "flex-start",
        gap: "12px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius:
          "12px",
        padding: "15px",
        cursor: "pointer",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <input
        name={name}
        type="checkbox"
        defaultChecked={
          defaultChecked
        }
        style={{
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor:
            "#d9b56d",
          flexShrink: 0,
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom:
              "3px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            color: "#98a49f",
            fontSize: "13px",
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function CheckOption({
  name,
  value,
  label,
  defaultChecked = false,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: "10px",
        border:
          "1px solid rgba(255,255,255,.1)",
        borderRadius:
          "11px",
        padding: "12px",
        cursor: "pointer",
        background:
          "rgba(255,255,255,.025)",
      }}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={
          defaultChecked
        }
        style={{
          width: "17px",
          height: "17px",
          accentColor:
            "#d9b56d",
        }}
      />

      <span
        style={{
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        {label}
      </span>
    </label>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255, 255, 255, 0.14)",
  background:
    "rgba(0, 0, 0, 0.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

const optionGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "10px",
};

const subheadingStyle = {
  margin: "0 0 6px",
  fontSize: "16px",
};

const sectionHelpStyle = {
  margin: "0 0 12px",
  color: "#98a49f",
  fontSize: "13px",
  lineHeight: 1.5,
};

const primaryButtonStyle = {
  minHeight: "48px",
  padding: "0 22px",
  border: 0,
  borderRadius: "12px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "15px",
};

const secondaryButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent:
    "center",
  borderRadius: "12px",
  border:
    "1px solid rgba(255, 255, 255, 0.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};

const dangerButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "12px",
  border:
    "1px solid rgba(221, 92, 92, 0.55)",
  background:
    "rgba(221, 92, 92, 0.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};