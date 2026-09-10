"use client";

import { upload } from "@vercel/blob/client";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function createSafeFilename(filename) {
  const lastDot =
    filename.lastIndexOf(".");

  const originalExtension =
    lastDot >= 0
      ? filename.slice(lastDot)
      : "";

  const originalName =
    lastDot >= 0
      ? filename.slice(0, lastDot)
      : filename;

  const safeName = originalName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeExtension =
    originalExtension
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "");

  return `${
    safeName || "review-image"
  }${safeExtension}`;
}

function normalizeImages(images) {
  const normalized = (
    Array.isArray(images)
      ? images
      : []
  )
    .filter(
      (image) =>
        image?.imageUrl
    )
    .map((image, index) => ({
      id: image.id || null,
      imageUrl: image.imageUrl,
      altText:
        image.altText || "",
      caption:
        image.caption || "",
      sortOrder: index,
      primary:
        Boolean(image.primary),
    }));

  if (
    normalized.length > 0 &&
    !normalized.some(
      (image) => image.primary
    )
  ) {
    normalized[0].primary = true;
  }

  let primaryFound = false;

  return normalized.map(
    (image, index) => {
      const primary =
        image.primary &&
        !primaryFound;

      if (primary) {
        primaryFound = true;
      }

      return {
        ...image,
        sortOrder: index,
        primary,
      };
    }
  );
}

