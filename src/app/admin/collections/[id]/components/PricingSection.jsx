import Field from "./Field";
import FormSection from "./FormSection";
import {
  inputStyle,
  threeColumnGridStyle,
} from "./styles";

export default function PricingSection({ collection }) {
  return (
    <FormSection
      title="Pricing and Organization"
      description="Set the collection's starting price and control its display order in the catalog."
    >
      <div style={threeColumnGridStyle}>
        <Field label="Starting Price" required>
          <div
            style={{
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9eaaa6",
                fontWeight: "800",
                pointerEvents: "none",
              }}
            >
              $
            </span>

            <input
              name="startingPrice"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={collection.startingPrice}
              style={{
                ...inputStyle,
                paddingLeft: "32px",
              }}
            />
          </div>
        </Field>

        <Field
          label="Sort Order"
          helpText="Lower numbers appear first in the collection list."
        >
          <input
            name="sortOrder"
            type="number"
            defaultValue={collection.sortOrder || 0}
            style={inputStyle}
          />
        </Field>

        <Field
          label="Current Starting Price"
          helpText="This is a preview only."
        >
          <div
            style={{
              minHeight: "46px",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              borderRadius: "10px",
              border: "1px solid rgba(217, 181, 109, 0.25)",
              background: "rgba(217, 181, 109, 0.07)",
              color: "#e7c77f",
              fontSize: "18px",
              fontWeight: "900",
            }}
          >
            ${Number(collection.startingPrice || 0).toFixed(2)}
          </div>
        </Field>
      </div>
    </FormSection>
  );
}