import Link from "next/link";

import ConfiguratorOptionForm from "@/components/admin/ConfiguratorOptionForm";

import {
  createDecorativeAccent,
} from "../actions";

export default function NewDecorativeAccentPage() {
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
          href="/admin/decorative-accents"
          style={{
            color: "#d9b56d",
            textDecoration: "none",
            fontWeight: "850",
          }}
        >
          ← Back to Decorative Accents
        </Link>

        <h1
          style={{
            margin: "24px 0",
            fontSize:
              "clamp(34px,5vw,52px)",
          }}
        >
          New Decorative Accent
        </h1>

        <ConfiguratorOptionForm
          action={createDecorativeAccent}
          categoryLabel="Decorative Accent"
          imageFolder="decorative-accents"
          submitLabel="Create Decorative Accent"
        />
      </div>
    </main>
  );
}