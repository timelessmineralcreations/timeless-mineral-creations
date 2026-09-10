import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import ConfiguratorOptionForm from "@/components/admin/ConfiguratorOptionForm";

import {
  updateAccentStyle,
  deleteAccentStyle,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EditAccentStylePage({
  params,
}) {
  const { id } = await params;

  const option =
    await prisma.configuratorOption.findFirst({
      where: {
        id,
        category: "accent-style",
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/admin/accent-styles"
          style={{
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "850",
          }}
        >
          ← Back to Accent Styles
        </Link>

        <h1
          style={{
            margin: "24px 0",
            fontSize:
              "clamp(34px,5vw,52px)",
          }}
        >
          Edit {option.name}
        </h1>

        <ConfiguratorOptionForm
          action={updateAccentStyle}
          option={option}
          categoryLabel="Accent Style"
          imageFolder="accent-styles"
          submitLabel="Save Changes"
        />

        <form
          action={deleteAccentStyle}
          style={{
            marginTop: "24px",
          }}
        >
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
            Delete Accent Style
          </button>
        </form>
      </div>
    </main>
  );
}