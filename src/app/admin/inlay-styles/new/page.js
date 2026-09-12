import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
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

async function createInlayStyle(formData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();
  const description = String(
    formData.get("description") || ""
  ).trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name) {
    throw new Error("Inlay style name is required.");
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error("A valid slug could not be created.");
  }

  const existingStyle = await prisma.inlayStyle.findUnique({
    where: {
      slug,
    },
  });

  if (existingStyle) {
    throw new Error(
      "An inlay style with that URL slug already exists."
    );
  }

  const inlayStyle = await prisma.inlayStyle.create({
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

  redirect(`/admin/inlay-styles/${inlayStyle.id}`);
}

export default function NewInlayStylePage() {
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
            New Inlay Style
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Add a reusable inlay design that can later be assigned to one or
            more collections.
          </p>
        </div>

        <form action={createInlayStyle}>
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Style Information"
              description="Give the style a clear name, URL slug, and customer-facing description."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Inlay Style Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Example: Memorial Base + Mineral Sprinkle"
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
                    placeholder="memorial-base-mineral-sprinkle"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe how the inlay is arranged and what materials the customer can choose."
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
              description="For now, enter a path from your public folder. Direct uploads will be added later."
            >
              <Field
                label="Image Path"
                helpText="Example: /rings/inlay-styles/memorial-sprinkle.png"
              >
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="/rings/inlay-styles/example.png"
                  style={inputStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Organization"
              description="Control the display order and whether the style is active or featured."
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
                  description="Available for assignment to collections."
                  defaultChecked
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or highlighted style."
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
                href="/admin/inlay-styles"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Create Inlay Style
              </button>
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