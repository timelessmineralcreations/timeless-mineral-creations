import {
  createCollectionPhoto,
  deleteCollectionPhoto,
  updateCollectionPhoto,
} from "../actions";

import FormSection from "./FormSection";

import ImageUploadField from "./ImageUploadField";

export default function PhotosSection({
  collection,
  photos = [],
  productBases = [],
  inlayStyles = [],
  minerals = [],
  glowPowders = [],
}) {
  const materials = [
    ...new Set(
      productBases
        .map((product) => product.material)
        .filter(Boolean)
    ),
  ].sort();

  const finishes = [
    ...new Set(
      productBases
        .map((product) => product.finish)
        .filter(Boolean)
    ),
  ].sort();

  return (
    <FormSection
      title="Collection Product Photos"
      description="Add completed jewelry photos and tag them so the configurator can display the best match for the customer's selections."
    >
      <form
        action={createCollectionPhoto}
        style={formCardStyle}
      >
        <input
          type="hidden"
          name="collectionId"
          value={collection.id}
        />

        <div style={sectionHeadingStyle}>
          <div>
            <h3 style={headingStyle}>
              Add a New Photo
            </h3>

            <p style={helpStyle}>
              For now, place the image inside
              your public folder and enter its
              path below. Drag-and-drop uploads
              will be added next.
            </p>
          </div>
        </div>

        <PhotoFields
          collection={collection}
          productBases={productBases}
          inlayStyles={inlayStyles}
          minerals={minerals}
          glowPowders={glowPowders}
          materials={materials}
          finishes={finishes}
        />

        <div style={buttonRowStyle}>
          <button
            type="submit"
            style={primaryButtonStyle}
          >
            Add Photo
          </button>
        </div>
      </form>

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        <div>
          <h3 style={headingStyle}>
            Existing Photos
          </h3>

          <p style={helpStyle}>
            {photos.length === 0
              ? "No product photos have been assigned to this collection yet."
              : `${photos.length} photo${
                  photos.length === 1
                    ? ""
                    : "s"
                } assigned to this collection.`}
          </p>
        </div>

        {photos.map((photo) => (
          <ExistingPhotoCard
            key={photo.id}
            photo={photo}
            collection={collection}
            productBases={productBases}
            inlayStyles={inlayStyles}
            minerals={minerals}
            glowPowders={glowPowders}
            materials={materials}
            finishes={finishes}
          />
        ))}
      </div>
    </FormSection>
  );
}

function ExistingPhotoCard({
  photo,
  collection,
  productBases,
  inlayStyles,
  minerals,
  glowPowders,
  materials,
  finishes,
}) {
  return (
    <div style={existingCardStyle}>
      <div style={photoPreviewStyle}>
        <img
          src={photo.imageUrl}
          alt={
            photo.altText ||
            collection.name
          }
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />

        {photo.featured ? (
          <span style={featuredBadgeStyle}>
            Featured
          </span>
        ) : null}

        {!photo.active ? (
          <span style={inactiveBadgeStyle}>
            Inactive
          </span>
        ) : null}
      </div>

      <form
        action={updateCollectionPhoto}
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        <input
          type="hidden"
          name="photoId"
          value={photo.id}
        />

        <input
          type="hidden"
          name="collectionId"
          value={collection.id}
        />

        <PhotoFields
          photo={photo}
          collection={collection}
          productBases={productBases}
          inlayStyles={inlayStyles}
          minerals={minerals}
          glowPowders={glowPowders}
          materials={materials}
          finishes={finishes}
        />

        <div style={buttonRowStyle}>
          <button
            type="submit"
            style={primaryButtonStyle}
          >
            Save Photo
          </button>
        </div>
      </form>

      <form
        action={deleteCollectionPhoto}
      >
        <input
          type="hidden"
          name="photoId"
          value={photo.id}
        />

        <input
          type="hidden"
          name="collectionId"
          value={collection.id}
        />

        <button
          type="submit"
          style={dangerButtonStyle}
        >
          Delete Photo
        </button>
      </form>
    </div>
  );
}

