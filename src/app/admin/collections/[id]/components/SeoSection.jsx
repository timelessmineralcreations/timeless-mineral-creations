import Field from "./Field";
import FormSection from "./FormSection";
import {
  inputStyle,
  textareaStyle,
} from "./styles";

export default function SeoSection({ collection }) {
  return (
    <FormSection
      title="Search Engine Information"
      description="Optional information used by Google, social previews, and other search engines."
    >
      <Field
        label="SEO Title"
        helpText="Aim for about 50–60 characters."
      >
        <input
          name="seoTitle"
          type="text"
          maxLength={70}
          defaultValue={collection.seoTitle || ""}
          placeholder="Signature Memorial Ring Collection"
          style={inputStyle}
        />
      </Field>

      <Field
        label="SEO Description"
        helpText="Aim for about 140–160 characters."
      >
        <textarea
          name="seoDescription"
          rows={4}
          maxLength={170}
          defaultValue={collection.seoDescription || ""}
          placeholder="Customize a handcrafted memorial ring with cremation ashes, minerals, glow powder, and optional engraving."
          style={textareaStyle}
        />
      </Field>
    </FormSection>
  );
}