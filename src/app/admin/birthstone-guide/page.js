import { requireAdmin } from "@/lib/require-admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import ImageUploader from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

const GUIDE_CATEGORY = "birthstone-guide";
const GUIDE_SLUG = "default";

async function saveBirthstoneGuide(formData) {
  "use server";
  await requireAdmin();

  const imageUrl = String(
    formData.get("imageUrl") || ""
  ).trim();

  await prisma.configuratorOption.upsert({
    where: {
      category_slug: {
        category: GUIDE_CATEGORY,
        slug: GUIDE_SLUG,
      },
    },

    update: {
      name: "Birthstone Color Guide",

      description:
        "Global birthstone color guide used by customer configurators.",

      imageUrl:
        imageUrl || null,

      active: true,
    },

    create: {
      category: GUIDE_CATEGORY,

      slug: GUIDE_SLUG,

      name: "Birthstone Color Guide",

      description:
        "Global birthstone color guide used by customer configurators.",

      imageUrl:
        imageUrl || null,

      priceAdjustmentCents: 0,

      active: true,

      featured: false,

      sortOrder: 0,
    },
  });

  revalidatePath(
    "/admin/birthstone-guide"
  );

  revalidatePath(
    "/collections"
  );

  redirect(
    "/admin/birthstone-guide"
  );
}

export default async function BirthstoneGuidePage() {
  const guide =
    await prisma.configuratorOption.findUnique({
      where: {
        category_slug: {
          category: GUIDE_CATEGORY,
          slug: GUIDE_SLUG,
        },
      },
    });

  return (
    <main
      style={{
        padding:
          "32px 28px 80px",
      }}
    >
      <div
        style={{
          width:
            "100%",

          maxWidth:
            "1000px",

          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            marginBottom:
              "28px",
          }}
        >
          <p
            style={{
              margin:
                "0 0 8px",

              color:
                "#d9b56d",

              fontSize:
                "13px",

              fontWeight:
                "800",

              letterSpacing:
                "0.12em",

              textTransform:
                "uppercase",
            }}
          >
            Birthstone Configuration
          </p>

          <h1
            style={{
              margin:
                0,

              fontSize:
                "clamp(34px, 5vw, 52px)",

              lineHeight:
                1.05,
            }}
          >
            Birthstone Color Guide
          </h1>

          <p
            style={{
              margin:
                "12px 0 0",

              color:
                "#aab6b1",

              maxWidth:
                "760px",

              lineHeight:
                1.65,
            }}
          >
            Upload one global birthstone color
            guide. Collections that have the
            Birthstone Color Guide enabled will
            display this image above their
            birthstone choices.
          </p>
        </div>

        <form
          action={
            saveBirthstoneGuide
          }
        >
          <section
            style={{
              padding:
                "24px",

              border:
                "1px solid rgba(255,255,255,.12)",

              borderRadius:
                "18px",

              background:
                "rgba(255,255,255,.035)",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 8px",

                fontSize:
                  "22px",
              }}
            >
              Guide Image
            </h2>

            <p
              style={{
                margin:
                  "0 0 22px",

                color:
                  "#aab6b1",

                lineHeight:
                  1.6,
              }}
            >
              This image only needs to be uploaded
              once. Individual collections will
              decide whether it is shown.
            </p>

            <ImageUploader
              name="imageUrl"
              label="Birthstone Color Guide"
              folder="birthstones"
              defaultValue={
                guide?.imageUrl ||
                ""
              }
              helpText="Upload the Birthstone Color Guide image shown to customers."
            />

            {guide?.imageUrl && (
              <div
                style={{
                  marginTop:
                    "24px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 10px",

                    fontSize:
                      "13px",

                    fontWeight:
                      800,

                    color:
                      "#d9b56d",

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      ".08em",
                  }}
                >
                  Current Guide
                </p>

                <img
                  src={
                    guide.imageUrl
                  }
                  alt="Birthstone Color Guide"
                  style={{
                    width:
                      "100%",

                    maxWidth:
                      "850px",

                    display:
                      "block",

                    borderRadius:
                      "16px",

                    border:
                      "1px solid rgba(255,255,255,.12)",

                    background:
                      "#fff",
                  }}
                />
              </div>
            )}
          </section>

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "flex-end",

              marginTop:
                "22px",
            }}
          >
            <button
              type="submit"
              style={{
                minHeight:
                  "46px",

                padding:
                  "0 22px",

                border:
                  "none",

                borderRadius:
                  "10px",

                background:
                  "#d9b56d",

                color:
                  "#111",

                fontSize:
                  "15px",

                fontWeight:
                  850,

                cursor:
                  "pointer",
              }}
            >
              Save Birthstone Guide
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}