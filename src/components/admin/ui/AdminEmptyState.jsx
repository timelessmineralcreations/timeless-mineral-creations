import Link from "next/link";

export default function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}) {
  return (
    <div
      style={{
        padding: "56px 28px",
        border: "1px dashed rgba(255, 255, 255, 0.22)",
        borderRadius: "18px",
        background: "rgba(255, 255, 255, 0.025)",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          margin: "0 0 10px",
          fontSize: "24px",
        }}
      >
        {title}
      </h2>

      {description ? (
        <p
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            color: "#98a49f",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      ) : null}

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          style={{
            minHeight: "46px",
            marginTop: "22px",
            padding: "0 20px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "11px",
            background: "#d9b56d",
            color: "#111814",
            textDecoration: "none",
            fontWeight: "900",
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}