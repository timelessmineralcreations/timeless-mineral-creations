import OptionCard from "@/components/builder/OptionCard";

export default function GlowSelector({
  glowPowders,
  selectedGlow,
  onSelectGlow,
}) {
  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>
        Glow Powder{" "}
        <span
          style={{
            fontSize: "14px",
            opacity: 0.7,
            fontWeight: "normal",
          }}
        >
          (Optional)
        </span>
      </h2>

      <p
        style={{
          marginTop: "4px",
          marginBottom: "18px",
          opacity: 0.75,
        }}
      >
        Charges in sunlight, UV light, or under a black light.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {glowPowders.map((glow) => (
          <OptionCard
            key={glow.id}
            title={glow.name}
            description={
              glow.price > 0
                ? `+$${glow.price}`
                : "Included"
            }
            image={glow.image}
            active={selectedGlow?.id === glow.id}
            onClick={() => onSelectGlow(glow)}
          />
        ))}
      </div>
    </section>
  );
}