import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function updateBirthstoneMonth(formData) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  const name = String(
    formData.get("name") || ""
  ).trim();

  const monthNumber = Number(
    formData.get("monthNumber")
  );

  const sortOrder = Number(
    formData.get("sortOrder") || monthNumber || 0
  );

  const active =
    formData.get("active") === "on";

  if (!id) {
    throw new Error(
      "Birthstone month ID is missing."
    );
  }

  if (!name) {
    throw new Error(
      "Birthstone month name is required."
    );
  }

  if (
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    throw new Error(
      "Month number must be between 1 and 12."
    );
  }

  const duplicateMonth =
    await prisma.birthstoneMonth.findFirst({
      where: {
        monthNumber,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateMonth) {
    throw new Error(
      "That birthstone month already exists."
    );
  }

  await prisma.birthstoneMonth.update({
    where: {
      id,
    },
    data: {
      name,
      monthNumber,
      active,
      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : monthNumber,
    },
  });

  revalidatePath("/admin/birthstones");
  revalidatePath(`/admin/birthstones/${id}`);

  redirect("/admin/birthstones");
}

async function deleteBirthstoneMonth(formData) {
  "use server";
  await requireAdmin();

  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Birthstone month ID is missing."
    );
  }

  await prisma.birthstoneMonth.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/birthstones");

  redirect("/admin/birthstones");
}

export default async function EditBirthstoneMonthPage({
  params,
}) {
  const { id } = await params;

  const month =
    await prisma.birthstoneMonth.findUnique({
      where: {
        id,
      },
    });

  if (!month) {
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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <Link
            href="/admin/birthstones"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#d9b56d",
              textDecoration: "none",
              fontWeight: "850",
              marginBottom: "18px",
            }}
          >
            ← Back to Birthstones
          </Link>

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
            Product Options
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            Edit {month.name}
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#aab6b1",
              maxWidth: "720px",
              lineHeight: 1.65,
            }}
          >
            Update the month name, calendar position,
            display order, and availability.
          </p>
        </div>

        <form action={updateBirthstoneMonth}>
          <input
            type="hidden"
            name="id"
            value={month.id}
          />

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FormSection
              title="Month Information"
              description="Update the calendar month and its display order."
            >
              <div style={twoColumnGridStyle}>
                <Field
                  label="Month"
                  required
                >
                  <select
                    name="monthNumber"
                    required
                    defaultValue={month.monthNumber}
                    style={inputStyle}
                  >
                    {monthNames.map(
                      (monthName, index) => (
                        <option
                          key={monthName}
                          value={index + 1}
                        >
                          {index + 1}. {monthName}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field
                  label="Month Name"
                  required
                  helpText="Enter the month name exactly as customers should see it."
                >
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={month.name}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field
                label="Sort Order"
                helpText="Use the month number so January is first and December is last."
              >
                <input
                  name="sortOrder"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue={month.sortOrder}
                  style={inputStyle}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Status"
              description="Inactive months remain saved but will not be offered in new product selections."
            >
              <CheckboxField
                name="active"
                label="Active"
                description="Allow this birthstone month to be used throughout the product catalog."
                defaultChecked={month.active}
              />
            </FormSection>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                formAction={deleteBirthstoneMonth}
                style={dangerButtonStyle}
              >
                Delete Birthstone Month
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/admin/birthstones"
                  style={secondaryButtonStyle}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  style={primaryButtonStyle}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        border:
          "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius: "18px",
        background:
          "rgba(255, 255, 255, 0.035)",
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h2
          style={{
            margin: "0 0 7px",
            fontSize: "22px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: 0,
            color: "#98a49f",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  helpText,
  children,
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
          color: "#e8eeeb",
          fontSize: "14px",
          fontWeight: "850",
        }}
      >
        {label}

        {required ? (
          <span
            style={{
              color: "#d9b56d",
            }}
          >
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}

      {helpText ? (
        <span
          style={{
            color: "#7f8c87",
            fontSize: "12px",
            lineHeight: 1.45,
          }}
        >
          {helpText}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked = false,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "15px",
        cursor: "pointer",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor: "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom: "3px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            color: "#98a49f",
            fontSize: "13px",
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(0, 0, 0, 0.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

const primaryButtonStyle = {
  minHeight: "48px",
  padding: "0 22px",
  border: 0,
  borderRadius: "12px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "15px",
};

const secondaryButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  border:
    "1px solid rgba(255, 255, 255, 0.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};

const dangerButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "12px",
  border:
    "1px solid rgba(221, 92, 92, 0.55)",
  background:
    "rgba(221, 92, 92, 0.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};