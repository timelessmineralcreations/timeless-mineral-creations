"use client";

import OptionCard from "@/components/builder/OptionCard";
import GlowSelector from "@/components/builder/GlowSelector";

export default function ChannelCard({
  channel,
  index,
  memorialMaterials = [],
  minerals = [],
  glowPowders = [],
  selection = {},
  onChange,
  groupLabel = "Channel",
}) {
  const memorialEnabled =
    channel?.memorialMaterials?.enabled === true;

  const mineralsEnabled =
    channel?.minerals?.enabled === true;

  const glowEnabled = channel?.glow?.enabled === true;

  const selectionMode = channel?.selectionMode || "either";
  const requiresBoth = selectionMode === "both";
  const allowsBoth = memorialEnabled && mineralsEnabled;

  const selectedType = requiresBoth
    ? "both"
    : allowsBoth
    ? selection.type || null
    : memorialEnabled
    ? "memorial"
    : mineralsEnabled
    ? "mineral"
    : null;

  const allowedMemorialMaterials = memorialEnabled
    ? memorialMaterials.filter((material) =>
        (channel.memorialMaterials.allowed || []).includes(
          material.id
        )
      )
    : [];

  const allowedMinerals = mineralsEnabled ? minerals : [];

  const hasMaterialSelection =
    Boolean(selection.memorial) || Boolean(selection.mineral);

  const memorialDescription = allowedMemorialMaterials
    .map((material) => material.name)
    .join(", ");

  function selectType(type) {
    onChange?.({
      ...selection,
      type,
      memorial:
        type === "memorial"
          ? selection.memorial || null
          : null,
      mineral:
        type === "mineral"
          ? selection.mineral || null
          : null,
      glow: selection.glow || null,
    });
  }

  function selectMemorial(materialId) {
    onChange?.({
      ...selection,
      type: requiresBoth ? "both" : "memorial",
      memorial: materialId,
      mineral: requiresBoth
        ? selection.mineral || null
        : null,
      glow: selection.glow || null,
    });
  }

  function selectMineral(mineral) {
    onChange?.({
      ...selection,
      type: requiresBoth ? "both" : "mineral",
      memorial: requiresBoth
        ? selection.memorial || null
        : null,
      mineral,
      glow: selection.glow || null,
    });
  }

  function selectGlow(glow) {
    onChange?.({
      ...selection,
      glow,
    });
  }

  return (
    <section
      style={{
        marginBottom: "24px",
        padding: "22px",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: "16px",
        background: "rgba(255,255,255,.03)",
      }}
    >
      <h2 style={{ marginBottom: "6px" }}>
        {channel?.name || `${groupLabel} ${index + 1}`}
      </h2>

      {channel?.description && (
        <p
          style={{
            opacity: 0.75,
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          {channel.description}
        </p>
      )}

      {allowsBoth && !requiresBoth && (
        <>
          <h3 style={{ marginBottom: "12px" }}>
            What would you like in this{" "}
            {groupLabel.toLowerCase()}?
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
              marginBottom: selectedType ? "24px" : 0,
            }}
          >
            <button
              type="button"
              onClick={() => selectType("memorial")}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border:
                  selectedType === "memorial"
                    ? "2px solid #D4AF37"
                    : "1px solid rgba(255,255,255,.2)",
                background:
                  selectedType === "memorial"
                    ? "rgba(212,175,55,.14)"
                    : "rgba(255,255,255,.04)",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong>Memorial Material</strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  opacity: 0.75,
                }}
              >
                {memorialDescription ||
                  "Choose an available memorial material."}
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectType("mineral")}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border:
                  selectedType === "mineral"
                    ? "2px solid #D4AF37"
                    : "1px solid rgba(255,255,255,.2)",
                background:
                  selectedType === "mineral"
                    ? "rgba(212,175,55,.14)"
                    : "rgba(255,255,255,.04)",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong>Natural Mineral</strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  opacity: 0.75,
                }}
              >
                Choose one natural mineral for this{" "}
                {groupLabel.toLowerCase()}.
              </div>
            </button>
          </div>
        </>
      )}

      {requiresBoth && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "10px",
            background: "rgba(212,175,55,.08)",
            border: "1px solid rgba(212,175,55,.25)",
            lineHeight: 1.5,
          }}
        >
          This design uses both a memorial material and one
          natural mineral in this {groupLabel.toLowerCase()}.
        </div>
      )}

      {(selectedType === "memorial" ||
        selectedType === "both") &&
        memorialEnabled && (
          <div
            style={{
              marginBottom:
                selectedType === "both" ? "24px" : 0,
            }}
          >
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
                  active={selection.memorial === material.id}
                  onClick={() =>
                    selectMemorial(material.id)
                  }
                />
              ))}
            </div>
          </div>
        )}

      {(selectedType === "mineral" ||
        selectedType === "both") &&
        mineralsEnabled && (
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
                    selection.mineral?.id === mineral.id
                      ? "Selected"
                      : mineral.price > 0
                      ? `+$${mineral.price}`
                      : "Included"
                  }
                  image={mineral.image}
                  active={
                    selection.mineral?.id === mineral.id
                  }
                  onClick={() => selectMineral(mineral)}
                />
              ))}
            </div>
          </div>
        )}

      {glowEnabled && hasMaterialSelection && (
        <div style={{ marginTop: "26px" }}>
          <GlowSelector
            glowPowders={glowPowders}
            selectedGlow={selection.glow || null}
            onSelectGlow={selectGlow}
          />
        </div>
      )}
    </section>
  );
}