function PhotoFields({
  photo = null,
  collection,
  productBases,
  inlayStyles,
  minerals,
  glowPowders,
  materials,
  finishes,
}) {
  const selectedMineralIds =
    parseJsonArray(
      photo?.mineralIdsJson
    );

  const selectedGlowIds =
    parseJsonArray(
      photo?.glowPowderIdsJson
    );

  const memorialMaterials =
    parseJsonArray(
      photo?.memorialMaterialIdsJson
    ).join(", ");

  const accentMaterials =
    parseJsonArray(
      photo?.accentMaterialIdsJson
    ).join(", ");

  const tags = parseJsonArray(
    photo?.tagsJson
  ).join(", ");

  return (
    <>
      <div style={twoColumnStyle}>
        <FieldBlock
  label="Product Image"
  help="Drag and drop an image here or click the box to choose one."
>
  <ImageUploadField
    name="imageUrl"
    defaultValue={photo?.imageUrl || ""}
    label={`${collection.name} product photo`}
    folder={`collections/${collection.slug}/products`}
  />
</FieldBlock>

        <FieldBlock
          label="Alternative Text"
          help="Describe the jewelry for accessibility and search engines."
        >
          <input
            name="altText"
            type="text"
            defaultValue={
              photo?.altText || ""
            }
            placeholder={`${collection.name} memorial jewelry`}
            style={inputStyle}
          />
        </FieldBlock>
      </div>

      <FieldBlock
        label="Caption"
        help="Optional internal or customer-facing description."
      >
        <textarea
          name="caption"
          defaultValue={
            photo?.caption || ""
          }
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </FieldBlock>

      <div style={threeColumnStyle}>
        <FieldBlock label="Material">
          <select
            name="material"
            defaultValue={
              photo?.material || ""
            }
            style={inputStyle}
          >
            <option value="">
              Any material
            </option>

            {materials.map((material) => (
              <option
                key={material}
                value={material}
              >
                {material}
              </option>
            ))}
          </select>
        </FieldBlock>

        <FieldBlock label="Finish">
          <select
            name="finish"
            defaultValue={
              photo?.finish || ""
            }
            style={inputStyle}
          >
            <option value="">
              Any finish
            </option>

            {finishes.map((finish) => (
              <option
                key={finish}
                value={finish}
              >
                {finish}
              </option>
            ))}
          </select>
        </FieldBlock>

        <FieldBlock label="Width">
          <input
            name="widthMm"
            type="number"
            min="0"
            step="0.1"
            defaultValue={
              photo?.widthMm ?? ""
            }
            placeholder="8"
            style={inputStyle}
          />
        </FieldBlock>
      </div>

      <div style={twoColumnStyle}>
        <FieldBlock label="Product Base / Core">
          <select
            name="coreId"
            defaultValue={
              photo?.coreId || ""
            }
            style={inputStyle}
          >
            <option value="">
              Any product base
            </option>

            {productBases.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.slug}
                >
                  {product.name}
                  {product.material
                    ? ` — ${product.material}`
                    : ""}
                </option>
              )
            )}
          </select>
        </FieldBlock>

        <FieldBlock label="Inlay Style">
          <select
            name="inlayStyleId"
            defaultValue={
              photo?.inlayStyleId || ""
            }
            style={inputStyle}
          >
            <option value="">
              Any inlay style
            </option>

            {inlayStyles.map((style) => (
              <option
                key={style.id}
                value={style.slug}
              >
                {style.name}
              </option>
            ))}
          </select>
        </FieldBlock>
      </div>

      <CheckboxGroup
        title="Minerals"
        name="mineralIds"
        options={minerals.map(
          (mineral) => ({
            id: mineral.slug,
            name: mineral.name,
          })
        )}
        selectedIds={
          selectedMineralIds
        }
      />

      <CheckboxGroup
        title="Glow Powders"
        name="glowPowderIds"
        options={glowPowders.map(
          (glow) => ({
            id: glow.slug,
            name: glow.name,
          })
        )}
        selectedIds={selectedGlowIds}
      />

      <div style={twoColumnStyle}>
        <FieldBlock
          label="Memorial Materials"
          help="Comma separated. Example: ashes, hair"
        >
          <input
            name="memorialMaterials"
            type="text"
            defaultValue={
              memorialMaterials
            }
            placeholder="ashes, hair"
            style={inputStyle}
          />
        </FieldBlock>

        <FieldBlock
          label="Accent Materials"
          help="Comma separated. Example: meteorite, gold-flake"
        >
          <input
            name="accentMaterials"
            type="text"
            defaultValue={
              accentMaterials
            }
            placeholder="meteorite, gold-flake"
            style={inputStyle}
          />
        </FieldBlock>
      </div>

      <div style={twoColumnStyle}>
        <FieldBlock
          label="Search Tags"
          help="Comma separated internal labels."
        >
          <input
            name="tags"
            type="text"
            defaultValue={tags}
            placeholder="blue, pet memorial, popular"
            style={inputStyle}
          />
        </FieldBlock>

        <FieldBlock label="Sort Order">
          <input
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={
              photo?.sortOrder ?? 0
            }
            style={inputStyle}
          />
        </FieldBlock>
      </div>

      <div style={toggleRowStyle}>
        <label style={toggleLabelStyle}>
          <input
            name="active"
            type="checkbox"
            defaultChecked={
              photo
                ? photo.active
                : true
            }
          />

          Active
        </label>

        <label style={toggleLabelStyle}>
          <input
            name="featured"
            type="checkbox"
            defaultChecked={
              photo?.featured || false
            }
          />

          Featured photo
        </label>
      </div>
    </>
  );
}

