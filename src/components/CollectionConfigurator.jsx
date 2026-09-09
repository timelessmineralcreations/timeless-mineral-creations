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
import getBestRingPhoto from "@/utils/getBestRingPhoto";
import calculateRingPrice from "@/utils/calculateRingPrice";
import { loadDesign } from "@/utils/savedDesigns";

import { glowPowders } from "@/data/glowPowders";
import { memorialMaterials } from "@/data/memorialMaterials";
import { minerals } from "@/data/minerals";
import { inlayStyles } from "@/data/inlayStyles";
import { accentMaterials } from "@/data/accentMaterials";
import { birthstones } from "@/data/birthstones";

function RingCollectionConfigurator({ collection }) {
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateMobileLayout = () => {
      setIsMobileLayout(mediaQuery.matches);
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
  const materials = [...new Set(ringCores.map((core) => core.material))];

  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);

const [selectedKeepsakeMaterial, setSelectedKeepsakeMaterial] =
  useState("breastMilk");
const [selectedBirthstone, setSelectedBirthstone] =
  useState(null); 
  
  const availableCores = ringCores.filter(
    (core) => core.material === selectedMaterial
  );

  const [selectedCore, setSelectedCore] = useState(availableCores[0]);

  const [selectedWidth, setSelectedWidth] = useState(
    availableCores[0]?.widths?.[0]
  );

  const [selectedSize, setSelectedSize] = useState(
    availableCores[0]?.widths?.[0]?.sizes?.[0]
  );

  const collectionInlayStyles = (collection.availableInlayStyles || [])
    .map((styleId) => {
      const style = inlayStyles.find((item) => item.id === styleId);

      if (!style) return null;

      const override = collection.inlayStyleOverrides?.[style.id];

      if (!override) return style;

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

        engraving: {
          ...style.engraving,
          ...override.engraving,
        },

        specialRequest: {
          ...style.specialRequest,
          ...override.specialRequest,
        },
      };
    })
    .filter(Boolean);

  const [selectedInlayStyle, setSelectedInlayStyle] = useState(
    collectionInlayStyles.find((style) => style.featured) ||
      collectionInlayStyles[0]
  );

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState({});
  const [selectedMinerals, setSelectedMinerals] = useState([]);
  const [selectedAccentMaterials, setSelectedAccentMaterials] = useState([]);
  const [specialRequest, setSpecialRequest] = useState(false);
  const [engravingEnabled, setEngravingEnabled] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [engravingType, setEngravingType] = useState("standard");

  const [selectedEngravingFont, setSelectedEngravingFont] = useState({
    id: "arial",
    name: "Arial",
    fontFamily: "Arial, sans-serif",
  });

  const [selectedGlow, setSelectedGlow] = useState(null);
  const [previewImage, setPreviewImage] = useState(collection.heroImage);

const firstLoad = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const designId = params.get("design");

    if (!designId) return;

    try {
      const savedDesign = loadDesign(designId);

      if (!savedDesign) return;

      const savedMaterial = savedDesign.material || materials[0];

      const savedCores = ringCores.filter(
        (core) => core.material === savedMaterial
      );

      const savedCore =
        savedCores.find((core) => core.id === savedDesign.core) ||
        savedCores[0];

      const savedWidth =
        savedCore?.widths?.find(
          (widthOption) => widthOption.width === savedDesign.width
        ) || savedCore?.widths?.[0];

      const savedSize =
        savedWidth?.sizes?.find((size) => size === savedDesign.size) ||
        savedWidth?.sizes?.[0];

      const savedStyle =
        collectionInlayStyles.find(
          (style) => style.id === savedDesign.design
        ) ||
        collectionInlayStyles.find((style) => style.featured) ||
        collectionInlayStyles[0];

      const savedMinerals = (savedDesign.minerals || [])
        .map((mineralId) =>
          minerals.find((mineral) => mineral.id === mineralId)
        )
        .filter(Boolean);

      const savedGlow =
        glowPowders.find((glow) => glow.id === savedDesign.glow) || null;

      setSelectedMaterial(savedMaterial);
      setSelectedCore(savedCore);
      setSelectedWidth(savedWidth);
      setSelectedSize(savedSize);
      setSelectedInlayStyle(savedStyle);
      setSelectedMaterials(savedDesign.memorialMaterials || []);
      setSelectedMinerals(savedMinerals);
      setSelectedAccentMaterials(savedDesign.accentMaterials || []);
      setSelectedGlow(savedGlow);
      setEngravingEnabled(savedDesign.engravingEnabled || false);
      setEngravingText(savedDesign.engravingText || "");
    } catch (error) {
      console.error("Could not load saved design:", error);
    }
  }, []);

  const allowedMemorialMaterials =
    selectedInlayStyle?.memorialMaterials?.enabled
      ? memorialMaterials.filter((material) =>
          selectedInlayStyle.memorialMaterials.allowed.includes(material.id)
        )
      : [];

  const allowedAccentMaterials =
    selectedInlayStyle?.accentMaterials?.enabled
      ? accentMaterials.filter((item) =>
          selectedInlayStyle.accentMaterials.allowed.includes(item.id)
        )
      : [];

  const maxMinerals = selectedInlayStyle?.minerals?.max || 0;
  const showMinerals = selectedInlayStyle?.minerals?.enabled;

 const usesChannelSelections =
