import OptionCard from "@/components/builder/OptionCard";

export default function RingCoreSelector({
  cores,
  selectedCore,
  onSelectCore,
  heading = "Choose Your Band Style",
}) {
  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>{heading}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {cores.map((core) => (
          <OptionCard
            key={core.id}
            title={core.name || core.edge || core.material}
            subtitle={
              core.comfortFit
                ? "Comfort Fit"
                : core.finish || undefined
            }
            description={
              core.description &&
              core.description !== core.finish
                ? core.description
                : undefined
            }
            image={core.image}
            active={selectedCore?.id === core.id}
            onClick={() => onSelectCore(core)}
          />
        ))}
      </div>
    </section>
  );
}