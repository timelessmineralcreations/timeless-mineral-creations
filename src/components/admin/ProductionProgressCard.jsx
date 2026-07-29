export default function ProductionProgressCard({
  initialValues,
}) {
  const steps = [
    { label: "Core Confirmed", value: initialValues.coreConfirmedAt },
    { label: "Size Confirmed", value: initialValues.sizeConfirmedAt },
    { label: "Materials Prepared", value: initialValues.materialsPreparedAt },
    { label: "Build Complete", value: initialValues.buildCompletedAt },
    { label: "Engraving Complete", value: initialValues.engravingCompletedAt },
    { label: "Quality Check", value: initialValues.qualityCheckedAt },
    { label: "Photos Taken", value: initialValues.photosTakenAt },
    { label: "Packaged", value: initialValues.packagedAt },
  ];

  const completed = steps.filter((step) => step.value).length;
  const percent = Math.round((completed / steps.length) * 100);

  return (
    <section
      style={{
        background: "#1d1d1d",
        border: "1px solid #333",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "24px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Production Progress</h2>

      <div
        style={{
          height: "14px",
          background: "#2b2b2b",
          borderRadius: "999px",
          overflow: "hidden",
          margin: "18px 0",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg,#22c55e,#16a34a)",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px", fontWeight: 700 }}>
        {completed} / {steps.length} Steps Complete ({percent}%)
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {steps.map((step) => (
          <div
            key={step.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{step.label}</span>
            <span>{step.value ? "✅" : "⭕"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}