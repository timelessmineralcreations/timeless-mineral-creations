import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const CATEGORY = "engraving-option";

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
      name: "Standard Engraving",
      slug: "standard-engraving",
      description:
        "Add personalized text to your jewelry.",
      priceAdjustmentCents: 2000,
      sortOrder: 10,
      metadataJson: JSON.stringify({
        inputMode: "standard-text",
        maxLength: 25,
      }),
    },
    {
      name:
        "Custom Signature / Handwritten",
      slug: "custom-signature",
      description:
        "Use a handwritten signature or other approved custom handwriting.",
      priceAdjustmentCents: 5000,
      sortOrder: 20,
      metadataJson: JSON.stringify({
        inputMode: "custom-signature",
        maxLength: null,
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
    "/admin/engraving-options"
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

  const inputMode = String(
    formData.get("inputMode") ||
      "standard-text"
  ).trim();

  const maxLength = Number(
    formData.get("maxLength") || 0
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
      "Engraving option name is required."
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
      "An engraving option already uses that slug."
    );
  }

  const metadata = {
    inputMode,

    maxLength:
      inputMode === "standard-text"
        ? Number.isFinite(maxLength)
          ? Math.max(0, maxLength)
          : 25
        : null,
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
    "/admin/engraving-options"
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

  const inputMode = String(
    formData.get("inputMode") ||
      "standard-text"
  ).trim();

  const maxLength = Number(
    formData.get("maxLength") || 0
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
      "Engraving option ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Engraving option name is required."
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
      "Engraving option could not be found."
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
      "Another engraving option already uses that slug."
    );
  }

  const oldMetadata =
    parseMetadata(
      existing.metadataJson
    );

  const metadata = {
    ...oldMetadata,

    inputMode,

    maxLength:
      inputMode === "standard-text"
        ? Number.isFinite(maxLength)
          ? Math.max(0, maxLength)
          : 25
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
        JSON.stringify(metadata),
    },
  });

  revalidatePath(
    "/admin/engraving-options"
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
      "Engraving option ID is missing."
    );
  }

  await prisma.configuratorOption.deleteMany({
    where: {
      id,
      category: CATEGORY,
    },
  });

  revalidatePath(
    "/admin/engraving-options"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

export default async function EngravingOptionsPage() {
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
          Engraving Options
        </h1>

        <p
          style={{
            margin: "12px 0 28px",
            color: "#aab6b1",
            maxWidth: "780px",
            lineHeight: 1.65,
          }}
        >
          Manage the engraving
          choices customers can
          select when their chosen
          Product Base allows
          inside engraving.
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
                Default Engraving
                Options
              </h2>

              <p
                style={helpStyle}
              >
                Adds Standard
                Engraving and
                Custom Signature /
                Handwritten if they
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
          style={sectionStyle}
        >
          <h2
            style={{
              margin: "0 0 7px",
              fontSize: "22px",
            }}
          >
            Add New Engraving
            Option
          </h2>

          <p
            style={{
              ...helpStyle,
              marginBottom: "22px",
            }}
          >
            Create another
            engraving choice for
            customers. You can
            change the displayed
            name and pricing later.
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
                Add Engraving
                Option
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
            Current Options
          </h2>

          <p
            style={helpStyle}
          >
            {options.length}{" "}
            engraving option
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
                No engraving
                options have been
                created yet. Click{" "}
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

  const inputMode =
    metadata.inputMode ||
    "standard-text";

  const maxLength =
    metadata.maxLength ??
    25;

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
          label="Option Name"
          required
        >
          <input
            name="name"
            type="text"
            required
            defaultValue={
              option?.name || ""
            }
            placeholder="Standard Engraving"
            style={inputStyle}
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
              option?.slug || ""
            }
            placeholder="standard-engraving"
            style={inputStyle}
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
          placeholder="Add personalized text to your jewelry."
          style={{
            ...inputStyle,
            minHeight: "110px",
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
          label="Price"
          helpText="Additional price charged for this option."
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

        <Field
          label="Engraving Type"
          helpText="Controls how the customer provides the engraving."
        >
          <select
            name="inputMode"
            defaultValue={
              inputMode
            }
            style={inputStyle}
          >
            <option value="standard-text">
              Standard Typed Text
            </option>

            <option value="custom-signature">
              Signature /
              Handwritten
            </option>
          </select>
        </Field>

        <Field
          label="Maximum Characters"
          helpText="Used for standard typed engraving."
        >
          <input
            name="maxLength"
            type="number"
            min="0"
            defaultValue={
              maxLength
            }
            style={inputStyle}
          />
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
            description="Allow customers to select this engraving option."
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