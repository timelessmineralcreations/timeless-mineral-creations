import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createCollection(formData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();
  const startingPrice = Number(formData.get("startingPrice") || 0);
  const productType = String(formData.get("productType") || "Ring").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const cardImage = String(formData.get("cardImage") || "").trim();
  const heroImage = String(formData.get("heroImage") || "").trim();

  const seoTitle = String(formData.get("seoTitle") || "").trim();
  const seoDescription = String(
    formData.get("seoDescription") || ""
  ).trim();

  const published = formData.get("published") === "on";
  const comingSoon = formData.get("comingSoon") === "on";
  const featured = formData.get("featured") === "on";

  if (!name) {
    throw new Error("Collection name is required.");
  }

  if (!description) {
    throw new Error("Collection description is required.");
  }

  if (!Number.isFinite(startingPrice) || startingPrice < 0) {
    throw new Error("Starting price must be a valid positive number.");
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error("A valid collection slug could not be created.");
  }

  const existingCollection = await prisma.collection.findUnique({
    where: {
      slug,
    },
  });

  if (existingCollection) {
    throw new Error(
      "That collection URL already exists. Please use a different slug."
    );
  }

  const collection = await prisma.collection.create({
    data: {
      name,
      slug,
      description,
      startingPrice,
      productType: productType || "Ring",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      cardImage: cardImage || null,
      heroImage: heroImage || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      published,
      comingSoon,
      featured,
    },
  });

  redirect(`/admin/collections/${collection.id}`);
}

export default function NewCollectionPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07110f 0%, #0b1714 45%, #08100e 100%)",
        color: "#f5f5f5",
        padding: "40px 20px 80px",
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
            href="/admin/collections"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "800",
              marginBottom: "18px",
            }}
          >
            ← Back to Collections
          </Link>

          <p
            style={{
              margin: "0 0 8px",
              color: "#d9b56d",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Timeless Mineral Creations Admin
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 1.05,
            }}
          >
            New Collection
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#b9c4c0",
              maxWidth: "700px",
              lineHeight: 1.65,
            }}
          >
            Create the basic collection listing first. We will add the ring
            builder options, image uploads, and configurator settings next.
          </p>
        </div>

        <form action={createCollection}>
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Collection Details"
              description="The main information customers will see on the collection card and collection page."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Collection Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Example: Focus Collection"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Collection URL Slug">
                  <input
                    name="slug"
                    type="text"
                    placeholder="focus"
                    style={inputStyle}
                  />
                  <HelpText>
                    Leave blank to create it automatically from the collection
                    name.
                  </HelpText>
                </Field>
              </div>

              <Field label="Description" required>
                <textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="Describe the collection, memorial materials, and customization options."
                  style={{
                    ...inputStyle,
                    minHeight: "130px",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Pricing and Organization"
              description="Set the starting price and control where the collection appears."
            >
              <div style={threeColumnGridStyle}>
                <Field label="Starting Price" required>
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
                        transform: "translateY(-50%)",
                        color: "#9eaaa6",
                        fontWeight: "800",
                      }}
                    >
                      $
                    </span>

                    <input
                      name="startingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="130"
                      required
                      style={{
                        ...inputStyle,
                        paddingLeft: "32px",
                      }}
                    />
                  </div>
                </Field>

                <Field label="Product Type">
                  <select
                    name="productType"
                    defaultValue="Ring"
                    style={inputStyle}
                  >
                    <option value="Ring">💍 Ring</option>
<option value="Bracelet">📿 Bracelet</option>
<option value="Necklace">📿 Necklace</option>
<option value="Pendant">💎 Pendant</option>
<option value="Keychain">🔑 Keychain</option>
<option value="Earrings">🧿 Earrings</option>
<option value="Keepsake">🏺 Keepsake</option>
<option value="Other">📦 Other</option>
                  </select>
                </Field>

                <Field label="Sort Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue="0"
                    style={inputStyle}
                  />
                  <HelpText>Lower numbers appear first.</HelpText>
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Images"
              description="For now, enter public image paths such as /rings/focus/focus-hero.png. We will replace this with direct uploads later."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Card Image Path">
                  <input
                    name="cardImage"
                    type="text"
                    placeholder="/rings/focus/focus-card.png"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Hero Image Path">
                  <input
                    name="heroImage"
                    type="text"
                    placeholder="/rings/focus/focus-hero.png"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Visibility"
              description="Choose whether the collection is public, shown as coming soon, or featured."
            >
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <CheckboxField
                  name="published"
                  label="Published"
                  description="Show this collection as an active listing."
                />

                <CheckboxField
                  name="comingSoon"
                  label="Coming Soon"
                  description="Display it as an upcoming collection before it is ready."
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Allow this collection to appear in featured areas of the website."
                />
              </div>
            </FormSection>

            <FormSection
              title="Search Engine Information"
              description="Optional information used by Google and other search engines."
            >
              <Field label="SEO Title">
                <input
                  name="seoTitle"
                  type="text"
                  maxLength={70}
                  placeholder="Focus Memorial Ring Collection"
                  style={inputStyle}
                />
              </Field>

              <Field label="SEO Description">
                <textarea
                  name="seoDescription"
                  rows={4}
                  maxLength={170}
                  placeholder="Customize a handcrafted memorial ring with cremation ashes, minerals, glow powder, and optional engraving."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </Field>
            </FormSection>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
                paddingTop: "6px",
              }}
            >
              <Link
                href="/admin/collections"
                style={{
                  minHeight: "48px",
                  padding: "0 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#dfe7e3",
                  textDecoration: "none",
                  fontWeight: "800",
                }}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={{
                  minHeight: "48px",
                  padding: "0 22px",
                  border: 0,
                  borderRadius: "12px",
                  background: "#d9b56d",
                  color: "#111814",
                  fontWeight: "900",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                Create Collection
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
            color: "#9eaaa6",
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

function Field({ label, required = false, children }) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: "800",
          color: "#e8eeeb",
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
    </label>
  );
}

function HelpText({ children }) {
  return (
    <span
      style={{
        color: "#87938e",
        fontSize: "12px",
        lineHeight: 1.45,
      }}
    >
      {children}
    </span>
  );
}

function CheckboxField({ name, label, description }) {
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
            color: "#9eaaa6",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

const threeColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "18px",
};