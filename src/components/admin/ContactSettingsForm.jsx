import ImageUploader from "@/components/admin/ImageUploader";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f5f5",
  fontSize: "15px",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
  lineHeight: 1.6,
};

function Field({ label, name, defaultValue, multiline = false, helpText }) {
  return (
    <label
      style={{
        display: "block",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: "700",
          color: "#e8ecea",
        }}
      >
        {label}
      </span>

      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue || ""}
          style={textareaStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue || ""}
          style={inputStyle}
        />
      )}

      {helpText && (
        <span
          style={{
            display: "block",
            marginTop: "7px",
            color: "#8f9b96",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {helpText}
        </span>
      )}
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <section
      style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "21px",
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              margin: "7px 0 0",
              color: "#929d98",
              lineHeight: 1.55,
              fontSize: "14px",
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function ContactSettingsForm({ settings, action }) {
  return (
    <form
      action={action}
      style={{
        display: "grid",
        gap: "22px",
      }}
    >
      <Section
        title="Contact Information"
        description="Information shown to customers on the Contact page."
      >
        <Field
          label="Contact Email"
          name="contactEmail"
          defaultValue={settings.contactEmail}
          helpText="This email address will appear on the public Contact page."
        />

        <Field
          label="Location Text"
          name="contactLocationText"
          defaultValue={settings.contactLocationText}
        />

        <Field
          label="Typical Response Time"
          name="contactResponseTimeText"
          defaultValue={settings.contactResponseTimeText}
        />
      </Section>

      <Section
        title="Meet the Craftsman"
        description="Manage your photo and the personal introduction shown on the Contact page."
      >
        <ImageUploader
          name="contactCreatorImageUrl"
          label="Meet the Craftsman Photo"
          folder="contact"
          defaultValue={settings.contactCreatorImageUrl || ""}
          helpText="Upload the photo you want displayed beside your Meet the Craftsman section."
        />

        <Field
          label="Section Heading"
          name="contactCreatorHeading"
          defaultValue={settings.contactCreatorHeading}
          helpText='You can keep "Meet the Craftsman" or change it to something like "Meet the Creator."'
        />

        <Field
          label="Introduction"
          name="contactCreatorIntro"
          defaultValue={settings.contactCreatorIntro}
          multiline
        />

        <Field
          label="First Paragraph"
          name="contactCreatorBodyOne"
          defaultValue={settings.contactCreatorBodyOne}
          multiline
        />

        <Field
          label="Second Paragraph"
          name="contactCreatorBodyTwo"
          defaultValue={settings.contactCreatorBodyTwo}
          multiline
        />
      </Section>

      <Section
        title="Closing Message"
        description="The message displayed near the bottom of the Contact page."
      >
        <Field
          label="Closing Paragraph"
          name="contactClosingText"
          defaultValue={settings.contactClosingText}
          multiline
        />

        <Field
          label="Thank You Message"
          name="contactClosingThankYouText"
          defaultValue={settings.contactClosingThankYouText}
          multiline
        />
      </Section>

      <div>
        <button
          type="submit"
          style={{
            padding: "13px 22px",
            border: 0,
            borderRadius: "10px",
            background: "#d9b56d",
            color: "#111",
            fontSize: "15px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Save Contact Page
        </button>
      </div>
    </form>
  );
}
