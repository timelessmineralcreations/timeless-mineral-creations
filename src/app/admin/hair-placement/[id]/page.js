import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConfiguratorOptionForm from "@/components/admin/ConfiguratorOptionForm";

import {
  updateHairPlacement,
  deleteHairPlacement,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EditHairPlacementPage({
  params,
}) {
  const { id } = await params;

  const option =
    await prisma.configuratorOption.findFirst({
      where: {
        id,
        category: "hair-placement",
      },
    });

  if (!option) {
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
        <Link
          href="/admin/hair-placement"
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "850",
            marginBottom: "18px",
          }}
        >
          ← Back to Hair Placement
        </Link>

        <div
          style={{
            marginBottom: "28px",
          }}
        >
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
            Configurator Options
          </p>

          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            Edit {option.name}
          </h1>
        </div>

        <ConfiguratorOptionForm
          action={updateHairPlacement}
          option={option}
          categoryLabel="Hair Placement"
          imageFolder="hair-placement"
          submitLabel="Save Changes"
        />

        <div
          style={{
            marginTop: "22px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,.1)",
          }}
        >
          <form action={deleteHairPlacement}>
            <input
              type="hidden"
              name="id"
              value={option.id}
            />

            <button
              type="submit"
              style={{
                minHeight: "46px",
                padding: "0 18px",
                borderRadius: "11px",
                border:
                  "1px solid rgba(221,92,92,.55)",
                background:
                  "rgba(221,92,92,.08)",
                color: "#ff9d9d",
                fontWeight: "850",
                cursor: "pointer",
              }}
            >
              Delete Hair Placement
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}