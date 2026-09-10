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

function dollarsToCents(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100);
}

function parseJsonList(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function formatList(value) {
  return parseJsonList(value).join(", ");
}

async function saveProductBase(formData) {
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

  const productType = String(
    formData.get("productType") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const notes = String(
    formData.get("notes") || ""
  ).trim();

  const material = String(
    formData.get("material") || ""
  ).trim();

  const finish = String(
    formData.get("finish") || ""
  ).trim();

  const color = String(
    formData.get("color") || ""
  ).trim();

  const style = String(
    formData.get("style") || ""
  ).trim();

  const edge = String(
    formData.get("edge") || ""
  ).trim();

  const supplierId = String(
    formData.get("supplierId") || ""
  ).trim();

  const supplierModel = String(
    formData.get("supplierModel") || ""
  ).trim();

  const supplierSku = String(
    formData.get("supplierSku") || ""
  ).trim();

  const supplierUrl = String(
    formData.get("supplierUrl") || ""
  ).trim();

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const supplierCostCents =
    dollarsToCents(
      formData.get("supplierCost")
    );

  const estimatedShippingCostCents =
    dollarsToCents(
      formData.get("estimatedShippingCost")
    );

  const landedCostCents =
    dollarsToCents(
      formData.get("landedCost")
    );

  const active =
    formData.get("active") === "on";

  const featured =
    formData.get("featured") === "on";

  const comfortFit =
    formData.get("comfortFit") === "on";

  const allowEngraving =
    formData.get("allowEngraving") === "on";

  const collectionIds = formData
    .getAll("collectionIds")
    .map((value) => String(value))
    .filter(Boolean);

  if (!id) {
    throw new Error(
      "Product Base ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Product Base name is required."
    );
  }

  if (!productType) {
    throw new Error(
      "Product Type is required."
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

  const duplicateSlug =
    await prisma.productBase.findFirst({
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

  if (duplicateSlug) {
    throw new Error(
      "Another Product Base already uses that slug."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.productBase.update({
      where: {
        id,
      },

      data: {
        name,
        slug,
        productType,

        description:
          description || null,

        notes:
          notes || null,

        material:
          material || null,

        finish:
          finish || null,

        color:
          color || null,

        style:
          style || null,

        edge:
          edge || null,

        comfortFit,
        allowEngraving,

        imageUrl:
          imageUrl || null,

        supplierId:
          supplierId || null,

        supplierModel:
          supplierModel || null,

        supplierSku:
          supplierSku || null,

        supplierUrl:
          supplierUrl || null,

        supplierCostCents,

        estimatedShippingCostCents,

        landedCostCents,

        active,
        featured,

        sortOrder:
          Number.isFinite(sortOrder)
            ? sortOrder
            : 0,
      },
    });

    await tx.collectionProductBase.deleteMany({
      where: {
        productBaseId: id,
      },
    });

    if (collectionIds.length > 0) {
      await tx.collectionProductBase.createMany({
        data: collectionIds.map(
          (collectionId, index) => ({
            productBaseId: id,
            collectionId,

            active: true,
            sortOrder: index,
          })
        ),
      });
    }
  });

  revalidatePath(
    "/admin/product-bases"
  );

  revalidatePath(
    `/admin/product-bases/${id}`
  );

  redirect(
    `/admin/product-bases/${id}?saved=true`
  );
}

export default async function EditProductBasePage({
  params,
  searchParams,
}) {
  const { id } = await params;

  const resolvedSearchParams =
    await searchParams;

  const [
    product,
    suppliers,
    collections,
  ] = await Promise.all([
    prisma.productBase.findUnique({
      where: {
        id,
      },

      include: {
        supplier: true,

        collections: {
          include: {
            collection: true,
          },

          orderBy: {
            sortOrder: "asc",
          },
        },

        variants: {
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
      },
    }),

    prisma.supplier.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.collection.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const selectedCollectionIds =
    new Set(
      product.collections.map(
        (link) => link.collectionId
      )
    );

  const saved =
    resolvedSearchParams?.saved === "true";

  return (
    <main
      style={{
        padding: "32px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/admin/product-bases"
          style={{
            display: "inline-flex",
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "850",
            marginBottom: "18px",
          }}
        >
          ← Back to Product Bases
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
          Product Catalog
        </p>

        <h1
          style={{
            margin: 0,
            fontSize:
              "clamp(34px, 5vw, 52px)",
            lineHeight: 1.05,
          }}
        >
          Edit {product.name}
        </h1>

        <p
          style={{
            margin: "12px 0 28px",
            color: "#aab6b1",
            maxWidth: "760px",
            lineHeight: 1.65,
          }}
        >
          Manage product information,
          supplier costs, collection
          assignments, availability, and
          imported variants.
        </p>

        {saved ? (
          <div
            style={{
              marginBottom: "20px",
              border:
                "1px solid rgba(79, 190, 132, 0.45)",
              borderRadius: "13px",
              background:
                "rgba(79, 190, 132, 0.1)",
              color: "#83e3ad",
              padding: "15px 17px",
              fontWeight: "800",
            }}
          >
            Product Base saved successfully.
          </div>
        ) : null}

        <form action={saveProductBase}>
          <input
            type="hidden"
            name="id"
            value={product.id}
          />

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="General Information"
              description="Edit the product name, type, URL slug, and description."
            >
              <div style={twoColumnGridStyle}>
                <Field
                  label="Product Name"
                  required
                >
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={
                      product.name
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="URL Slug">
                  <input
                    name="slug"
                    type="text"
                    defaultValue={
                      product.slug
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={twoColumnGridStyle}>
                <Field
                  label="Product Type"
                  required
                >
                  <select
                    name="productType"
                    required
                    defaultValue={
                      product.productType
                    }
                    style={inputStyle}
                  >
                    <option value="channel-ring">
                      Channel Ring
                    </option>

                    <option value="bezel-ring">
                      Bezel Ring
                    </option>

                    <option value="bracelet">
                      Bracelet
                    </option>

                    <option value="necklace">
                      Necklace
                    </option>

                    <option value="pendant">
                      Pendant
                    </option>

                    <option value="cross">
                      Cross
                    </option>

                    <option value="heart">
                      Heart
                    </option>

                    <option value="jewelry-base">
                      Other Jewelry Base
                    </option>
                  </select>
                </Field>

                <Field label="Sort Order">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={
                      product.sortOrder
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={
                    product.description || ""
                  }
                  style={textareaStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Material and Appearance"
              description="Describe the material, finish, color, style, and edge profile."
            >
              <div style={threeColumnGridStyle}>
                <Field label="Material">
                  <input
                    name="material"
                    type="text"
                    defaultValue={
                      product.material || ""
                    }
                    placeholder="Tungsten"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Finish">
                  <input
                    name="finish"
                    type="text"
                    defaultValue={
                      product.finish || ""
                    }
                    placeholder="Polished"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Color">
                  <input
                    name="color"
                    type="text"
                    defaultValue={
                      product.color || ""
                    }
                    placeholder="Black"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Style">
                  <input
                    name="style"
                    type="text"
                    defaultValue={
                      product.style || ""
                    }
                    placeholder="Hammered"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Edge">
                  <input
                    name="edge"
                    type="text"
                    defaultValue={
                      product.edge || ""
                    }
                    placeholder="Beveled Edge"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <CheckboxField
                name="comfortFit"
                label="Comfort Fit"
                description="This product uses a comfort-fit interior."
                defaultChecked={
                  Boolean(product.comfortFit)
                }
              />
            </FormSection>

            <FormSection
              title="Engraving"
              description="Control whether this Product Base can offer inside engraving."
            >
              <CheckboxField
                name="allowEngraving"
                label="Allow Inside Engraving"
                description="When enabled, the customer configurator can show engraving when this Product Base is selected."
                defaultChecked={
                  Boolean(product.allowEngraving)
                }
              />
            </FormSection>

            <FormSection
              title="Supplier and Costs"
              description="Manage purchasing information and your total landed cost."
            >
              <div style={twoColumnGridStyle}>
                <Field label="Supplier">
                  <select
                    name="supplierId"
                    defaultValue={
                      product.supplierId || ""
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      No Supplier
                    </option>

                    {suppliers.map(
                      (supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Supplier Model">
                  <input
                    name="supplierModel"
                    type="text"
                    defaultValue={
                      product.supplierModel ||
                      ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Supplier SKU">
                  <input
                    name="supplierSku"
                    type="text"
                    defaultValue={
                      product.supplierSku ||
                      ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Supplier URL">
                  <input
                    name="supplierUrl"
                    type="url"
                    defaultValue={
                      product.supplierUrl ||
                      ""
                    }
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={threeColumnGridStyle}>
                <MoneyField
                  name="supplierCost"
                  label="Supplier Cost"
                  cents={
                    product.supplierCostCents
                  }
                />

                <MoneyField
                  name="estimatedShippingCost"
                  label="Estimated Shipping"
                  cents={
                    product.estimatedShippingCostCents
                  }
                />

                <MoneyField
                  name="landedCost"
                  label="Landed Cost"
                  cents={
                    product.landedCostCents
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Collection Assignments"
              description="Choose every collection that can use this Product Base."
            >
              <div style={checkboxGridStyle}>
                {collections.map(
                  (collection) => (
                    <CheckboxField
                      key={collection.id}
                      name="collectionIds"
                      value={collection.id}
                      label={collection.name}
                      description={`/${collection.slug}`}
                      defaultChecked={selectedCollectionIds.has(
                        collection.id
                      )}
                    />
                  )
                )}
              </div>
            </FormSection>

            <FormSection
              title="Product Image"
              description="Upload or replace the Product Base image."
            >
              <ImageUploader
                name="imageUrl"
                label="Product Base Image"
                folder="product-bases"
                defaultValue={
                  product.imageUrl || ""
                }
                helpText="Upload a JPG, PNG, or WebP image."
              />
            </FormSection>

            <FormSection
              title={`Variants (${product.variants.length})`}
              description="These variants were imported from your existing product files."
            >
              {product.variants.length ===
              0 ? (
                <p style={mutedTextStyle}>
                  No variants have been added.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {product.variants.map(
                    (variant) => (
                      <VariantCard
                        key={variant.id}
                        variant={variant}
                        productBaseId={product.id}
                      />
                    )
                  )}
                </div>
              )}
            </FormSection>

            <FormSection
              title="Internal Notes"
              description="These notes are visible only in your admin."
            >
              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={6}
                  defaultValue={
                    product.notes || ""
                  }
                  style={textareaStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Status"
              description="Control whether this Product Base is available."
            >
              <CheckboxField
                name="active"
                label="Active"
                description="Available for collections and customer selections."
                defaultChecked={
                  product.active
                }
              />

              <CheckboxField
                name="featured"
                label="Featured"
                description="Mark this as a frequently used or important Product Base."
                defaultChecked={
                  product.featured
                }
              />
            </FormSection>

            <div style={actionRowStyle}>
              <Link
                href="/admin/product-bases"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Save Product Base
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function VariantCard({
  variant,
  productBaseId,
}) {
  const sizes = formatList(
    variant.sizesJson
  );

  const finishes = formatList(
    variant.finishesJson
  );

  const bezelSizes = formatList(
    variant.bezelSizesJson
  );

  const chainOptions = parseJsonList(
    variant.chainOptionsJson
  )
    .map((option) => {
      if (
        option &&
        typeof option === "object"
      ) {
        return (
          option.name ||
          option.label ||
          option.id
        );
      }

      return String(option);
    })
    .filter(Boolean)
    .join(", ");

  const lengths = formatList(
    variant.lengthsJson
  );

  return (
    <div
      style={{
        border:
          "1px solid rgba(255,255,255,0.11)",
        borderRadius: "13px",
        background:
          "rgba(255,255,255,0.025)",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              marginBottom: "7px",
              fontSize: "17px",
            }}
          >
            {variant.name ||
              variant.variantKey}
          </strong>

          <div style={mutedTextStyle}>
            {variant.widthMm != null
              ? `${variant.widthMm}mm width`
              : "No width"}

            {variant.channelWidthMm != null
              ? ` • ${variant.channelWidthMm}mm channel`
              : ""}

            {variant.channelLayout
              ? ` • ${variant.channelLayout}`
              : ""}

            {variant.finish
              ? ` • ${variant.finish}`
              : ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              borderRadius: "999px",
              padding: "5px 10px",
              background: variant.active
                ? "rgba(79,190,132,.14)"
                : "rgba(255,255,255,.08)",
              color: variant.active
                ? "#7fe0aa"
                : "#bec9c5",
              fontSize: "12px",
              fontWeight: "850",
            }}
          >
            {variant.active
              ? "Active"
              : "Inactive"}
          </span>

          <Link
            href={`/admin/product-bases/${productBaseId}/variants/${variant.id}`}
            style={{
              minHeight: "34px",
              padding: "0 12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              border:
                "1px solid rgba(217,181,109,.35)",
              color: "#d9b56d",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "850",
            }}
          >
            Edit Variant
          </Link>
        </div>
      </div>

      {sizes ? (
        <p style={variantDetailStyle}>
          <strong>Ring sizes:</strong>{" "}
          {sizes}
        </p>
      ) : null}

      {finishes ? (
        <p style={variantDetailStyle}>
          <strong>Finishes:</strong>{" "}
          {finishes}
        </p>
      ) : null}

      {bezelSizes ? (
        <p style={variantDetailStyle}>
          <strong>Bezel sizes:</strong>{" "}
          {bezelSizes}
        </p>
      ) : null}

      {chainOptions ? (
        <p style={variantDetailStyle}>
          <strong>Chain options:</strong>{" "}
          {chainOptions}
        </p>
      ) : null}

      {lengths ? (
        <p style={variantDetailStyle}>
          <strong>Lengths:</strong>{" "}
          {lengths}
        </p>
      ) : null}

      <p style={variantDetailStyle}>
        <strong>Inventory:</strong>{" "}
        {variant.inventoryQuantity}
      </p>
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
          "1px solid rgba(255,255,255,0.11)",
        borderRadius: "18px",
        background:
          "rgba(255,255,255,0.035)",
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
    </label>
  );
}

function MoneyField({
  name,
  label,
  cents,
}) {
  return (
    <Field label={label}>
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
          name={name}
          type="number"
          min="0"
          step="0.01"
          defaultValue={(
            Number(cents || 0) / 100
          ).toFixed(2)}
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
  value,
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
          "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "15px",
        cursor: "pointer",
        background:
          "rgba(255,255,255,0.025)",
      }}
    >
      <input
        name={name}
        value={value}
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
    "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
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

const checkboxGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "12px",
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
    "1px solid rgba(255,255,255,0.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};

const mutedTextStyle = {
  margin: 0,
  color: "#98a49f",
  lineHeight: 1.55,
};

const variantDetailStyle = {
  margin: "10px 0 0",
  color: "#aab6b1",
  fontSize: "13px",
  lineHeight: 1.5,
};