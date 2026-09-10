import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const inputStyle = {
  width: "100%",
  minHeight: "44px",
  padding: "10px 12px",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: "9px",
  background: "rgba(0, 0, 0, 0.18)",
  color: "#eef3f0",
  fontSize: "14px",
  outline: "none",
};

const sectionStyle = {
  display: "grid",
  gap: "18px",
  padding: "22px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.025)",
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return session;
}

function centsToDollars(cents) {
  const amount = Number(cents);

  if (!Number.isFinite(amount)) {
    return "0.00";
  }

  return (amount / 100).toFixed(2);
}

function dollarsToCents(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error("All prices must be valid numbers.");
  }

  return Math.round(amount * 100);
}

function formatMoneyFromCents(cents) {
  const amount = Number(cents);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

function formatCategoryName(category) {
  return String(category || "Other")
    .replace(/\./g, " › ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function groupRules(rules) {
  const grouped = new Map();

  for (const rule of rules) {
    const category = rule.category || "other";

    if (!grouped.has(category)) {
      grouped.set(category, []);
    }

    grouped.get(category).push(rule);
  }

  return Array.from(grouped.entries()).map(
    ([category, categoryRules]) => ({
      category,
      rules: categoryRules,
    })
  );
}

export async function updateCollectionPricing(formData) {
  "use server";

  await requireAdmin();

  const collectionId = String(
    formData.get("collectionId") || ""
  ).trim();

  if (!collectionId) {
    throw new Error("Collection ID is missing.");
  }

  const existingCollection =
    await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },

      include: {
        pricingProfile: true,

        pricingRules: {
          orderBy: [
            {
              category: "asc",
            },
            {
              sortOrder: "asc",
            },
          ],
        },
      },
    });

  if (!existingCollection) {
    throw new Error(
      "This collection no longer exists."
    );
  }

  const baseProductCents = dollarsToCents(
    formData.get("baseProduct")
  );

  const profitCents = dollarsToCents(
    formData.get("profit")
  );

  const overrideValue = String(
    formData.get("startingPriceOverride") || ""
  ).trim();

  const startingPriceOverrideCents =
    overrideValue === ""
      ? null
      : dollarsToCents(overrideValue);

  const profileActive =
    formData.get("profileActive") === "on";

  const notes = String(
    formData.get("notes") || ""
  ).trim();

  if (baseProductCents < 0) {
    throw new Error(
      "Base product cost cannot be negative."
    );
  }

  if (profitCents < 0) {
    throw new Error(
      "Profit cannot be negative."
    );
  }

  if (
    startingPriceOverrideCents !== null &&
    startingPriceOverrideCents < 0
  ) {
    throw new Error(
      "Starting-price override cannot be negative."
    );
  }

  const updatedRules =
    existingCollection.pricingRules.map((rule) => {
      const amountField = `ruleAmount_${rule.id}`;
      const labelField = `ruleLabel_${rule.id}`;
      const activeField = `ruleActive_${rule.id}`;

      const amountCents = dollarsToCents(
        formData.get(amountField)
      );

      const label = String(
        formData.get(labelField) || rule.label
      ).trim();

      const active =
        formData.get(activeField) === "on";

      if (!label) {
        throw new Error(
          `A label is required for ${rule.optionKey}.`
        );
      }

      return {
        id: rule.id,
        amountCents,
        label,
        active,
      };
    });

  const calculatedStartingCents =
    startingPriceOverrideCents ??
    baseProductCents + profitCents;

  await prisma.$transaction(
    async (transaction) => {
      await transaction.collectionPricingProfile.upsert({
        where: {
          collectionId,
        },

        create: {
          collectionId,
          baseProductCents,
          profitCents,
          startingPriceOverrideCents,
          active: profileActive,
          notes: notes || null,
        },

        update: {
          baseProductCents,
          profitCents,
          startingPriceOverrideCents,
          active: profileActive,
          notes: notes || null,
        },
      });

      for (const rule of updatedRules) {
        await transaction.collectionPricingRule.update({
          where: {
            id: rule.id,
          },

          data: {
            amountCents: rule.amountCents,
            label: rule.label,
            active: rule.active,
          },
        });
      }

      await transaction.collection.update({
  where: {
    id: collectionId,
  },

  data: {
    pricingUpdatedAt: new Date(),
  },
});
    }
  );

  revalidatePath("/admin/pricing");
  revalidatePath(
    `/admin/pricing/${collectionId}`
  );
  revalidatePath("/collections");
  revalidatePath(
    `/collections/${existingCollection.slug}`
  );
  revalidatePath("/");

  redirect(
    `/admin/pricing/${collectionId}?saved=true`
  );
}

