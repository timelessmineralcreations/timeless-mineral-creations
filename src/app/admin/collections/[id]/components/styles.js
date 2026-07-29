export const pageStyle = {
  padding: "32px 28px 80px",
};

export const pageInnerStyle = {
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
};

export const pageHeaderStyle = {
  marginBottom: "28px",
};

export const eyebrowStyle = {
  margin: "0 0 8px",
  color: "#d9b56d",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export const pageTitleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 52px)",
  lineHeight: 1.05,
};

export const pageDescriptionStyle = {
  margin: "12px 0 0",
  color: "#aab6b1",
  maxWidth: "760px",
  lineHeight: 1.65,
};

export const formGridStyle = {
  display: "grid",
  gap: "20px",
};

export const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

export const threeColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "18px",
};

export const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(0, 0, 0, 0.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

export const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
};

export const primaryButtonStyle = {
  minHeight: "48px",
  padding: "0 22px",
  border: 0,
  borderRadius: "12px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "15px",
};

export const secondaryButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "850",
};

export const dangerButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "12px",
  border: "1px solid rgba(221, 92, 92, 0.55)",
  background: "rgba(221, 92, 92, 0.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};

export const actionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  paddingTop: "6px",
};

export const actionGroupStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

export const helpTextStyle = {
  color: "#7f8c87",
  fontSize: "12px",
  lineHeight: 1.45,
};

export const emptyStateStyle = {
  border: "1px dashed rgba(255, 255, 255, 0.16)",
  borderRadius: "14px",
  padding: "24px",
  color: "#98a49f",
  textAlign: "center",
  background: "rgba(255, 255, 255, 0.02)",
};