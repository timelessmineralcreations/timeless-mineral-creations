"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function ImageUploader({
  name = "imageUrl",
  label = "Image",
  folder = "admin-images",
  defaultValue = "",
  helpText = "Upload a JPG, PNG, or WebP image smaller than 4 MB.",
}) {
  const inputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file) {
    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 4 MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The image could not be uploaded."
        );
      }

      setImageUrl(result.url);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  function handleDrop(event) {
    event.preventDefault();

    if (uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function removeImage() {
    setImageUrl("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "10px",
      }}
    >
      <input
        type="hidden"
        name={name}
        value={imageUrl}
      />

      <div>
        <div
          style={{
            color: "#e8eeeb",
            fontSize: "14px",
            fontWeight: "850",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#7f8c87",
            fontSize: "12px",
            lineHeight: 1.45,
          }}
        >
          {helpText}
        </div>
      </div>

      {imageUrl ? (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              aspectRatio: "4 / 3",
              overflow: "hidden",
              borderRadius: "14px",
              border:
                "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          >
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={secondaryButtonStyle}
            >
              {uploading ? "Uploading..." : "Replace Image"}
            </button>

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              style={dangerButtonStyle}
            >
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={uploading}
          style={{
            width: "100%",
            minHeight: "170px",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            border:
              "1px dashed rgba(217, 181, 109, 0.65)",
            borderRadius: "14px",
            background: "rgba(217, 181, 109, 0.04)",
            color: "#d9b56d",
            cursor: uploading ? "wait" : "pointer",
            textAlign: "center",
          }}
        >
          <span>
            <strong
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "16px",
              }}
            >
              {uploading
                ? "Uploading image..."
                : "Upload Image"}
            </strong>

            <span
              style={{
                display: "block",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Click here or drag and drop an image
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        hidden
      />

      {error ? (
        <div
          style={{
            border: "1px solid rgba(221, 92, 92, 0.5)",
            borderRadius: "10px",
            padding: "11px 13px",
            background: "rgba(221, 92, 92, 0.08)",
            color: "#ff9d9d",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      ) : null}

      {imageUrl ? (
        <div
          style={{
            overflowWrap: "anywhere",
            color: "#7f8c87",
            fontSize: "11px",
            lineHeight: 1.5,
          }}
        >
          Saved image URL: {imageUrl}
        </div>
      ) : null}
    </div>
  );
}

const secondaryButtonStyle = {
  minHeight: "44px",
  padding: "0 17px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "11px",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  background: "rgba(255, 255, 255, 0.035)",
  color: "#dfe7e3",
  fontWeight: "850",
  cursor: "pointer",
};

const dangerButtonStyle = {
  minHeight: "44px",
  padding: "0 17px",
  borderRadius: "11px",
  border: "1px solid rgba(221, 92, 92, 0.55)",
  background: "rgba(221, 92, 92, 0.08)",
  color: "#ff9d9d",
  fontWeight: "850",
  cursor: "pointer",
};