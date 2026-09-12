import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BirthstonesPage() {
  const months = await prisma.birthstoneMonth.findMany({
    orderBy: {
      monthNumber: "asc",
    },
  });

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <p
            style={{
              color: "#d9b56d",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            ADMIN
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
            }}
          >
            Birthstones
          </h1>
        </div>

        <Link
          href="/admin/birthstones/new"
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111",
            textDecoration: "none",
            fontWeight: "800",
          }}
        >
          + New Month
        </Link>
      </div>

      {months.length === 0 ? (
        <div
          style={{
            padding: "50px",
            border: "1px dashed #555",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2>No Birthstone Months Yet</h2>

          <p>
            Create your first birthstone month.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {months.map((month) => (
            <Link
              key={month.id}
              href={`/admin/birthstones/${month.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: "14px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                  }}
                >
                  {month.monthNumber}. {month.name}
                </h3>

                <div
                  style={{
                    color: "#9aa5a0",
                    fontSize: "14px",
                  }}
                >
                  Month #{month.monthNumber}
                </div>
              </div>

              <span>
                {month.active ? "Active" : "Inactive"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}