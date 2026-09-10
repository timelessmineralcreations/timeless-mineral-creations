import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function parseOptionalNumber(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number)
    ? number
    : null;
}

function dollarsToCentsOrNull(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(number * 100);
}

function dollarsToCents(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 100);
}

function parseJsonArray(value, fieldLabel) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error(
        `${fieldLabel} must be a JSON array.`
      );
    }

    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(
      `${fieldLabel} contains invalid JSON. ${
        error instanceof Error
          ? error.message
          : ""
      }`
    );
  }
}

function formatJson(value) {
  if (!value) {
    return "";
  }

  try {
    return JSON.stringify(
      JSON.parse(value),
      null,
      2
    );
  } catch {
    return value;
  }
}

async function saveVariant(formData) {
  "use server";
  await requireAdmin();

  const productBaseId = String(
    formData.get("productBaseId") || ""
  ).trim();

  const variantId = String(
    formData.get("variantId") || ""
  ).trim();

  const variantKey = String(
    formData.get("variantKey") || ""
  ).trim();

  const name = normalizeText(
    formData.get("name")
  );

  const widthMm = parseOptionalNumber(
    formData.get("widthMm")
  );

  const channelWidthMm =
    parseOptionalNumber(
      formData.get("channelWidthMm")
    );

  const channelLayout = normalizeText(
    formData.get("channelLayout")
  );

  const finish = normalizeText(
    formData.get("finish")
  );

  const bezelSize = normalizeText(
    formData.get("bezelSize")
  );

  const chainOption = normalizeText(
    formData.get("chainOption")
  );

  const lengthOption = normalizeText(
    formData.get("lengthOption")
  );

  const sizesJson = parseJsonArray(
    formData.get("sizesJson"),
    "Ring sizes"
  );

  const finishesJson = parseJsonArray(
    formData.get("finishesJson"),
    "Finishes"
  );

  const bezelSizesJson = parseJsonArray(
    formData.get("bezelSizesJson"),
    "Bezel sizes"
  );

  const chainOptionsJson = parseJsonArray(
    formData.get("chainOptionsJson"),
    "Chain options"
  );

  const lengthsJson = parseJsonArray(
    formData.get("lengthsJson"),
    "Lengths"
  );

  const channelsJson = parseJsonArray(
    formData.get("channelsJson"),
    "Channels"
  );

  const attributesText = String(
    formData.get("attributesJson") || ""
  ).trim();

  let attributesJson = null;

  if (attributesText) {
    try {
      attributesJson = JSON.stringify(
        JSON.parse(attributesText)
      );
    } catch {
      throw new Error(
        "Attributes contains invalid JSON."
      );
    }
  }

  const supplierCostOverrideCents =
    dollarsToCentsOrNull(
      formData.get(
        "supplierCostOverride"
      )
    );

  const priceAdjustmentCents =
    dollarsToCents(
      formData.get("priceAdjustment")
    );

  const inventoryQuantity = Number(
    formData.get("inventoryQuantity") || 0
  );

  const lowStockThreshold = Number(
    formData.get("lowStockThreshold") || 0
  );

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const inStock =
    formData.get("inStock") === "on";

  const active =
    formData.get("active") === "on";

  if (!productBaseId || !variantId) {
    throw new Error(
      "Variant or Product Base ID is missing."
    );
  }

  if (!variantKey) {
    throw new Error(
      "Variant key is required."
    );
  }

  if (
    !Number.isInteger(inventoryQuantity) ||
    inventoryQuantity < 0
  ) {
    throw new Error(
      "Inventory quantity must be a whole number of zero or greater."
    );
  }

  if (
    !Number.isInteger(lowStockThreshold) ||
    lowStockThreshold < 0
  ) {
    throw new Error(
      "Low-stock threshold must be a whole number of zero or greater."
    );
  }

  const existing =
    await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productBaseId,
      },

      select: {
        id: true,
      },
    });

  if (!existing) {
    throw new Error(
      "This variant does not belong to the selected Product Base."
    );
  }

  const duplicateKey =
    await prisma.productVariant.findFirst({
      where: {
        productBaseId,
        variantKey,

        NOT: {
          id: variantId,
        },
      },

      select: {
        id: true,
      },
    });

  if (duplicateKey) {
    throw new Error(
      "Another variant for this Product Base already uses that variant key."
    );
  }

  await prisma.productVariant.update({
    where: {
      id: variantId,
    },

    data: {
      variantKey,
      name,

      widthMm,
      channelWidthMm,
      channelLayout,

      finish,
      bezelSize,
      chainOption,
      lengthOption,

      sizesJson,
      finishesJson,
      bezelSizesJson,
      chainOptionsJson,
      lengthsJson,
      channelsJson,
      attributesJson,

      supplierCostOverrideCents,
      priceAdjustmentCents,

      inventoryQuantity,
      lowStockThreshold,

      inStock,
      active,

      sortOrder:
        Number.isFinite(sortOrder)
          ? sortOrder
          : 0,
    },
  });

  revalidatePath(
    `/admin/product-bases/${productBaseId}`
  );

  revalidatePath(
    `/admin/product-bases/${productBaseId}/variants/${variantId}`
  );

  redirect(
    `/admin/product-bases/${productBaseId}/variants/${variantId}?saved=true`
  );
}