(
  collection.builder === "dual-channel" ||
  collection.builder === "multi-channel" ||
  collection.builder === "focus"
) &&
selectedInlayStyle?.channels?.length > 0;

  const effectiveSelectedMaterials = usesChannelSelections
    ? Object.values(selectedChannels)
        .map((channel) => channel?.memorial)
        .filter(Boolean)
    : selectedMaterials;

  const effectiveSelectedMinerals = usesChannelSelections
    ? Object.values(selectedChannels)
        .map((channel) => channel?.mineral)
        .filter(Boolean)
    : selectedMinerals;

  function chooseMaterial(material) {
    const cores = ringCores.filter((core) => core.material === material);
    const firstCore = cores[0];
    const firstWidth = firstCore?.widths?.[0];

    setSelectedMaterial(material);
    setSelectedCore(firstCore);
    setSelectedWidth(firstWidth);
    setSelectedSize(firstWidth?.sizes?.[0]);
  }

  function chooseCore(core) {
    const firstWidth = core.widths?.[0];

    setSelectedCore(core);
    setSelectedWidth(firstWidth);
    setSelectedSize(firstWidth?.sizes?.[0]);
  }

  function chooseWidth(widthOption) {
    setSelectedWidth(widthOption);
    setSelectedSize(widthOption.sizes?.[0]);
  }

  function chooseInlayStyle(style) {
    setSelectedInlayStyle(style);

    if (style.memorialMaterials?.locked) {
      setSelectedMaterials(style.memorialMaterials.allowed);
    } else {
      setSelectedMaterials([]);
    }

    setSelectedMinerals([]);
    setSelectedAccentMaterials([]);
    setSelectedGlow(null);
    setSelectedChannels({});

    if (!style.engraving?.enabled) {
      setEngravingEnabled(false);
      setEngravingText("");
    }
  }

  function toggleMemorialMaterial(id) {
    const max = selectedInlayStyle?.memorialMaterials?.max || 1;

    setSelectedMaterials((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= max) {
        return [id];
      }

      return [...current, id];
    });
  }

  function toggleMineral(mineral) {
    setSelectedMinerals((current) => {
      if (current.some((item) => item.id === mineral.id)) {
        return current.filter((item) => item.id !== mineral.id);
      }

      if (current.length >= maxMinerals) {
        return current;
      }

      return [...current, mineral];
    });
  }

  function toggleAccentMaterial(id) {
    const max = selectedInlayStyle?.accentMaterials?.max || 0;

    setSelectedAccentMaterials((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= max) {
        return current;
      }

      return [...current, id];
    });
  }

  function toggleEngraving() {
    setEngravingEnabled((current) => {
      if (current) {
        setEngravingText("");
      }

      return !current;
    });
  }

  const ringImage = getBestRingPhoto({
    photos: collection.ringPhotos || [],
    selectedMaterial,
    selectedCore,
    selectedWidth,
    selectedMinerals: effectiveSelectedMinerals,
    selectedMaterials: effectiveSelectedMaterials,
    fallbackImage: collection.heroImage,
  });

  const mainImage = previewImage || ringImage;

 useEffect(() => {
  if (firstLoad.current) {
    firstLoad.current = false;
    return;
  }

  setPreviewImage(null);
}, [
  selectedMaterial,
  selectedCore,
  selectedWidth,
  selectedMinerals,
  selectedMaterials,
  selectedChannels,
]);

   const { totalPrice } = calculateRingPrice({
  collection,
  selectedCore,
  selectedWidth,
  selectedInlayStyle,
  selectedMaterials: effectiveSelectedMaterials,
  selectedMinerals: effectiveSelectedMinerals,
  selectedAccentMaterials,
  selectedGlow,
  selectedChannels,
  engravingEnabled,
  engravingType,
  specialRequest,
  selectedMaterial,
});
  useEffect(() => {
  const isCeramic = selectedMaterial
    ?.toLowerCase()
    .includes("ceramic");

  if (isCeramic) {
    setEngravingEnabled(false);
    setEngravingText("");
  }
}, [selectedMaterial]);

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
        gridTemplateColumns: isMobileLayout
            ? "minmax(0, 1fr)"
            : "minmax(0, 1fr) 300px",
          gap: isMobileLayout ? "24px" : "18px",
          alignItems: "start",
          minWidth: 0,
      }}
    >
      <section>
        <img
  src={mainImage}
  alt={collection.name}
  style={{
    width: "100%",
    maxHeight: "560px",
    objectFit: "contain",
    background: "#080808",
    borderRadius: "18px",
    display: "block",
  }}
