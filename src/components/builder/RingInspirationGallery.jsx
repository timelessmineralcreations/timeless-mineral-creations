"use client";

import { useEffect, useState } from "react";

const INITIAL_PHOTO_COUNT = 6;

export default function RingInspirationGallery({
  photos = [],
  selectedMaterial,
  selectedWidth,
  onSelectPhoto,
}) {
  const [showAll, setShowAll] = useState(false);

  const width = selectedWidth?.width;

  useEffect(() => {
    setShowAll(false);
  }, [selectedMaterial, width]);

  if (!photos.length) return null;

  const sortedPhotos = [...photos].sort((a, b) => {
    const aMaterial = a.material === selectedMaterial ? 0 : 1;
    const bMaterial = b.material === selectedMaterial ? 0 : 1;

    if (aMaterial !== bMaterial) return aMaterial - bMaterial;

    const aWidth = a.width === width ? 0 : 1;
    const bWidth = b.width === width ? 0 : 1;

    return aWidth - bWidth;
  });

  const visiblePhotos = showAll
    ? sortedPhotos
    : sortedPhotos.slice(0, INITIAL_PHOTO_COUNT);

  const hasMorePhotos = sortedPhotos.length > INITIAL_PHOTO_COUNT;

  return (
    <section style={{ marginTop: "24px" }}>
      <h2 style={{ marginBottom: "8px" }}>Real Rings We’ve Handcrafted</h2>

      <p style={{ opacity: 0.75, marginBottom: "14px" }}>
        Click a photo to preview it larger. This will not change your selected
        options.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "12px",
        }}
      >
        {visiblePhotos.map((photo, index) => {
          const mineralLabels = getMineralLabels(photo);

          return (
            <button
              key={photo.id || photo.image || index}
              type="button"
              onClick={() => onSelectPhoto?.(photo.image)}
              title={[
                photo.material || "Ring",
                photo.width ? `${photo.width}mm` : null,
                mineralLabels || null,
              ]
                .filter(Boolean)
                .join(" • ")}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,.18)",
                aspectRatio: "1 / 1",
                cursor: "zoom-in",
                padding: 0,
                background: "transparent",
                color: "inherit",
              }}
            >
              <img
                src={photo.image}
                alt={[
                  photo.material || "Ring",
                  mineralLabels || null,
                  "example",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "end",
                  padding: "10px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.72), transparent)",
                }}
              >
                <div style={{ fontSize: "13px", lineHeight: 1.3 }}>
                  <strong>{photo.material}</strong>
                  {photo.width && <div>{photo.width}mm</div>}
                  {mineralLabels && <div>{mineralLabels}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {hasMorePhotos && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            style={{
              border: "1px solid rgba(255,255,255,.25)",
              borderRadius: "999px",
              padding: "10px 20px",
              cursor: "pointer",
              background: "rgba(255,255,255,.08)",
              color: "inherit",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {showAll
              ? "Show Less"
              : `View ${
                  sortedPhotos.length - INITIAL_PHOTO_COUNT
                } More Customer Rings`}
          </button>
        </div>
      )}
    </section>
  );
}

function getMineralLabels(photo) {
  if (Array.isArray(photo.minerals) && photo.minerals.length > 0) {
    return photo.minerals.map(formatLabel).join(" + ");
  }

  if (photo.mineral) {
    return formatLabel(photo.mineral);
  }

  return "";
}

function formatLabel(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}