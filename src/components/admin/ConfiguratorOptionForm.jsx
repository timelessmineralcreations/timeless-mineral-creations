"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function ConfiguratorOptionForm({
  action,
  option = null,
  categoryLabel = "Option",
  imageFolder = "configurator-options",
  submitLabel = "Save",
}) {
  const [imageUrl, setImageUrl] = useState(
    option?.imageUrl || ""
  );

  return (
    <form action={action}>
      {option?.id ? (
        <input
          type="hidden"
          name="id"
          value={option.id}
        />
      ) : null}

      <input
        type="hidden"
        name="imageUrl"
        value={imageUrl}
      />

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        <FormSection
          title={`${categoryLabel} Information`}
          description={`Set the customer-facing name, URL slug, and description for this ${categoryLabel.toLowerCase()}.`}
        >
          <div style={twoColumnGridStyle}>
            <Field
              label={`${categoryLabel} Name`}
              required
            >
              <input
                name="name"
                type="text"
                required
                defaultValue={option?.name || ""}
                placeholder={`Example: ${categoryLabel}`}
                style={inputStyle}
              />
            </Field>

            <Field
              label="Slug"
              helpText="Leave blank when creating to generate it automatically from the name."
            >
              <input
                name="slug"
                type="text"
                defaultValue={option?.slug || ""}
                placeholder="example-option"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              rows={5}
              defaultValue={option?.description || ""}
              placeholder="Describe how this option will appear to the customer."
              style={{
                ...inputStyle,
                minHeight: "130px",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Image"
          description="Upload an image customers can use to understand this option."
        >
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            label={option?.name || categoryLabel}
            folder={imageFolder}
          />
        </FormSection>

        <FormSection
          title="Pricing"
          description="Set the additional customer price for this option."
        >
          <Field
            label="Price Adjustment"
            helpText="Enter dollars. Example: 15.00"
          >
            <input
              name="priceAdjustment"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                (option?.priceAdjustmentCents || 0) / 100
              }
              style={inputStyle}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Organization & Status"
          description="Control the display order and whether this option can be used."
        >
          <Field
            label="Sort Order"
            helpText="Lower numbers appear first."
          >
            <input
              name="sortOrder"
              type="number"
              defaultValue={option?.sortOrder || 0}
              style={inputStyle}
            />
          </Field>

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <CheckboxField
              name="active"
              label="Active"
              description="Allow this option to be assigned to collections."
              defaultChecked={
                option ? option.active : true
              }
            />

            <CheckboxField
              name="featured"
              label="Featured"
              description="Mark this as a frequently used or highlighted option."
              defaultChecked={
                option?.featured || false
              }
            />
          </div>
        </FormSection>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="submit"
            style={primaryButtonStyle}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        border:
          "1px solid rgba(255, 255, 255, 0.11)",
        borderRadius: "18px",
        background:
          "rgba(255, 255, 255, 0.035)",
        padding: "24px",
      }}
    >
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

        <p
          style={{
            margin: 0,
            color: "#98a49f",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
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

function Field({
  label,
  required = false,
  helpText,
  children,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      <span
        style={{
          color: "#e8eeeb",
          fontSize: "14px",
          fontWeight: "850",
        }}
      >
        {label}

        {required ? (
          <span style={{ color: "#d9b56d" }}>
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}

      {helpText ? (
        <span
          style={{
            color: "#7f8c87",
            fontSize: "12px",
            lineHeight: 1.45,
          }}
        >
          {helpText}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked = false,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        border:
          "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "15px",
        cursor: "pointer",
        background:
          "rgba(255, 255, 255, 0.025)",
      }}
    >
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor: "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom: "3px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            color: "#98a49f",
            fontSize: "13px",
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(0, 0, 0, 0.2)",
  color: "#f3f7f5",
  fontSize: "15px",
  outline: "none",
};

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "18px",
};

const primaryButtonStyle = {
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