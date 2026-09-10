import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const CATEGORY = "chain-option";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dollarsToCents(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

function centsToDollars(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function parseMetadata(value) {
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

async function addDefaultOptions() {
  "use server";
  await requireAdmin();

  const defaults = [
    {
      name:
        "Pendant Only — No Chain",

      slug:
        "none",

      description:
        "Purchase the pendant without a chain.",

      priceAdjustmentCents:
        0,

      sortOrder:
        10,

      metadataJson:
        JSON.stringify({
          type:
            "pendant-only",

          lengthInches:
            null,

          extenderInches:
            null,
        }),
    },

    {
      name:
        'Add Matching 16" Chain with 2" Extender',

      slug:
        "matching-chain",

      description:
        'Add a matching 16-inch chain with a 2-inch extender. The chain finish will automatically match your pendant finish.',

      priceAdjustmentCents:
        2000,

      sortOrder:
        20,

      metadataJson:
        JSON.stringify({
          type:
            "matching-chain",

          lengthInches:
            16,

          extenderInches:
            2,
        }),
    },
  ];

  for (const option of defaults) {
    const existing =
      await prisma.configuratorOption.findFirst({
        where: {
          category:
            CATEGORY,

          slug:
            option.slug,
        },

        select: {
          id:
            true,
        },
      });

    if (!existing) {
      await prisma.configuratorOption.create({
        data: {
          category:
            CATEGORY,

          name:
            option.name,

          slug:
            option.slug,

          description:
            option.description,

          priceAdjustmentCents:
            option.priceAdjustmentCents,

          active:
            true,

          featured:
            false,

          sortOrder:
            option.sortOrder,

          metadataJson:
            option.metadataJson,
        },
      });
    }
  }

  revalidatePath(
    "/admin/chain-options"
  );

  revalidatePath(
    "/admin/collections"
  );
}

async function createOption(formData) {
  "use server";
  await requireAdmin();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const lengthRaw = String(
    formData.get("lengthInches") || ""
  ).trim();

  const extenderRaw = String(
    formData.get("extenderInches") || ""
  ).trim();

  const lengthInches =
    lengthRaw === ""
      ? null
      : Number(lengthRaw);

  const extenderInches =
    extenderRaw === ""
      ? null
      : Number(extenderRaw);

  const active =
    formData.get("active") === "on";

  if (!name) {
    throw new Error(
      "Chain option name is required."
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

  const duplicate =
    await prisma.configuratorOption.findFirst({
      where: {
        category:
          CATEGORY,

        slug,
      },

      select: {
        id:
          true,
      },
    });

  if (duplicate) {
    throw new Error(
      "A chain option already uses that slug."
    );
  }

  const metadata = {
    type:
      slug === "none"
        ? "pendant-only"
        : "chain",

    lengthInches:
      Number.isFinite(
        lengthInches
      )
        ? lengthInches
        : null,

    extenderInches:
      Number.isFinite(
        extenderInches
      )
        ? extenderInches
        : null,
  };

  await prisma.configuratorOption.create({
    data: {
      category:
        CATEGORY,

      name,

      slug,

      description:
        description || null,

      priceAdjustmentCents,

      active,

      featured:
        false,

      sortOrder:
        Number.isFinite(sortOrder)
          ? sortOrder
          : 0,

      metadataJson:
        JSON.stringify(
          metadata
        ),
    },
  });

  revalidatePath(
    "/admin/chain-options"
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

async function updateOption(formData) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const lengthRaw = String(
    formData.get("lengthInches") || ""
  ).trim();

  const extenderRaw = String(
    formData.get("extenderInches") || ""
  ).trim();

  const lengthInches =
    lengthRaw === ""
      ? null
      : Number(lengthRaw);

  const extenderInches =
    extenderRaw === ""
      ? null
      : Number(extenderRaw);

  const active =
    formData.get("active") === "on";

  if (!id) {
    throw new Error(
      "Chain option ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Chain option name is required."
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

  const existing =
    await prisma.configuratorOption.findFirst({
      where: {
        id,

        category:
          CATEGORY,
      },
    });

  if (!existing) {
    throw new Error(
      "Chain option could not be found."
    );
  }

  const duplicate =
    await prisma.configuratorOption.findFirst({
      where: {
        category:
          CATEGORY,

        slug,

        NOT: {
          id,
        },
      },

      select: {
        id:
          true,
      },
    });

  if (duplicate) {
    throw new Error(
      "Another chain option already uses that slug."
    );
  }

  const oldMetadata =
    parseMetadata(
      existing.metadataJson
    );

  const metadata = {
    ...oldMetadata,

    type:
      slug === "none"
        ? "pendant-only"
        : oldMetadata.type ||
          "chain",

    lengthInches:
      Number.isFinite(
        lengthInches
      )
        ? lengthInches
        : null,

    extenderInches:
      Number.isFinite(
        extenderInches
      )
        ? extenderInches
        : null,
  };

  await prisma.configuratorOption.update({
    where: {
      id,
    },

    data: {
      name,

      slug,

      description:
        description || null,

      priceAdjustmentCents,

      active,

      sortOrder:
        Number.isFinite(sortOrder)
          ? sortOrder
          : 0,

      metadataJson:
        JSON.stringify(
          metadata
        ),
    },
  });

  revalidatePath(
    "/admin/chain-options"
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

async function deleteOption(formData) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Chain option ID is missing."
    );
  }

  await prisma.configuratorOption.deleteMany({
    where: {
      id,

      category:
        CATEGORY,
    },
  });

  revalidatePath(
    "/admin/chain-options"
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

export default async function ChainOptionsPage() {
  const options =
    await prisma.configuratorOption.findMany({
      where: {
        category:
          CATEGORY,
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

  return (
    <main
      style={{
        padding:
          "32px 28px 80px",
      }}
    >
      <div
        style={{
          width:
            "100%",

          maxWidth:
            "1100px",

          margin:
            "0 auto",
        }}
      >
        <p
          style={{
            margin:
              "0 0 8px",

            color:
              "#d9b56d",

            fontSize:
              "13px",

            fontWeight:
              "800",

            letterSpacing:
              "0.12em",

            textTransform:
              "uppercase",
          }}
        >
          Product Configuration
        </p>

        <h1
          style={{
            margin:
              0,

            fontSize:
              "clamp(34px, 5vw, 52px)",

            lineHeight:
              1.05,
          }}
        >
          Chain Options
        </h1>

        <p
          style={{
            margin:
              "12px 0 28px",

            color:
              "#aab6b1",

            maxWidth:
              "780px",

            lineHeight:
              1.65,
          }}
        >
          Manage the necklace
          chain choices available
          throughout the site.
          Collections will decide
          which of these options
          their customers can
          select.
        </p>

        <section
          style={
            sectionStyle
          }
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "flex-start",

              justifyContent:
                "space-between",

              gap:
                "18px",

              flexWrap:
                "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin:
                    "0 0 7px",

                  fontSize:
                    "22px",
                }}
              >
                Default Chain
                Options
              </h2>

              <p
                style={
                  helpStyle
                }
              >
                Adds Pendant Only
                — No Chain and
                the Matching 16"
                Chain with 2"
                Extender if they
                do not already
                exist.
              </p>
            </div>

            <form
              action={
                addDefaultOptions
              }
            >
              <button
                type="submit"

                style={
                  secondaryButtonStyle
                }
              >
                Add Missing Defaults
              </button>
            </form>
          </div>
        </section>

        <section
          style={
            sectionStyle
          }
        >
          <h2
            style={{
              margin:
                "0 0 7px",

              fontSize:
                "22px",
            }}
          >
            Add New Chain Option
          </h2>

          <p
            style={{
              ...helpStyle,

              marginBottom:
                "22px",
            }}
          >
            Add another chain
            choice or chain
            length. Pricing,
            length, extender
            length, and
            visibility can be
            changed at any time.
          </p>

          <form
            action={
              createOption
            }
          >
            <OptionFields
              option={null}
            />

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "flex-end",

                marginTop:
                  "20px",
              }}
            >
              <button
                type="submit"

                style={
                  primaryButtonStyle
                }
              >
                Add Chain Option
              </button>
            </div>
          </form>
        </section>

        <div
          style={{
            margin:
              "32px 0 16px",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 6px",

              fontSize:
                "26px",
            }}
          >
            Current Options
          </h2>

          <p
            style={
              helpStyle
            }
          >
            {options.length}{" "}
            chain option
            {options.length === 1
              ? ""
              : "s"}{" "}
            saved.
          </p>
        </div>

        <div
          style={{
            display:
              "grid",

            gap:
              "20px",
          }}
        >
          {options.length ===
          0 ? (
            <section
              style={
                sectionStyle
              }
            >
              <p
                style={{
                  margin:
                    0,

                  color:
                    "#aab6b1",

                  lineHeight:
                    1.6,
                }}
              >
                No chain options
                have been created
                yet. Click{" "}
                <strong>
                  Add Missing
                  Defaults
                </strong>{" "}
                above.
              </p>
            </section>
          ) : (
            options.map(
              (option) => (
                <OptionCard
                  key={
                    option.id
                  }

                  option={
                    option
                  }
                />
              )
            )
          )}
        </div>
      </div>
    </main>
  );
}

function OptionCard({
  option,
}) {
  return (
    <section
      style={
        sectionStyle
      }
    >
      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "flex-start",

          gap:
            "14px",

          flexWrap:
            "wrap",

          marginBottom:
            "22px",
        }}
      >
        <div>
          <h2
            style={{
              margin:
                "0 0 5px",

              fontSize:
                "22px",
            }}
          >
            {option.name}
          </h2>

          <p
            style={{
              margin:
                0,

              color:
                "#7f8c87",

              fontSize:
                "13px",
            }}
          >
            {option.slug}
          </p>
        </div>

        <span
          style={{
            padding:
              "7px 11px",

            borderRadius:
              "999px",

            fontSize:
              "12px",

            fontWeight:
              "850",

            color:
              option.active
                ? "#83e3ad"
                : "#aab6b1",

            background:
              option.active
                ? "rgba(79, 190, 132, 0.12)"
                : "rgba(255,255,255,.06)",
          }}
        >
          {option.active
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      <form
        action={
          updateOption
        }
      >
        <input
          type="hidden"

          name="id"

          value={
            option.id
          }
        />

        <OptionFields
          option={
            option
          }
        />

        <div
          style={{
            marginTop:
              "22px",

            display:
              "flex",

            justifyContent:
              "space-between",

            gap:
              "12px",

            flexWrap:
              "wrap",
          }}
        >
          <button
            type="submit"

            formAction={
              deleteOption
            }

            style={
              dangerButtonStyle
            }
          >
            Delete
          </button>

          <button
            type="submit"

            style={
              primaryButtonStyle
            }
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}

function OptionFields({
  option,
}) {
  const metadata =
    parseMetadata(
      option?.metadataJson
    );

  const lengthInches =
    metadata.lengthInches ??
    "";

  const extenderInches =
    metadata.extenderInches ??
    "";

  return (
    <div
      style={{
        display:
          "grid",

        gap:
          "18px",
      }}
    >
      <div
        style={
          twoColumnGridStyle
        }
      >
        <Field
          label="Option Name"

          required
        >
          <input
            name="name"

            type="text"

            required

            defaultValue={
              option?.name ||
              ""
            }

            placeholder='Add Matching 16" Chain with 2" Extender'

            style={
              inputStyle
            }
          />
        </Field>

        <Field
          label="Internal Slug"

          helpText="Leave blank on a new option to generate it automatically."
        >
          <input
            name="slug"

            type="text"

            defaultValue={
              option?.slug ||
              ""
            }

            placeholder="matching-chain"

            style={
              inputStyle
            }
          />
        </Field>
      </div>

      <Field
        label="Customer Description"
      >
        <textarea
          name="description"

          rows={4}

          defaultValue={
            option
              ?.description ||
            ""
          }

          placeholder='Add a matching 16-inch chain with a 2-inch extender.'

          style={{
            ...inputStyle,

            minHeight:
              "110px",

            resize:
              "vertical",

            lineHeight:
              1.6,
          }}
        />
      </Field>

      <div
        style={
          fourColumnGridStyle
        }
      >
        <Field
          label="Price"

          helpText="Additional amount charged for this chain option."
        >
          <div
            style={{
              position:
                "relative",
            }}
          >
            <span
              style={{
                position:
                  "absolute",

                left:
                  "14px",

                top:
                  "50%",

                transform:
                  "translateY(-50%)",

                color:
                  "#98a49f",

                fontWeight:
                  "800",
              }}
            >
              $
            </span>

            <input
              name="price"

              type="number"

              min="0"

              step="0.01"

              defaultValue={
                option
                  ? centsToDollars(
                      option.priceAdjustmentCents
                    )
                  : "0.00"
              }

              style={{
                ...inputStyle,

                paddingLeft:
                  "31px",
              }}
            />
          </div>
        </Field>

        <Field
          label="Chain Length"

          helpText='Main chain length in inches. Leave blank for "Pendant Only".'
        >
          <input
            name="lengthInches"

            type="number"

            min="0"

            step="0.5"

            defaultValue={
              lengthInches
            }

            placeholder="16"

            style={
              inputStyle
            }
          />
        </Field>

        <Field
          label="Extender Length"

          helpText="Additional extender length in inches."
        >
          <input
            name="extenderInches"

            type="number"

            min="0"

            step="0.5"

            defaultValue={
              extenderInches
            }

            placeholder="2"

            style={
              inputStyle
            }
          />
        </Field>

        <Field
          label="Sort Order"

          helpText="Lower numbers appear first."
        >
          <input
            name="sortOrder"

            type="number"

            defaultValue={
              option
                ?.sortOrder ??
              0
            }

            style={
              inputStyle
            }
          />
        </Field>
      </div>

      <CheckboxField
        name="active"

        label="Active"

        description="Allow this option to be assigned to necklace collections."

        defaultChecked={
          option
            ? option.active
            : true
        }
      />
    </div>
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
        display:
          "grid",

        gap:
          "7px",
      }}
    >
      <span
        style={{
          color:
            "#eef3f1",

          fontSize:
            "13px",

          fontWeight:
            "800",
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

      {helpText ? (
        <span
          style={
            helpStyle
          }
        >
          {helpText}
        </span>
      ) : null}

      {children}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}) {
  return (
    <label
      style={{
        display:
          "flex",

        alignItems:
          "flex-start",

        gap:
          "11px",

        padding:
          "14px",

        border:
          "1px solid rgba(255,255,255,.10)",

        borderRadius:
          "12px",

        background:
          "rgba(255,255,255,.025)",

        cursor:
          "pointer",
      }}
    >
      <input
        name={
          name
        }

        type="checkbox"

        defaultChecked={
          defaultChecked
        }

        style={{
          width:
            "18px",

          height:
            "18px",

          marginTop:
            "2px",

          accentColor:
            "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display:
              "block",

            color:
              "#eef3f1",

            fontSize:
              "14px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            display:
              "block",

            marginTop:
              "4px",

            color:
              "#84918c",

            fontSize:
              "12px",

            lineHeight:
              1.45,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

const sectionStyle = {
  border:
    "1px solid rgba(255,255,255,.11)",

  borderRadius:
    "18px",

  background:
    "rgba(255,255,255,.035)",

  padding:
    "24px",

  marginBottom:
    "20px",
};

const inputStyle = {
  width:
    "100%",

  minHeight:
    "44px",

  padding:
    "10px 13px",

  borderRadius:
    "10px",

  border:
    "1px solid rgba(255,255,255,.12)",

  background:
    "rgba(0,0,0,.18)",

  color:
    "#eef3f1",

  outline:
    "none",

  fontSize:
    "14px",

  boxSizing:
    "border-box",
};

const helpStyle = {
  margin:
    0,

  color:
    "#84918c",

  fontSize:
    "12px",

  lineHeight:
    1.5,
};

const twoColumnGridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",

  gap:
    "18px",
};

const fourColumnGridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",

  gap:
    "18px",
};

const primaryButtonStyle = {
  minHeight:
    "42px",

  padding:
    "0 16px",

  borderRadius:
    "10px",

  border:
    "1px solid rgba(217,181,109,.55)",

  background:
    "rgba(217,181,109,.15)",

  color:
    "#e4c47d",

  fontSize:
    "13px",

  fontWeight:
    "850",

  cursor:
    "pointer",
};

const secondaryButtonStyle = {
  minHeight:
    "42px",

  padding:
    "0 16px",

  borderRadius:
    "10px",

  border:
    "1px solid rgba(255,255,255,.12)",

  background:
    "rgba(255,255,255,.045)",

  color:
    "#eef3f1",

  fontSize:
    "13px",

  fontWeight:
    "800",

  cursor:
    "pointer",
};

const dangerButtonStyle = {
  minHeight:
    "42px",

  padding:
    "0 16px",

  borderRadius:
    "10px",

  border:
    "1px solid rgba(232,101,101,.35)",

  background:
    "rgba(232,101,101,.08)",

  color:
    "#ef9e9e",

  fontSize:
    "13px",

  fontWeight:
    "850",

  cursor:
    "pointer",
};