export default async function EditPricingPage({
  params,
  searchParams,
}) {
  const { id } = await params;
  const query = await searchParams;

  const collection =
    await prisma.collection.findUnique({
      where: {
        id,
      },

      include: {
        pricingProfile: true,

        pricingRules: {
          orderBy: [
            {
              category: "asc",
            },
            {
              sortOrder: "asc",
            },
            {
              label: "asc",
            },
          ],
        },
      },
    });

  if (!collection) {
    notFound();
  }

  const profile =
    collection.pricingProfile;

  const groupedRules =
    groupRules(collection.pricingRules);

  const baseProductCents =
    profile?.baseProductCents || 0;

  const profitCents =
    profile?.profitCents || 0;

  const overrideCents =
    profile?.startingPriceOverrideCents ??
    null;

  const calculatedStartingCents =
    overrideCents ??
    baseProductCents + profitCents;

  const saved =
    query?.saved === "true";

  return (
    <main
      style={{
        maxWidth: "1150px",
        margin: "0 auto",
        padding: "40px 24px 90px",
      }}
    >
      <Link
        href="/admin/pricing"
        style={{
          color: "#d9b56d",
          fontWeight: "800",
          textDecoration: "none",
        }}
      >
        ← Back to Pricing
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "18px",
          marginTop: "28px",
          marginBottom: "26px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#d9b56d",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Collection Pricing
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              color: "#eef3f0",
              fontSize: "38px",
            }}
          >
            {collection.name}
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              color: "#98a49f",
              lineHeight: 1.6,
            }}
          >
            Edit base pricing and every imported
            pricing adjustment for this collection.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <StatusBadge
            label={
              collection.published
                ? "Published"
                : "Draft"
            }
            tone={
              collection.published
                ? "success"
                : "neutral"
            }
          />

          <StatusBadge
            label={`${collection.pricingRules.length} Rules`}
            tone="gold"
          />
        </div>
      </div>

      {saved ? (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            border:
              "1px solid rgba(134, 239, 172, 0.3)",
            borderRadius: "12px",
            background:
              "rgba(134, 239, 172, 0.08)",
            color: "#86efac",
            fontWeight: "800",
          }}
        >
          Pricing changes saved successfully.
        </div>
      ) : null}

      {!profile ? (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            border:
              "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "12px",
            background:
              "rgba(251, 191, 36, 0.08)",
            color: "#fbbf24",
          }}
        >
          This collection does not have a normalized
          pricing profile yet. Running the pricing
          normalization script will create one.
        </div>
      ) : null}

      <form action={updateCollectionPricing}>
        <input
          type="hidden"
          name="collectionId"
          value={collection.id}
        />

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          <section style={sectionStyle}>
            <SectionHeading
              eyebrow="Base Pricing"
              title="Collection Starting Price"
              description="Set the core product cost, your profit, and an optional starting-price override."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "14px",
              }}
            >
              <MoneyField
                label="Base Product Cost"
                name="baseProduct"
                defaultValue={centsToDollars(
                  baseProductCents
                )}
                description="Your underlying cost for the product."
              />

              <MoneyField
                label="Profit"
                name="profit"
                defaultValue={centsToDollars(
                  profitCents
                )}
                description="The profit amount added to the base cost."
              />

              <MoneyField
                label="Starting Price Override"
                name="startingPriceOverride"
                defaultValue={
                  overrideCents === null
                    ? ""
                    : centsToDollars(
                        overrideCents
                      )
                }
                required={false}
                description="Leave blank to use base product plus profit."
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              <PriceSummary
                label="Base Product"
                value={formatMoneyFromCents(
                  baseProductCents
                )}
              />

              <PriceSummary
                label="Profit"
                value={formatMoneyFromCents(
                  profitCents
                )}
              />

              <PriceSummary
                label="Current Starting Price"
                value={formatMoneyFromCents(
                  calculatedStartingCents
                )}
                highlighted
              />

              <PriceSummary
                label="Public Catalog Price"
                value={new Intl.NumberFormat(
                  "en-US",
                  {
                    style: "currency",
                    currency: "USD",
                  }
                ).format(
                  collection.startingPrice
                )}
              />
            </div>

            <label
              style={{
                display: "grid",
                gridTemplateColumns:
                  "auto minmax(0, 1fr)",
                gap: "11px",
                alignItems: "start",
                padding: "13px",
                border:
                  "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "11px",
                background:
                  "rgba(0, 0, 0, 0.12)",
              }}
            >
              <input
                name="profileActive"
                type="checkbox"
                defaultChecked={
                  profile?.active ?? true
                }
                style={{
                  width: "17px",
                  height: "17px",
                  marginTop: "2px",
                  accentColor: "#d9b56d",
                }}
              />

              <span>
                <strong
                  style={{
                    display: "block",
                    color: "#eef3f0",
                  }}
                >
                  Pricing profile active
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "#98a49f",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Keep this enabled when the collection
                  should use its normalized pricing.
                </span>
              </span>
            </label>

            <label
              style={{
                display: "grid",
                gap: "8px",
              }}
            >
              <span
                style={{
                  color: "#dfe7e3",
                  fontSize: "13px",
                  fontWeight: "800",
                }}
              >
                Internal Pricing Notes
              </span>

              <textarea
                name="notes"
                rows={4}
                defaultValue={
                  profile?.notes || ""
                }
                placeholder="Optional notes about costs, suppliers, margins, or future price changes."
                style={{
                  ...inputStyle,
                  minHeight: "110px",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </label>
          </section>

          {groupedRules.length === 0 ? (
            <section style={sectionStyle}>
              <SectionHeading
                eyebrow="Adjustments"
                title="No Pricing Rules"
                description="This collection does not currently have any imported pricing adjustments."
              />
            </section>
          ) : (
            groupedRules.map(
              ({ category, rules }) => (
                <section
                  key={category}
                  style={sectionStyle}
                >
                  <SectionHeading
                    eyebrow="Pricing Adjustments"
                    title={formatCategoryName(
                      category
                    )}
                    description={`${rules.length} ${
                      rules.length === 1
                        ? "pricing option"
                        : "pricing options"
                    } in this category.`}
                  />

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                    }}
                  >
                    {rules.map((rule) => (
                      <PricingRuleRow
                        key={rule.id}
                        rule={rule}
                      />
                    ))}
                  </div>
                </section>
              )
            )
          )}

          <div
            style={{
              position: "sticky",
              bottom: "14px",
              zIndex: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              padding: "14px",
              border:
                "1px solid rgba(217, 181, 109, 0.28)",
              borderRadius: "14px",
              background:
                "rgba(10, 18, 15, 0.96)",
              boxShadow:
                "0 18px 45px rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(14px)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#98a49f",
                fontSize: "13px",
              }}
            >
              Saving updates the database pricing for
              this collection.
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/admin/pricing"
                style={{
                  display: "inline-flex",
                  minHeight: "46px",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 18px",
                  border:
                    "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "10px",
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
                  minHeight: "46px",
                  padding: "0 22px",
                  border: 0,
                  borderRadius: "10px",
                  background:
                    "linear-gradient(90deg, #efc15c, #c99425)",
                  color: "#111814",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Save Pricing Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          color: "#d9b56d",
          fontSize: "11px",
          fontWeight: "900",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "7px 0 0",
          color: "#eef3f0",
          fontSize: "22px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "7px 0 0",
          color: "#98a49f",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function MoneyField({
  label,
  name,
  defaultValue,
  description,
  required = true,
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
          color: "#dfe7e3",
          fontSize: "13px",
          fontWeight: "800",
        }}
      >
        {label}
      </span>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "42px 1fr",
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            border:
              "1px solid rgba(255, 255, 255, 0.14)",
            borderRight: 0,
            borderRadius: "9px 0 0 9px",
            background:
              "rgba(255, 255, 255, 0.04)",
            color: "#d9b56d",
            fontWeight: "900",
          }}
        >
          $
        </span>

        <input
          name={name}
          type="number"
          min="0"
          step="0.01"
          required={required}
          defaultValue={defaultValue}
          style={{
            ...inputStyle,
            borderRadius: "0 9px 9px 0",
          }}
        />
      </div>

      <span
        style={{
          color: "#83908a",
          fontSize: "11px",
          lineHeight: 1.45,
        }}
      >
        {description}
      </span>
    </label>
  );
}

