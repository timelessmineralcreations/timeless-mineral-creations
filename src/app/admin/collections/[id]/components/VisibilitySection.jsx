import CheckboxField from "./CheckboxField";
import FormSection from "./FormSection";

export default function VisibilitySection({ collection }) {
  return (
    <FormSection
      title="Visibility"
      description="Control whether this collection is live, marked as coming soon, or featured across the website."
    >
      <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        <CheckboxField
          name="published"
          label="Published"
          defaultChecked={collection.published}
        />

        <CheckboxField
          name="comingSoon"
          label="Coming Soon"
          defaultChecked={collection.comingSoon}
        />

        <CheckboxField
          name="featured"
          label="Featured"
          defaultChecked={collection.featured}
        />
      </div>

      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.025)",
          padding: "15px",
          color: "#98a49f",
          fontSize: "13px",
          lineHeight: 1.55,
        }}
      >
        <strong
          style={{
            display: "block",
            color: "#e8eeeb",
            marginBottom: "5px",
          }}
        >
          Status guide
        </strong>

        Published makes the collection available as an active listing. Coming
        Soon lets you display the collection before it is ready for ordering.
        Featured allows it to appear in highlighted areas of the website.
      </div>
    </FormSection>
  );
}