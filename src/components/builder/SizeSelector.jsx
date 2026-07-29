import Link from "next/link";

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}) {
  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>Choose Ring Size</h2>

      <select
        value={selectedSize || ""}
        onChange={(e) => onSelectSize(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "260px",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,.25)",
          background: "rgba(20,20,20,.95)",
          color: "white",
          fontSize: "16px",
        }}
      >
        {sizes?.map((size) => (
          <option key={size} value={size}>
            Size {size}
          </option>
        ))}
      </select>

      <p
        style={{
          marginTop: "12px",
          fontSize: "14px",
          color: "rgba(255,255,255,.75)",
          lineHeight: "1.6",
          maxWidth: "500px",
        }}
      >
        Not sure of your ring size? We offer a{" "}
        <strong>complimentary reusable ring sizer</strong> for customers
        planning to order.{" "}
        <Link
          href="/contact"
          style={{
            color: "#D4AF37",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Contact us to request one.
        </Link>
      </p>
    </section>
  );
}