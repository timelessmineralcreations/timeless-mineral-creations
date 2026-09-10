export default function SiteSettingsForm({
  settings,
  action,
}) {
  const salePercent = Math.min(
    100,
    Math.max(
      0,
      Number(
        settings.sitewideSalePercent ??
          0
      )
    )
  );

  const exampleRegularPrice =
    250;

  const exampleSalePrice =
    exampleRegularPrice *
    (1 - salePercent / 100);

  return (
    <form
      action={action}
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      <SettingsSection
        title="Business Information"
        description="Your main business and contact information."
      >
        <FieldGrid>
          <TextField
            label="Business Name"
            name="businessName"
            defaultValue={
              settings.businessName
            }
            required
          />

          <TextField
            label="Contact Email"
            name="contactEmail"
            type="email"
            defaultValue={
              settings.contactEmail
            }
            placeholder="you@example.com"
          />

          <TextField
            label="Contact Phone"
            name="contactPhone"
            type="tel"
            defaultValue={
              settings.contactPhone
            }
            placeholder="Optional"
          />
        </FieldGrid>
      </SettingsSection>

      <SettingsSection
        title="Business / Memorial Shipping Address"
        description="The address customers should use when mailing cremation ashes, hair, fur, or other memorial materials."
      >
        <FieldGrid>
          <TextField
            label="Address Line 1"
            name="addressLine1"
            defaultValue={
              settings.addressLine1
            }
            placeholder="Street address"
          />

          <TextField
            label="Address Line 2"
            name="addressLine2"
            defaultValue={
              settings.addressLine2
            }
            placeholder="Suite, unit, etc. (optional)"
          />

          <TextField
            label="City"
            name="city"
            defaultValue={
              settings.city
            }
          />

          <TextField
            label="State"
            name="state"
            defaultValue={
              settings.state
            }
          />

          <TextField
            label="ZIP / Postal Code"
            name="postalCode"
            defaultValue={
              settings.postalCode
            }
          />

          <TextField
            label="Country"
            name="country"
            defaultValue={
              settings.country
            }
          />
        </FieldGrid>
      </SettingsSection>

      <SettingsSection
        title="Turnaround Time"
        description="Set the site-wide estimated production window."
      >
        <FieldGrid>
          <NumberField
            label="Minimum Weeks"
            name="turnaroundMinWeeks"
            defaultValue={
              settings.turnaroundMinWeeks
            }
            min="0"
          />

          <NumberField
            label="Maximum Weeks"
            name="turnaroundMaxWeeks"
            defaultValue={
              settings.turnaroundMaxWeeks
            }
            min="0"
          />
        </FieldGrid>

        <PreviewBox>
          Current customer-facing
          estimate:{" "}
          <strong>
            {
              settings.turnaroundMinWeeks
            }
            –
            {
              settings.turnaroundMaxWeeks
            }{" "}
            weeks
          </strong>
        </PreviewBox>
      </SettingsSection>

      <SettingsSection
        title="Shipping Settings"
        description="Control customer shipping options, prices, and general shipping information."
      >
        <ToggleField
          name="usShippingOnly"
          label="United States shipping only"
          description="Keep this enabled if orders should only ship to U.S. addresses."
          defaultChecked={
            settings.usShippingOnly
          }
        />

        <FieldGrid>
          <NumberField
            label="USPS Ground Advantage ($)"
            name="standardShippingPrice"
            defaultValue={(
              (settings.standardShippingPriceCents ??
                800) / 100
            ).toFixed(2)}
            min="0"
            step="0.01"
          />

          <NumberField
            label="USPS Priority Mail ($)"
            name="priorityShippingPrice"
            defaultValue={(
              (settings.priorityShippingPriceCents ??
                1500) / 100
            ).toFixed(2)}
            min="0"
            step="0.01"
          />
        </FieldGrid>

        <PreviewBox>
          <div
            style={{
              display: "grid",
              gap: "6px",
            }}
          >
            <div>
              <strong>
                USPS Ground
                Advantage:
              </strong>{" "}
              $
              {(
                (settings.standardShippingPriceCents ??
                  800) / 100
              ).toFixed(2)}
            </div>

            <div>
              <strong>
                USPS Priority Mail:
              </strong>{" "}
              $
              {(
                (settings.priorityShippingPriceCents ??
                  1500) / 100
              ).toFixed(2)}
            </div>

            <div
              style={{
                marginTop: "4px",
                opacity: 0.75,
                fontSize: "13px",
              }}
            >
              Priority Mail only
              speeds up shipping
              after the piece is
              completed. Your normal
              production turnaround
              still applies.
            </div>
          </div>
        </PreviewBox>

        <TextAreaField
          label="General Shipping Instructions"
          name="shippingInstructions"
          defaultValue={
            settings.shippingInstructions
          }
          placeholder="General information about shipping, tracking, packaging, etc."
          rows={6}
        />
      </SettingsSection>

      <SettingsSection
        title="Memorial Material Instructions"
        description="Instructions for customers mailing ashes, hair, fur, sand, soil, or other keepsake materials."
      >
        <TextAreaField
          label="Customer Instructions"
          name="memorialInstructions"
          defaultValue={
            settings.memorialInstructions
          }
          placeholder="Example: Double-bag cremation ashes, include the customer's name and order number, and ship with tracking..."
          rows={9}
        />
      </SettingsSection>

      <SettingsSection
        title="Site-Wide Sale"
        description="Turn a percentage discount on or off across the entire storefront."
      >
        <ToggleField
          name="sitewideSaleEnabled"
          label="Enable site-wide sale"
          description="When enabled, the percentage below will be applied to eligible jewelry prices across the website. Shipping will not be discounted."
          defaultChecked={
            settings.sitewideSaleEnabled
          }
        />

        <FieldGrid>
          <TextField
            label="Sale Name"
            name="sitewideSaleName"
            defaultValue={
              settings.sitewideSaleName
            }
            placeholder="Example: Labor Day Sale"
          />

          <NumberField
            label="Discount Percentage"
            name="sitewideSalePercent"
            defaultValue={
              salePercent
            }
            min="0"
            max="100"
            step="1"
          />
        </FieldGrid>

        <PreviewBox>
          <div
            style={{
              display: "grid",
              gap: "8px",
            }}
          >
            <div>
              <strong>
                Current Sale Status:
              </strong>{" "}
              {settings.sitewideSaleEnabled
                ? "Enabled"
                : "Disabled"}
            </div>

            {settings.sitewideSaleName ? (
              <div>
                <strong>
                  Sale Name:
                </strong>{" "}
                {
                  settings.sitewideSaleName
                }
              </div>
            ) : null}

            <div>
              <strong>
                Discount:
              </strong>{" "}
              {salePercent}%
            </div>

            <div>
              <strong>
                Example:
              </strong>{" "}
              $
              {exampleRegularPrice.toFixed(
                2
              )}{" "}
              →{" "}
              <strong>
                $
                {exampleSalePrice.toFixed(
                  2
                )}
              </strong>
            </div>

            <div
              style={{
                marginTop: "4px",
                opacity: 0.75,
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              The discount will apply
              to the configured jewelry
              price. Shipping charges
              will remain at their
              normal price.
            </div>
          </div>
        </PreviewBox>
      </SettingsSection>

      <SettingsSection
        title="Announcement Bar"
        description="Create a site-wide message for customers."
      >
        <ToggleField
          name="announcementEnabled"
          label="Enable announcement"
          description="When enabled, the storefront displays the announcement text below."
          defaultChecked={
            settings.announcementEnabled
          }
        />

        <TextAreaField
          label="Announcement Text"
          name="announcementText"
          defaultValue={
            settings.announcementText
          }
          placeholder="Example: Current turnaround time is approximately 2–10 weeks."
          rows={4}
        />
      </SettingsSection>

      <SettingsSection
        title="Social Links"
        description="Links used by the website for your business social profiles."
      >
        <FieldGrid>
          <TextField
            label="Facebook"
            name="facebookUrl"
            type="url"
            defaultValue={
              settings.facebookUrl
            }
            placeholder="https://..."
          />

          <TextField
            label="Instagram"
            name="instagramUrl"
            type="url"
            defaultValue={
              settings.instagramUrl
            }
            placeholder="https://..."
          />

          <TextField
            label="TikTok"
            name="tiktokUrl"
            type="url"
            defaultValue={
              settings.tiktokUrl
            }
            placeholder="https://..."
          />

          <TextField
            label="Etsy"
            name="etsyUrl"
            type="url"
            defaultValue={
              settings.etsyUrl
            }
            placeholder="https://..."
          />
        </FieldGrid>
      </SettingsSection>

      <div
        style={{
          position: "sticky",
          bottom: "20px",
          zIndex: 10,
          display: "flex",
          justifyContent:
            "flex-end",
          padding: "16px",
          border:
            "1px solid rgba(255,255,255,.12)",
          borderRadius: "14px",
          background:
            "rgba(18,18,18,.94)",
          backdropFilter:
            "blur(10px)",
          boxShadow:
            "0 14px 40px rgba(0,0,0,.35)",
        }}
      >
        <button
          type="submit"
          style={{
            padding:
              "13px 24px",
            border: "none",
            borderRadius:
              "10px",
            background:
              "linear-gradient(135deg,#E9C054,#B8860B)",
            color: "#111",
            fontWeight: 850,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Save Settings
        </button>
      </div>
    </form>
  );
}

function SettingsSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        padding: "22px",
        borderRadius: "16px",
        border:
          "1px solid rgba(255,255,255,.1)",
        background:
          "rgba(255,255,255,.025)",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 6px",
            fontSize: "20px",
          }}
        >
          {title}
        </h2>

        {description ? (
          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
              lineHeight: 1.55,
              fontSize: "14px",
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

function FieldGrid({
  children,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
      }}
    >
      {children}
    </div>
  );
}

function TextField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = false,
}) {
  return (
    <label
      style={
        fieldWrapperStyle
      }
    >
      <span
        style={
          fieldLabelStyle
        }
      >
        {label}
      </span>

      <input
        name={name}
        type={type}
        defaultValue={
          defaultValue || ""
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        style={
          inputStyle
        }
      />
    </label>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  min,
  max,
  step = "1",
}) {
  return (
    <label
      style={
        fieldWrapperStyle
      }
    >
      <span
        style={
          fieldLabelStyle
        }
      >
        {label}
      </span>

      <input
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue={
          defaultValue
        }
        style={
          inputStyle
        }
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 5,
}) {
  return (
    <label
      style={
        fieldWrapperStyle
      }
    >
      <span
        style={
          fieldLabelStyle
        }
      >
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={
          defaultValue || ""
        }
        placeholder={
          placeholder
        }
        rows={rows}
        style={{
          ...inputStyle,
          resize:
            "vertical",
          lineHeight: 1.55,
          minHeight:
            "110px",
        }}
      />
    </label>
  );
}

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems:
          "flex-start",
        gap: "12px",
        padding: "15px",
        borderRadius:
          "12px",
        border:
          "1px solid rgba(255,255,255,.1)",
        background:
          "rgba(255,255,255,.025)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={
          defaultChecked
        }
        style={{
          width: "19px",
          height: "19px",
          marginTop: "2px",
          accentColor:
            "#d9b56d",
          flexShrink: 0,
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom:
              "4px",
          }}
        >
          {label}
        </strong>

        {description ? (
          <span
            style={{
              display: "block",
              color: "#98a49f",
              fontSize:
                "13px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function PreviewBox({
  children,
}) {
  return (
    <div
      style={{
        padding:
          "13px 15px",
        borderRadius:
          "10px",
        background:
          "rgba(217,181,109,.08)",
        border:
          "1px solid rgba(217,181,109,.25)",
        color: "#ddd",
        fontSize: "14px",
      }}
    >
      {children}
    </div>
  );
}

const fieldWrapperStyle = {
  display: "grid",
  gap: "7px",
};

const fieldLabelStyle = {
  fontSize: "13px",
  fontWeight: 750,
  color: "#ddd",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: "9px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background:
    "rgba(255,255,255,.045)",
  color: "#f5f5f5",
  fontSize: "14px",
  outline: "none",
};