import Field from "./Field";
import FormSection from "./FormSection";
import {
  inputStyle,
  twoColumnGridStyle,
} from "./styles";

export default function ImagesSection({ collection }) {
  return (
    <FormSection
      title="Images"
      description="Set the collection card image and the large hero image used on the collection page."
    >
      <div style={twoColumnGridStyle}>
        <Field
          label="Card Image Path"
          helpText="Example: /rings/signature/signature-card.png"
        >
          <input
            name="cardImage"
            type="text"
            defaultValue={collection.cardImage || ""}
            placeholder="/rings/signature/signature-card.png"
            style={inputStyle}
          />
        </Field>

        <Field
          label="Hero Image Path"
          helpText="Example: /rings/signature/signature-hero.png"
        >
          <input
            name="heroImage"
            type="text"
            defaultValue={collection.heroImage || ""}
            placeholder="/rings/signature/signature-hero.png"
            style={inputStyle}
          />
        </Field>
      </div>

      {(collection.cardImage || collection.heroImage) ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "18px",
          }}
        >
          <ImagePreview
            label="Card Image Preview"
            imagePath={collection.cardImage}
          />

          <ImagePreview
            label="Hero Image Preview"
            imagePath={collection.heroImage}
          />
        </div>
      ) : null}
    </FormSection>
  );
}

function ImagePreview({ label, imagePath }) {
  if (!imagePath) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      <span
        style={{
          color: "#e8eeeb",
          fontSize: "14px",
          fontWeight: "800",
        }}
      >
        {label}
      </span>

      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <img
          src={imagePath}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}