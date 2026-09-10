"use client";

import Link from "next/link";
import { useState } from "react";

import ReviewImageManager from "./ReviewImageManager";

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  padding: "11px 13px",
  border:
    "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: "10px",
  background:
    "rgba(0, 0, 0, 0.18)",
  color: "#eef3f0",
  fontSize: "14px",
  outline: "none",
};

const sectionStyle = {
  display: "grid",
  gap: "18px",
  padding: "22px",
  border:
    "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  background:
    "rgba(255, 255, 255, 0.025)",
};

function Field({
  label,
  required = false,
  description = "",
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
          color: "#dfe7e3",
          fontSize: "13px",
          fontWeight: "800",
        }}
      >
        {label}
        {required ? " *" : ""}
      </span>

      {children}

      {description ? (
        <span
          style={{
            color: "#87938e",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns:
          "auto minmax(0, 1fr)",
        gap: "11px",
        alignItems: "start",
        padding: "13px",
        border:
          "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "11px",
        background:
          "rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
      }}
    >
      <input
        name={name}
        type="checkbox"
        defaultChecked={
          defaultChecked
        }
        style={{
          width: "17px",
          height: "17px",
          marginTop: "2px",
          accentColor: "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            color: "#eef3f0",
            fontSize: "14px",
          }}
        >
          {label}
        </strong>

        <span
          style={{
            display: "block",
            marginTop: "4px",
            color: "#98a49f",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function getDateInputValue(
  dateValue
) {
  if (!dateValue) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  return date
    .toISOString()
    .slice(0, 10);
}

export default function ReviewForm({
  review = null,
  collections = [],
  galleryItems = [],
  saveAction,
  deleteAction = null,
}) {
  const isEditing =
    Boolean(review);

  const [
    uploadState,
    setUploadState,
  ] = useState({
    uploading: false,
    imageCount:
      review?.images?.length || 0,
  });

  const reviewDate =
    getDateInputValue(
      review?.reviewDate
    );

  return (
    <form action={saveAction}>
      {isEditing ? (
        <input
          type="hidden"
          name="id"
          value={review.id}
        />
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        <section style={sectionStyle}>
          <div>
            <p
              style={{
                margin: 0,
                color: "#d9b56d",
                fontSize: "12px",
                fontWeight: "900",
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
              }}
            >
              Customer Details
            </p>

            <h2
              style={{
                margin:
                  "7px 0 0",
                color: "#eef3f0",
                fontSize: "21px",
              }}
            >
              Review Information
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Enter the customer name,
              rating, review text, and
              date.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <Field
              label="Customer Name"
              required
            >
              <input
                name="customerName"
                type="text"
                required
                defaultValue={
                  review?.customerName ||
                  ""
                }
                placeholder="Example: Sarah M."
                style={inputStyle}
              />
            </Field>

            <Field label="Customer Location">
              <input
                name="customerLocation"
                type="text"
                defaultValue={
                  review?.customerLocation ||
                  ""
                }
                placeholder="Example: Havelock, NC"
                style={inputStyle}
              />
            </Field>

            <Field
              label="Rating"
              required
            >
              <select
                name="rating"
                required
                defaultValue={
                  review?.rating || 5
                }
                style={inputStyle}
              >
                <option value="5">
                  ★★★★★ — 5 stars
                </option>

                <option value="4">
                  ★★★★☆ — 4 stars
                </option>

                <option value="3">
                  ★★★☆☆ — 3 stars
                </option>

                <option value="2">
                  ★★☆☆☆ — 2 stars
                </option>

                <option value="1">
                  ★☆☆☆☆ — 1 star
                </option>
              </select>
            </Field>

            <Field
              label="Review Date"
              required
            >
              <input
                name="reviewDate"
                type="date"
                required
                defaultValue={
                  reviewDate
                }
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Review Title">
            <input
              name="title"
              type="text"
              defaultValue={
                review?.title || ""
              }
              placeholder="Example: Absolutely beautiful memorial ring"
              style={inputStyle}
            />
          </Field>

          <Field
            label="Review Text"
            required
          >
            <textarea
              name="body"
              required
              rows={7}
              defaultValue={
                review?.body || ""
              }
              placeholder="Paste or enter the customer's review..."
              style={{
                ...inputStyle,
                minHeight: "170px",
                resize: "vertical",
                lineHeight: 1.65,
              }}
            />
          </Field>

          <Field
            label="Owner Response"
            description="Optional public response from Timeless Mineral Creations."
          >
            <textarea
              name="ownerResponse"
              rows={5}
              defaultValue={
                review?.ownerResponse ||
                ""
              }
              placeholder="Thank you so much for trusting me with such a meaningful piece..."
              style={{
                ...inputStyle,
                minHeight: "125px",
                resize: "vertical",
                lineHeight: 1.65,
              }}
            />
          </Field>
        </section>

        <section style={sectionStyle}>
          <div>
            <p
              style={{
                margin: 0,
                color: "#d9b56d",
                fontSize: "12px",
                fontWeight: "900",
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
              }}
            >
              Customer Photos
            </p>

            <h2
              style={{
                margin:
                  "7px 0 0",
                color: "#eef3f0",
                fontSize: "21px",
              }}
            >
              Review Images
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Upload optional customer
              photos or completed-piece
              images.
            </p>
          </div>

          <ReviewImageManager
            defaultImages={
              review?.images || []
            }
            onStatusChange={
              setUploadState
            }
          />
        </section>

        <section style={sectionStyle}>
          <div>
            <p
              style={{
                margin: 0,
                color: "#d9b56d",
                fontSize: "12px",
                fontWeight: "900",
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
              }}
            >
              Website Connections
            </p>

            <h2
              style={{
                margin:
                  "7px 0 0",
                color: "#eef3f0",
                fontSize: "21px",
              }}
            >
              Related Content
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Optionally connect this
              review to a collection or
              completed gallery piece.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
            }}
          >
            <Field label="Collection">
              <select
                name="collectionId"
                defaultValue={
                  review?.collectionId ||
                  ""
                }
                style={inputStyle}
              >
                <option value="">
                  No collection
                </option>

                {collections.map(
                  (collection) => (
                    <option
                      key={collection.id}
                      value={collection.id}
                    >
                      {collection.name}
                      {collection.published
                        ? ""
                        : " — Draft"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Gallery Item">
              <select
                name="galleryItemId"
                defaultValue={
                  review?.galleryItemId ||
                  ""
                }
                style={inputStyle}
              >
                <option value="">
                  No gallery item
                </option>

                {galleryItems.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.title}
                      {item.active
                        ? ""
                        : " — Inactive"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Sort Order"
              description="Lower numbers appear first."
            >
              <input
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  review?.sortOrder ??
                  0
                }
                style={inputStyle}
              />
            </Field>
          </div>
        </section>

        <section style={sectionStyle}>
          <div>
            <p
              style={{
                margin: 0,
                color: "#d9b56d",
                fontSize: "12px",
                fontWeight: "900",
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
              }}
            >
              Publishing
            </p>

            <h2
              style={{
                margin:
                  "7px 0 0",
                color: "#eef3f0",
                fontSize: "21px",
              }}
            >
              Visibility Settings
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#98a49f",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Choose where the review
              may appear and whether it
              has been verified.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            <CheckboxField
              name="approved"
              label="Approved"
              description="Allow this review to appear publicly on the website."
              defaultChecked={
                review?.approved ||
                false
              }
            />

            <CheckboxField
              name="verified"
              label="Verified Customer"
              description="Show customers that this review came from a verified buyer."
              defaultChecked={
                review?.verified ||
                false
              }
            />

            <CheckboxField
              name="featured"
              label="Featured"
              description="Mark this as an especially important review."
              defaultChecked={
                review?.featured ||
                false
              }
            />

            <CheckboxField
              name="homepageFeatured"
              label="Homepage Featured"
              description="Allow this review to appear in a featured reviews section on the homepage."
              defaultChecked={
                review?.homepageFeatured ||
                false
              }
            />
          </div>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            paddingTop: "4px",
          }}
        >
          <div>
            {isEditing &&
            deleteAction ? (
              <button
                type="submit"
                formAction={
                  deleteAction
                }
                disabled={
                  uploadState.uploading
                }
                style={{
                  minHeight: "46px",
                  padding:
                    "0 18px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid rgba(248, 113, 113, 0.4)",
                  background:
                    "rgba(248, 113, 113, 0.1)",
                  color:
                    "#fca5a5",
                  fontWeight:
                    "900",
                  cursor:
                    uploadState.uploading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    uploadState.uploading
                      ? 0.55
                      : 1,
                }}
              >
                Delete Review
              </button>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/admin/reviews"
              style={{
                display:
                  "inline-flex",
                minHeight: "46px",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding:
                  "0 18px",
                borderRadius:
                  "10px",
                border:
                  "1px solid rgba(255, 255, 255, 0.16)",
                background:
                  "transparent",
                color:
                  "#dfe7e3",
                textDecoration:
                  "none",
                fontWeight:
                  "800",
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                uploadState.uploading
              }
              style={{
                minHeight: "46px",
                padding:
                  "0 20px",
                border: 0,
                borderRadius:
                  "10px",
                background:
                  "#d9b56d",
                color:
                  "#111814",
                fontWeight:
                  "900",
                cursor:
                  uploadState.uploading
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  uploadState.uploading
                    ? 0.55
                    : 1,
              }}
            >
              {uploadState.uploading
                ? "Uploading Photos..."
                : isEditing
                  ? "Save Review"
                  : "Create Review"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}