/>

        <RingInspirationGallery
          photos={collection.ringPhotos || []}
          selectedMaterial={selectedMaterial}
          selectedWidth={selectedWidth}
          onSelectPhoto={setPreviewImage}
        />

        <h1
          style={{
            fontSize: "30px",
            marginBottom: "10px",
          }}
        >
          {collection.name}
        </h1>

        <p
          style={{
            fontSize: "16px",
            opacity: 0.85,
            marginBottom: "18px",
          }}
        >
          {collection.description}
        </p>

        <MaterialSelector
          materials={materials}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={chooseMaterial}
        />

        <RingCoreSelector
  cores={availableCores}
  selectedCore={selectedCore}
  onSelectCore={chooseCore}
  heading={
    collection.builder === "keepsake"
      ? "Choose Metal Finish"
      : "Choose Your Band Style"
  }
/>

        <WidthSelector
          widths={selectedCore?.widths}
          selectedWidth={selectedWidth}
          onSelectWidth={chooseWidth}
        />

        <SizeSelector
  sizes={selectedWidth?.sizes}
  selectedSize={selectedSize}
  onSelectSize={setSelectedSize}
  heading={
    collection.builder === "keepsake"
      ? "Choose Size"
      : "Choose Ring Size"
  }
/>

{collection.slug === "cornerstone" && (
  <section
    style={{
      marginTop: "24px",
      marginBottom: "24px",
    }}
  >
    <h2 style={{ marginBottom: "14px" }}>
      Cornerstone Design Guide
    </h2>

    <p
      style={{
        marginBottom: "16px",
        opacity: 0.75,
        lineHeight: 1.5,
      }}
    >
      Compare all three Cornerstone design options before making
      your selection below.
    </p>

    <img
      src="/design-examples/cornerstone-design-guide.png"
      alt="Cornerstone Collection design guide showing Signature Cornerstone, Memorial Foundation, and Natural Foundation"
      style={{
        width: "100%",
        display: "block",
        borderRadius: "14px",
        border: "1px solid rgba(212,175,55,.35)",
      }}
    />
  </section>
)}