export default async function EditVariantPage({
  params,
  searchParams,
}) {
  const { id, variantId } = await params;

  const resolvedSearchParams =
    await searchParams;

  const variant =
    await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productBaseId: id,
      },

      include: {
        productBase: true,
      },
    });

  if (!variant) {
    notFound();
  }

  const saved =
    resolvedSearchParams?.saved === "true";

  return (
    <main style={pageStyle}>
      <div style={pageInnerStyle}>
        <Link
          href={`/admin/product-bases/${id}`}
          style={backLinkStyle}
        >
          ← Back to {variant.productBase.name}
        </Link>

        <p style={eyebrowStyle}>
          Product Variant
        </p>

        <h1 style={pageTitleStyle}>
          Edit{" "}
          {variant.name ||
            variant.variantKey}
        </h1>

        <p style={pageDescriptionStyle}>
          Manage dimensions, customer-selectable
          options, pricing, inventory, and
          availability for this specific variant.
        </p>

        {saved ? (
          <div style={successStyle}>
            Variant saved successfully.
          </div>
        ) : null}

        <form action={saveVariant}>
          <input
            type="hidden"
            name="productBaseId"
            value={id}
          />

          <input
            type="hidden"
            name="variantId"
            value={variant.id}
          />

          <div style={formGridStyle}>
            <FormSection
              title="Variant Identity"
              description="Set the internal name, stable key, and display order."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Variant Name">
                  <input
                    name="name"
                    type="text"
                    defaultValue={
                      variant.name || ""
                    }
                    placeholder="8mm"
                    style={inputStyle}
                  />
                </Field>

                <Field
                  label="Variant Key"
                  required
                >
                  <input
                    name="variantKey"
                    type="text"
                    required
                    defaultValue={
                      variant.variantKey
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Sort Order">
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={
                    variant.sortOrder
                  }
                  style={inputStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Physical Specifications"
              description="Enter fixed measurements or fixed selections for this variant."
            >
              <div style={threeColumnGridStyle}>
                <Field label="Width (mm)">
                  <input
                    name="widthMm"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={
                      variant.widthMm ?? ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Channel Width (mm)">
                  <input
                    name="channelWidthMm"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={
                      variant.channelWidthMm ??
                      ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Channel Layout">
                  <input
                    name="channelLayout"
                    type="text"
                    defaultValue={
                      variant.channelLayout ||
                      ""
                    }
                    placeholder="2.5mm × 2"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Fixed Finish">
                  <input
                    name="finish"
                    type="text"
                    defaultValue={
                      variant.finish || ""
                    }
                    placeholder="White Gold Plated"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Fixed Bezel Size">
                  <input
                    name="bezelSize"
                    type="text"
                    defaultValue={
                      variant.bezelSize || ""
                    }
                    placeholder="8x10"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Fixed Chain Option">
                  <input
                    name="chainOption"
                    type="text"
                    defaultValue={
                      variant.chainOption || ""
                    }
                    placeholder='Matching 16" Chain'
                    style={inputStyle}
                  />
                </Field>

                <Field label="Fixed Length">
                  <input
                    name="lengthOption"
                    type="text"
                    defaultValue={
                      variant.lengthOption || ""
                    }
                    placeholder='18"'
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Selectable Options"
              description="Enter valid JSON arrays. These choices belong only to this Product Base variant."
            >
              <JsonField
                label="Ring Sizes"
                name="sizesJson"
                value={variant.sizesJson}
                example='["4", "4.5", "5", "5.5"]'
              />

              <JsonField
                label="Finishes"
                name="finishesJson"
                value={variant.finishesJson}
                example='["White Gold Plated", "Yellow Gold Plated", "Rose Gold Plated"]'
              />

              <JsonField
                label="Bezel Sizes"
                name="bezelSizesJson"
                value={variant.bezelSizesJson}
                example='["4x6", "5x7", "6x8", "8x10", "10x14"]'
              />

              <JsonField
                label="Chain Options"
                name="chainOptionsJson"
                value={variant.chainOptionsJson}
                example={`[
  {
    "id": "none",
    "name": "Pendant Only",
    "price": 0
  },
  {
    "id": "matching-chain",
    "name": "Matching 16\\" Chain",
    "price": 20
  }
]`}
              />

              <JsonField
                label="Available Lengths"
                name="lengthsJson"
                value={variant.lengthsJson}
                example='["16", "18", "20"]'
              />

              <JsonField
                label="Channels"
                name="channelsJson"
                value={variant.channelsJson}
                example={`[
  {
    "id": "channel-one",
    "name": "Channel One"
  }
]`}
              />
            </FormSection>

            <FormSection
              title="Additional Attributes"
              description="Store product-specific details such as pendant dimensions, setting size, stone size, or setting shape."
            >
              <Field label="Attributes JSON">
                <textarea
                  name="attributesJson"
                  rows={10}
                  defaultValue={formatJson(
                    variant.attributesJson
                  )}
                  placeholder={`{
  "pendantSize": "20 × 12 mm",
  "settingShape": "Oval",
  "settingSize": "8 × 10 mm"
}`}
                  style={textareaStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Pricing"
              description="Override supplier cost or add a customer-facing price adjustment for this variant."
            >
              <div style={twoColumnGridStyle}>
                <MoneyField
                  name="supplierCostOverride"
                  label="Supplier Cost Override"
                  cents={
                    variant.supplierCostOverrideCents
                  }
                  allowBlank
                />

                <MoneyField
                  name="priceAdjustment"
                  label="Price Adjustment"
                  cents={
                    variant.priceAdjustmentCents
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Inventory"
              description="Track available quantity and the point at which the item is considered low stock."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Inventory Quantity">
                  <input
                    name="inventoryQuantity"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={
                      variant.inventoryQuantity
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Low-Stock Threshold">
                  <input
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={
                      variant.lowStockThreshold
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Status"
              description="Control whether this variant can be selected and whether inventory is currently available."
            >
              <CheckboxField
                name="active"
                label="Active"
                description="Allow this variant to appear in the admin and customer configurator."
                defaultChecked={
                  variant.active
                }
              />

              <CheckboxField
                name="inStock"
                label="In Stock"
                description="Mark this variant as currently available to order."
                defaultChecked={
                  variant.inStock
                }
              />
            </FormSection>

            <div style={actionRowStyle}>
              <Link
                href={`/admin/product-bases/${id}`}
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Save Variant
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
    <section style={sectionStyle}>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={sectionTitleStyle}>
          {title}
        </h2>

        <p style={mutedTextStyle}>
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
  children,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      <span style={fieldLabelStyle}>
        {label}

        {required ? (
          <span style={{ color: "#d9b56d" }}>
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function JsonField({
  label,
  name,
  value,
  example,
}) {
  return (
    <Field label={label}>
      <textarea
        name={name}
        rows={7}
        defaultValue={formatJson(value)}
        placeholder={example}
        style={codeTextareaStyle}
      />

      <span style={helpTextStyle}>
        Enter a valid JSON array. Leave blank
        when this variant does not use this
        option.
      </span>
    </Field>
  );
}

function MoneyField({
  name,
  label,
  cents,
  allowBlank = false,
}) {
  const defaultValue =
    allowBlank && cents == null
      ? ""
      : (
          Number(cents || 0) / 100
        ).toFixed(2);

  return (
    <Field label={label}>
      <div style={{ position: "relative" }}>
        <span style={currencyStyle}>
          $
        </span>

        <input
          name={name}
          type="number"
          step="0.01"
          defaultValue={defaultValue}
          style={{
            ...inputStyle,
            paddingLeft: "32px",
          }}
        />
      </div>
    </Field>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}) {
  return (
    <label style={checkboxStyle}>
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        style={checkboxInputStyle}
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

        <span style={helpTextStyle}>
          {description}
        </span>
      </span>
    </label>
  );
}

const pageStyle = {
  padding: "32px 28px 80px",
};

const pageInnerStyle = {
  width: "100%",
  maxWidth: "1050px",
  margin: "0 auto",
};

const backLinkStyle = {
  display: "inline-flex",
  color: "#d9b56d",
  textDecoration: "none",
  fontWeight: "850",
  marginBottom: "18px",
};

const eyebrowStyle = {
  margin: "0 0 8px",
  color: "#d9b56d",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 52px)",
  lineHeight: 1.05,
};

const pageDescriptionStyle = {
  margin: "12px 0 28px",
  color: "#aab6b1",
  maxWidth: "760px",
  lineHeight: 1.65,
};

const successStyle = {
  marginBottom: "20px",
  border:
    "1px solid rgba(79,190,132,.45)",
  borderRadius: "13px",
  background:
    "rgba(79,190,132,.1)",
  color: "#83e3ad",
  padding: "15px 17px",
  fontWeight: "800",
};

const formGridStyle = {
  display: "grid",
  gap: "20px",
};

const sectionStyle = {
  border:
    "1px solid rgba(255,255,255,.11)",
  borderRadius: "18px",
  background:
    "rgba(255,255,255,.035)",
  padding: "24px",
};

const sectionTitleStyle = {
  margin: "0 0 7px",
  fontSize: "22px",
};

const fieldLabelStyle = {
  color: "#e8eeeb",
  fontSize: "14px",
  fontWeight: "850",
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
};

const codeTextareaStyle = {
  ...textareaStyle,
  fontFamily:
    "Consolas, Monaco, monospace",
  fontSize: "13px",
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
    "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
  gap: "18px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  border:
    "1px solid rgba(255,255,255,.1)",
  borderRadius: "12px",
  padding: "15px",
  cursor: "pointer",
  background:
    "rgba(255,255,255,.025)",
};

const checkboxInputStyle = {
  width: "18px",
  height: "18px",
  marginTop: "2px",
  accentColor: "#d9b56d",
};

const helpTextStyle = {
  color: "#98a49f",
  fontSize: "13px",
  lineHeight: 1.45,
};

const mutedTextStyle = {
  margin: 0,
  color: "#98a49f",
  lineHeight: 1.55,
};

const currencyStyle = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9eaaa6",
  fontWeight: "850",
};

const actionRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
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
    "1px solid rgba(255,255,255,.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};