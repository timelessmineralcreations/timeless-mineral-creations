import Link from "next/link";
import AdminStatusBadge from "./AdminStatusBadge";

export default function AdminItemCard({
  href,
  imageUrl,
  imageAlt = "",
  fallbackColor = "#444",
  fallbackIcon = "◇",
  title,
  subtitle,
  description,
  active = true,
  featured = false,
  extraBadge,
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "18px",
        flexWrap: "wrap",
        padding: "18px",
        border: "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius: "15px",
        background: "rgba(255, 255, 255, 0.025)",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          minWidth: 0,
          flex: "1 1 360px",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: "76px",
              height: "76px",
              objectFit: "cover",
              borderRadius: "13px",
              border: "1px solid rgba(255, 255, 255, 0.13)",
              background: "rgba(255, 255, 255, 0.04)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: "76px",
              height: "76px",
              display: "grid",
              placeItems: "center",
              borderRadius: "13px",
              border: "1px solid rgba(255, 255, 255, 0.13)",
              background: fallbackColor,
              color: "#fff",
              fontSize: "24px",
              flexShrink: 0,
            }}
          >
            {fallbackIcon}
          </div>
        )}

        <div
          style={{
            minWidth: 0,
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "19px",
            }}
          >
            {title}
          </h2>

          {subtitle ? (
            <div
              style={{
                color: "#d9b56d",
                fontSize: "13px",
                fontWeight: "800",
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {description ? (
            <div
              style={{
                marginTop: "5px",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.45,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "9px",
          flexWrap: "wrap",
        }}
      >
        {featured ? (
          <span
            style={{
              color: "#d9b56d",
              fontSize: "13px",
              fontWeight: "850",
            }}
          >
            ★ Featured
          </span>
        ) : null}

        {extraBadge}

        <AdminStatusBadge active={active} />
      </div>
    </Link>
  );
}