{collection.builder !== "keepsake" && (
  <RingDesignSelector
    styles={collectionInlayStyles}
    selectedStyle={selectedInlayStyle}
    onSelectStyle={chooseInlayStyle}
  />
)}

        {usesChannelSelections && (
  <>
    <MultiChannelSelector
  channels={selectedInlayStyle.channels}
  memorialMaterials={memorialMaterials}
  minerals={minerals}
  glowPowders={glowPowders}
  selectedChannels={selectedChannels}
  groupLabel={
    collection.builder === "focus"
      ? "Inlay"
      : collection.id === "quad"
      ? "Section"
      : "Channel"
  }
  onChangeChannel={(channelId, selection) =>
    setSelectedChannels((current) => ({
      ...current,
      [channelId]: selection,
    }))
  }
/>

    <ShippingReminder
  selectedChannels={selectedChannels}
  label={collection.id === "quad" ? "Section" : "Channel"}
/>
  </>
)}
{collection.builder === "keepsake" && (
  <section style={{ marginBottom: "30px" }}>
    <h2>Choose Keepsake Material</h2>

    <p
      style={{
        opacity: 0.75,
        marginBottom: "18px",
      }}
    >
      Select the keepsake material you would like preserved in
      your ring.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      <OptionCard
        title="Breast Milk"
        subtitle="Pearl White"
        description="Professionally preserved into a timeless pearl-white keepsake."
        active={selectedKeepsakeMaterial === "breastMilk"}
onClick={() => setSelectedKeepsakeMaterial("breastMilk")}
      />

      <OptionCard
        title="Cremation Ashes"
        subtitle="Natural Appearance"
        description="Preserved using your loved one's natural color, making every ring beautifully unique."
        active={selectedKeepsakeMaterial === "cremation"}
onClick={() => setSelectedKeepsakeMaterial("cremation")}
      />
    </div>
  </section>
)}
{collection.builder === "keepsake" && (
  <section
    style={{
      marginBottom: "24px",
    }}
  >
    <h2 style={{ marginBottom: "14px" }}>
      Birthstone Color Guide
    </h2>

    <p
      style={{
        marginBottom: "16px",
        opacity: 0.75,
        lineHeight: 1.5,
      }}
    >
      Use the guide below to compare the available birthstone
      colors before choosing your birth month.
    </p>

    <img
      src="/design-examples/birthstone-color-guide.png"
      alt="Birthstone color guide showing January through December birthstone colors"
      style={{
        width: "100%",
        display: "block",
        borderRadius: "14px",
        border: "1px solid rgba(212,175,55,.35)",
      }}
    />
  </section>
)}
{collection.builder === "keepsake" && (
  <section style={{ marginBottom: "30px" }}>
    <h2>Choose Birth Month</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(145px, 1fr))",
        gap: "12px",
      }}
    >
      {birthstones.map((birthstone) => (
        <OptionCard
          key={birthstone.id}
          title={birthstone.month}
          subtitle={birthstone.stone}
          description="Included"
          active={selectedBirthstone?.id === birthstone.id}
          onClick={() => setSelectedBirthstone(birthstone)}
        />
      ))}
    </div>
  </section>
)}
        {collection.builder !== "keepsake" &&
  !usesChannelSelections &&
  selectedInlayStyle?.memorialMaterials?.enabled && (
            <section style={{ marginBottom: "30px" }}>
              <h2>
                {selectedInlayStyle.memorialMaterials.locked
                  ? "Memorial Material"
                  : "Choose Memorial Material"}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",
                  gap: "12px",
                }}
              >
                {allowedMemorialMaterials.map((material) => (
                  <OptionCard
                    key={material.id}
                    title={`${material.icon} ${material.name}`}
                    description={material.description}
                    active={selectedMaterials.includes(material.id)}
                    onClick={() =>
                      !selectedInlayStyle.memorialMaterials.locked &&
                      toggleMemorialMaterial(material.id)
                    }
                  />
                ))}
              </div>
            </section>
          )}

        {collection.builder !== "keepsake" &&
  !usesChannelSelections &&
  showMinerals && (
          <section style={{ marginBottom: "30px" }}>
            <h2>
              Choose Minerals{" "}
              <span
                style={{
                  fontSize: "14px",
                  opacity: 0.7,
                }}
              >
                up to {maxMinerals}
              </span>
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",
                gap: "12px",
              }}
            >
              {minerals.map((mineral) => (
                <OptionCard
                  key={mineral.id}
                  title={mineral.name}
                  description={
                    selectedMinerals.some(
                      (item) => item.id === mineral.id
                    )
                      ? "Selected"
                      : mineral.price > 0
                      ? `+$${mineral.price}`
                      : "Included"
                  }
                  image={mineral.image}
                  active={selectedMinerals.some(
                    (item) => item.id === mineral.id
                  )}
                  onClick={() => toggleMineral(mineral)}
                />
              ))}
            </div>
          </section>
        )}

        {selectedInlayStyle?.accentMaterials?.enabled && (
          <AccentMaterialSelector
            accentMaterials={allowedAccentMaterials}
            selectedAccentMaterials={selectedAccentMaterials}
            onToggleAccentMaterial={toggleAccentMaterial}
            max={selectedInlayStyle.accentMaterials.max}
          />
        )}

        {collection.builder !== "keepsake" &&
  selectedInlayStyle?.glow?.enabled && (
          <GlowSelector
            glowPowders={glowPowders}
            selectedGlow={selectedGlow}
            onSelectGlow={setSelectedGlow}
          />
        )}

       {collection.builder !== "keepsake" &&
  selectedInlayStyle?.engraving?.enabled &&
  !selectedMaterial?.toLowerCase().includes("ceramic") && (
    <EngravingSelector
      engravingEnabled={engravingEnabled}
      engravingType={engravingType}
      engravingText={engravingText}
      selectedEngravingFont={selectedEngravingFont}
      onToggleEngraving={toggleEngraving}
      onChangeEngravingType={(type) => {
        setEngravingType(type);

        if (type === "customSignature") {
          setEngravingText("");
        }
      }}
      onChangeEngraving={setEngravingText}
      onChangeEngravingFont={setSelectedEngravingFont}
    />
  )}

        {(collection.builder === "keepsake" ||
  selectedInlayStyle?.specialRequest?.enabled) && (
          <section style={{ marginTop: "30px" }}>
            <h2>⭐ Special Request</h2>

            <OptionCard
  title="⭐ Custom Request"
  description="Looking for something unique? We can often accommodate custom requests such as glow powder. Please message us before purchasing so we can discuss your idea and ensure it's possible."
  active={specialRequest}
  onClick={() => setSpecialRequest((current) => !current)}
/>
          </section>
        )}
      </section>

      <aside
        style={{
          position: isMobileLayout
              ? "static"
              : "sticky",
            top: isMobileLayout
              ? "auto"
              : "96px",
            alignSelf: "start",
            width: "100%",
            minWidth: 0,
            maxHeight: isMobileLayout
              ? "none"
              : "calc(100vh - 112px)",
            overflowY: isMobileLayout
              ? "visible"
              : "auto",
            paddingBottom: "14px",
        }}
      >
        <SummaryCard
  collection={collection}
  mainImage={mainImage}
  selectedMaterial={selectedMaterial}
  selectedCore={selectedCore}
  selectedWidth={selectedWidth}
  selectedSize={selectedSize}
  selectedInlayStyle={selectedInlayStyle}
  selectedMaterials={effectiveSelectedMaterials}
  selectedMinerals={effectiveSelectedMinerals}
  selectedAccentMaterials={selectedAccentMaterials}
  selectedGlow={selectedGlow}
  selectedEngravingFont={selectedEngravingFont}
  engravingEnabled={engravingEnabled}
  engravingType={engravingType}
  engravingText={engravingText}
  specialRequest={specialRequest}
  totalPrice={totalPrice}
  selectedChannels={selectedChannels}
  selectedKeepsakeMaterial={selectedKeepsakeMaterial}
  selectedBirthstone={selectedBirthstone}
/>
      </aside>
    </div>
  );
}

export default function CollectionConfigurator({ collection }) {
  if (
    collection.builder === "evermore-ring" ||
    collection.builder === "evermore-bracelet" ||
    collection.builder === "keepsake-branch" ||
    collection.builder === "keepsake-branch-ring"
  ) {
    return (
  <BreastMilkJewelryConfigurator
    collection={collection}
  />
);
  }

  return <RingCollectionConfigurator collection={collection} />;
}