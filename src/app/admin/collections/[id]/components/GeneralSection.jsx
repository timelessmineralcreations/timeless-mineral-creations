import Field from "./Field";
import FormSection from "./FormSection";
import {
  inputStyle,
  textareaStyle,
  twoColumnGridStyle,
} from "./styles";

export default function GeneralSection({ collection }) {
  return (
    <FormSection
      title="General Information"
      description="Edit the collection name, public URL, product type, and customer-facing description."
    >
      <div style={twoColumnGridStyle}>
        <Field label="Collection Name" required>
          <input
            name="name"
            type="text"
            required
            defaultValue={collection.name}
            placeholder="Example: Signature Collection"
            style={inputStyle}
          />
        </Field>

        <Field
          label="Collection URL Slug"
          helpText={`Current page: /collections/${collection.slug}`}
        >
          <input
            name="slug"
            type="text"
            defaultValue={collection.slug}
            placeholder="signature"
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label="Product Type">
        <select
          name="productType"
          defaultValue={collection.productType || "Ring"}
          style={inputStyle}
        >
          <option value="Ring">Ring</option>
          <option value="Bracelet">Bracelet</option>
          <option value="Necklace">Necklace</option>
          <option value="Pendant">Pendant</option>
          <option value="Other">Other</option>
        </select>
      </Field>

      <Field label="Description" required>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={collection.description}
          placeholder="Describe the collection and its customization options."
          style={{
            ...textareaStyle,
            minHeight: "150px",
          }}
        />
      </Field>
    </FormSection>
  );
}