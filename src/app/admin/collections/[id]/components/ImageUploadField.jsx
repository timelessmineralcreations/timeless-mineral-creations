"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function ImageUploadField({
  name = "imageUrl",
  defaultValue = "",
  label = "Product Photo",
  folder = "collection-photos",
}) {
  const [value, setValue] = useState(
    defaultValue || ""
  );

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={value}
      />

      <ImageUploader
        value={value}
        onChange={setValue}
        label={label}
        folder={folder}
      />
    </>
  );
}