import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dollarsToCents(value) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return 0;
  }

  return Math.round(amount * 100);
}

async function createProductBase(formData) {
  "use server";
  await requireAdmin();

  const session = await auth();

  const sessionEmail = String(
    session?.user?.email || ""
  )
    .trim()
    .toLowerCase();

  if (
    !ADMIN_EMAIL ||
    sessionEmail !== ADMIN_EMAIL
  ) {
    throw new Error("Unauthorized.");
  }

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

  const imageUrl = String(
    formData.get("imageUrl") || ""
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

  const sortOrder = Number(
    formData.get("sortOrder") || 0
  );

  const supplierCostCents =
    dollarsToCents(
      formData.get("supplierCost")
    );

  const estimatedShippingCostCents =
    dollarsToCents(
      formData.get(
        "estimatedShippingCost"
      )
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
    formData.get("allowEngraving") ===
    "on";

  const collectionIds = formData
    .getAll("collectionIds")
    .map((value) => String(value))
    .filter(Boolean);

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
    await prisma.productBase.findUnique({
      where: {
        slug,
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

  const product =
    await prisma.$transaction(
      async (tx) => {
        const created =
          await tx.productBase.create({
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

        if (
          collectionIds.length > 0
        ) {
          await tx.collectionProductBase.createMany(
            {
              data: collectionIds.map(
                (
                  collectionId,
                  index
                ) => ({
                  productBaseId:
                    created.id,

                  collectionId,

                  active: true,

                  sortOrder: index,
                })
              ),
            }
          );
        }

        return created;
      }
    );

  revalidatePath(
    "/admin/product-bases"
  );

  revalidatePath(
    `/admin/product-bases/${product.id}`
  );

  redirect(
    `/admin/product-bases/${product.id}?saved=true`
  );
}

const fieldStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "9px",
  border:
    "1px solid rgba(255,255,255,.16)",
  background:
    "rgba(255,255,255,.04)",
  color: "inherit",
  fontSize: "15px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "grid",
  gap: "7px",
  fontWeight: "700",
};

const sectionStyle = {
  border:
    "1px solid rgba(255,255,255,.12)",
  borderRadius: "16px",
  padding: "22px",
  display: "grid",
  gap: "18px",
};

export default async function NewProductBasePage() {
  const session = await auth();

  const sessionEmail = String(
    session?.user?.email || ""
  )
    .trim()
    .toLowerCase();

  if (
    !ADMIN_EMAIL ||
    sessionEmail !== ADMIN_EMAIL
  ) {
    redirect("/admin/login");
  }

  const [
    suppliers,
    collections,
  ] = await Promise.all([
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

      select: {
        id: true,
        name: true,
      },
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

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              color: "#d9b56d",
              fontWeight: "800",
              margin:
                "0 0 6px",
            }}
          >
            ADMIN
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "40px",
            }}
          >
            New Product Base
          </h1>

          <p
            style={{
              margin:
                "10px 0 0",
              color: "#9aa5a0",
              lineHeight: 1.6,
            }}
          >
            Create a reusable product
            base and connect it to one
            or more collections.
          </p>
        </div>

        <form
          action={createProductBase}
          style={{
            display: "grid",
            gap: "22px",
          }}
        >
          <section
            style={sectionStyle}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              General
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <label
                style={labelStyle}
              >
                Name *

                <input
                  name="name"
                  required
                  style={fieldStyle}
                  placeholder="Example: 8mm Tungsten Channel Ring"
                />
              </label>

              <label
                style={labelStyle}
              >
                Slug

                <input
                  name="slug"
                  style={fieldStyle}
                  placeholder="Automatically generated from name"
                />
              </label>

              <label
                style={labelStyle}
              >
                Product Type *

                <input
                  name="productType"
                  required
                  style={fieldStyle}
                  placeholder="channel-ring"
                />
              </label>

              <label
                style={labelStyle}
              >
                Sort Order

                <input
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
                  style={fieldStyle}
                />
              </label>
            </div>

            <label
              style={labelStyle}
            >
              Description

              <textarea
                name="description"
                rows={4}
                style={{
                  ...fieldStyle,
                  resize: "vertical",
                }}
              />
            </label>

            <label
              style={labelStyle}
            >
              Internal Notes

              <textarea
                name="notes"
                rows={4}
                style={{
                  ...fieldStyle,
                  resize: "vertical",
                }}
              />
            </label>
          </section>

          <section
            style={sectionStyle}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Product Details
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <label
                style={labelStyle}
              >
                Material

                <input
                  name="material"
                  style={fieldStyle}
                  placeholder="Tungsten"
                />
              </label>

              <label
                style={labelStyle}
              >
                Finish

                <input
                  name="finish"
                  style={fieldStyle}
                  placeholder="Polished"
                />
              </label>

              <label
                style={labelStyle}
              >
                Color

                <input
                  name="color"
                  style={fieldStyle}
                  placeholder="Silver"
                />
              </label>

              <label
                style={labelStyle}
              >
                Style

                <input
                  name="style"
                  style={fieldStyle}
                />
              </label>

              <label
                style={labelStyle}
              >
                Edge

                <input
                  name="edge"
                  style={fieldStyle}
                />
              </label>
            </div>

            <label
              style={labelStyle}
            >
              Image URL

              <input
                name="imageUrl"
                type="url"
                style={fieldStyle}
                placeholder="https://..."
              />
            </label>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  name="comfortFit"
                />{" "}
                Comfort Fit
              </label>

              <label>
                <input
                  type="checkbox"
                  name="allowEngraving"
                />{" "}
                Allow Engraving
              </label>

              <label>
                <input
                  type="checkbox"
                  name="featured"
                />{" "}
                Featured
              </label>

              <label>
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                />{" "}
                Active
              </label>
            </div>
          </section>

          <section
            style={sectionStyle}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Supplier
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <label
                style={labelStyle}
              >
                Supplier

                <select
                  name="supplierId"
                  defaultValue=""
                  style={fieldStyle}
                >
                  <option value="">
                    No supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={
                          supplier.id
                        }
                        value={
                          supplier.id
                        }
                      >
                        {
                          supplier.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                style={labelStyle}
              >
                Supplier Model

                <input
                  name="supplierModel"
                  style={fieldStyle}
                />
              </label>

              <label
                style={labelStyle}
              >
                Supplier SKU

                <input
                  name="supplierSku"
                  style={fieldStyle}
                />
              </label>

              <label
                style={labelStyle}
              >
                Supplier URL

                <input
                  name="supplierUrl"
                  type="url"
                  style={fieldStyle}
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          <section
            style={sectionStyle}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Costs
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <label
                style={labelStyle}
              >
                Supplier Cost ($)

                <input
                  name="supplierCost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  style={fieldStyle}
                />
              </label>

              <label
                style={labelStyle}
              >
                Estimated Shipping
                Cost ($)

                <input
                  name="estimatedShippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  style={fieldStyle}
                />
              </label>

              <label
                style={labelStyle}
              >
                Landed Cost ($)

                <input
                  name="landedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  style={fieldStyle}
                />
              </label>
            </div>
          </section>

          <section
            style={sectionStyle}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Collections
            </h2>

            {collections.length ===
            0 ? (
              <p
                style={{
                  margin: 0,
                  color: "#9aa5a0",
                }}
              >
                No collections are
                available.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {collections.map(
                  (collection) => (
                    <label
                      key={
                        collection.id
                      }
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        alignItems:
                          "center",
                        padding:
                          "12px",
                        border:
                          "1px solid rgba(255,255,255,.1)",
                        borderRadius:
                          "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="collectionIds"
                        value={
                          collection.id
                        }
                      />

                      <span>
                        {
                          collection.name
                        }
                      </span>
                    </label>
                  )
                )}
              </div>
            )}
          </section>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "12px",
            }}
          >
            <Link
              href="/admin/product-bases"
              style={{
                padding:
                  "13px 22px",
                borderRadius:
                  "10px",
                border:
                  "1px solid rgba(255,255,255,.16)",
                color: "inherit",
                textDecoration:
                  "none",
                fontWeight: "800",
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              style={{
                padding:
                  "13px 24px",
                borderRadius:
                  "10px",
                border: 0,
                background:
                  "#d9b56d",
                color: "#111",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              Create Product Base
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}