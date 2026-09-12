"use client";

import { useEffect, useRef, useState } from "react";
import ShippingReminder from "@/components/builder/ShippingReminder";
import RingInspirationGallery from "@/components/builder/RingInspirationGallery";
import GlowSelector from "@/components/builder/GlowSelector";
import MaterialSelector from "@/components/builder/MaterialSelector";
import RingCoreSelector from "@/components/builder/RingCoreSelector";
import WidthSelector from "@/components/builder/WidthSelector";
import SizeSelector from "@/components/builder/SizeSelector";
import RingDesignSelector from "@/components/builder/RingDesignSelector";
import MultiChannelSelector from "@/components/builder/MultiChannelSelector";
import SummaryCard from "@/components/builder/SummaryCard";
import OptionCard from "@/components/builder/OptionCard";
import AccentMaterialSelector from "@/components/builder/AccentMaterialSelector";
import EngravingSelector from "@/components/builder/EngravingSelector";
import NecklaceConfigurator from "@/components/BreastMilkJewelryConfigurator";
import getBestCollectionPhoto from "@/utils/getBestCollectionPhoto";
import calculateRingPrice from "@/utils/calculateRingPrice";
import { loadDesign } from "@/utils/savedDesigns";



import { inlayStyles } from "@/data/inlayStyles";
import { accentMaterials } from "@/data/accentMaterials";
import { birthstones } from "@/data/birthstones";

function normalizeSalePercent(value) {
  const percent = Number(value);

  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round(percent)
    )
  );
}

function getDiscountedPrice(
  price,
  enabled,
  percent
) {
  const regularCents =
    Math.max(
      0,
      Math.round(
        (Number(price) || 0) *
          100
      )
    );

  if (
    !enabled ||
    percent <= 0
  ) {
    return regularCents / 100;
  }

  const discountedCents =
    Math.round(
      (regularCents *
        (100 - percent)) /
        100
    );

  return discountedCents / 100;
}

function RingCollectionConfigurator({ collection }) {
  const [
    isMobileLayout,
    setIsMobileLayout,
  ] = useState(false);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 768px)"
      );

    const updateMobileLayout = () => {
      setIsMobileLayout(
        mediaQuery.matches
      );
    };

    updateMobileLayout();

    mediaQuery.addEventListener(
      "change",
      updateMobileLayout
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMobileLayout
      );
    };
  }, []);

  const ringCores = collection.ringCores || [];

  const availableGlowPowders =
  Array.isArray(
    collection.glowPowders
  )
    ? collection.glowPowders.filter(
        (glow) =>
          glow?.active !== false
      )
    : [];