function FieldBlock({
  label,
  help,
  children,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "7px",
      }}
    >
      <span
        style={{
          color: "#edf2ef",
          fontSize: "13px",
          fontWeight: "800",
        }}
      >
        {label}
      </span>

      {children}

      {help ? (
        <span style={fieldHelpStyle}>
          {help}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxGroup({
  title,
  name,
  options,
  selectedIds,
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend style={legendStyle}>
        {title}
      </legend>

      <div style={checkboxGridStyle}>
        {options.map((option) => (
          <label
            key={option.id}
            style={checkboxLabelStyle}
          >
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={selectedIds.includes(
                option.id
              )}
            />

            <span>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
}

const formCardStyle = {
  display: "grid",
  gap: "18px",
  padding: "18px",
  border:
    "1px solid rgba(255,255,255,0.11)",
  borderRadius: "16px",
  background:
    "rgba(255,255,255,0.025)",
};

const existingCardStyle = {
  display: "grid",
  gap: "18px",
  padding: "18px",
  border:
    "1px solid rgba(255,255,255,0.11)",
  borderRadius: "16px",
  background:
    "rgba(255,255,255,0.025)",
};

const photoPreviewStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "460px",
  aspectRatio: "4 / 3",
  overflow: "hidden",
  borderRadius: "13px",
  border:
    "1px solid rgba(255,255,255,0.12)",
  background: "#07100d",
};

const sectionHeadingStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
};

const headingStyle = {
  margin: "0 0 5px",
  color: "#eef3f0",
  fontSize: "18px",
};

const helpStyle = {
  margin: 0,
  color: "#98a49f",
  fontSize: "13px",
  lineHeight: 1.55,
};

const fieldHelpStyle = {
  color: "#84918c",
  fontSize: "11px",
  lineHeight: 1.4,
};

const inputStyle = {
  width: "100%",
  minHeight: "43px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,0.14)",
  background:
    "rgba(0,0,0,0.22)",
  color: "#f1f4f2",
  padding: "10px 12px",
  font: "inherit",
  boxSizing: "border-box",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
  gap: "14px",
};

const threeColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: "14px",
};

const fieldsetStyle = {
  margin: 0,
  padding: "14px",
  border:
    "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
};

const legendStyle = {
  padding: "0 7px",
  color: "#edf2ef",
  fontSize: "13px",
  fontWeight: "800",
};

const checkboxGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "9px",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#cbd4d0",
  fontSize: "12px",
};

const toggleRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "18px",
};

const toggleLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#e2e8e5",
  fontSize: "13px",
  fontWeight: "750",
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const primaryButtonStyle = {
  minHeight: "42px",
  padding: "0 16px",
  border: 0,
  borderRadius: "10px",
  background: "#d9b56d",
  color: "#111814",
  fontWeight: "850",
  cursor: "pointer",
};

const dangerButtonStyle = {
  minHeight: "40px",
  padding: "0 14px",
  borderRadius: "10px",
  border:
    "1px solid rgba(226,92,92,0.4)",
  background:
    "rgba(226,92,92,0.08)",
  color: "#ffaaaa",
  fontWeight: "800",
  cursor: "pointer",
};

const featuredBadgeStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  padding: "6px 9px",
  borderRadius: "999px",
  background: "#d9b56d",
  color: "#111814",
  fontSize: "11px",
  fontWeight: "900",
};

const inactiveBadgeStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "6px 9px",
  borderRadius: "999px",
  background: "rgba(0,0,0,0.78)",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "900",
};