function PricingRuleRow({ rule }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(180px, 1fr) minmax(130px, 180px) auto",
        gap: "12px",
        alignItems: "end",
        padding: "13px",
        border:
          "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "12px",
        background:
          "rgba(0, 0, 0, 0.12)",
      }}
    >
      <label
        style={{
          display: "grid",
          gap: "7px",
        }}
      >
        <span
          style={{
            color: "#8f9b96",
            fontSize: "10px",
            fontWeight: "900",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Option Label
        </span>

        <input
          name={`ruleLabel_${rule.id}`}
          type="text"
          required
          defaultValue={rule.label}
          style={inputStyle}
        />

        <span
          style={{
            color: "#718079",
            fontSize: "10px",
          }}
        >
          Key: {rule.optionKey}
        </span>
      </label>

      <label
        style={{
          display: "grid",
          gap: "7px",
        }}
      >
        <span
          style={{
            color: "#8f9b96",
            fontSize: "10px",
            fontWeight: "900",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Adjustment
        </span>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              border:
                "1px solid rgba(255, 255, 255, 0.14)",
              borderRight: 0,
              borderRadius: "9px 0 0 9px",
              color: "#d9b56d",
              fontWeight: "900",
            }}
          >
            $
          </span>

          <input
            name={`ruleAmount_${rule.id}`}
            type="number"
            step="0.01"
            required
            defaultValue={centsToDollars(
              rule.amountCents
            )}
            style={{
              ...inputStyle,
              borderRadius: "0 9px 9px 0",
            }}
          />
        </div>
      </label>

      <label
        style={{
          display: "flex",
          minHeight: "44px",
          alignItems: "center",
          gap: "8px",
          padding: "0 12px",
          border:
            "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "9px",
          cursor: "pointer",
        }}
      >
        <input
          name={`ruleActive_${rule.id}`}
          type="checkbox"
          defaultChecked={rule.active}
          style={{
            width: "16px",
            height: "16px",
            accentColor: "#d9b56d",
          }}
        />

        <span
          style={{
            color: "#dfe7e3",
            fontSize: "12px",
            fontWeight: "800",
          }}
        >
          Active
        </span>
      </label>
    </div>
  );
}

