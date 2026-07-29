import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function createRingCore(formData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const submittedSlug = String(formData.get("slug") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const finish = String(formData.get("finish") || "").trim();
  const color = String(formData.get("color") || "").trim();

  const supplier = String(formData.get("supplier") || "").trim();
  const supplierUrl = String(formData.get("supplierUrl") || "").trim();
  const supplierCost = Number(formData.get("supplierCost") || 0);
  const supplierCostCents = Math.round(supplierCost * 100);

  const widths = cleanList(formData.get("widths"));
  const sizes = cleanList(formData.get("sizes"));
  const channelDimensions = cleanList(
    formData.get("channelDimensions")
  );

  const notes = String(formData.get("notes") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name) {
    throw new Error("Ring core name is required.");
  }

  if (!material) {
    throw new Error("Material is required.");
  }

  if (!Number.isFinite(supplierCostCents) || supplierCostCents < 0) {
    throw new Error("Supplier cost must be a valid positive number.");
  }

  const slug = createSlug(submittedSlug || name);

  if (!slug) {
    throw new Error("A valid slug could not be created.");
  }

  const existingCore = await prisma.ringCore.findUnique({
    where: {
      slug,
    },
  });

  if (existingCore) {
    throw new Error(
      "A ring core with that URL slug already exists."
    );
  }

  const ringCore = await prisma.ringCore.create({
    data: {
      name,
      slug,
      material,
      finish: finish || null,
      color: color || null,
      supplier: supplier || null,
      supplierUrl: supplierUrl || null,
      supplierCostCents,
      widthsJson: widths.length ? JSON.stringify(widths) : null,
      sizesJson: sizes.length ? JSON.stringify(sizes) : null,
      channelDimensionsJson: channelDimensions.length
        ? JSON.stringify(channelDimensions)
        : null,
      notes: notes || null,
      imageUrl: imageUrl || null,
      active,
      featured,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin/ring-cores");

  redirect(`/admin/ring-cores/${ringCore.id}`);
}

export default function NewRingCorePage() {
  return (
    <main
      style={{
        padding: "32px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <Link
            href="/admin/ring-cores"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Ring Cores
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
            Product Components
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            New Ring Core
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Add a reusable ring blank with its supplier, cost,
            material, available widths, sizes, channel measurements,
            image, and internal notes.
          </p>
        </div>

        <form action={createRingCore}>
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="General Information"
              description="Give this core a clear name and describe the physical ring blank."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Core Name" required>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Example: Titanium Flat Channel 8mm"
                    style={inputStyle}
                  />
                </Field>

                <Field label="URL Slug">
                  <input
                    name="slug"
                    type="text"
                    placeholder="titanium-flat-channel-8mm"
                    style={inputStyle}
                  />
                  <HelpText>
                    Leave blank to create it automatically.
                  </HelpText>
                </Field>
              </div>

              <div style={threeColumnGridStyle}>
                <Field label="Material" required>
                  <select
                    name="material"
                    required
                    defaultValue=""
                    style={inputStyle}
                  >
                    <option value="" disabled>
                      Select material
                    </option>
                    <option value="Titanium">Titanium</option>
                    <option value="Tungsten">Tungsten</option>
                    <option value="Black Ceramic">
                      Black Ceramic
                    </option>
                    <option value="White Ceramic">
                      White Ceramic
                    </option>
                    <option value="Stainless Steel">
                      Stainless Steel
                    </option>
                    <option value="Sterling Silver">
                      Sterling Silver
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Finish">
                  <input
                    name="finish"
                    type="text"
                    placeholder="Polished, brushed, hammered"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Color">
                  <input
                    name="color"
                    type="text"
                    placeholder="Silver, black, rose gold"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Supplier Information"
              description="Track where the ring comes from and what it costs you."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Supplier">
                  <input
                    name="supplier"
                    type="text"
                    placeholder="Alibaba supplier name"
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

              <div style={twoColumnGridStyle}>
                <Field label="Supplier Cost" required>
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
                        fontWeight: "850",
                      }}
                    >
                      $
                    </span>

                    <input
                      name="supplierCost"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      required
                      style={{
                        ...inputStyle,
                        paddingLeft: "32px",
                      }}
                    />
                  </div>
                </Field>

                <Field label="Sort Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue="0"
                    style={inputStyle}
                  />
                  <HelpText>
                    Lower numbers appear first.
                  </HelpText>
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Available Widths and Sizes"
              description="Enter values separated by commas. You can include full and half sizes."
            >
              <Field label="Widths">
                <input
                  name="widths"
                  type="text"
                  placeholder="4mm, 6mm, 8mm, 10mm"
                  style={inputStyle}
                />
                <HelpText>
                  Example: 6mm, 8mm, 10mm
                </HelpText>
              </Field>

              <Field label="Sizes">
                <textarea
                  name="sizes"
                  rows={4}
                  placeholder="4, 4.5, 5, 5.5, 6, 6.5, 7"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
                <HelpText>
                  Enter every available size separated by commas.
                </HelpText>
              </Field>
            </FormSection>

            <FormSection
              title="Channel Dimensions"
              description="Record measurements or descriptions for each inlay channel."
            >
              <Field label="Channel Dimensions">
                <textarea
                  name="channelDimensions"
                  rows={4}
                  placeholder="Main channel: 4mm wide x 2mm deep, Small offset channel: 1.5mm wide"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
                <HelpText>
                  Separate multiple channel measurements with commas.
                </HelpText>
              </Field>
            </FormSection>

            <FormSection
              title="Product Image"
              description="For now, use an image path from your public folder. Direct uploads will be added later."
            >
              <Field label="Image Path">
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="/rings/cores/titanium-flat-8mm.png"
                  style={inputStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Internal Notes"
              description="These notes are only for you and will not appear on the public website."
            >
              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={6}
                  placeholder="Supplier details, minimum order quantity, quality notes, engraving limitations, or anything else worth remembering."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Status"
              description="Inactive cores remain in your records but will be hidden from new collection selections."
            >
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <CheckboxField
                  name="active"
                  label="Active"
                  description="Available for use in new and existing collections."
                  defaultChecked
                />

                <CheckboxField
                  name="featured"
                  label="Featured"
                  description="Mark this as a frequently used or important core."
                />
              </div>
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
                href="/admin/ring-cores"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Create Ring Core
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
    </label>
  );
}

function HelpText({ children }) {
  return (
    <span
      style={{
        color: "#7f8c87",
        fontSize: "12px",
        lineHeight: 1.45,
      }}
    >
      {children}
    </span>
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

const threeColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
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