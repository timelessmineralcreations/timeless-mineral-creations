import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
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

async function createMineral(formData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  const colorHex = String(
    formData.get("colorHex") || ""
  ).trim();

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  if (!name) {
    throw new Error("Mineral name is required.");
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error(
      "A valid mineral URL slug could not be created."
    );
  }

  const existingMineral = await prisma.mineral.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingMineral) {
    throw new Error(
      "A mineral with that URL slug already exists."
    );
  }

  const mineral = await prisma.mineral.create({
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      colorHex: colorHex || null,
      active,
      featured,
      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
    },
  });

  revalidatePath("/admin/minerals");

  redirect("/admin/minerals");
}

export default function NewMineralPage() {
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
            href="/admin/minerals"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Minerals
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
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            New Mineral
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Add a mineral that can later be assigned to your
            collections and offered as an inlay option.
          </p>
        </div>

        <form action={createMineral}>
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Mineral Information"
              description="Give the mineral a clear name, URL slug, and customer-facing description."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Mineral Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Example: Turquoise"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="URL Slug"
                  helpText="Leave blank to create it automatically."
                >
                  <input
                    name="slug"
                    type="text"
                    placeholder="turquoise"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe the mineral, its appearance, color, and any meaningful characteristics."
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
              title="Appearance"
              description="Add an image path and an approximate color for the mineral swatch."
            >
              <div style={twoColumnGridStyle}>
                <ImageUploader
  name="imageUrl"
  label="Mineral Image"
  folder="minerals"
  helpText="Upload a mineral photo. It will automatically be stored in Vercel Blob."
/>

                <Field
                  label="Color"
                  helpText="Choose an approximate color for the admin swatch."
                >
                  <input
                    name="colorHex"
                    type="color"
                    defaultValue="#4f9f9b"
                    style={{
                      ...inputStyle,
                      padding: "6px",
                      cursor: "pointer",
                    }}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Organization"
              description="Control the display order and whether the mineral is active or featured."
            >
              <Field
                label="Sort Order"
                helpText="Lower numbers appear first."
              >
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
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
                  description="Available for use throughout the product catalog."
                  defaultChecked
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or highlighted mineral."
                />
              </div>
            </FormSection>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/admin/minerals"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Create Mineral
              </button>
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
        border: "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius: "18px",
        background: "rgba(255, 255, 255, 0.035)",
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
          <span style={{ color: "#d9b56d" }}>
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
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "15px",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.025)",
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
  border: "1px solid rgba(255, 255, 255, 0.14)",
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
  border: "1px solid rgba(255, 255, 255, 0.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};