import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const CATEGORY = "memorial-material";

const DEFAULT_MATERIALS = [
  {
    name: "Cremation Ashes",
    slug: "ashes",
    description:
      "A small amount of cremation ashes incorporated into the memorial inlay.",
    priceAdjustmentCents: 0,
    active: true,
    sortOrder: 10,
  },
  {
    name: "Hair",
    slug: "hair",
    description:
      "Human hair incorporated into the memorial inlay.",
    priceAdjustmentCents: 2000,
    active: true,
    sortOrder: 20,
  },
  {
    name: "Pet Fur",
    slug: "fur",
    description:
      "Pet fur incorporated into the memorial inlay.",
    priceAdjustmentCents: 2000,
    active: true,
    sortOrder: 30,
  },
  {
    name: "Horse Hair",
    slug: "horseHair",
    description:
      "Horse hair incorporated into the memorial inlay.",
    priceAdjustmentCents: 2500,
    active: true,
    sortOrder: 40,
  },
  {
    name: "Sand",
    slug: "sand",
    description:
      "Meaningful sand incorporated into the memorial inlay.",
    priceAdjustmentCents: 1000,
    active: true,
    sortOrder: 50,
  },
  {
    name: "Soil",
    slug: "soil",
    description:
      "Meaningful soil incorporated into the memorial inlay.",
    priceAdjustmentCents: 1000,
    active: true,
    sortOrder: 60,
  },
  {
    name: "Breast Milk",
    slug: "breastMilk",
    description:
      "Preserved breast milk incorporated into eligible keepsake jewelry.",
    priceAdjustmentCents: 0,
    active: true,
    sortOrder: 70,
  },
  {
    name: "Special Request",
    slug: "specialRequest",
    description:
      "A custom memorial material request that may require approval before production.",
    priceAdjustmentCents: 3000,
    active: true,
    sortOrder: 80,
  },
  {
    name: "Fabric",
    slug: "fabric",
    description:
      "A small amount of approved fabric incorporated into an eligible memorial design.",
    priceAdjustmentCents: 0,
    active: false,
    sortOrder: 90,
  },
];

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

function createMaterialKey(value) {
  const text = String(
    value || ""
  ).trim();

  if (!text) {
    return "";
  }

  const words = text
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  const first =
    words[0]
      .charAt(0)
      .toLowerCase() +
    words[0].slice(1);

  const rest = words
    .slice(1)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join("");

  return `${first}${rest}`;
}

function normalizeSubmittedKey(value) {
  return String(value || "")
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
}

async function addDefaultOptions() {
  "use server";
  await requireAdmin();

  for (
    const option of
      DEFAULT_MATERIALS
  ) {
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

    if (existing) {
      continue;
    }

    await prisma.configuratorOption.create({
      data: {
        category: CATEGORY,

        name:
          option.name,

        slug:
          option.slug,

        description:
          option.description,

        priceAdjustmentCents:
          option.priceAdjustmentCents,

        active:
          option.active,

        featured: false,

        sortOrder:
          option.sortOrder,

        metadataJson:
          JSON.stringify({
            materialType:
              "memorial",
          }),
      },
    });
  }

  revalidatePath(
    "/admin/memorial-materials"
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

async function createOption(formData) {
  "use server";
  await requireAdmin();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const submittedKey = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") ||
      ""
  ).trim();

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const active =
    formData.get("active") ===
    "on";

  if (!name) {
    throw new Error(
      "Memorial material name is required."
    );
  }

  const slug =
    normalizeSubmittedKey(
      submittedKey
    ) ||
    createMaterialKey(name);

  if (!slug) {
    throw new Error(
      "A valid internal key could not be created."
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
      "A memorial material already uses that internal key."
    );
  }

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
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,

      metadataJson:
        JSON.stringify({
          materialType:
            "memorial",
        }),
    },
  });

  revalidatePath(
    "/admin/memorial-materials"
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

  const description = String(
    formData.get("description") ||
      ""
  ).trim();

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("price")
    );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const active =
    formData.get("active") ===
    "on";

  if (!id) {
    throw new Error(
      "Memorial material ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Memorial material name is required."
    );
  }

  const existing =
    await prisma.configuratorOption.findFirst({
      where: {
        id,
        category:
          CATEGORY,
      },

      select: {
        id: true,
        slug: true,
      },
    });

  if (!existing) {
    throw new Error(
      "Memorial material could not be found."
    );
  }

  /*
   * IMPORTANT:
   *
   * The slug is intentionally NOT changed here.
   *
   * Existing collection pricing rules and
   * inlay-style configuration already reference
   * exact keys such as:
   *
   * ashes
   * horseHair
   * breastMilk
   * specialRequest
   *
   * Renaming those keys from this page could
   * break existing collection configurations.
   */

  await prisma.configuratorOption.update({
    where: {
      id,
    },

    data: {
      name,

      description:
        description || null,

      priceAdjustmentCents,

      active,

      sortOrder:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,
    },
  });

  revalidatePath(
    "/admin/memorial-materials"
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
      "Memorial material ID is missing."
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
    "/admin/memorial-materials"
  );

  revalidatePath(
    "/admin/collections"
  );

  revalidatePath(
    "/collections/[slug]",
    "page"
  );
}

