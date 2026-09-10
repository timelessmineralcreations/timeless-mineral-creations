export default function AdminStatusBadge({
  active = true,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) {
  const background = active
    ? "rgba(74, 222, 128, 0.12)"
    : "rgba(248, 113, 113, 0.12)";

  const border = active
    ? "1px solid rgba(74, 222, 128, 0.28)"
    : "1px solid rgba(248, 113, 113, 0.28)";

  const color = active
    ? "#86efac"
    : "#fca5a5";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: "28px",
        padding: "0 10px",
        borderRadius: "999px",
        background,
        border,
        color,
        fontSize: "12px",
        fontWeight: "850",
        whiteSpace: "nowrap",
      }}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}