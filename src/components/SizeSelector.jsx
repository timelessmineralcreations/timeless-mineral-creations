"use client";

import OptionCard from "./OptionCard";

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  heading = "Choose Ring Size",
}) {
  if (!sizes.length) return null;

  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>{heading}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: "12px",
        }}
      >
        {sizes.map((size) => (
          <OptionCard
            key={size}
            title={size}
            active={selectedSize === size}
            onClick={() => onSelectSize(size)}
          />
        ))}
      </div>
    </section>
  );
}