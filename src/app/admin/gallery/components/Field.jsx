export default function Field({
  label,
  required = false,
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
          fontSize: "14px",
          fontWeight: "800",
          color: "#e8eeeb",
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
    </label>
  );
}