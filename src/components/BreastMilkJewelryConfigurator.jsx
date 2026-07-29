"use client";

import { useMemo, useState } from "react";

export default function BreastMilkJewelryConfigurator({ collection }) {
  const productType =
  collection.productType ||
  collection.ringCores?.[0]?.productType ||
  collection.braceletCores?.[0]?.productType ||
  collection.necklaceCores?.[0]?.productType ||
  "jewelry";

const isRing = productType === "ring";
const isBracelet = productType === "bracelet";
const isNecklace = productType === "necklace";

const productName = isRing
  ? "Ring"
  : isBracelet
  ? "Bracelet"
  : isNecklace
  ? "Necklace"
  : "Jewelry";

  const productCores =
  collection.ringCores ||
  collection.braceletCores ||
  collection.necklaceCores ||
  [];

const productCore = productCores[0];

const productPhotos =
  collection.ringPhotos ||
  collection.braceletPhotos ||
  collection.necklacePhotos ||
  [];

  const finishes = isBracelet
    ? productCores.map((core) => ({
        id:
          core.finish === "White Gold Plated"
            ? "white-gold-plated"
            : core.finish === "Rose Gold Plated"
            ? "rose-gold-plated"
            : core.id,

        name: core.finish,

        materialDescription:
          core.metal || core.material || "925 Sterling Silver",

        core,
      }))
    : productCore?.finishes || [];

  const [selectedFinishId, setSelectedFinishId] = useState(
    productCore?.defaultFinish || finishes[0]?.id || ""
  );

  const [selectedKeepsakeMaterial, setSelectedKeepsakeMaterial] =
    useState("breastMilk");

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  const selectedFinish =
    finishes.find(
      (finish) => finish.id === selectedFinishId
    ) || finishes[0];

  const displayedImages = useMemo(() => {
  const normalizeFinish = (finish) => {
    if (!finish) return "";

    return finish
      .toLowerCase()
      .replaceAll(" ", "-");
  };

  const normalizePhoto = (photo, index) => {
    if (typeof photo === "string") {
      return {
        id: `photo-${index}`,
        src: photo,
        label: `${productName} View ${index + 1}`,
      };
    }

    const src = photo.src || photo.image || null;

    const finishName =
      photo.finish === "white-gold-plated"
        ? "White Gold Plated"
        : photo.finish === "rose-gold-plated"
        ? "Rose Gold Plated"
        : photo.finish || "";

    const birthstoneName = photo.birthstone
      ? photo.birthstone.charAt(0).toUpperCase() +
        photo.birthstone.slice(1)
      : "";

    const label =
      photo.name ||
      photo.title ||
      [finishName, birthstoneName]
        .filter(Boolean)
        .join(" • ") ||
      `${productName} View ${index + 1}`;

    return {
      ...photo,
      id: photo.id || `photo-${index}`,
      src,
      label,
    };
  };

  const normalizedPhotos = productPhotos
    .map(normalizePhoto)
    .filter((photo) => photo.src);

  const selectedFinishPhotos = normalizedPhotos.filter(
    (photo) => {
      if (!photo.finish) return true;

      return (
        normalizeFinish(photo.finish) ===
        normalizeFinish(selectedFinishId)
      );
    }
  );

  const otherPhotos = normalizedPhotos.filter(
    (photo) =>
      !selectedFinishPhotos.some(
        (selectedPhoto) =>
          selectedPhoto.src === photo.src
      )
  );

  const combinedPhotos = [
    ...selectedFinishPhotos,
    ...otherPhotos,
  ];

  if (combinedPhotos.length > 0) {
    return combinedPhotos.filter(
      (photo, index, array) =>
        array.findIndex(
          (item) => item.src === photo.src
        ) === index
    );
  }

  if (selectedFinish?.images?.length > 0) {
    return selectedFinish.images.map(
      (image, index) => ({
        id: `finish-photo-${index}`,
        src: image,
        label: `${selectedFinish.name} • ${productName}`,
      })
    );
  }

  return collection.heroImage
    ? [
        {
          id: "hero-image",
          src: collection.heroImage,
          label: collection.name,
        },
      ]
    : [];
}, [
  collection.heroImage,
  collection.name,
  productName,
  productPhotos,
  selectedFinish,
  selectedFinishId,
]);

  const basePrice =
    (collection.pricing?.profit || 0) +
    (collection.pricing?.baseProduct || 0);

  const finishPrice =
    collection.pricing?.finishes?.[
      selectedFinishId
    ] || 0;

  const keepsakePrice =
    collection.pricing?.keepsakeMaterials?.[
      selectedKeepsakeMaterial
    ] || 0;

  const totalPrice =
    basePrice + finishPrice + keepsakePrice;

  const keepsakeChoices = [
    {
      id: "breastMilk",
      name: "Breast Milk",
      description:
        "Your preserved breast milk is transformed into a timeless pearl-white keepsake inlay.",
    },
    {
      id: "cremation",
      name: "Cremation Ashes",
      description: `A small portion of your loved one’s cremation ashes is carefully preserved within the ${productName.toLowerCase()}.`,
    },
    {
      id: "specialRequest",
      name: "Special Request",
      description:
        "Choose this option for another meaningful keepsake material and describe your request after ordering.",
    },
  ];

  const selectedKeepsakeChoice =
    keepsakeChoices.find(
      (choice) =>
        choice.id === selectedKeepsakeMaterial
    ) || keepsakeChoices[0];

  const currentPhoto =
    displayedImages[selectedImageIndex] ||
    displayedImages[0] ||
    null;

  const currentImage =
    currentPhoto?.src || collection.heroImage;

  const detailData =
    productCore?.ringDetails ||
    productCore?.pendantDetails ||
    {};

  const settingQuantity =
    detailData.bezelQuantity ||
    detailData.settingQuantity ||
    3;

  const settingShape =
    detailData.bezelShape ||
    detailData.settingShape ||
    "Marquise";

  const settingSize =
    detailData.bezelSize ||
    detailData.settingSize ||
    (isRing
      ? "2 × 4 mm each"
      : "2 × 3.5 mm each");

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "45px 20px 80px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(320px, 390px)",
          gap: "34px",
          alignItems: "start",
        }}
      >
        <section>
          <img
            src={currentImage}
            alt={collection.name}
            style={{
              width: "100%",
              maxHeight: "650px",
              objectFit: "cover",
              borderRadius: "20px",
              border:
                "1px solid rgba(255,255,255,.12)",
              display: "block",
            }}
          />

          {displayedImages.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              {displayedImages.map((photo, index) => (
                <button
                  key={`${photo.id}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex(index)
                  }
                  style={{
                    padding: 0,
                    border:
                      selectedImageIndex === index
                        ? "2px solid #d4af37"
                        : "1px solid rgba(255,255,255,.15)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "rgba(255,255,255,.035)",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <span
                    style={{
                      display: "block",
                      padding: "8px 9px",
                      fontSize: "12px",
                      lineHeight: 1.35,
                      fontWeight: 650,
                      textAlign: "center",
                    }}
                  >
                    {photo.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <h1
            style={{
              fontSize: "44px",
              margin: "28px 0 12px",
            }}
          >
            {collection.name}
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              opacity: 0.82,
              maxWidth: "850px",
            }}
          >
            {collection.description}
          </p>

          <section style={{ marginTop: "38px" }}>
            <h2
              style={{
                fontSize: "23px",
                marginBottom: "15px",
              }}
            >
              Choose Metal Finish
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "14px",
              }}
            >
              {finishes.map((finish) => {
                const selected =
                  selectedFinishId === finish.id;

                return (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => {
                      setSelectedFinishId(
                        finish.id
                      );
                      setSelectedImageIndex(0);
                    }}
                    style={{
                      padding: "18px",
                      borderRadius: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#fff",
                      background: selected
                        ? "rgba(212,175,55,.14)"
                        : "rgba(255,255,255,.04)",
                      border: selected
                        ? "2px solid #d4af37"
                        : "1px solid rgba(255,255,255,.14)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: "17px",
                        marginBottom: "6px",
                      }}
                    >
                      {finish.name}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        fontSize: "13px",
                        lineHeight: 1.45,
                        opacity: 0.72,
                      }}
                    >
                      {finish.materialDescription}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: "36px" }}>
            <h2
              style={{
                fontSize: "23px",
                marginBottom: "15px",
              }}
            >
              Choose Keepsake Material
            </h2>

            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {keepsakeChoices.map((choice) => {
                const selected =
                  selectedKeepsakeMaterial === choice.id;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setSelectedKeepsakeMaterial(
                        choice.id
                      );
                      setSelectedImageIndex(0);
                    }}
                    style={{
                      padding: "18px",
                      borderRadius: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#fff",
                      background: selected
                        ? "rgba(212,175,55,.14)"
                        : "rgba(255,255,255,.04)",
                      border: selected
                        ? "2px solid #d4af37"
                        : "1px solid rgba(255,255,255,.14)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: "17px",
                        marginBottom: "6px",
                      }}
                    >
                      {choice.name}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        opacity: 0.75,
                      }}
                    >
                      {choice.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            style={{
              marginTop: "36px",
              padding: "22px",
              borderRadius: "16px",
              border:
                "1px solid rgba(255,255,255,.13)",
              background:
                "rgba(255,255,255,.035)",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                marginBottom: "14px",
              }}
            >
              {productName} Details
            </h2>

            <p
              style={{
                margin: "7px 0",
                opacity: 0.82,
              }}
            >
              <strong>Metal:</strong>{" "}
              {productCore?.material ||
                "Solid 925 Sterling Silver"}
            </p>

            {isRing && (
              <p
                style={{
                  margin: "7px 0",
                  opacity: 0.82,
                }}
              >
                <strong>Ring Size:</strong>{" "}
                {productCore?.size ||
                  productCore?.sizeRange ||
                  "Adjustable"}
              </p>
            )}

            {isBracelet && (
              <p
                style={{
                  margin: "7px 0",
                  opacity: 0.82,
                }}
              >
                <strong>Bracelet Length:</strong>{" "}
                {productCore?.braceletLength ||
                  productCore?.length ||
                  productCore?.size ||
                  "Adjustable"}
              </p>
            )}

            {isNecklace && (
              <>
                <p
                  style={{
                    margin: "7px 0",
                    opacity: 0.82,
                  }}
                >
                  <strong>Necklace Length:</strong>{" "}
                  {productCore?.chainLength ||
                    '16" with 2" extender'}
                </p>

                <p
                  style={{
                    margin: "7px 0",
                    opacity: 0.82,
                  }}
                >
                  <strong>
                    Adjustable Length:
                  </strong>{" "}
                  {productCore?.adjustableLength ||
                    "Up to 18 inches"}
                </p>
              </>
            )}

            <p
              style={{
                margin: "7px 0",
                opacity: 0.82,
              }}
            >
              <strong>Inlay Settings:</strong>{" "}
              {settingQuantity} {settingShape} settings,{" "}
              {settingSize}
            </p>
          </section>
        </section>

        <aside
          style={{
            position: "sticky",
            top: "110px",
            padding: "22px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,.18)",
            background:
              "rgba(255,255,255,.045)",
          }}
        >
          <h2
            style={{
              fontSize: "27px",
              marginBottom: "20px",
            }}
          >
            Your {productName}
          </h2>

          <SummaryRow
            label="Product"
            value={collection.name}
          />

          <SummaryRow
            label="Metal Finish"
            value={
              selectedFinish?.name ||
              "Not selected"
            }
          />

          <SummaryRow
            label="Keepsake Material"
            value={
              selectedKeepsakeChoice?.name ||
              "Not selected"
            }
          />

          <SummaryRow
            label={
              isRing
                ? "Ring Size"
                : isBracelet
                ? "Bracelet Length"
                : isNecklace
                ? "Necklace Length"
                : "Product Size"
            }
            value={
              isRing
                ? productCore?.size ||
                  productCore?.sizeRange ||
                  "Adjustable"
                : isBracelet
                ? productCore?.braceletLength ||
                  productCore?.length ||
                  productCore?.size ||
                  "Adjustable"
                : isNecklace
                ? productCore?.chainLength ||
                  '16" with 2" extender'
                : "Not specified"
            }
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop:
                "1px solid rgba(255,255,255,.15)",
              marginTop: "20px",
              paddingTop: "20px",
            }}
          >
            <strong style={{ fontSize: "18px" }}>
              Total
            </strong>

            <strong
              style={{
                fontSize: "28px",
                color: "#d4af37",
              }}
            >
              ${totalPrice.toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              background: "#d4af37",
              color: "#111",
              fontSize: "17px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>

          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.5,
              opacity: 0.68,
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Carefully handcrafted in North Carolina.
            Estimated completion time is 2–10 weeks.
          </p>
        </aside>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        marginBottom: "14px",
        paddingBottom: "14px",
        borderBottom:
          "1px solid rgba(255,255,255,.1)",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          opacity: 0.58,
          marginBottom: "5px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          display: "block",
          fontSize: "15px",
          fontWeight: 650,
        }}
      >
        {value}
      </span>
    </div>
  );
}