"use client";

import { upload } from "@vercel/blob/client";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function createSafeFilename(filename) {
  const lastDot = filename.lastIndexOf(".");

  const originalExtension =
    lastDot >= 0 ? filename.slice(lastDot) : "";

  const originalName =
    lastDot >= 0
      ? filename.slice(0, lastDot)
      : filename;

  const safeName = originalName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeExtension = originalExtension
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");

  return `${
    safeName || "gallery-image"
  }${safeExtension}`;
}

export default function GalleryImageUpload({
  defaultValue = "",
  onStatusChange,
}) {
  const inputRef = useRef(null);

  const [imageUrl, setImageUrl] =
    useState(defaultValue);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(defaultValue);

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

    useEffect(() => {
  onStatusChange?.({
    uploading,
    hasImage: Boolean(imageUrl),
  });
}, [
  uploading,
  imageUrl,
  onStatusChange,
]);

  function validateFile(file) {
    if (!file) {
      return "Choose an image first.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "The image must be 20 MB or smaller.";
    }

    return "";
  }

  async function uploadImage(fileToUpload) {
    const validationError =
      validateFile(fileToUpload);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);
    setImageUrl("");

    try {
      const safeFilename =
        createSafeFilename(
          fileToUpload.name
        );

      const blob = await upload(
        `gallery/${safeFilename}`,
        fileToUpload,
        {
          access: "public",

          handleUploadUrl:
            "/api/gallery/upload",

          multipart:
            fileToUpload.size >
            5 * 1024 * 1024,

          onUploadProgress: (
            progressEvent
          ) => {
            setProgress(
              Math.round(
                progressEvent.percentage
              )
            );
          },
        }
      );

      setImageUrl(blob.url);
      setPreviewUrl(blob.url);
      setProgress(100);
    } catch (uploadError) {
      console.error(
        "Gallery image upload failed:",
        uploadError
      );

      setImageUrl("");
      setProgress(0);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded."
      );
    } finally {
      setUploading(false);
    }
  }

  async function chooseFile(file) {
    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSelectedFile(file);
    setProgress(0);
    setImageUrl("");

    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreviewUrl =
      URL.createObjectURL(file);

    setPreviewUrl(localPreviewUrl);

    await uploadImage(file);
  }

  function clearImage() {
    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setImageUrl("");
    setProgress(0);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    if (uploading) {
      return;
    }

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      chooseFile(file);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
      }}
    >
      <input
        type="hidden"
        name="imageUrl"
        value={imageUrl}
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
          minHeight: "190px",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          borderRadius: "16px",
          border: dragging
            ? "2px dashed #d9b56d"
            : "2px dashed rgba(255, 255, 255, 0.22)",
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
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            if (file) {
              chooseFile(file);
            }
          }}
          style={{
            display: "none",
          }}
        />

        <div>
          <div
            aria-hidden="true"
            style={{
              marginBottom: "10px",
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
              ? "Uploading image..."
              : dragging
                ? "Drop the image here"
                : "Drag an image here"}
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
              : "or click to browse"}
          </span>

          <span
            style={{
              display: "block",
              marginTop: "8px",
              color: "#78847f",
              fontSize: "12px",
            }}
          >
            JPEG, PNG, or WebP • Maximum 20 MB
          </span>
        </div>
      </div>

      {selectedFile ? (
        <div
          style={{
            padding: "14px",
            border:
              "1px solid rgba(255, 255, 255, 0.11)",
            borderRadius: "12px",
            background:
              "rgba(255, 255, 255, 0.025)",
          }}
        >
          <strong
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedFile.name}
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "4px",
              color: "#98a49f",
              fontSize: "12px",
            }}
          >
            {formatFileSize(
              selectedFile.size
            )}
          </span>
        </div>
      ) : null}

      {previewUrl ? (
        <div
          style={{
            padding: "14px",
            border:
              "1px solid rgba(255, 255, 255, 0.11)",
            borderRadius: "14px",
            background:
              "rgba(255, 255, 255, 0.025)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#d9b56d",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            Preview
          </p>

          <img
            src={previewUrl}
            alt="Selected gallery upload preview"
            style={{
              display: "block",
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "11px",
              background: "#07110f",
            }}
          />
        </div>
      ) : null}

      {uploading || progress > 0 ? (
        <div>
          <div
            style={{
              height: "9px",
              overflow: "hidden",
              borderRadius: "999px",
              background:
                "rgba(255, 255, 255, 0.09)",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: "999px",
                background: "#d9b56d",
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

      {previewUrl ? (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            style={{
              minHeight: "44px",
              padding: "0 18px",
              borderRadius: "10px",
              border:
                "1px solid rgba(255, 255, 255, 0.16)",
              background: "transparent",
              color: "#dfe7e3",
              fontWeight: "800",
              cursor: uploading
                ? "not-allowed"
                : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            Remove Image
          </button>
        </div>
      ) : null}

      {uploading ? (
        <div
          style={{
            color: "#d9b56d",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          Uploading image. Please wait...
        </div>
      ) : imageUrl ? (
        <div
          style={{
            color: "#86efac",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          ✓ Upload complete. You can now
          create the gallery item.
        </div>
      ) : (
        <div
          style={{
            color: "#98a49f",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          Select an image and it will upload
          automatically.
        </div>
      )}
    </div>
  );
}