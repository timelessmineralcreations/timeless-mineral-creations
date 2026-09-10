import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  importExistingAccentStyles,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AccentStylesPage() {
  const options =
    await prisma.configuratorOption.findMany({
      where: {
        category: "accent-style",
      },
      orderBy: [
        { active: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

  const activeCount = options.filter(
    (option) => option.active
  ).length;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 7px",
              color: "#d9b56d",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Configurator Options
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
            }}
          >
            Accent Styles
          </h1>

          <p
            style={{
              color: "#98a49f",
              lineHeight: 1.6,
            }}
          >
            Manage the patterns used to position
            decorative accents within an inlay.
          </p>
        </div>

        <Link
          href="/admin/accent-styles/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "46px",
            padding: "0 20px",
            borderRadius: "11px",
            background:
              "linear-gradient(90deg,#efc15c,#c99425)",
            color: "#111814",
            textDecoration: "none",
            fontWeight: "900",
          }}
        >
          + New Accent Style
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap: "12px",
          marginBottom: "26px",
        }}
      >
        <SummaryCard
          label="Total"
          value={options.length}
        />

        <SummaryCard
          label="Active"
          value={activeCount}
        />

        <SummaryCard
          label="Inactive"
          value={options.length - activeCount}
        />
      </div>

      {options.length === 0 ? (
        <div
          style={{
            padding: "50px 24px",
            border:
              "1px dashed rgba(255,255,255,.2)",
            borderRadius: "16px",
            textAlign: "center",
            background:
              "rgba(255,255,255,.025)",
          }}
        >
          <h2>No Accent Styles Yet</h2>

          <p style={{ color: "#98a49f" }}>
            Import the two styles already used by
            Remi.
          </p>

          <form action={importExistingAccentStyles}>
            <button style={goldButton}>
              Import Existing Accent Styles
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {options.map((option) => (
            <Link
              key={option.id}
              href={`/admin/accent-styles/${option.id}`}
              style={{
                padding: "18px",
                border:
                  "1px solid rgba(255,255,255,.1)",
                borderRadius: "14px",
                background:
                  "rgba(255,255,255,.025)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {option.name}
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#8f9b96",
                    }}
                  >
                    {option.slug}
                  </p>
                </div>

                <span
                  style={{
                    color: option.active
                      ? "#86efac"
                      : "#aaa",
                    fontWeight: "900",
                  }}
                >
                  {option.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  color: "#d9b56d",
                  fontWeight: "800",
                }}
              >
                Sort: {option.sortOrder}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        padding: "16px",
        border:
          "1px solid rgba(255,255,255,.1)",
        borderRadius: "13px",
        background:
          "rgba(255,255,255,.025)",
      }}
    >
      <div
        style={{
          color: "#98a49f",
          fontSize: "12px",
          fontWeight: "800",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          fontSize: "29px",
          fontWeight: "900",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const goldButton = {
  minHeight: "46px",
  padding: "0 18px",
  border: 0,
  borderRadius: "11px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "900",
  cursor: "pointer",
};