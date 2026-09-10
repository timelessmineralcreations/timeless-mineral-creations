"use client";

import { useState } from "react";

import ImagePositionEditor from "@/components/admin/ImagePositionEditor";

import Field from "./Field";
import FormSection from "./FormSection";
import ImageUploader from "./ImageUploader";

export default function ImagesSection({
  collection,
}) {
  const [cardImage, setCardImage] =
    useState(collection.cardImage || "");

  const [heroImage, setHeroImage] =
    useState(collection.heroImage || "");

  return (
    <FormSection
      title="Images"
      description="Upload each collection image, then drag and zoom it until the preview looks right."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "20px",
        }}
      >
        {/* CARD IMAGE UPLOAD */}
        <Field
          label="Collection Card Image"
          helpText="Drag and drop an image or click to choose one."
        >
          <input
            type="hidden"
            name="cardImage"
            value={cardImage}
          />

          <ImageUploader
            value={cardImage}
            onChange={setCardImage}
            label="Collection Card Image"
            folder={`collections/${collection.slug}/card`}
          />
        </Field>

        {/* HERO IMAGE UPLOAD */}
        <Field
          label="Collection Hero Image"
          helpText="Drag and drop an image or click to choose one."
        >
          <input
            type="hidden"
            name="heroImage"
            value={heroImage}
          />

          <ImageUploader
            value={heroImage}
            onChange={setHeroImage}
            label="Collection Hero Image"
            folder={`collections/${collection.slug}/hero`}
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "20px",
        }}
      >
        {/* CARD IMAGE POSITIONING */}
        <ImagePositionEditor
          title="Collection Card Image"
          description="Drag the image to reposition it inside the collection card."
          imagePath={cardImage}
          scaleName="cardImageScale"
          xName="cardImageX"
          yName="cardImageY"
          defaultScale={
            collection.cardImageScale ?? 1
          }
          defaultX={
            collection.cardImageX ?? 0
          }
          defaultY={
            collection.cardImageY ?? 0
          }
          aspectRatio="4 / 3"
          fitMode="contain"
        />

        {/* HERO IMAGE POSITIONING */}
        <ImagePositionEditor
          title="Collection Hero Image"
          description="Drag the image to reposition it on the collection page."
          imagePath={heroImage}
          scaleName="heroImageScale"
          xName="heroImageX"
          yName="heroImageY"
          defaultScale={
            collection.heroImageScale ?? 1
          }
          defaultX={
            collection.heroImageX ?? 0
          }
          defaultY={
            collection.heroImageY ?? 0
          }
          aspectRatio="16 / 9"
          fitMode="contain"
        />
      </div>
    </FormSection>
  );
}