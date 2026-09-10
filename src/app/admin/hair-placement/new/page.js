import Link from "next/link";
import ConfiguratorOptionForm from "@/components/admin/ConfiguratorOptionForm";
import {
  createHairPlacement,
} from "../actions";

export default function NewHairPlacementPage() {
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
            New Hair Placement
          </h1>
        </div>

        <ConfiguratorOptionForm
          action={createHairPlacement}
          categoryLabel="Hair Placement"
          imageFolder="hair-placement"
          submitLabel="Create Hair Placement"
        />
      </div>
    </main>
  );
}