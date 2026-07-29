import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function updateInlayStyle(formData) {
  "use server";

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();
  const description = String(
    formData.get("description") || ""
  ).trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!id) {
    throw new Error("Inlay style ID is missing.");
  }

  if (!name) {
    throw new Error("Inlay style name is required.");
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error("A valid slug could not be created.");
  }

  const duplicateStyle = await prisma.inlayStyle.findFirst({
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

  if (duplicateStyle) {
    throw new Error(
      "An inlay style with that URL slug already exists."
    );
  }

  await prisma.inlayStyle.update({
    where: {
      id,
    },
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      active,
      featured,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin/inlay-styles");
  revalidatePath(`/admin/inlay-styles/${id}`);

  redirect("/admin/inlay-styles");
}

async function deleteInlayStyle(formData) {
  "use server";

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Inlay style ID is missing.");
  }

  await prisma.inlayStyle.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/inlay-styles");

  redirect("/admin/inlay-styles");
}

export default async function EditInlayStylePage({ params }) {
  const { id } = await params;

  const inlayStyle = await prisma.inlayStyle.findUnique({
    where: {
      id,
    },
  });

  if (!inlayStyle) {
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
            href="/admin/inlay-styles"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Inlay Styles
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
            Product Configuration
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            Edit {inlayStyle.name}
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Update the inlay style information, image, display order,
            and availability.
          </p>
        </div>

        <form action={updateInlayStyle}>
          <input
            type="hidden"
            name="id"
            value={inlayStyle.id}
          />

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Style Information"
              description="Edit the name, URL slug, and customer-facing description."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Inlay Style Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={inlayStyle.name}
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="URL Slug"
                  helpText={`Current slug: ${inlayStyle.slug}`}
                >
                  <input
                    name="slug"
                    type="text"
                    defaultValue={inlayStyle.slug}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={inlayStyle.description || ""}
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
                  defaultValue={inlayStyle.imageUrl || ""}
                  style={inputStyle}
                />
              </Field>

              {inlayStyle.imageUrl ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    borderRadius: "14px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.12)",
                    background: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <img
                    src={inlayStyle.imageUrl}
                    alt={inlayStyle.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                  defaultValue={inlayStyle.sortOrder}
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
                  description="Available for assignment to collections."
                  defaultChecked={inlayStyle.active}
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or highlighted style."
                  defaultChecked={inlayStyle.featured}
                />
              </div>
            </FormSection>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                formAction={deleteInlayStyle}
                style={dangerButtonStyle}
              >
                Delete Inlay Style
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/admin/inlay-styles"
                  style={secondaryButtonStyle}
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

function FormSection({ title, description, children }) {
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
          <span style={{ color: "#d9b56d" }}> *</span>
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

const dangerButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "12px",
  border: "1px solid rgba(221, 92, 92, 0.55)",
  background: "rgba(221, 92, 92, 0.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};