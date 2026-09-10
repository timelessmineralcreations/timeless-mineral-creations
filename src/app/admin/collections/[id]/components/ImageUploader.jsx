"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export default function ImageUploader({
  value = "",
  onChange,
  label = "Image",
  folder = "collection-images",
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please use a JPG, PNG, or WebP image."
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      const safeFileName = file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");

      const pathname =
        `${folder}/${Date.now()}-${safeFileName}`;

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      if (!blob?.url) {
        throw new Error(
          "The upload completed but no image URL was returned."
        );
      }

      onChange?.(blob.url);
    } catch (uploadError) {
      console.error(
        "Image upload failed:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "The image could not be uploaded."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);
  }

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    if (file) {
      uploadFile(file);
    }

    event.target.value = "";
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "10px",
      }}
    >
      <div
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: "relative",
          minHeight: value
            ? "260px"
            : "180px",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          overflow: "hidden",

          borderRadius: "16px",

          border: dragging
            ? "2px solid #d8ad4f"
            : "2px dashed rgba(216, 173, 79, 0.55)",

          background: dragging
            ? "rgba(216, 173, 79, 0.12)"
            : "rgba(0, 0, 0, 0.18)",

          cursor: uploading
            ? "wait"
            : "pointer",

          transition:
            "border 150ms ease, background 150ms ease",
        }}
      >
        {value ? (
          <img
            src={value}
            alt={label}
            style={{
              position: "absolute",
              inset: 0,

              width: "100%",
              height: "100%",

              objectFit: "contain",

              pointerEvents: "none",
            }}
          />
        ) : null}

        <div
          style={{
            position: "relative",
            zIndex: 2,

            maxWidth: "360px",

            padding: "16px 20px",

            borderRadius: "12px",

            background: value
              ? "rgba(0, 0, 0, 0.72)"
              : "transparent",

            color: "#ffffff",

            textAlign: "center",
          }}
        >
          {uploading ? (
            <>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                }}
              >
                Uploading image...
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  opacity: 0.75,
                }}
              >
                Please wait.
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                }}
              >
                {value
                  ? "Replace Image"
                  : "Drag & Drop Image"}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  opacity: 0.8,
                }}
              >
                Drop a JPG, PNG, or WebP here
                or click to choose a file.
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            display: "none",
          }}
        />
      </div>

      {value ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={value}
            readOnly
            style={{
              flex: 1,
              minWidth: 0,

              padding: "10px 12px",

              borderRadius: "9px",
              border:
                "1px solid rgba(255,255,255,0.12)",

              background:
                "rgba(0,0,0,0.22)",

              color: "#cfd8d4",
              fontSize: "12px",
            }}
          />

          <button
            type="button"
            onClick={() => onChange?.("")}
            disabled={uploading}
            style={{
              minHeight: "40px",
              padding: "0 14px",

              borderRadius: "9px",
              border:
                "1px solid rgba(255,255,255,0.16)",

              background:
                "rgba(255,255,255,0.06)",

              color: "#ffffff",

              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: "10px 12px",

            borderRadius: "9px",
            border:
              "1px solid rgba(255,90,90,0.35)",

            background:
              "rgba(255,90,90,0.08)",

            color: "#ffb3b3",

            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}