export default async function MemorialMaterialsPage() {
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
            margin: 0,
            fontSize:
              "clamp(34px, 5vw, 52px)",
            lineHeight: 1.05,
          }}
        >
          Memorial Materials
        </h1>

        <p
          style={{
            margin:
              "12px 0 28px",
            color: "#aab6b1",
            maxWidth: "800px",
            lineHeight: 1.65,
          }}
        >
          Manage the memorial
          materials that can be
          assigned to collections
          and offered to customers.
          The price here is the
          default price. Individual
          collections may use their
          own pricing override.
        </p>

        <section
          style={
            sectionStyle
          }
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              gap: "18px",
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
                Default Memorial
                Materials
              </h2>

              <p
                style={
                  helpStyle
                }
              >
                Adds the nine
                memorial materials
                found during the
                existing-site audit
                without changing
                existing collection
                pricing.
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
                Add Missing
                Defaults
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
              fontSize: "22px",
            }}
          >
            Add New Memorial
            Material
          </h2>

          <p
            style={{
              ...helpStyle,
              marginBottom:
                "22px",
            }}
          >
            Create another
            memorial material if
            you add a new
            customer option in
            the future.
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
                Add Memorial
                Material
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
              fontSize: "26px",
            }}
          >
            Current Materials
          </h2>

          <p
            style={
              helpStyle
            }
          >
            {options.length}{" "}
            memorial material
            {options.length ===
            1
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
              style={
                sectionStyle
              }
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "#aab6b1",
                  lineHeight:
                    1.6,
                }}
              >
                No memorial
                materials have
                been created yet.
                Click{" "}
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
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "14px",
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
              fontSize: "22px",
            }}
          >
            {option.name}
          </h2>

          <p
            style={{
              margin: 0,
              color:
                "#7f8c87",
              fontSize:
                "13px",
            }}
          >
            Internal key:{" "}
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
  const existing =
    Boolean(option);

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
          label="Material Name"
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
            placeholder="Cremation Ashes"
            style={
              inputStyle
            }
          />
        </Field>

        {existing ? (
          <Field
            label="Internal Key"
            helpText="Locked because existing collection and inlay-style rules may already reference this exact key."
          >
            <div
              style={
                lockedFieldStyle
              }
            >
              {option.slug}
            </div>
          </Field>
        ) : (
          <Field
            label="Internal Key"
            helpText="Leave blank to create one automatically. Existing legacy keys such as horseHair and breastMilk are case-sensitive."
          >
            <input
              name="slug"
              type="text"
              defaultValue=""
              placeholder="newMaterial"
              style={
                inputStyle
              }
            />
          </Field>
        )}
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
          placeholder="Describe this memorial material for customers."
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
          twoColumnGridStyle
        }
      >
        <Field
          label="Default Price"
          helpText="Default additional price for this material. A collection-specific price may override this later."
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
        description="Allow this memorial material to be assigned to collections and displayed to customers."
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
        display: "grid",
        gap: "8px",
      }}
    >
      <span
        style={{
          color:
            "#e8eeeb",
          fontSize:
            "14px",
          fontWeight:
            "850",
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
            color:
              "#7f8c87",
            fontSize:
              "12px",
            lineHeight:
              1.45,
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
        cursor:
          "pointer",
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
          height:
            "18px",
          marginTop:
            "2px",
          accentColor:
            "#d9b56d",
          flexShrink: 0,
        }}
      />

      <span>
        <strong
          style={{
            display:
              "block",
            marginBottom:
              "3px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            color:
              "#98a49f",
            fontSize:
              "13px",
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
  boxSizing:
    "border-box",
  padding:
    "11px 13px",
  borderRadius:
    "10px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background:
    "rgba(0,0,0,.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const lockedFieldStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing:
    "border-box",
  padding:
    "11px 13px",
  display: "flex",
  alignItems:
    "center",
  borderRadius:
    "10px",
  border:
    "1px solid rgba(255,255,255,.1)",
  background:
    "rgba(255,255,255,.025)",
  color: "#98a49f",
  fontSize: "15px",
  fontFamily:
    "monospace",
};

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

const primaryButtonStyle = {
  minHeight: "46px",
  padding:
    "0 20px",
  border: 0,
  borderRadius:
    "11px",
  background:
    "#d9b56d",
  color: "#111814",
  fontWeight:
    "900",
  cursor: "pointer",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  minHeight: "44px",
  padding:
    "0 16px",
  borderRadius:
    "11px",
  border:
    "1px solid rgba(217,181,109,.35)",
  background:
    "rgba(217,181,109,.08)",
  color: "#e7c77f",
  fontWeight:
    "850",
  cursor: "pointer",
};

const dangerButtonStyle = {
  minHeight: "44px",
  padding:
    "0 16px",
  borderRadius:
    "11px",
  border:
    "1px solid rgba(221,92,92,.55)",
  background:
    "rgba(221,92,92,.08)",
  color: "#ff9d9d",
  fontWeight:
    "850",
  cursor: "pointer",
};