import { sectionStyle } from "./styles";

export default function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section style={sectionStyle}>
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h2
          style={{
            margin: "0 0 7px",
            fontSize: "22px",
          }}
        >
          {title}
        </h2>

        {description ? (
          <p
            style={{
              margin: 0,
              color: "#9eaaa6",
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        {children}
      </div>
    </section>
  );
}