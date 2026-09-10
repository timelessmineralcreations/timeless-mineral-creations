import Link from "next/link";

import ConfiguratorOptionForm from "@/components/admin/ConfiguratorOptionForm";

import {
  createAccentStyle,
} from "../actions";

export default function NewAccentStylePage() {
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
          New Accent Style
        </h1>

        <ConfiguratorOptionForm
          action={createAccentStyle}
          categoryLabel="Accent Style"
          imageFolder="accent-styles"
          submitLabel="Create Accent Style"
        />
      </div>
    </main>
  );
}