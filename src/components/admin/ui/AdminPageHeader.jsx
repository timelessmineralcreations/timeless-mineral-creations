import Link from "next/link";

export default function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actionHref,
  actionLabel,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
        }}
      >
        <p
          style={{
            margin: "0 0 7px",
            color: "#d9b56d",
            fontSize: "12px",
            fontWeight: "900",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 5vw, 48px)",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>

        {description ? (
          <p
            style={{
              margin: "12px 0 0",
              color: "#9eaaa6",
              lineHeight: 1.65,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          style={{
            minHeight: "48px",
            padding: "0 21px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background: "#d9b56d",
            color: "#111814",
            textDecoration: "none",
            fontWeight: "900",
            whiteSpace: "nowrap",
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}