export default function ReviewImageManager({
  defaultImages = [],
  onStatusChange,
}) {
  const inputRef = useRef(null);

  const [images, setImages] =
    useState(() =>
      normalizeImages(
        defaultImages
      )
    );

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [dragging, setDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    onStatusChange?.({
      uploading,
      imageCount:
        images.length,
    });
  }, [
    uploading,
    images.length,
    onStatusChange,
  ]);

  function validateFile(file) {
    if (!file) {
      return "Choose an image first.";
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      return "Only JPEG, PNG, and WebP images are allowed.";
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return "Each image must be 20 MB or smaller.";
    }

    return "";
  }

  async function uploadFiles(
    fileList
  ) {
    const files = Array.from(
      fileList || []
    );

    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setError(
          validationError
        );
        return;
      }
    }

    setUploading(true);
    setProgress(0);
    setError("");

    const uploadedImages = [];

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file =
          files[index];

        const uniquePart = `${
          Date.now()
        }-${Math.random()
          .toString(36)
          .slice(2, 10)}`;

        const safeFilename =
          createSafeFilename(
            file.name
          );

        const blob =
          await upload(
            `gallery/reviews/${uniquePart}-${safeFilename}`,
            file,
            {
              access: "public",

              handleUploadUrl:
                "/api/gallery/upload",

              multipart:
                file.size >
                5 *
                  1024 *
                  1024,

              onUploadProgress: (
                progressEvent
              ) => {
                const completedBefore =
                  index /
                  files.length;

                const currentPart =
                  progressEvent.percentage /
                  100 /
                  files.length;

                setProgress(
                  Math.round(
                    (completedBefore +
                      currentPart) *
                      100
                  )
                );
              },
            }
          );

        uploadedImages.push({
          id: null,
          imageUrl:
            blob.url,
          altText: "",
          caption: "",
          sortOrder: 0,
          primary: false,
        });
      }

      setImages(
        (currentImages) =>
          normalizeImages([
            ...currentImages,
            ...uploadedImages,
          ])
      );

      setProgress(100);
    } catch (uploadError) {
      console.error(
        "Review image upload failed:",
        uploadError
      );

      setProgress(0);

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "The review images could not be uploaded."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }
    }
  }

  function removeImage(
    imageIndex
  ) {
    setImages(
      (currentImages) => {
        const remainingImages =
          currentImages.filter(
            (_, index) =>
              index !==
              imageIndex
          );

        return normalizeImages(
          remainingImages
        );
      }
    );
  }

  function setPrimaryImage(
    imageIndex
  ) {
    setImages(
      (currentImages) =>
        currentImages.map(
          (image, index) => ({
            ...image,
            primary:
              index ===
              imageIndex,
          })
        )
    );
  }

  function moveImage(
    imageIndex,
    direction
  ) {
    setImages(
      (currentImages) => {
        const nextIndex =
          imageIndex +
          direction;

        if (
          nextIndex < 0 ||
          nextIndex >=
            currentImages.length
        ) {
          return currentImages;
        }

        const updatedImages = [
          ...currentImages,
        ];

        const [movedImage] =
          updatedImages.splice(
            imageIndex,
            1
          );

        updatedImages.splice(
          nextIndex,
          0,
          movedImage
        );

        return normalizeImages(
          updatedImages
        );
      }
    );
  }

  function updateImageField(
    imageIndex,
    field,
    value
  ) {
    setImages(
      (currentImages) =>
        currentImages.map(
          (image, index) =>
            index ===
            imageIndex
              ? {
                  ...image,
                  [field]:
                    value,
                }
              : image
        )
    );
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    if (uploading) {
      return;
    }

    uploadFiles(
      event.dataTransfer.files
    );
  }

  const formImages =
    images.map(
      (image, index) => ({
        ...image,
        sortOrder: index,
      })
    );

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
      }}
    >
      <input
        type="hidden"
        name="reviewImagesJson"
        value={JSON.stringify(
          formImages
        )}
      />

      <div
        onDragEnter={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        style={{
          minHeight: "175px",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          borderRadius: "16px",

          border: dragging
            ? "2px dashed #d9b56d"
            : "2px dashed rgba(255, 255, 255, 0.2)",

          background: dragging
            ? "rgba(217, 181, 109, 0.08)"
            : "rgba(0, 0, 0, 0.16)",

          cursor: uploading
            ? "wait"
            : "pointer",

          textAlign: "center",
          transition:
            "border-color 160ms ease, background 160ms ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => {
            uploadFiles(
              event.target.files
            );
          }}
          style={{
            display: "none",
          }}
        />

        <div>
          <div
            aria-hidden="true"
            style={{
              marginBottom:
                "10px",
              fontSize: "35px",
            }}
          >
            📷
          </div>

          <strong
            style={{
              display: "block",
              color: "#eef3f0",
              fontSize: "17px",
            }}
          >
            {uploading
              ? "Uploading review photos..."
              : dragging
                ? "Drop the photos here"
                : "Drag review photos here"}
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "7px",
              color: "#9eaaa6",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {uploading
              ? "Please wait for the upload to finish."
              : "or click to select one or more images"}
          </span>

          <span
            style={{
              display: "block",
              marginTop: "8px",
              color: "#78847f",
              fontSize: "12px",
            }}
          >
            JPEG, PNG, or WebP
            • Maximum 20 MB each
          </span>
        </div>
      </div>

      {uploading ||
      progress > 0 ? (
        <div>
          <div
            style={{
              height: "9px",
              overflow: "hidden",
              borderRadius:
                "999px",
              background:
                "rgba(255, 255, 255, 0.09)",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius:
                  "999px",
                background:
                  "#d9b56d",
                transition:
                  "width 120ms ease",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "7px",
              color: "#9eaaa6",
              fontSize: "12px",
              textAlign: "right",
            }}
          >
            {progress}% uploaded
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            border:
              "1px solid rgba(248, 113, 113, 0.32)",
            borderRadius: "11px",
            background:
              "rgba(248, 113, 113, 0.1)",
            color: "#fca5a5",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          color: "#9eaaa6",
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        {images.length}{" "}
        {images.length === 1
          ? "photo"
          : "photos"}
      </div>

      {images.length === 0 ? (
        <div
          style={{
            padding: "18px",
            border:
              "1px dashed rgba(255, 255, 255, 0.12)",
            borderRadius: "12px",
            color: "#98a49f",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          Review photos are
          optional.
        </div>
      ) : null}

      {images.map(
        (image, index) => (
          <div
            key={
              image.id ||
              image.imageUrl
            }
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(120px, 170px) minmax(0, 1fr)",
              gap: "16px",
              padding: "14px",
              borderRadius:
                "14px",

              border: image.primary
                ? "1px solid rgba(217, 181, 109, 0.6)"
                : "1px solid rgba(255, 255, 255, 0.11)",

              background:
                "rgba(255, 255, 255, 0.025)",
            }}
          >
            <img
              src={image.imageUrl}
              alt={
                image.altText ||
                `Review image ${
                  index + 1
                }`
              }
              style={{
                display: "block",
                width: "100%",
                aspectRatio:
                  "1 / 1",
                objectFit: "cover",
                borderRadius:
                  "10px",
                background:
                  "#07110f",
              }}
            />

            <div
              style={{
                display: "grid",
                gap: "11px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <strong>
                  Image {index + 1}
                  {image.primary
                    ? " — Primary"
                    : ""}
                </strong>

                {!image.primary ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPrimaryImage(
                        index
                      )
                    }
                    style={{
                      minHeight:
                        "36px",
                      padding:
                        "0 12px",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid rgba(217, 181, 109, 0.45)",
                      background:
                        "transparent",
                      color:
                        "#d9b56d",
                      fontWeight:
                        "800",
                      cursor:
                        "pointer",
                    }}
                  >
                    Make Primary
                  </button>
                ) : null}
              </div>

              <input
                type="text"
                value={
                  image.altText
                }
                onChange={(event) =>
                  updateImageField(
                    index,
                    "altText",
                    event.target.value
                  )
                }
                placeholder="Alternative text for this image"
                style={{
                  width: "100%",
                  minHeight:
                    "42px",
                  padding:
                    "10px 12px",
                  border:
                    "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius:
                    "9px",
                  background:
                    "rgba(0, 0, 0, 0.18)",
                  color:
                    "#eef3f0",
                }}
              />

              <input
                type="text"
                value={
                  image.caption
                }
                onChange={(event) =>
                  updateImageField(
                    index,
                    "caption",
                    event.target.value
                  )
                }
                placeholder="Optional caption"
                style={{
                  width: "100%",
                  minHeight:
                    "42px",
                  padding:
                    "10px 12px",
                  border:
                    "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius:
                    "9px",
                  background:
                    "rgba(0, 0, 0, 0.18)",
                  color:
                    "#eef3f0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  disabled={
                    index === 0
                  }
                  onClick={() =>
                    moveImage(
                      index,
                      -1
                    )
                  }
                  style={{
                    minHeight:
                      "36px",
                    padding:
                      "0 11px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.14)",
                    background:
                      "transparent",
                    color:
                      "#dfe7e3",
                    opacity:
                      index === 0
                        ? 0.45
                        : 1,
                    cursor:
                      index === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ↑ Move Up
                </button>

                <button
                  type="button"
                  disabled={
                    index ===
                    images.length -
                      1
                  }
                  onClick={() =>
                    moveImage(
                      index,
                      1
                    )
                  }
                  style={{
                    minHeight:
                      "36px",
                    padding:
                      "0 11px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.14)",
                    background:
                      "transparent",
                    color:
                      "#dfe7e3",
                    opacity:
                      index ===
                      images.length -
                        1
                        ? 0.45
                        : 1,
                    cursor:
                      index ===
                      images.length -
                        1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ↓ Move Down
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeImage(index)
                  }
                  style={{
                    minHeight:
                      "36px",
                    padding:
                      "0 11px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid rgba(248, 113, 113, 0.32)",
                    background:
                      "rgba(248, 113, 113, 0.08)",
                    color:
                      "#fca5a5",
                    cursor:
                      "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}