"use client";

import OptionCard from "@/components/builder/OptionCard";

export default function ChannelSelector({
  channel,
  memorialMaterials = [],
  minerals = [],
  selectedMemorial,
  selectedMineral,
  onSelectMemorial,
  onSelectMineral,
}) {
  const allowedMemorialMaterials =
    channel?.memorialMaterials?.enabled
      ? memorialMaterials.filter((material) =>
          channel.memorialMaterials.allowed.includes(material.id)
        )
      : [];

  const allowedMinerals = channel?.minerals?.enabled
    ? minerals
    : [];

  return (
    <section
      style={{
        marginBottom: "30px",
        padding: "22px",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: "16px",
        background: "rgba(255,255,255,.03)",
      }}
    >
      <h2 style={{ marginBottom: "6px" }}>
        {channel.name || "Channel"}
      </h2>

      {channel.description && (
        <p
          style={{
            opacity: 0.75,
            lineHeight: 1.5,
            marginBottom: "22px",
          }}
        >
          {channel.description}
        </p>
      )}

      {channel?.memorialMaterials?.enabled && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "12px" }}>
            Choose Memorial Material
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {allowedMemorialMaterials.map((material) => (
              <OptionCard
                key={material.id}
                title={`${material.icon} ${material.name}`}
                description={material.description}
                active={selectedMemorial === material.id}
                onClick={() =>
                  onSelectMemorial?.(material.id)
                }
              />
            ))}
          </div>
        </div>
      )}

      {channel?.minerals?.enabled && (
        <div>
          <h3 style={{ marginBottom: "12px" }}>
            Choose Mineral
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            {allowedMinerals.map((mineral) => (
              <OptionCard
                key={mineral.id}
                title={mineral.name}
                description={
                  selectedMineral?.id === mineral.id
                    ? "Selected"
                    : mineral.price > 0
                    ? `+$${mineral.price}`
                    : "Included"
                }
                image={mineral.image}
                active={selectedMineral?.id === mineral.id}
                onClick={() =>
                  onSelectMineral?.(mineral)
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}