const availableMinerals =
  Array.isArray(
    collection.minerals
  )
    ? collection.minerals.filter(
        (mineral) =>
          mineral?.active !== false
      )
    : [];

  /*
   * CUSTOMER MEMORIAL MATERIAL CATALOG
   *
   * This list is built by the collection page
   * from active Admin → Memorial Materials
   * records that are also assigned to this
   * collection.
   */
  const availableMemorialMaterials =
    Array.isArray(
      collection.memorialMaterials
    )
      ? collection.memorialMaterials.filter(
          (material) =>
            material?.active !== false
        )
      : [];

  const availableMemorialMaterialIdSet =
    new Set(
      availableMemorialMaterials.map(
        (material) =>
          String(material.id)
      )
    );

  /*
   * CUSTOMER ENGRAVING CATALOG
   *
   * The collection page already filters this
   * list against the active master Engraving
   * Options and the methods assigned to this
   * collection.
   *
   * If this collection has database engraving
   * pricing, use that price so the option card
   * matches the amount calculateRingPrice adds.
   */
  const availableEngravingOptions =
    Array.isArray(
      collection.engravingOptions
    )
      ? collection.engravingOptions
          .filter(
            (option) =>
              option?.active !== false
          )
          .map((option) => {
            const pricingKey =
              option.slug ===
              "standard-engraving"
                ? "standard"
                : option.slug ===
                    "custom-signature"
                  ? "customSignature"
                  : null;

            const collectionPrice =
              pricingKey
                ? collection.databasePricing
                    ?.engraving?.[
                    pricingKey
                  ]
                : undefined;

            const numericCollectionPrice =
              Number(collectionPrice);

            if (
              !Number.isFinite(
                numericCollectionPrice
              )
            ) {
              return option;
            }

            return {
              ...option,

              price:
                numericCollectionPrice,

              priceAdjustmentCents:
                Math.round(
                  numericCollectionPrice *
                    100
                ),
            };
          })
      : [];

  const materials = [
    ...new Set(
      ringCores.map(
        (core) => core.material
      )
    ),
  ];

  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState(materials[0]);

  const [
    selectedKeepsakeMaterial,
    setSelectedKeepsakeMaterial,
  ] = useState("breastMilk");

  const [
    selectedBirthstone,
    setSelectedBirthstone,
  ] = useState(null);

  const availableCores =
    ringCores.filter(
      (core) =>
        core.material ===
        selectedMaterial
    );

  const [
    selectedCore,
    setSelectedCore,
  ] = useState(
    availableCores[0]
  );

  const [
    selectedWidth,
    setSelectedWidth,
  ] = useState(
    availableCores[0]?.widths?.[0]
  );

  const [
    selectedSize,
    setSelectedSize,
  ] = useState(
    availableCores[0]?.widths?.[0]
      ?.sizes?.[0]
  );

  useEffect(() => {
    if (!ringCores.length) {
      return;
    }

    const materialStillExists =
      selectedMaterial &&
      ringCores.some(
        (core) =>
          core.material ===
          selectedMaterial
      );

    if (materialStillExists) {
      return;
    }

    const firstMaterial =
      ringCores[0]?.material;

    const firstCore =
      ringCores.find(
        (core) =>
          core.material ===
          firstMaterial
      );

    const firstWidth =
      firstCore?.widths?.[0];

    setSelectedMaterial(
      firstMaterial
    );

    setSelectedCore(
      firstCore
    );

    setSelectedWidth(
      firstWidth
    );

    setSelectedSize(
      firstWidth?.sizes?.[0]
    );
  }, [
    ringCores,
    selectedMaterial,
  ]);

  const collectionInlayStyles = (
    collection.availableInlayStyles ||
    []
  )
    .map((styleEntry) => {
      const databaseStyle =
        styleEntry &&
        typeof styleEntry ===
          "object"
          ? styleEntry
          : null;

      const styleId =
        databaseStyle?.id ||
        styleEntry;

      const legacyStyle =
        inlayStyles.find(
          (item) =>
            item.id === styleId
        );

      const style =
        databaseStyle ||
        legacyStyle;

      if (!style) {
        return null;
      }

      const override =
        collection
          .inlayStyleOverrides?.[
          style.id
        ];

      if (!override) {
        return style;
      }

      return {
        ...style,
        ...override,

        memorialMaterials: {
          ...style.memorialMaterials,
          ...override.memorialMaterials,
        },

        minerals: {
          ...style.minerals,
          ...override.minerals,
        },

        accentMaterials: {
          ...style.accentMaterials,
          ...override.accentMaterials,
        },

        glow: {
          ...style.glow,
          ...override.glow,
        },

        specialRequest: {
          ...style.specialRequest,
          ...override.specialRequest,
        },
      };
    })
    .filter(Boolean);

  const [
    selectedInlayStyle,
    setSelectedInlayStyle,
  ] = useState(
    collectionInlayStyles.find(
      (style) => style.featured
    ) ||
      collectionInlayStyles[0]
  );

  const [
    selectedMaterials,
    setSelectedMaterials,
  ] = useState([]);

  const [
    selectedChannels,
    setSelectedChannels,
  ] = useState({});

  const [
    selectedMinerals,
    setSelectedMinerals,
  ] = useState([]);

  const [
    selectedAccentMaterials,
    setSelectedAccentMaterials,
  ] = useState([]);

  const [
    specialRequest,
    setSpecialRequest,
  ] = useState(false);

  const [
    engravingEnabled,
    setEngravingEnabled,
  ] = useState(false);

  const [
    engravingText,
    setEngravingText,
  ] = useState("");

  const [
    engravingType,
    setEngravingType,
  ] = useState("standard");

  const [
    selectedEngravingFont,
    setSelectedEngravingFont,
  ] = useState({
    id: "arial",
    name: "Arial",
    fontFamily:
      "Arial, sans-serif",
  });

  const [
    selectedGlow,
    setSelectedGlow,
  ] = useState(null);

  const engravingAvailable =
    selectedCore?.allowEngraving ===
      true &&
    availableEngravingOptions.length >
      0;

  const effectiveEngravingEnabled =
    engravingAvailable &&
    engravingEnabled;

  const [
    previewImage,
    setPreviewImage,
  ] = useState(null);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const designId =
      params.get("design");

    if (!designId) {
      return;
    }

    try {
      const savedDesign =
        loadDesign(designId);

      if (!savedDesign) {
        return;
      }

      const savedMaterial =
        savedDesign.material ||
        materials[0];

      const savedCores =
        ringCores.filter(
          (core) =>
            core.material ===
            savedMaterial
        );

      const savedCore =
        savedCores.find(
          (core) =>
            core.id ===
            savedDesign.core
        ) ||
        savedCores[0];

      const savedWidth =
        savedCore?.widths?.find(
          (widthOption) =>
            widthOption.width ===
            savedDesign.width
        ) ||
        savedCore?.widths?.[0];

      const savedSize =
        savedWidth?.sizes?.find(
          (size) =>
            size ===
            savedDesign.size
        ) ||
        savedWidth?.sizes?.[0];

      const savedStyle =
        collectionInlayStyles.find(
          (style) =>
            style.id ===
            savedDesign.design
        ) ||
        collectionInlayStyles.find(
          (style) =>
            style.featured
        ) ||
        collectionInlayStyles[0];

      const savedMinerals = (
  savedDesign.minerals ||
  []
)
  .map((mineralId) =>
    availableMinerals.find(
      (mineral) =>
        mineral.id ===
        mineralId
    )
  )
  .filter(Boolean);

const savedGlow =
  availableGlowPowders.find(
    (glow) =>
      glow.id ===
      savedDesign.glow
  ) || null;

      setSelectedMaterial(
        savedMaterial
      );

      setSelectedCore(
        savedCore
      );

      setSelectedWidth(
        savedWidth
      );

      setSelectedSize(
        savedSize
      );

      setSelectedInlayStyle(
        savedStyle
      );

      setSelectedMaterials(
        savedDesign.memorialMaterials ||
          []
      );

      setSelectedMinerals(
        savedMinerals
      );

      setSelectedAccentMaterials(
        savedDesign.accentMaterials ||
          []
      );

      setSelectedGlow(
        savedGlow
      );

      setEngravingEnabled(
        savedDesign.engravingEnabled ||
          false
      );

      setEngravingText(
        savedDesign.engravingText ||
          ""
      );
    } catch (error) {
      console.error(
        "Could not load saved design:",
        error
      );
    }
  }, []);

  const styleAllowedMemorialMaterialIds =
    Array.isArray(
      selectedInlayStyle
        ?.memorialMaterials
        ?.allowed
    )
      ? selectedInlayStyle.memorialMaterials.allowed.map(
          (value) =>
            String(value)
        )
      : [];

  const styleAllowedMemorialMaterialIdSet =
    new Set(
      styleAllowedMemorialMaterialIds
    );

  /*
   * FINAL CUSTOMER GATE
   *
   * A memorial material reaches the customer
   * only when:
   *
   * 1. It is active in the master catalog.
   * 2. It is assigned to this collection.
   * 3. The selected Inlay Style allows it.
   *
   * Steps 1 and 2 are already represented by
   * availableMemorialMaterials.
   */
  const allowedMemorialMaterials =
    selectedInlayStyle
      ?.memorialMaterials
      ?.enabled
      ? availableMemorialMaterials.filter(
          (material) =>
            styleAllowedMemorialMaterialIdSet.has(
              String(
                material.id
              )
            )
        )
      : [];

  const allowedMemorialMaterialIds =
    allowedMemorialMaterials.map(
      (material) =>
        String(material.id)
    );

  const allowedMemorialMaterialKey =
    allowedMemorialMaterialIds.join(
      "|"
    );

  /*
   * Keep saved/current selections clean if an
   * Admin rule changes while an old design is
   * being loaded.
   */
  useEffect(() => {
    const allowedIdSet =
      new Set(
        allowedMemorialMaterialIds
      );

    setSelectedMaterials(
      (current) => {
        const next =
          selectedInlayStyle
            ?.memorialMaterials
            ?.locked
            ? [
                ...allowedMemorialMaterialIds,
              ]
            : current.filter(
                (id) =>
                  allowedIdSet.has(
                    String(id)
                  )
              );

        const unchanged =
          next.length ===
            current.length &&
          next.every(
            (id, index) =>
              id ===
              current[index]
          );

        return unchanged
          ? current
          : next;
      }
    );

    setSelectedChannels(
      (current) => {
        let changed = false;

        const next =
          Object.fromEntries(
            Object.entries(
              current || {}
            ).map(
              ([
                channelId,
                selection,
              ]) => {
                if (
                  !selection?.memorial ||
                  allowedIdSet.has(
                    String(
                      selection.memorial
                    )
                  )
                ) {
                  return [
                    channelId,
                    selection,
                  ];
                }

                changed = true;

                return [
                  channelId,
                  {
                    ...selection,
                    memorial:
                      null,
                  },
                ];
              }
            )
          );

        return changed
          ? next
          : current;
      }
    );
  }, [
    selectedInlayStyle?.id,
    selectedInlayStyle
      ?.memorialMaterials
      ?.locked,
    allowedMemorialMaterialKey,
  ]);

  const allowedAccentMaterials =
    selectedInlayStyle
      ?.accentMaterials
      ?.enabled
      ? accentMaterials.filter(
          (item) =>
            selectedInlayStyle
              .accentMaterials
              .allowed.includes(
                item.id
              )
        )
      : [];

  const maxMinerals =
    selectedInlayStyle
      ?.minerals?.max || 0;

  const showMinerals =
    selectedInlayStyle
      ?.minerals?.enabled;

  const usesChannelSelections =
    selectedInlayStyle?.channels
      ?.length > 0;

  const effectiveSelectedMaterials =
    usesChannelSelections
      ? Object.values(
          selectedChannels
        )
          .map(
            (channel) =>
              channel?.memorial
          )
          .filter(Boolean)
      : selectedMaterials;

  const effectiveSelectedMinerals =
    usesChannelSelections
      ? Object.values(
          selectedChannels
        )
          .map(
            (channel) =>
              channel?.mineral
          )
          .filter(Boolean)
      : selectedMinerals;

  const nonChannelShippingMemorialIds =
    effectiveSelectedMaterials.length >
    0
      ? effectiveSelectedMaterials
      : selectedInlayStyle
          ?.memorialMaterials
          ?.locked
        ? allowedMemorialMaterials.map(
            (material) =>
              material.id
          )
        : [];

  const shippingReminderSelections =
    usesChannelSelections
      ? selectedChannels
      : Object.fromEntries(
          nonChannelShippingMemorialIds.map(
            (
              memorialId,
              index
            ) => [
              `memorial-${
                index + 1
              }`,

              {
                memorial:
                  memorialId,
              },
            ]
          )
        );

  function chooseMaterial(
    material
  ) {
    const cores =
      ringCores.filter(
        (core) =>
          core.material ===
          material
      );

    const firstCore =
      cores[0];

    const firstWidth =
      firstCore?.widths?.[0];

    setSelectedMaterial(
      material
    );

    setSelectedCore(
      firstCore
    );

    setSelectedWidth(
      firstWidth
    );

    setSelectedSize(
      firstWidth?.sizes?.[0]
    );
  }

  function chooseCore(core) {
    const firstWidth =
      core.widths?.[0];

    setSelectedCore(core);

    setSelectedWidth(
      firstWidth
    );

    setSelectedSize(
      firstWidth?.sizes?.[0]
    );
  }

  function chooseWidth(
    widthOption
  ) {
    setSelectedWidth(
      widthOption
    );

    setSelectedSize(
      widthOption.sizes?.[0]
    );
  }

  function chooseInlayStyle(
    style
  ) {
    setSelectedInlayStyle(
      style
    );

    if (
      style.memorialMaterials
        ?.locked
    ) {
      const styleAllowedIds =
        Array.isArray(
          style.memorialMaterials
            ?.allowed
        )
          ? style.memorialMaterials.allowed
          : [];

      setSelectedMaterials(
        styleAllowedIds.filter(
          (id) =>
            availableMemorialMaterialIdSet.has(
              String(id)
            )
        )
      );
    } else {
      setSelectedMaterials(
        []
      );
    }

    setSelectedMinerals(
      []
    );

    setSelectedAccentMaterials(
      []
    );

    setSelectedGlow(
      null
    );

    setSelectedChannels(
      {}
    );
  }

  function toggleMemorialMaterial(
    id
  ) {
    const max =
      selectedInlayStyle
        ?.memorialMaterials?.max ||
      1;

    setSelectedMaterials(
      (current) => {
        if (
          current.includes(id)
        ) {
          return current.filter(
            (item) =>
              item !== id
          );
        }

        if (
          current.length >= max
        ) {
          return [id];
        }

        return [
          ...current,
          id,
        ];
      }
    );
  }

  function toggleMineral(
    mineral
  ) {
    setSelectedMinerals(
      (current) => {
        if (
          current.some(
            (item) =>
              item.id ===
              mineral.id
          )
        ) {
          return current.filter(
            (item) =>
              item.id !==
              mineral.id
          );
        }

        if (
          current.length >=
          maxMinerals
        ) {
          return current;
        }

        return [
          ...current,
          mineral,
        ];
      }
    );
  }

  function toggleAccentMaterial(
    id
  ) {
    const max =
      selectedInlayStyle
        ?.accentMaterials?.max ||
      0;

    setSelectedAccentMaterials(
      (current) => {
        if (
          current.includes(id)
        ) {
          return current.filter(
            (item) =>
              item !== id
          );
        }

        if (
          current.length >= max
        ) {
          return current;
        }

        return [
          ...current,
          id,
        ];
      }
    );
  }

  function toggleEngraving() {
    if (!engravingAvailable) {
      setEngravingEnabled(
        false
      );

      setEngravingText(
        ""
      );

      return;
    }

    setEngravingEnabled(
      (current) => {
        if (current) {
          setEngravingText(
            ""
          );
        }

        return !current;
      }
    );
  }

  const ringImage =
    getBestCollectionPhoto({
      photos:
        collection.ringPhotos ||
        collection.photos ||
        [],

      selectedMaterial,

      selectedFinish:
        selectedCore?.finish ||
        "",

      selectedCore,

      selectedWidth,

      selectedInlayStyle,

      selectedMinerals:
        effectiveSelectedMinerals,

      selectedMemorialMaterials:
        effectiveSelectedMaterials,

      selectedAccentMaterials,

      selectedGlow,

      fallbackImage:
        collection.heroImage,
    });

  const mainImage =
    previewImage ||
    ringImage;

  useEffect(() => {
    setPreviewImage(null);
  }, [
    selectedMaterial,
    selectedCore,
    selectedWidth,
    selectedInlayStyle,
    selectedMinerals,
    selectedMaterials,
    selectedAccentMaterials,
    selectedGlow,
    selectedChannels,
  ]);

  /*
   * REGULAR CONFIGURED PRICE
   *
   * calculateRingPrice still owns all normal
   * collection pricing. We leave that untouched.
   */
  const { totalPrice } =
    calculateRingPrice({
      collection,
      selectedCore,
      selectedWidth,
      selectedInlayStyle,
      selectedMaterials:
        effectiveSelectedMaterials,
      selectedMinerals:
        effectiveSelectedMinerals,
      selectedAccentMaterials,
      selectedGlow,
      selectedChannels,
      engravingEnabled:
        effectiveEngravingEnabled,
      engravingType,
      specialRequest,
      selectedMaterial,
    });

  /*
   * SITE-WIDE SALE
   *
   * The discount is applied AFTER the full
   * configured jewelry price has been calculated.
   *
   * That means the sale applies to:
   * - Base jewelry price
   * - Core / material adjustments
   * - Width adjustments
   * - Memorial material adjustments
   * - Minerals
   * - Glow
   * - Engraving
   * - Other configured add-ons
   *
   * Shipping is handled later and is not
   * discounted here.
   */
  const sitewideSalePercent =
    normalizeSalePercent(
      collection.siteSettings
        ?.sitewideSalePercent
    );

  const sitewideSaleEnabled =
    Boolean(
      collection.siteSettings
        ?.sitewideSaleEnabled
    ) &&
    sitewideSalePercent > 0;

  const sitewideSaleName =
    collection.siteSettings
      ?.sitewideSaleName ||
    "";

  const customerPrice =
    getDiscountedPrice(
      totalPrice,
      sitewideSaleEnabled,
      sitewideSalePercent
    );

  useEffect(() => {
    if (engravingAvailable) {
      return;
    }

    setEngravingEnabled(
      false
    );

    setEngravingText(
      ""
    );

    setEngravingType(
      "standard"
    );

    setSelectedEngravingFont({
      id: "arial",
      name: "Arial",
      fontFamily:
        "Arial, sans-serif",
    });
  }, [engravingAvailable]);

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",

        gridTemplateColumns:
          isMobileLayout
            ? "minmax(0, 1fr)"
            : "minmax(0, 1fr) 300px",

        gap:
          isMobileLayout
            ? "24px"
            : "18px",

        alignItems: "start",
        minWidth: 0,
      }}
    >
      <section
        style={{
          minWidth: 0,
        }}
      >
        <img
          src={mainImage}
          alt={collection.name}
          draggable={false}
          style={{
            width: "100%",

            maxHeight:
              "560px",

            objectFit:
              "contain",

            transform: `translate(${
              collection.heroImageX ??
              0
            }px, ${
              collection.heroImageY ??
              0
            }px) scale(${
              collection.heroImageScale ??
              1
            })`,

            transformOrigin:
              "center center",

            background:
              "#080808",

            borderRadius:
              "18px",

            display:
              "block",

            userSelect:
              "none",

            pointerEvents:
              "none",
          }}
        />

        <RingInspirationGallery
          photos={
            collection.ringPhotos ||
            []
          }
          selectedMaterial={
            selectedMaterial
          }
          selectedWidth={
            selectedWidth
          }
          onSelectPhoto={
            setPreviewImage
          }
        />

        <h1
          style={{
            fontSize:
              "30px",

            marginBottom:
              "10px",
          }}
        >
          {collection.name}
        </h1>

        <p
          style={{
            fontSize:
              "16px",

            opacity:
              0.85,

            marginBottom:
              "18px",
          }}
        >
          {
            collection.description
          }
        </p>

        <MaterialSelector
          materials={
            materials
          }
          selectedMaterial={
            selectedMaterial
          }
          onSelectMaterial={
            chooseMaterial
          }
        />

        <RingCoreSelector
          cores={
            availableCores
          }
          selectedCore={
            selectedCore
          }
          onSelectCore={
            chooseCore
          }
          heading={
            collection.builder ===
            "keepsake"
              ? "Choose Metal Finish"
              : "Choose Your Band Style"
          }
        />

        <WidthSelector
          widths={
            selectedCore?.widths
          }
          selectedWidth={
            selectedWidth
          }
          onSelectWidth={
            chooseWidth
          }
        />

        <SizeSelector
          sizes={
            selectedWidth?.sizes
          }
          selectedSize={
            selectedSize
          }
          onSelectSize={
            setSelectedSize
          }
          heading={
            collection.builder ===
            "keepsake"
              ? "Choose Size"
              : "Choose Ring Size"
          }
        />

        {collection.slug ===
          "cornerstone" && (
          <section
            style={{
              marginTop:
                "24px",

              marginBottom:
                "24px",
            }}
          >
            <h2
              style={{
                marginBottom:
                  "14px",
              }}
            >
              Cornerstone Design Guide
            </h2>

            <p
              style={{
                marginBottom:
                  "16px",

                opacity:
                  0.75,

                lineHeight:
                  1.5,
              }}
            >
              Compare all three Cornerstone design options before making
              your selection below.
            </p>

            <img
              src="/design-examples/cornerstone-design-guide.png"
              alt="Cornerstone Collection design guide showing Signature Cornerstone, Memorial Foundation, and Natural Foundation"
              style={{
                width:
                  "100%",

                display:
                  "block",

                borderRadius:
                  "14px",

                border:
                  "1px solid rgba(212,175,55,.35)",
              }}
            />
          </section>
        )}

        {collection.builder !==
          "keepsake" && (
          <RingDesignSelector
            styles={
              collectionInlayStyles
            }
            selectedStyle={
              selectedInlayStyle
            }
            onSelectStyle={
              chooseInlayStyle
            }
          />
        )}

        {usesChannelSelections && (
          <MultiChannelSelector
            channels={
              selectedInlayStyle.channels
            }
            memorialMaterials={
              allowedMemorialMaterials
            }
            minerals={
              availableMinerals
            }
            glowPowders={
              availableGlowPowders
            }
            selectedChannels={
              selectedChannels
            }
            groupLabel={
              collection.builder ===
              "focus"
                ? "Inlay"
                : collection.id ===
                    "quad"
                  ? "Section"
                  : "Channel"
            }
            onChangeChannel={(
              channelId,
              selection
            ) =>
              setSelectedChannels(
                (current) => ({
                  ...current,

                  [channelId]:
                    selection,
                })
              )
            }
          />
        )}

        <ShippingReminder
          selectedChannels={
            shippingReminderSelections
          }
          label={
            collection.id ===
            "quad"
              ? "Section"
              : "Channel"
          }
          siteSettings={
            collection.siteSettings
          }
        />

        {(collection.birthstones ||
          []).length > 0 && (
          <section
            style={{
              marginBottom:
                "30px",
            }}
          >
            <h2>
              Choose Birth Month
            </h2>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",

                gap:
                  "12px",
              }}
            >
              {collection.birthstones.map(
                (
                  birthstone
                ) => (
                  <OptionCard
                    key={
                      birthstone.id
                    }
                    title={
                      birthstone.month
                    }
                    subtitle={
                      birthstone.stone
                    }
                    description={
                      birthstone.priceAdjustment >
                      0
                        ? `+$${birthstone.priceAdjustment}`
                        : "Included"
                    }
                    image={
                      birthstone.image ||
                      birthstone.imageUrl
                    }
                    active={
                      selectedBirthstone?.id ===
                      birthstone.id
                    }
                    onClick={() =>
                      setSelectedBirthstone(
                        birthstone
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {collection.builder ===
          "keepsake" && (
          <section
            style={{
              marginBottom:
                "24px",
            }}
          >
            <h2
              style={{
                marginBottom:
                  "14px",
              }}
            >
              Birthstone Color Guide
            </h2>

            <p
              style={{
                marginBottom:
                  "16px",

                opacity:
                  0.75,

                lineHeight:
                  1.5,
              }}
            >
              Use the guide below to compare the available birthstone
              colors before choosing your birth month.
            </p>

            <img
              src="/design-examples/birthstone-color-guide.png"
              alt="Birthstone color guide showing January through December birthstone colors"
              style={{
                width:
                  "100%",

                display:
                  "block",

                borderRadius:
                  "14px",

                border:
                  "1px solid rgba(212,175,55,.35)",
              }}
            />
          </section>
        )}

        {collection.builder ===
          "keepsake" && (
          <section
            style={{
              marginBottom:
                "30px",
            }}
          >
            <h2>
              Choose Birth Month
            </h2>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",

                gap:
                  "12px",
              }}
            >
              {birthstones.map(
                (
                  birthstone
                ) => (
                  <OptionCard
                    key={
                      birthstone.id
                    }
                    title={
                      birthstone.month
                    }
                    subtitle={
                      birthstone.stone
                    }
                    description="Included"
                    active={
                      selectedBirthstone?.id ===
                      birthstone.id
                    }
                    onClick={() =>
                      setSelectedBirthstone(
                        birthstone
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {collection.builder !==
          "keepsake" &&
          !usesChannelSelections &&
          selectedInlayStyle
            ?.memorialMaterials
            ?.enabled && (
            <section
              style={{
                marginBottom:
                  "30px",
              }}
            >
              <h2>
                {selectedInlayStyle
                  .memorialMaterials
                  .locked
                  ? "Memorial Material"
                  : "Choose Memorial Material"}
              </h2>

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",

                  gap:
                    "12px",
                }}
              >
                {allowedMemorialMaterials.map(
                  (
                    material
                  ) => (
                    <OptionCard
                      key={
                        material.id
                      }
                      title={
                        material.icon
                          ? `${material.icon} ${material.name}`
                          : material.name
                      }
                      description={
                        material.description
                      }
                      active={
                        selectedMaterials.includes(
                          material.id
                        )
                      }
                      onClick={() =>
                        !selectedInlayStyle
                          .memorialMaterials
                          .locked &&
                        toggleMemorialMaterial(
                          material.id
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {collection.builder !==
          "keepsake" &&
          !usesChannelSelections &&
          showMinerals && (
            <section
              style={{
                marginBottom:
                  "30px",
              }}
            >
              <h2>
                Choose Minerals{" "}
                <span
                  style={{
                    fontSize:
                      "14px",

                    opacity:
                      0.7,
                  }}
                >
                  up to{" "}
                  {maxMinerals}
                </span>
              </h2>

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",

                  gap:
                    "12px",
                }}
              >
                {availableMinerals.map(
                  (
                    mineral
                  ) => (
                    <OptionCard
                      key={
                        mineral.id
                      }
                      title={
                        mineral.name
                      }
                      description={
                        selectedMinerals.some(
                          (item) =>
                            item.id ===
                            mineral.id
                        )
                          ? "Selected"
                          : mineral.price >
                              0
                            ? `+$${mineral.price}`
                            : "Included"
                      }
                      image={
                        mineral.image
                      }
                      active={
                        selectedMinerals.some(
                          (item) =>
                            item.id ===
                            mineral.id
                        )
                      }
                      onClick={() =>
                        toggleMineral(
                          mineral
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {selectedInlayStyle
          ?.accentMaterials
          ?.enabled && (
          <AccentMaterialSelector
            accentMaterials={
              allowedAccentMaterials
            }
            selectedAccentMaterials={
              selectedAccentMaterials
            }
            onToggleAccentMaterial={
              toggleAccentMaterial
            }
            max={
              selectedInlayStyle
                .accentMaterials.max
            }
          />
        )}

        {collection.builder !==
          "keepsake" &&
          selectedInlayStyle
            ?.glow?.enabled && (
            <GlowSelector
              glowPowders={
                availableGlowPowders
              }
              selectedGlow={
                selectedGlow
              }
              onSelectGlow={
                setSelectedGlow
              }
            />
          )}

        {collection.builder !==
          "keepsake" &&
          engravingAvailable && (
            <EngravingSelector
              engravingOptions={
                availableEngravingOptions
              }
              engravingEnabled={
                engravingEnabled
              }
              engravingType={
                engravingType
              }
              engravingText={
                engravingText
              }
              selectedEngravingFont={
                selectedEngravingFont
              }
              onToggleEngraving={
                toggleEngraving
              }
              onChangeEngravingType={(
                type
              ) => {
                setEngravingType(
                  type
                );

                if (
                  type ===
                  "customSignature"
                ) {
                  setEngravingText(
                    ""
                  );
                }
              }}
              onChangeEngraving={
                setEngravingText
              }
              onChangeEngravingFont={
                setSelectedEngravingFont
              }
            />
          )}

        {(collection.builder ===
          "keepsake" ||
          selectedInlayStyle
            ?.specialRequest
            ?.enabled) && (
          <section
            style={{
              marginTop:
                "30px",
            }}
          >
            <h2>
              ⭐ Special Request
            </h2>

            <OptionCard
              title="⭐ Custom Request"
              description="Looking for something unique? We can often accommodate custom requests such as glow powder. Please message us before purchasing so we can discuss your idea and ensure it's possible."
              active={
                specialRequest
              }
              onClick={() =>
                setSpecialRequest(
                  (current) =>
                    !current
                )
              }
            />
          </section>
        )}
      </section>

      <aside
        style={{
          position:
            isMobileLayout
              ? "static"
              : "sticky",

          top:
            isMobileLayout
              ? "auto"
              : "96px",

          alignSelf:
            "start",

          width:
            "100%",

          minWidth:
            0,

          maxHeight:
            isMobileLayout
              ? "none"
              : "calc(100vh - 112px)",

          overflowY:
            isMobileLayout
              ? "visible"
              : "auto",

          paddingBottom:
            "14px",
        }}
      >
        <SummaryCard
          collection={
            collection
          }
          mainImage={
            mainImage
          }
          selectedMaterial={
            selectedMaterial
          }
          selectedCore={
            selectedCore
          }
          selectedWidth={
            selectedWidth
          }
          selectedSize={
            selectedSize
          }
          selectedInlayStyle={
            selectedInlayStyle
          }
          selectedMaterials={
            effectiveSelectedMaterials
          }
          selectedMinerals={
            effectiveSelectedMinerals
          }
          selectedAccentMaterials={
            selectedAccentMaterials
          }
          selectedGlow={
            selectedGlow
          }
          selectedEngravingFont={
            selectedEngravingFont
          }
          engravingEnabled={
            effectiveEngravingEnabled
          }
          engravingType={
            engravingType
          }
          engravingText={
            engravingText
          }
          specialRequest={
            specialRequest
          }

          /*
           * Customer-facing price after any
           * active site-wide sale.
           */
          totalPrice={
            customerPrice
          }

          /*
           * Preserve the full normal price so
           * Cart and Stripe can always calculate
           * the sale from the authoritative
           * regular amount exactly once.
           */
          regularPrice={
            totalPrice
          }

          sitewideSaleEnabled={
            sitewideSaleEnabled
          }
          sitewideSalePercent={
            sitewideSalePercent
          }
          sitewideSaleName={
            sitewideSaleName
          }

          selectedChannels={
            selectedChannels
          }
          selectedKeepsakeMaterial={
            selectedKeepsakeMaterial
          }
          selectedBirthstone={
            selectedBirthstone
          }
        />
      </aside>
    </div>
  );
}

export default function CollectionConfigurator({
  collection,
}) {
  if (
    collection.builder ===
      "evermore-ring" ||
    collection.builder ===
      "evermore-bracelet" ||
    collection.builder ===
      "keepsake-branch" ||
    collection.builder ===
      "keepsake-branch-ring"
  ) {
    return (
      <NecklaceConfigurator
        collection={
          collection
        }
      />
    );
  }

  return (
    <RingCollectionConfigurator
      collection={
        collection
      }
    />
  );
}