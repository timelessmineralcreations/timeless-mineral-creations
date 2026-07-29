export default function CheckboxField({
  name,
  label,
  defaultChecked = false,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        color: "#e7ece9",
        fontWeight: "700",
      }}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        style={{
          width: "18px",
          height: "18px",
          cursor: "pointer",
        }}
      />

      <span>{label}</span>
    </label>
  );
}