import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const CATEGORY = "bezel-size";

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
    /*
     * Oval / rectangular necklace bezels
     */
    {
      name: "4 × 6 mm",
      slug: "4x6-mm",
      description:
        "4 × 6 mm bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 10,
      metadataJson: JSON.stringify({
        widthMm: 4,
        heightMm: 6,
        shapeType: "oval",
      }),
    },
    {
      name: "5 × 7 mm",
      slug: "5x7-mm",
      description:
        "5 × 7 mm bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 20,
      metadataJson: JSON.stringify({
        widthMm: 5,
        heightMm: 7,
        shapeType: "oval",
      }),
    },
    {
      name: "6 × 8 mm",
      slug: "6x8-mm",
      description:
        "6 × 8 mm bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 30,
      metadataJson: JSON.stringify({
        widthMm: 6,
        heightMm: 8,
        shapeType: "oval",
      }),
    },
    {
      name: "8 × 10 mm",
      slug: "8x10-mm",
      description:
        "8 × 10 mm bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 40,
      metadataJson: JSON.stringify({
        widthMm: 8,
        heightMm: 10,
        shapeType: "oval",
      }),
    },
    {
      name: "10 × 14 mm",
      slug: "10x14-mm",
      description:
        "10 × 14 mm bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 50,
      metadataJson: JSON.stringify({
        widthMm: 10,
        heightMm: 14,
        shapeType: "oval",
      }),
    },

    /*
     * Round Legacy Heart bezels
     */
    {
      name: "6 mm Round",
      slug: "6mm-round",
      description:
        "6 mm round bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 60,
      metadataJson: JSON.stringify({
        widthMm: 6,
        heightMm: 6,
        diameterMm: 6,
        shapeType: "round",
      }),
    },
    {
      name: "8 mm Round",
      slug: "8mm-round",
      description:
        "8 mm round bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 70,
      metadataJson: JSON.stringify({
        widthMm: 8,
        heightMm: 8,
        diameterMm: 8,
        shapeType: "round",
      }),
    },
    {
      name: "10 mm Round",
      slug: "10mm-round",
      description:
        "10 mm round bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 80,
      metadataJson: JSON.stringify({
        widthMm: 10,
        heightMm: 10,
        diameterMm: 10,
        shapeType: "round",
      }),
    },

    /*
     * Remi / ring oval bezels
     */
    {
      name: "7 × 5 mm",
      slug: "7x5-mm",
      description:
        "7 × 5 mm oval bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 90,
      metadataJson: JSON.stringify({
        widthMm: 7,
        heightMm: 5,
        shapeType: "oval",
      }),
    },
    {
      name: "8 × 6 mm",
      slug: "8x6-mm",
      description:
        "8 × 6 mm oval bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 100,
      metadataJson: JSON.stringify({
        widthMm: 8,
        heightMm: 6,
        shapeType: "oval",
      }),
    },
    {
      name: "9 × 7 mm",
      slug: "9x7-mm",
      description:
        "9 × 7 mm oval bezel setting.",
      priceAdjustmentCents: 0,
      sortOrder: 110,
      metadataJson: JSON.stringify({
        widthMm: 9,
        heightMm: 7,
        shapeType: "oval",
      }),
    },
    {
      name: "10 × 8 mm",
      slug: "10x8-mm",
      description:
        "10 × 8 mm oval bezel setting.",
      priceAdjustmentCents: 1000,
      sortOrder: 120,
      metadataJson: JSON.stringify({
        widthMm: 10,
        heightMm: 8,
        shapeType: "oval",
      }),
    },
    {
      name: "11 × 9 mm",
      slug: "11x9-mm",
      description:
        "11 × 9 mm oval bezel setting.",
      priceAdjustmentCents: 1000,
      sortOrder: 130,
      metadataJson: JSON.stringify({
        widthMm: 11,
        heightMm: 9,
        shapeType: "oval",
      }),
    },
  ];

  for (const option of defaults) {
    const existing =
      await prisma.configuratorOption.findFirst({
        where: {
          category: CATEGORY,
          slug: option.slug,
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      await prisma.configuratorOption.create({
        data: {
          category: CATEGORY,
          name: option.name,
          slug: option.slug,
          description:
            option.description,
          priceAdjustmentCents:
            option.priceAdjustmentCents,
          active: true,
          featured: false,
          sortOrder:
            option.sortOrder,
          metadataJson:
            option.metadataJson,
        },
      });
    }
  }

  revalidatePath(
    "/admin/bezel-sizes"
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

  const widthMm = Number(
    formData.get("widthMm") || 0
  );

  const heightMm = Number(
    formData.get("heightMm") || 0
  );

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const active =
    formData.get("active") === "on";

  if (!name) {
    throw new Error(
      "Bezel size name is required."
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
        category: CATEGORY,
        slug,
      },

      select: {
        id: true,
      },
    });

  if (duplicate) {
    throw new Error(
      "A bezel size already uses that slug."
    );
  }

  const metadata = {
    widthMm:
      Number.isFinite(widthMm)
        ? Math.max(0, widthMm)
        : 0,

    heightMm:
      Number.isFinite(heightMm)
        ? Math.max(0, heightMm)
        : 0,
  };

  await prisma.configuratorOption.create({
    data: {
      category: CATEGORY,
      name,
      slug,

      description:
        description || null,

      priceAdjustmentCents,

      active,

      featured: false,

      sortOrder:
        Number.isFinite(sortOrder)
          ? sortOrder
          : 0,

      metadataJson:
        JSON.stringify(metadata),
    },
  });

  revalidatePath(
    "/admin/bezel-sizes"
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

  const widthMm = Number(
    formData.get("widthMm") || 0
  );

  const heightMm = Number(
    formData.get("heightMm") || 0
  );

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const active =
    formData.get("active") === "on";

  if (!id) {
    throw new Error(
      "Bezel size ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Bezel size name is required."
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
        category: CATEGORY,
      },
    });

  if (!existing) {
    throw new Error(
      "Bezel size could not be found."
    );
  }

  const duplicate =
    await prisma.configuratorOption.findFirst({
      where: {
        category: CATEGORY,
        slug,

        NOT: {
          id,
        },
      },

      select: {
        id: true,
      },
    });

  if (duplicate) {
    throw new Error(
      "Another bezel size already uses that slug."
    );
  }

  const oldMetadata =
    parseMetadata(
      existing.metadataJson
    );

  const metadata = {
    ...oldMetadata,

    widthMm:
      Number.isFinite(widthMm)
        ? Math.max(0, widthMm)
        : 0,

    heightMm:
      Number.isFinite(heightMm)
        ? Math.max(0, heightMm)
        : 0,
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
        JSON.stringify(metadata),
    },
  });

  revalidatePath(
    "/admin/bezel-sizes"
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
      "Bezel size ID is missing."
    );
  }

  await prisma.configuratorOption.deleteMany({
    where: {
      id,
      category: CATEGORY,
    },
  });

  revalidatePath(
    "/admin/bezel-sizes"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

export default async function BezelSizesPage() {
  const options =
    await prisma.configuratorOption.findMany({
      where: {
        category: CATEGORY,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
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
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#d9b56d",
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "0.12em",
            textTransform:
              "uppercase",
          }}
        >
          Product Configuration
        </p>

        <h1
          style={{
            margin: 0,
            fontSize:
              "clamp(34px, 5vw, 52px)",
            lineHeight: 1.05,
          }}
        >
          Bezel Sizes
        </h1>

        <p
          style={{
            margin: "12px 0 28px",
            color: "#aab6b1",
            maxWidth: "780px",
            lineHeight: 1.65,
          }}
        >
          Manage the master catalog
          of bezel sizes available
          across necklaces, rings,
          and other keepsake products.
        </p>

        <section
          style={sectionStyle}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin:
                    "0 0 7px",
                  fontSize: "22px",
                }}
              >
                Default Bezel Catalog
              </h2>

              <p
                style={helpStyle}
              >
                Adds all 13 bezel
                sizes currently used
                in the product catalog
                if they do not already
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
          style={sectionStyle}
        >
          <h2
            style={{
              margin: "0 0 7px",
              fontSize: "22px",
            }}
          >
            Add New Bezel Size
          </h2>

          <p
            style={{
              ...helpStyle,
              marginBottom: "22px",
            }}
          >
            Add another bezel size
            whenever you introduce a
            new necklace, ring, or
            setting.
          </p>

          <form
            action={createOption}
          >
            <OptionFields
              option={null}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                style={
                  primaryButtonStyle
                }
              >
                Add Bezel Size
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
              margin: "0 0 6px",
              fontSize: "26px",
            }}
          >
            Current Bezel Sizes
          </h2>

          <p
            style={helpStyle}
          >
            {options.length}{" "}
            bezel size
            {options.length === 1
              ? ""
              : "s"}{" "}
            saved.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {options.length ===
          0 ? (
            <section
              style={sectionStyle}
            >
              <p
                style={{
                  margin: 0,
                  color: "#aab6b1",
                  lineHeight: 1.6,
                }}
              >
                No bezel sizes have
                been created yet.
                Click{" "}
                <strong>
                  Add Missing Defaults
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
  const metadata =
    parseMetadata(
      option.metadataJson
    );

  return (
    <section
      style={sectionStyle}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom:
            "22px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "22px",
            }}
          >
            {option.name}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#7f8c87",
              fontSize: "13px",
            }}
          >
            {option.slug}
            {metadata.widthMm &&
            metadata.heightMm
              ? ` • ${metadata.widthMm} × ${metadata.heightMm} mm`
              : ""}
          </p>
        </div>

        <span
          style={{
            padding:
              "7px 11px",
            borderRadius:
              "999px",
            fontSize: "12px",
            fontWeight: "850",

            color: option.active
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
        action={updateOption}
      >
        <input
          type="hidden"
          name="id"
          value={option.id}
        />

        <OptionFields
          option={option}
        />

        <div
          style={{
            marginTop: "22px",
            display: "flex",
            justifyContent:
              "space-between",
            gap: "12px",
            flexWrap: "wrap",
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

  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
      }}
    >
      <div
        style={
          twoColumnGridStyle
        }
      >
        <Field
          label="Display Name"
          required
        >
          <input
            name="name"
            type="text"
            required
            defaultValue={
              option?.name || ""
            }
            placeholder="6 × 8 mm"
            style={inputStyle}
          />
        </Field>

        <Field
          label="Internal Slug"
          helpText="Leave blank on a new size to generate it automatically."
        >
          <input
            name="slug"
            type="text"
            defaultValue={
              option?.slug || ""
            }
            placeholder="6x8-mm"
            style={inputStyle}
          />
        </Field>
      </div>

      <Field
        label="Customer Description"
      >
        <textarea
          name="description"
          rows={3}
          defaultValue={
            option
              ?.description ||
            ""
          }
          placeholder="6 × 8 mm bezel setting."
          style={{
            ...inputStyle,
            minHeight: "95px",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      </Field>

      <div
        style={
          threeColumnGridStyle
        }
      >
        <Field
          label="Width (mm)"
        >
          <input
            name="widthMm"
            type="number"
            min="0"
            step="0.1"
            defaultValue={
              metadata.widthMm ??
              ""
            }
            placeholder="6"
            style={inputStyle}
          />
        </Field>

        <Field
          label="Height (mm)"
        >
          <input
            name="heightMm"
            type="number"
            min="0"
            step="0.1"
            defaultValue={
              metadata.heightMm ??
              ""
            }
            placeholder="8"
            style={inputStyle}
          />
        </Field>

        <Field
          label="Price"
          helpText="Default additional price for this bezel size."
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
                left: "14px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#98a49f",
                fontWeight: "800",
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
      </div>

      <div
        style={
          twoColumnGridStyle
        }
      >
        <Field
          label="Sort Order"
          helpText="Lower numbers appear first."
        >
          <input
            name="sortOrder"
            type="number"
            defaultValue={
              option
                ?.sortOrder ?? 0
            }
            style={inputStyle}
          />
        </Field>

        <div
          style={{
            display: "grid",
            alignContent: "end",
          }}
        >
          <CheckboxField
            name="active"
            label="Active"
            description="Allow this bezel size to be assigned to products and collections."
            defaultChecked={
              option
                ? option.active
                : true
            }
          />
        </div>
      </div>
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
          "1px solid rgba(255,255,255,.1)",
        borderRadius:
          "12px",
        padding: "15px",
        background:
          "rgba(255,255,255,.025)",
        cursor: "pointer",
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

const sectionStyle = {
  border:
    "1px solid rgba(255,255,255,.11)",
  borderRadius: "18px",
  background:
    "rgba(255,255,255,.035)",
  padding: "24px",
  marginBottom: "20px",
};

const helpStyle = {
  margin: 0,
  color: "#98a49f",
  lineHeight: 1.55,
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background:
    "rgba(0,0,0,.2)",
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

const threeColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "18px",
};

const primaryButtonStyle = {
  minHeight: "46px",
  padding: "0 20px",
  border: 0,
  borderRadius: "11px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  minHeight: "44px",
  padding: "0 16px",
  borderRadius: "11px",
  border:
    "1px solid rgba(217,181,109,.35)",
  background:
    "rgba(217,181,109,.08)",
  color: "#e7c77f",
  fontWeight: "850",
  cursor: "pointer",
};

const dangerButtonStyle = {
  minHeight: "44px",
  padding: "0 16px",
  borderRadius: "11px",
  border:
    "1px solid rgba(221,92,92,.55)",
  background:
    "rgba(221,92,92,.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};