import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import ImageUploader from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function updateGlowPowder(formData) {
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

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  const daytimeColorHex = String(
    formData.get("daytimeColorHex") || ""
  ).trim();

  const glowColorHex = String(
    formData.get("glowColorHex") || ""
  ).trim();

  const brightnessLevel = String(
    formData.get("brightnessLevel") || ""
  ).trim();

  const glowDuration = String(
    formData.get("glowDuration") || ""
  ).trim();

  const priceAdjustment = Number(
    formData.get("priceAdjustment") || 0
  );

  const priceAdjustmentCents = Math.round(
    priceAdjustment * 100
  );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const active =
    formData.get("active") === "on";

  const featured =
    formData.get("featured") === "on";

  if (!id) {
    throw new Error(
      "Glow powder ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Glow powder name is required."
    );
  }

  if (
    !Number.isFinite(priceAdjustmentCents) ||
    priceAdjustmentCents < 0
  ) {
    throw new Error(
      "Price adjustment must be a valid positive number."
    );
  }

  const slug = createSlug(
    submittedSlug || name
  );

  if (!slug) {
    throw new Error(
      "A valid glow powder URL slug could not be created."
    );
  }

  const duplicateGlowPowder =
    await prisma.glowPowder.findFirst({
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

  if (duplicateGlowPowder) {
    throw new Error(
      "A glow powder with that URL slug already exists."
    );
  }

  await prisma.glowPowder.update({
    where: {
      id,
    },

    data: {
      name,
      slug,

      description:
        description || null,

      imageUrl:
        imageUrl || null,

      daytimeColorHex:
        daytimeColorHex || null,

      glowColorHex:
        glowColorHex || null,

      brightnessLevel:
        brightnessLevel || null,

      glowDuration:
        glowDuration || null,

      priceAdjustmentCents,

      active,
      featured,

      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
    },
  });

  revalidatePath(
    "/admin/glow-powders"
  );

  revalidatePath(
    `/admin/glow-powders/${id}`
  );

  redirect(
    "/admin/glow-powders"
  );
}

async function deleteGlowPowder(formData) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Glow powder ID is missing."
    );
  }

  await prisma.glowPowder.delete({
    where: {
      id,
    },
  });

  revalidatePath(
    "/admin/glow-powders"
  );

  redirect(
    "/admin/glow-powders"
  );
}

