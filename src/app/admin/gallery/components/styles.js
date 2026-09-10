export const pageStyle = {
  minHeight: "100vh",
  color: "#f5f5f5",
  padding: "40px 20px 80px",
};

export const pageInnerStyle = {
  width: "100%",
  maxWidth: "1000px",
  margin: "0 auto",
};

export const pageHeaderStyle = {
  marginBottom: "28px",
};

export const eyebrowStyle = {
  margin: "0 0 8px",
  color: "#d9b56d",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export const pageTitleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 54px)",
  lineHeight: 1.05,
};

export const pageDescriptionStyle = {
  margin: "12px 0 0",
  color: "#b9c4c0",
  maxWidth: "700px",
  lineHeight: 1.65,
};

export const backButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#d9b56d",
  textDecoration: "none",
  fontWeight: "800",
  marginBottom: "18px",
};

export const formGridStyle = {
  display: "grid",
  gap: "20px",
};

export const sectionStyle = {
  border: "1px solid rgba(255, 255, 255, 0.11)",
  borderRadius: "18px",
  background: "rgba(255, 255, 255, 0.035)",
  padding: "24px",
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

export const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

export const checkboxCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "15px",
  cursor: "pointer",
  background: "rgba(255, 255, 255, 0.025)",
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
  justifyContent: "flex-end",
  gap: "12px",
  flexWrap: "wrap",
};

export const secondaryButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  background: "transparent",
  color: "#dfe7e3",
  textDecoration: "none",
  fontWeight: "800",
  cursor: "pointer",
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

export const dangerButtonStyle = {
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "12px",
  border: "1px solid rgba(248, 113, 113, 0.36)",
  background: "rgba(248, 113, 113, 0.1)",
  color: "#fca5a5",
  fontWeight: "850",
  cursor: "pointer",
};