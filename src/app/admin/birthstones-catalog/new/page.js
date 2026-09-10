import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import ImageUploader from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

const months = [
  { name: "January", number: 1 },
  { name: "February", number: 2 },
  { name: "March", number: 3 },
  { name: "April", number: 4 },
  { name: "May", number: 5 },
  { name: "June", number: 6 },
  { name: "July", number: 7 },
  { name: "August", number: 8 },
  { name: "September", number: 9 },
  { name: "October", number: 10 },
  { name: "November", number: 11 },
  { name: "December", number: 12 },
];

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createBirthstone(formData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const monthNumber = Number(formData.get("monthNumber"));
  const month = months.find((item) => item.number === monthNumber);

  const stoneType = String(formData.get("stoneType") || "CZ").trim();
  const colorName = String(formData.get("colorName") || "").trim();
  const colorHex = String(formData.get("colorHex") || "").trim();
  const shape = String(formData.get("shape") || "").trim();
  const size = String(formData.get("size") || "").trim();

  const supplier = String(formData.get("supplier") || "").trim();
  const supplierUrl = String(formData.get("supplierUrl") || "").trim();

  const supplierCost = Number(formData.get("supplierCost") || 0);
  const priceAdjustment = Number(formData.get("priceAdjustment") || 0);
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const imageUrl = String(formData.get("imageUrl") || "").trim();

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  if (!name) {
    throw new Error("Birthstone name is required.");
  }

  if (!month) {
    throw new Error("Please select a valid birthstone month.");
  }

  const slug = createSlug(submittedSlug || `${month.name}-${name}`);

  if (!slug) {
    throw new Error("A valid URL slug could not be created.");
  }

  const existingBirthstone = await prisma.birthstone.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingBirthstone) {
    throw new Error("A birthstone with that URL slug already exists.");
  }

  await prisma.birthstone.create({
    data: {
      name,
      slug,
      description: description || null,

      monthName: month.name,
      monthNumber: month.number,

      stoneType: stoneType || "CZ",
      colorName: colorName || null,
      colorHex: colorHex || null,

      shape: shape || null,
      size: size || null,

      imageUrl: imageUrl || null,

      supplier: supplier || null,
      supplierUrl: supplierUrl || null,

      supplierCostCents: Number.isFinite(supplierCost)
        ? Math.round(supplierCost * 100)
        : 0,

      priceAdjustmentCents: Number.isFinite(priceAdjustment)
        ? Math.round(priceAdjustment * 100)
        : 0,

      active,
      featured,

      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
    },
  });

  revalidatePath("/admin/birthstones-catalog");

  redirect("/admin/birthstones-catalog");
}

export default function NewBirthstonePage() {
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
            href="/admin/birthstones-catalog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Birthstones
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
            CZ Birthstone Catalog
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            New Birthstone
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Add a CZ birthstone option for pieces such as Remi,
            Evermore, and other birthstone jewelry.
          </p>
        </div>

        <form action={createBirthstone}>
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Birthstone Information"
              description="Add the name, URL slug, month, and customer-facing description."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Birthstone Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Example: Garnet"
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
                    placeholder="january-garnet"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Birth Month" required>
                <select
                  name="monthNumber"
                  required
                  defaultValue=""
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select a month
                  </option>

                  {months.map((month) => (
                    <option
                      key={month.number}
                      value={month.number}
                    >
                      {month.number}. {month.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Describe the CZ birthstone, color, and any useful details."
                  style={{
                    ...inputStyle,
                    minHeight: "140px",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Stone Details"
              description="Record the stone type, color, shape, and size."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Stone Type">
                  <select
                    name="stoneType"
                    defaultValue="CZ"
                    style={inputStyle}
                  >
                    <option value="CZ">CZ</option>
                    <option value="Premium CZ">Premium CZ</option>
                    <option value="Lab Created">Lab Created</option>
                    <option value="Natural">Natural</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Color Name">
                  <input
                    name="colorName"
                    type="text"
                    placeholder="Example: Deep Red"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={twoColumnGridStyle}>
                <Field label="Shape">
                  <input
                    name="shape"
                    type="text"
                    placeholder="Example: Round"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Size">
                  <input
                    name="size"
                    type="text"
                    placeholder="Example: 3 mm"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Appearance"
              description="Upload the birthstone image and choose an approximate display color."
            >
              <ImageUploader
                name="imageUrl"
                label="Birthstone Image"
                folder="birthstones"
                helpText="Upload a JPG, PNG, or WebP image of the CZ birthstone."
              />

              <Field
                label="Color"
                helpText="Choose an approximate color for the admin swatch."
              >
                <input
                  name="colorHex"
                  type="color"
                  defaultValue="#9b1c31"
                  style={{
                    ...inputStyle,
                    padding: "6px",
                    cursor: "pointer",
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Supplier Information"
              description="Store the supplier source and your cost for the birthstone."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Supplier">
                  <input
                    name="supplier"
                    type="text"
                    placeholder="Example: Ring Supplies"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Supplier URL">
                  <input
                    name="supplierUrl"
                    type="url"
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Supplier Cost">
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span style={currencySymbolStyle}>$</span>

                  <input
                    name="supplierCost"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0.00"
                    style={{
                      ...inputStyle,
                      paddingLeft: "32px",
                    }}
                  />
                </div>
              </Field>
            </FormSection>

            <FormSection
              title="Pricing"
              description="Set any additional amount charged when this birthstone is selected."
            >
              <Field label="Price Adjustment">
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span style={currencySymbolStyle}>$</span>

                  <input
                    name="priceAdjustment"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0.00"
                    style={{
                      ...inputStyle,
                      paddingLeft: "32px",
                    }}
                  />
                </div>
              </Field>
            </FormSection>

            <FormSection
              title="Organization"
              description="Control the display order and whether the birthstone is active or featured."
            >
              <Field
                label="Sort Order"
                helpText="Lower numbers appear first within the month."
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
                  description="Available for use in eligible birthstone products."
                  defaultChecked
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a highlighted or frequently used birthstone."
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
                href="/admin/birthstones-catalog"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Create Birthstone
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

const currencySymbolStyle = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9eaaa6",
  fontWeight: "850",
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