export default async function EditGlowPowderPage({
  params,
}) {
  const { id } = await params;

  const glowPowder =
    await prisma.glowPowder.findUnique({
      where: {
        id,
      },
    });

  if (!glowPowder) {
    notFound();
  }

  return (
    <main
      style={{
        padding: "32px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <Link
            href="/admin/glow-powders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Glow Powders
          </Link>

          <p
            style={{
              margin: "0 0 8px",
              color: "#d9b56d",
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Product Materials
          </p>

          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            Edit {glowPowder.name}
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Update the glow powder image,
            colors, performance, pricing,
            display order, and availability.
          </p>
        </div>

        <form action={updateGlowPowder}>
          <input
            type="hidden"
            name="id"
            value={glowPowder.id}
          />

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Glow Powder Information"
              description="Edit the name, URL slug, and customer-facing description."
            >
              <div
                style={twoColumnGridStyle}
              >
                <Field
                  label="Glow Powder Name"
                  required
                >
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={
                      glowPowder.name
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="URL Slug"
                  helpText={`Current slug: ${glowPowder.slug}`}
                >
                  <input
                    name="slug"
                    type="text"
                    defaultValue={
                      glowPowder.slug
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={
                    glowPowder.description || ""
                  }
                  placeholder="Describe the glow color, daytime appearance, brightness, and any helpful details."
                  style={{
                    ...inputStyle,
                    minHeight: "150px",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Image and Colors"
              description="Upload or replace the image and update the approximate daytime and illuminated colors."
            >
              <ImageUploader
                name="imageUrl"
                label="Glow Powder Image"
                folder="glow-powders"
                defaultValue={
                  glowPowder.imageUrl || ""
                }
                helpText="Upload a JPG, PNG, or WebP photo of the glow powder or a finished glow example."
              />

              <div
                style={twoColumnGridStyle}
              >
                <Field
                  label="Daytime Color"
                  helpText="Choose the powder's approximate color when it is not glowing."
                >
                  <input
                    name="daytimeColorHex"
                    type="color"
                    defaultValue={
                      glowPowder.daytimeColorHex ||
                      "#f3f3f3"
                    }
                    style={{
                      ...inputStyle,
                      padding: "6px",
                      cursor: "pointer",
                    }}
                  />
                </Field>

                <Field
                  label="Glow Color"
                  helpText="Choose the approximate illuminated glow color."
                >
                  <input
                    name="glowColorHex"
                    type="color"
                    defaultValue={
                      glowPowder.glowColorHex ||
                      "#66fff2"
                    }
                    style={{
                      ...inputStyle,
                      padding: "6px",
                      cursor: "pointer",
                    }}
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: "14px",
                }}
              >
                <ColorPreview
                  label="Currently Saved Daytime Color"
                  value={
                    glowPowder.daytimeColorHex
                  }
                  fallback="#f3f3f3"
                />

                <ColorPreview
                  label="Currently Saved Glow Color"
                  value={
                    glowPowder.glowColorHex
                  }
                  fallback="#66fff2"
                  glowing
                />
              </div>
            </FormSection>

            <FormSection
              title="Glow Performance"
              description="Update how bright the powder appears and approximately how long it continues glowing."
            >
              <div
                style={twoColumnGridStyle}
              >
                <Field
                  label="Brightness Level"
                  helpText="Use a consistent rating so glow powders are easy to compare."
                >
                  <select
                    name="brightnessLevel"
                    defaultValue={
                      glowPowder.brightnessLevel ||
                      ""
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Select brightness
                    </option>

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Very High">
                      Very High
                    </option>
                  </select>
                </Field>

                <Field
                  label="Glow Duration"
                  helpText="Enter an approximate duration or description."
                >
                  <input
                    name="glowDuration"
                    type="text"
                    defaultValue={
                      glowPowder.glowDuration ||
                      ""
                    }
                    placeholder="Example: 6–8 hours"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Pricing"
              description="Update the additional charge applied when a customer selects this glow powder."
            >
              <Field
                label="Price Adjustment"
                required
                helpText="Your current standard glow upcharge is $15.00."
              >
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#9eaaa6",
                      fontWeight: "850",
                    }}
                  >
                    $
                  </span>

                  <input
                    name="priceAdjustment"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={(
                      glowPowder.priceAdjustmentCents /
                      100
                    ).toFixed(2)}
                    style={{
                      ...inputStyle,
                      paddingLeft: "32px",
                    }}
                  />
                </div>
              </Field>
            </FormSection>

            <FormSection
              title="Organization and Status"
              description="Inactive glow powders remain saved but will be hidden from new selections."
            >
              <Field
                label="Sort Order"
                helpText="Lower numbers appear first."
              >
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={
                    glowPowder.sortOrder
                  }
                  style={inputStyle}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <CheckboxField
                  name="active"
                  label="Active"
                  description="Available for use throughout the eligible product catalog."
                  defaultChecked={
                    glowPowder.active
                  }
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or highlighted glow powder."
                  defaultChecked={
                    glowPowder.featured
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
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                formAction={
                  deleteGlowPowder
                }
                style={dangerButtonStyle}
              >
                Delete Glow Powder
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/admin/glow-powders"
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  style={primaryButtonStyle}
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

function ColorPreview({
  label,
  value,
  fallback,
  glowing = false,
}) {
  const color = value || fallback;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <div
        style={{
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: color,
          border:
            "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: glowing
            ? `0 0 18px ${color}`
            : "none",
          flexShrink: 0,
        }}
      />

      <div>
        <strong
          style={{
            display: "block",
            marginBottom: "4px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            color: "#98a49f",
            fontSize: "13px",
          }}
        >
          {value || "No color saved"}
        </span>
      </div>
    </div>
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
        borderRadius: "18px",
        background:
          "rgba(255, 255, 255, 0.035)",
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h2
          style={{
            margin: "0 0 7px",
            fontSize: "22px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: 0,
            color: "#98a49f",
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
              color: "#d9b56d",
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
        alignItems: "flex-start",
        gap: "12px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "15px",
        cursor: "pointer",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor: "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom: "3px",
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

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(0, 0, 0, 0.2)",
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
  justifyContent: "center",
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