function PriceSummary({
  label,
  value,
  highlighted = false,
}) {
  return (
    <div
      style={{
        padding: "14px",
        border: highlighted
          ? "1px solid rgba(217, 181, 109, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "11px",
        background: highlighted
          ? "rgba(217, 181, 109, 0.08)"
          : "rgba(0, 0, 0, 0.12)",
      }}
    >
      <div
        style={{
          color: "#8f9b96",
          fontSize: "10px",
          fontWeight: "900",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          color: highlighted
            ? "#d9b56d"
            : "#eef3f0",
          fontSize: "21px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  tone = "neutral",
}) {
  const tones = {
    success: {
      border:
        "1px solid rgba(134, 239, 172, 0.3)",
      background:
        "rgba(134, 239, 172, 0.1)",
      color: "#86efac",
    },

    gold: {
      border:
        "1px solid rgba(217, 181, 109, 0.35)",
      background:
        "rgba(217, 181, 109, 0.1)",
      color: "#d9b56d",
    },

    neutral: {
      border:
        "1px solid rgba(255, 255, 255, 0.14)",
      background:
        "rgba(255, 255, 255, 0.05)",
      color: "#aeb9b4",
    },
  };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "900",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        ...tones[tone],
      }}
    >
      {label}
    </span>
  );
}