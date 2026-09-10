"use client";

import Link from "next/link";
import { useState } from "react";

import GalleryImageManager from "./GalleryImageManager";
import CheckboxField from "./CheckboxField";
import Field from "./Field";
import FormSection from "./FormSection";
import HelpText from "./HelpText";

import {
  actionGroupStyle,
  actionRowStyle,
  dangerButtonStyle,
  formGridStyle,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  twoColumnGridStyle,
} from "./styles";

export default function GalleryForm({
  galleryItem = null,
  collections = [],
  saveAction,
  deleteAction = null,
}) {
  const isEditing =
    Boolean(galleryItem);

  const legacyImages =
    galleryItem?.imageUrl
      ? [
          {
            id: null,
            imageUrl:
              galleryItem.imageUrl,
            altText:
              galleryItem.altText ||
              "",
            caption: "",
            sortOrder: 0,
            primary: true,
          },
        ]
      : [];

  const defaultImages =
    galleryItem?.images?.length
      ? galleryItem.images
      : legacyImages;

  const [uploadState, setUploadState] =
    useState({
      uploading: false,
      hasImage:
        defaultImages.length > 0,
    });

  const saveDisabled =
    uploadState.uploading ||
    !uploadState.hasImage;

  return (
    <form action={saveAction}>
      {isEditing ? (
        <input
          type="hidden"
          name="id"
          value={galleryItem.id}
        />
      ) : null}

      <div style={formGridStyle}>
        <FormSection
          title="Gallery Information"
          description="Enter the title and description customers may see with this memorial piece."
        >
          <Field
            label="Gallery Title"
            required
          >
            <input
              name="title"
              type="text"
              required
              defaultValue={
                galleryItem?.title ||
                ""
              }
              placeholder="Example: Turquoise Memorial Ring"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              rows={5}
              defaultValue={
                galleryItem?.description ||
                ""
              }
              placeholder="Describe the memorial piece, materials, minerals, and meaningful details."
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
          title="Gallery Images"
          description={
            isEditing
              ? "Add, remove, reorder, or select the primary image."
              : "Upload one or more images of the completed memorial piece."
          }
        >
          <GalleryImageManager
            defaultImages={
              defaultImages
            }
            onStatusChange={
              setUploadState
            }
          />

          <HelpText>
            The primary image will be used
            on gallery cards and featured
            sections.
          </HelpText>
        </FormSection>

        <FormSection
          title="Organization"
          description="Connect the gallery item to a collection and control its display order."
        >
          <div style={twoColumnGridStyle}>
            <Field label="Collection">
              <select
                name="collectionId"
                defaultValue={
                  galleryItem?.collectionId ||
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

              <HelpText>
                This is optional.
              </HelpText>
            </Field>

            <Field label="Sort Order">
              <input
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  galleryItem?.sortOrder ??
                  0
                }
                style={inputStyle}
              />

              <HelpText>
                Lower numbers appear first.
              </HelpText>
            </Field>
          </div>

          <Field label="Instagram URL">
            <input
              name="instagramUrl"
              type="url"
              defaultValue={
                galleryItem?.instagramUrl ||
                ""
              }
              placeholder="https://www.instagram.com/p/..."
              style={inputStyle}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Visibility"
          description="Choose where the gallery item may appear."
        >
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <CheckboxField
              name="active"
              label="Active"
              description="Display this item in the public gallery."
              defaultChecked={
                galleryItem
                  ? galleryItem.active
                  : true
              }
            />

            <CheckboxField
              name="featured"
              label="Featured"
              description="Mark this as an important featured gallery item."
              defaultChecked={
                galleryItem?.featured ||
                false
              }
            />

            <CheckboxField
              name="homepageFeatured"
              label="Homepage Featured"
              description="Allow this item to appear in the homepage gallery."
              defaultChecked={
                galleryItem?.homepageFeatured ||
                false
              }
            />
          </div>
        </FormSection>

        <div style={actionRowStyle}>
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
                  ...dangerButtonStyle,
                  opacity:
                    uploadState.uploading
                      ? 0.55
                      : 1,
                  cursor:
                    uploadState.uploading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Delete Gallery Item
              </button>
            ) : null}
          </div>

          <div style={actionGroupStyle}>
            <Link
              href="/admin/gallery"
              style={
                secondaryButtonStyle
              }
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saveDisabled}
              style={{
                ...primaryButtonStyle,
                opacity: saveDisabled
                  ? 0.5
                  : 1,
                cursor: saveDisabled
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {uploadState.uploading
                ? "Uploading Images..."
                : isEditing
                  ? "Save Changes"
                  : "Create Gallery Item"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}