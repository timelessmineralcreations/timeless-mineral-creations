"use client";

import { useEffect, useMemo, useState } from "react";
import { minerals } from "@/data/minerals";
import GlowSelector from "@/components/builder/GlowSelector";
import { glowPowders } from "@/data/glowPowders";
import { useCart } from "@/context/CartContext";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPrice(price = 0) {
  return price > 0 ? `+$${price}` : "Included";
}

function getFinishOptions(collection) {
  const cores =
    collection.pendantCores ||
    collection.ringCores ||
    [];
  const firstCore = cores[0];

  if (Array.isArray(firstCore?.finishes)) {
    return firstCore.finishes.map((finish, index) => {
      if (typeof finish === "string") {
        return {
          id: slugify(finish),
          name: finish,
          price: 0,
        };
      }

      return {
        id:
          finish.id ||
          slugify(finish.name || finish.finish) ||
          `finish-${index}`,
        name:
          finish.name ||
          finish.finish ||
          `Finish ${index + 1}`,
        price: finish.price || 0,
      };
    });
  }

  if (cores.length > 1) {
    return cores.map((core, index) => ({
      id:
        core.id ||
        slugify(core.finish || core.name) ||
        `finish-${index}`,
      name:
        core.finish ||
        core.name ||
        `Finish ${index + 1}`,
      price: core.price || 0,
    }));
  }

  return [
    {
      id: "sterling-silver",
      name: "Sterling Silver",
      price: 0,
    },
    {
      id: "yellow-gold-plated",
      name: "Yellow Gold Plated Sterling Silver",
      price: 0,
    },
    {
      id: "rose-gold-plated",
      name: "Rose Gold Plated Sterling Silver",
      price: 0,
    },
  ];
}

function getRingSizes(collection) {
  const firstCore = collection.ringCores?.[0];

  if (Array.isArray(firstCore?.sizes)) {
    return firstCore.sizes.map(String);
  }

  if (Array.isArray(firstCore?.ringSizes)) {
    return firstCore.ringSizes.map(String);
  }

  return Array.from({ length: 17 }, (_, index) =>
    (4 + index * 0.5).toString()
  );
}

function getBezelOptions(collection) {
  const firstCore =
  collection.pendantCores?.[0] ||
  collection.ringCores?.[0];

  const coreBezelSizes =
    firstCore?.bezelSizes ||
    firstCore?.bezels ||
    firstCore?.settings ||
    [];

  if (Array.isArray(coreBezelSizes) && coreBezelSizes.length > 0) {
    return coreBezelSizes.map((bezel, index) => {
      if (typeof bezel === "string") {
        return {
          id: slugify(bezel),
          name: bezel,
          price:
            collection.pricing?.bezelSizes?.[bezel] ||
            collection.pricing?.bezelSizes?.[slugify(bezel)] ||
            0,
        };
      }

      return {
        id:
          bezel.id ||
          slugify(bezel.name || bezel.size) ||
          `bezel-${index}`,
        name:
          bezel.name ||
          bezel.size ||
          `Bezel ${index + 1}`,
        price:
          bezel.price ||
          collection.pricing?.bezelSizes?.[bezel.id] ||
          collection.pricing?.bezelSizes?.[
            slugify(bezel.name || bezel.size)
          ] ||
          0,
      };
    });
  }

  return [
    { id: "7x5", name: "7 × 5 mm", price: 0 },
    { id: "8x6", name: "8 × 6 mm", price: 0 },
    { id: "9x7", name: "9 × 7 mm", price: 0 },
    { id: "10x8", name: "10 × 8 mm", price: 10 },
    { id: "11x9", name: "11 × 9 mm", price: 10 },
  ];
}

const keepsakeOptions = [
  { id: "ashes", name: "Cremation Ashes", price: 0 },
  { id: "breastMilk", name: "Breast Milk", price: 0 },
  { id: "sand", name: "Sand", price: 10 },
  { id: "soil", name: "Soil", price: 10 },
  { id: "mineralBase", name: "Mineral Base", price: 0 },
];

const hairOptions = [
  {
    id: "no-hair",
    name: "No Hair",
    price: 0,
    description: "No hair will be included in your keepsake.",
  },
  {
    id: "crescent-hair",
    name: "Crescent Hair (Timeless Signature Design)",
    price: 15,
    description:
      "Hair is carefully arranged in a graceful crescent moon shape along one side of the keepsake, creating our Timeless Signature Design.",
  },
  {
    id: "scattered-hair",
    name: "Scattered Hair",
    price: 15,
    description:
      "Fine strands of hair are artistically distributed throughout the keepsake, creating a natural and organic appearance.",
  },
];

const decorativeAccentOptions = [
  { id: "none", name: "No Decorative Accent", price: 0 },
  { id: "silver-foil", name: "Silver Foil", price: 10 },
  { id: "gold-foil", name: "Gold Foil", price: 10 },
  { id: "opal-chameleon", name: "Opal Chameleon", price: 10 },
  { id: "pink-chameleon", name: "Pink Chameleon", price: 10 },
];

const accentStyleOptions = [
  {
    id: "speckled",
    name: "Speckled",
    description:
      "Decorative material is naturally scattered throughout the keepsake.",
  },
  {
    id: "crescent-moon",
    name: "Crescent Moon",
    description:
      "Decorative material is carefully arranged in a graceful crescent moon shape.",
  },
];

export default function RemiConfigurator({ collection }) {
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
  const { addItem } = useCart();
  const isNecklace = collection.productType === "necklace";
  const productLabel = isNecklace ? "Necklace" : "Ring";
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRingSize, setSelectedRingSize] = useState("");
  const [selectedKeepsake, setSelectedKeepsake] = useState("ashes");
  const [selectedHair, setSelectedHair] = useState("no-hair");
  const [selectedDecorativeAccent, setSelectedDecorativeAccent] =
    useState("none");
  const [selectedAccentStyle, setSelectedAccentStyle] = useState("");
  const [selectedMineralId, setSelectedMineralId] = useState("");
  const [mineralSearch, setMineralSearch] = useState("");
  const [mineralPickerOpen, setMineralPickerOpen] = useState(false);
  const [selectedBaseMineralId, setSelectedBaseMineralId] = useState("");
  const [baseMineralSearch, setBaseMineralSearch] = useState("");
  const [baseMineralPickerOpen, setBaseMineralPickerOpen] = useState(false);
  const [selectedGlow, setSelectedGlow] = useState(null);
  const [specialRequest, setSpecialRequest] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState("no-chain");
  const [cartButtonText, setCartButtonText] = useState("Add to Cart");
  const [saveButtonText, setSaveButtonText] = useState("Save My Design");
  const finishOptions = useMemo(
    () => getFinishOptions(collection),
    [collection]
  );

  const ringSizes = useMemo(
    () => getRingSizes(collection),
    [collection]
  );

  const bezelOptions = useMemo(
    () => getBezelOptions(collection),
    [collection]
  );

  const chainOptions = useMemo(
    () => collection.options?.chain?.options || [],
    [collection]
  );

  const [selectedFinishId, setSelectedFinishId] = useState(
    finishOptions[0]?.id || ""
  );

  const [selectedBezelId, setSelectedBezelId] = useState(
    bezelOptions[0]?.id || ""
  );

  const selectedFinish =
    finishOptions.find((finish) => finish.id === selectedFinishId) ||
    finishOptions[0];

  const selectedBezel =
    bezelOptions.find((bezel) => bezel.id === selectedBezelId) ||
    bezelOptions[0];

  const selectedChain =
    chainOptions.find((chain) => chain.id === selectedChainId) ||
    chainOptions[0] ||
    null;

  const selectedMineral =
    minerals.find((mineral) => mineral.id === selectedMineralId) || null;

  const selectedBaseMineral =
    minerals.find((mineral) => mineral.id === selectedBaseMineralId) || null;

  const hasHair = selectedHair !== "no-hair";

const matchingRemiPhoto = useMemo(() => {
  const photos =
    collection.pendantPhotos ||
    collection.ringPhotos ||
    collection.photos ||
    [];

  const photoObjects = photos.filter(
    (photo) => photo && typeof photo === "object" && photo.image
  );

  if (photoObjects.length === 0) {
    return null;
  }

  const scoredPhotos = photoObjects.map((photo) => {
    let score = 0;
    let incompatible = false;

    // Finish
    if (photo.finish) {
      if (photo.finish === selectedFinish?.name) {
        score += 8;
      } else {
        incompatible = true;
      }
    }

    // Keepsake base
    if (photo.keepsakeMaterial) {
      if (photo.keepsakeMaterial === selectedKeepsake) {
        score += 6;
      } else {
        incompatible = true;
      }
    }

    // Mineral
    if (photo.mineral) {
      const activeMineralId =
        selectedKeepsake === "mineralBase"
          ? selectedBaseMineralId
          : selectedMineralId;

      if (photo.mineral === activeMineralId) {
        score += 5;
      } else {
        incompatible = true;
      }
    }

    // Hair
    if (typeof photo.hair === "boolean") {
      if (photo.hair === hasHair) {
        score += 4;
      } else {
        incompatible = true;
      }
    }

    return {
      photo,
      score: incompatible ? -1 : score,
    };
  });

  scoredPhotos.sort((a, b) => b.score - a.score);

  return scoredPhotos[0]?.score >= 0
    ? scoredPhotos[0].photo
    : null;
}, [
  collection,
  selectedFinish?.name,
  selectedKeepsake,
  selectedMineralId,
  selectedBaseMineralId,
  hasHair,
]);

const displayedImages = useMemo(() => {
  const photoImages = (
    collection.pendantPhotos ||
    collection.ringPhotos ||
    collection.photos ||
    []
  )
    .map((photo) =>
      typeof photo === "string" ? photo : photo?.image
    )
    .filter(Boolean);

  const images = [
    matchingRemiPhoto?.image,
    collection.heroImage,
    ...photoImages,
  ].filter(Boolean);

  return [...new Set(images)];
}, [collection, matchingRemiPhoto]);

useEffect(() => {
  setSelectedImageIndex(0);
}, [
  selectedFinishId,
  selectedKeepsake,
  selectedMineralId,
  selectedBaseMineralId,
  selectedHair,
]);

const currentImage =
  displayedImages[selectedImageIndex] ||
  displayedImages[0] ||
  collection.heroImage;

  const filteredMinerals = useMemo(() => {
    const search = mineralSearch.trim().toLowerCase();

    return [...minerals]
      .filter((mineral) => {
        if (!search) return true;

        return (
          mineral.name.toLowerCase().includes(search) ||
          mineral.category.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (a.popular !== b.popular) {
          return Number(b.popular) - Number(a.popular);
        }

        return a.name.localeCompare(b.name);
      });
  }, [mineralSearch]);

  const filteredBaseMinerals = useMemo(() => {
    const search = baseMineralSearch.trim().toLowerCase();

    return [...minerals]
      .filter((mineral) => {
        if (!search) return true;

        return (
          mineral.name.toLowerCase().includes(search) ||
          mineral.category.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (a.popular !== b.popular) {
          return Number(b.popular) - Number(a.popular);
        }

        return a.name.localeCompare(b.name);
      });
  }, [baseMineralSearch]);

  const popularBaseMinerals = filteredBaseMinerals.filter(
    (mineral) => mineral.popular
  );

  const otherBaseMinerals = filteredBaseMinerals.filter(
    (mineral) => !mineral.popular
  );

  const popularMinerals = filteredMinerals.filter(
    (mineral) => mineral.popular
  );

  const otherMinerals = filteredMinerals.filter(
    (mineral) => !mineral.popular
  );

  const basePrice =
    collection.pricing?.basePrice ??
    collection.startingPrice ??
    0;

  const finishPrice =
    collection.pricing?.finishes?.[selectedFinish?.id] ??
    collection.pricing?.finishes?.[selectedFinish?.name] ??
    selectedFinish?.price ??
    0;

  const bezelPrice =
    collection.pricing?.bezelSizes?.[selectedBezel?.id] ??
    collection.pricing?.bezelSizes?.[selectedBezel?.name] ??
    selectedBezel?.price ??
    0;

  const keepsakePrice =
    keepsakeOptions.find((option) => option.id === selectedKeepsake)
      ?.price ?? 0;

  const hairPrice =
    hairOptions.find((option) => option.id === selectedHair)?.price ?? 0;

  const mineralPrice =
    selectedKeepsake === "mineralBase" ? 0 : selectedMineral?.price ?? 0;

  const baseMineralPrice =
    selectedKeepsake === "mineralBase"
      ? selectedBaseMineral?.price ?? 0
      : 0;

  const decorativeAccentPrice =
    decorativeAccentOptions.find(
      (option) => option.id === selectedDecorativeAccent
    )?.price ?? 0;

  const glowPrice = selectedGlow?.price ?? 0;
  const specialRequestPrice = specialRequest ? 30 : 0;
  const chainPrice = isNecklace ? selectedChain?.price ?? 0 : 0;

  const totalPrice =
    basePrice +
    finishPrice +
    bezelPrice +
    keepsakePrice +
    hairPrice +
    mineralPrice +
    baseMineralPrice +
    glowPrice +
    decorativeAccentPrice +
    specialRequestPrice +
    chainPrice;

  const requiredSelectionsComplete = Boolean(
    selectedFinishId &&
      (!isNecklace ? selectedRingSize : true) &&
      selectedBezelId &&
      selectedKeepsake &&
      (selectedKeepsake === "mineralBase"
        ? selectedBaseMineralId
        : selectedMineralId)
  );

  function selectMineral(mineralId) {
    setSelectedMineralId(mineralId);
    setMineralPickerOpen(false);
    setMineralSearch("");
  }

  function selectBaseMineral(mineralId) {
    setSelectedBaseMineralId(mineralId);
    setBaseMineralPickerOpen(false);
    setBaseMineralSearch("");
  }

  function getCurrentDesign() {
    return {
      productId: collection.id || collection.slug || "remi",
      productName: collection.name,
      image: currentImage,
      finishId: selectedFinishId,
      finish: selectedFinish?.name || "",
      ringSize: isNecklace ? "" : selectedRingSize,
      bezelId: selectedBezelId,
      bezelSize: selectedBezel?.name || "",
      keepsakeBase: selectedKeepsake,
      keepsakeBaseName:
        selectedKeepsake === "mineralBase"
          ? selectedBaseMineral?.name || ""
          : keepsakeOptions.find((option) => option.id === selectedKeepsake)
              ?.name || "",
      naturalMineralId:
        selectedKeepsake === "mineralBase" ? "" : selectedMineralId,
      naturalMineral:
        selectedKeepsake === "mineralBase"
          ? ""
          : selectedMineral?.name || "",
      hairPlacement: selectedHair,
      hairPlacementName:
        hairOptions.find((option) => option.id === selectedHair)?.name || "",
      decorativeAccent: selectedDecorativeAccent,
      decorativeAccentName:
        decorativeAccentOptions.find(
          (option) => option.id === selectedDecorativeAccent
        )?.name || "",
      accentStyle: selectedAccentStyle,
      accentStyleName:
        accentStyleOptions.find((option) => option.id === selectedAccentStyle)
          ?.name || "",
      glowId: selectedGlow?.id || "none",
      glow: selectedGlow?.name || "No Glow",
      specialRequest,
      specialRequestPrice,
      chainId: isNecklace ? selectedChainId : "",
      chain: isNecklace ? selectedChain?.name || "Pendant Only — No Chain" : "",
      chainPrice,
      totalPrice,
    };
  }

  function handleAddToCart() {
    if (!requiredSelectionsComplete) return;

    const itemId =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `remi-${Date.now()}`;

    try {
      addItem({
        id: itemId,
        collectionId: collection.id || collection.slug || "remi",
        collectionSlug: collection.slug || "remi",
        collectionName: collection.name,
        productType: collection.productType || "ring",
        image: currentImage || collection.heroImage,
        material: selectedFinish?.name || "925 Sterling Silver",
        core: {
          id: selectedFinishId,
          name: selectedFinish?.name || "Remi Ring",
          finish: selectedFinish?.name || "",
          material: "925 Sterling Silver",
        },
        finish: selectedFinish?.name || "",
        size: isNecklace ? "" : selectedRingSize,
        bezelSize: selectedBezel?.name || "",
        keepsakeMaterial: selectedKeepsake,
        keepsakeMaterialName:
          selectedKeepsake === "mineralBase"
            ? selectedBaseMineral?.name || "Mineral Base"
            : keepsakeOptions.find(
                (option) => option.id === selectedKeepsake
              )?.name || "",
        mineral:
          selectedKeepsake === "mineralBase"
            ? selectedBaseMineral
            : selectedMineral,
        hairPlacement: selectedHair,
        hairPlacementName:
          hairOptions.find((option) => option.id === selectedHair)?.name || "",
        decorativeAccent: selectedDecorativeAccent,
        decorativeAccentName:
          decorativeAccentOptions.find(
            (option) => option.id === selectedDecorativeAccent
          )?.name || "",
        accentStyle: selectedAccentStyle,
        accentStyleName:
          accentStyleOptions.find(
            (option) => option.id === selectedAccentStyle
          )?.name || "",
        glow: selectedGlow,
        specialRequest,
        specialRequestPrice,
        chainId: isNecklace ? selectedChainId : "",
        chain: isNecklace ? selectedChain?.name || "Pendant Only — No Chain" : "",
        chainPrice,
        price: totalPrice,
        quantity: 1,
      });

      setCartButtonText("Added to Cart ✓");
      window.setTimeout(() => setCartButtonText("Add to Cart"), 2200);
    } catch (error) {
      console.error("Unable to add the Remi design to the cart:", error);
      setCartButtonText("Unable to Add — Try Again");
      window.setTimeout(() => setCartButtonText("Add to Cart"), 2600);
    }
  }

  async function handleSaveDesign() {
    if (typeof window === "undefined") return;

    const design = getCurrentDesign();
    const savedDesignUrl = `${window.location.origin}${
      window.location.pathname
    }?design=${encodeURIComponent(JSON.stringify(design))}`;

    try {
      await navigator.clipboard.writeText(savedDesignUrl);
      setSaveButtonText("Design Link Copied ✓");
    } catch {
      window.prompt("Copy your saved design link:", savedDesignUrl);
      setSaveButtonText("Design Saved ✓");
    }

    window.setTimeout(() => setSaveButtonText("Save My Design"), 2400);
  }

  return (
    <main
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "45px 20px 80px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobileLayout
              ? "minmax(0, 1fr)"
              : "minmax(0, 1fr) 330px",
            gap: isMobileLayout ? "24px" : "24px",
            alignItems: "start",
            minWidth: 0,
        }}
      >
        <section>
          <img
            src={currentImage}
            alt={collection.name}
            style={{
              width: "100%",
              maxHeight: "520px",              
              objectFit: "contain",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.03)",
              display: "block",
            }}
          />

          {displayedImages.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              {displayedImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    padding: 0,
                    border:
                      selectedImageIndex === index
                        ? "2px solid #d4af37"
                        : "1px solid rgba(255,255,255,.15)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={image}
                    alt={`${collection.name} view ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "contain",
                      objectPosition: "center",
                      display: "block",
                      background: "rgba(255,255,255,.03)",
                      padding: "6px",
                    }}
                  />
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

          <OptionSection
            title="Choose Metal Finish"
            description={`Select the finish for your sterling silver ${collection.name}.`}
          >
            <div style={optionGridStyle}>
              {finishOptions.map((finish) => (
                <ChoiceButton
                  key={finish.id}
                  selected={selectedFinishId === finish.id}
                  onClick={() => setSelectedFinishId(finish.id)}
                  title={finish.name}
                  description={formatPrice(
                    collection.pricing?.finishes?.[finish.id] ??
                      collection.pricing?.finishes?.[finish.name] ??
                      finish.price
                  )}
                />
              ))}
            </div>
          </OptionSection>

          {!isNecklace && (
            <OptionSection
              title="Choose Ring Size"
              description="Available in whole and half sizes from 4 through 12."
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(74px, 1fr))",
                  gap: "10px",
                }}
              >
                {ringSizes.map((size) => (
                  <ChoiceButton
                    key={size}
                    selected={selectedRingSize === size}
                    onClick={() => setSelectedRingSize(size)}
                    title={size}
                    compact
                    centered
                  />
                ))}
              </div>
            </OptionSection>
          )}

          {collection.options?.bezelSize?.enabled !== false && (
  <OptionSection
          
            title="Choose Bezel Size"
            description={isNecklace ? "Choose any available bezel size at no additional cost." : "Larger 10 × 8 mm and 11 × 9 mm bezels add $10."}
          >
            <div style={optionGridStyle}>
              {bezelOptions.map((bezel) => {
                const price =
                  collection.pricing?.bezelSizes?.[bezel.id] ??
                  collection.pricing?.bezelSizes?.[bezel.name] ??
                  bezel.price;

                return (
                  <ChoiceButton
                    key={bezel.id}
                    selected={selectedBezelId === bezel.id}
                    onClick={() => setSelectedBezelId(bezel.id)}
                    title={bezel.name}
                    description={formatPrice(price)}
                  />
                );
              })}
            </div>
          </OptionSection>
          )}
          {isNecklace && collection.options?.chain?.enabled && (
            <OptionSection
              title="Choose Chain Option"
              description="Select the pendant by itself or add a matching chain. The chain finish will automatically match your pendant finish."
            >
              <div style={optionGridStyle}>
                {chainOptions.map((chain) => (
                  <ChoiceButton
                    key={chain.id}
                    selected={selectedChainId === chain.id}
                    onClick={() => setSelectedChainId(chain.id)}
                    title={chain.name}
                    description={formatPrice(chain.price)}
                  />
                ))}
              </div>
            </OptionSection>
          )}

          <OptionSection
            title="Choose Keepsake Base"
            description={`Select the primary material that will create the foundation of your ${productLabel.toLowerCase()} keepsake. Breast milk is finished with our signature pearl appearance, while cremation ashes, sand, and soil retain their natural color for a timeless and authentic keepsake.`}
          >
            <div style={optionGridStyle}>
              {keepsakeOptions.map((material) => (
                <ChoiceButton
                  key={material.id}
                  selected={selectedKeepsake === material.id}
                  onClick={() => {
                    setSelectedKeepsake(material.id);

                    if (material.id === "mineralBase") {
                      setSelectedMineralId("");
                      setMineralPickerOpen(false);
                      setMineralSearch("");
                    } else {
                      setSelectedBaseMineralId("");
                      setBaseMineralPickerOpen(false);
                      setBaseMineralSearch("");
                    }
                  }}
                  title={material.name}
                  description={formatPrice(material.price)}
                />
              ))}
            </div>
          </OptionSection>

          {selectedKeepsake === "mineralBase" && (
            <OptionSection
              title="Choose Base Mineral"
              description={`Choose the mineral that will form the entire base of your ${productLabel.toLowerCase()} keepsake.`}
            >
              {selectedBaseMineral && !baseMineralPickerOpen && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "2px solid #d4af37",
                    background: "rgba(212,175,55,.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={selectedBaseMineral.image}
                      alt={selectedBaseMineral.name}
                      style={{
                        width: "68px",
                        height: "68px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "18px",
                          marginBottom: "4px",
                        }}
                      >
                        {selectedBaseMineral.name}
                      </strong>
                      <span style={{ fontSize: "14px", opacity: 0.72 }}>
                        {selectedBaseMineral.category} · {formatPrice(selectedBaseMineral.price)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBaseMineralPickerOpen(true)}
                    style={secondaryButtonStyle}
                  >
                    Change Mineral
                  </button>
                </div>
              )}

              {!selectedBaseMineral && !baseMineralPickerOpen && (
                <button
                  type="button"
                  onClick={() => setBaseMineralPickerOpen(true)}
                  style={{
                    ...secondaryButtonStyle,
                    width: "100%",
                    padding: "16px",
                    fontSize: "16px",
                  }}
                >
                  Choose a Base Mineral
                </button>
              )}

              {baseMineralPickerOpen && (
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,.14)",
                    background: "rgba(255,255,255,.025)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="search"
                      value={baseMineralSearch}
                      onChange={(event) =>
                        setBaseMineralSearch(event.target.value)
                      }
                      placeholder="Search minerals..."
                      style={{
                        flex: "1 1 260px",
                        minWidth: 0,
                        padding: "13px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,.18)",
                        background: "rgba(255,255,255,.05)",
                        color: "#fff",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />

                    {selectedBaseMineral && (
                      <button
                        type="button"
                        onClick={() => {
                          setBaseMineralPickerOpen(false);
                          setBaseMineralSearch("");
                        }}
                        style={secondaryButtonStyle}
                      >
                        Close
                      </button>
                    )}
                  </div>

                  {popularBaseMinerals.length > 0 && (
                    <MineralGroup
                      title="Popular Minerals"
                      mineralsToShow={popularBaseMinerals}
                      selectedMineralId={selectedBaseMineralId}
                      onSelect={selectBaseMineral}
                    />
                  )}

                  {otherBaseMinerals.length > 0 && (
                    <MineralGroup
                      title={
                        baseMineralSearch.trim()
                          ? "More Matching Minerals"
                          : "All Minerals"
                      }
                      mineralsToShow={otherBaseMinerals}
                      selectedMineralId={selectedBaseMineralId}
                      onSelect={selectBaseMineral}
                    />
                  )}

                  {filteredBaseMinerals.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        opacity: 0.7,
                        padding: "24px 0 8px",
                      }}
                    >
                      No minerals match your search.
                    </p>
                  )}
                </div>
              )}
            </OptionSection>
          )}

          <OptionSection
            title="Hair Placement"
            description="Choose how you would like your loved one's hair to be displayed within your keepsake. Only one option may be selected."
          >
            <div style={optionGridStyle}>
              {hairOptions
  .filter((hair) => {
    const allowed =
      collection.options?.hair?.allowedStyles;

    if (
      hair.id === "no-hair" ||
      !allowed ||
      allowed.length === 0
    ) {
      return true;
    }

    return allowed.includes(hair.id);
  })
  .map((hair) => (
                <ChoiceButton
                  key={hair.id}
                  selected={selectedHair === hair.id}
                  onClick={() => setSelectedHair(hair.id)}
                  title={hair.name}
                  description={`${hair.description} ${formatPrice(hair.price)}`}
                />
              ))}
            </div>
          </OptionSection>

          {selectedKeepsake !== "mineralBase" && (
          <OptionSection
            title="Choose Natural Mineral"
description="Select one natural mineral to complement your keepsake base. Your chosen mineral will be carefully crushed into small pieces and artistically sprinkled over the surface, adding beautiful natural color and texture while allowing your keepsake base to remain the centerpiece."          >
            {selectedMineral && !mineralPickerOpen && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "2px solid #d4af37",
                  background: "rgba(212,175,55,.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    minWidth: 0,
                  }}
                >
                  <img
                    src={selectedMineral.image}
                    alt={selectedMineral.name}
                    style={{
                      width: "68px",
                      height: "68px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "18px",
                        marginBottom: "4px",
                      }}
                    >
                      {selectedMineral.name}
                    </strong>
                    <span style={{ fontSize: "14px", opacity: 0.72 }}>
                      {selectedMineral.category} · {formatPrice(selectedMineral.price)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMineralPickerOpen(true)}
                  style={secondaryButtonStyle}
                >
                  Change Natural Mineral
                </button>
              </div>
            )}

            {!selectedMineral && !mineralPickerOpen && (
              <button
                type="button"
                onClick={() => setMineralPickerOpen(true)}
                style={{
                  ...secondaryButtonStyle,
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                }}
              >
                Choose a Natural Mineral
              </button>
            )}

            {mineralPickerOpen && (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.025)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="search"
                    value={mineralSearch}
                    onChange={(event) =>
                      setMineralSearch(event.target.value)
                    }
                    placeholder="Search minerals..."
                    style={{
                      flex: "1 1 260px",
                      minWidth: 0,
                      padding: "13px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(255,255,255,.05)",
                      color: "#fff",
                      fontSize: "15px",
                      outline: "none",
                    }}
                  />

                  {selectedMineral && (
                    <button
                      type="button"
                      onClick={() => {
                        setMineralPickerOpen(false);
                        setMineralSearch("");
                      }}
                      style={secondaryButtonStyle}
                    >
                      Close
                    </button>
                  )}
                </div>

                {popularMinerals.length > 0 && (
                  <MineralGroup
                    title="Popular Minerals"
                    mineralsToShow={popularMinerals}
                    selectedMineralId={selectedMineralId}
                    onSelect={selectMineral}
                  />
                )}

                {otherMinerals.length > 0 && (
                  <MineralGroup
                    title={
                      mineralSearch.trim()
                        ? "More Matching Minerals"
                        : "All Minerals"
                    }
                    mineralsToShow={otherMinerals}
                    selectedMineralId={selectedMineralId}
                    onSelect={selectMineral}
                  />
                )}

                {filteredMinerals.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      opacity: 0.7,
                      padding: "24px 0 8px",
                    }}
                  >
                    No minerals match your search.
                  </p>
                )}
              </div>
            )}
          </OptionSection>
          )}

          <OptionSection
            title="Decorative Accent"
            description="Choose one optional decorative accent to complement your keepsake."
          >
            <div style={optionGridStyle}>
              {decorativeAccentOptions.map((accent) => (
                <ChoiceButton
                  key={accent.id}
                  selected={selectedDecorativeAccent === accent.id}
                  onClick={() => {
                    setSelectedDecorativeAccent(accent.id);

                    if (accent.id === "none") {
                      setSelectedAccentStyle("");
                    } else if (!selectedAccentStyle) {
                      setSelectedAccentStyle("speckled");
                    }
                  }}
                  title={accent.name}
                  description={formatPrice(accent.price)}
                />
              ))}
            </div>
          </OptionSection>

          {selectedDecorativeAccent !== "none" && (
            <OptionSection
              title="Accent Style"
              description="Choose one style for your decorative accent."
            >
              <div style={optionGridStyle}>
                {accentStyleOptions
  .filter((style) => {
    const allowed =
      collection.options?.decorativeAccents?.allowedStyles;

    if (!allowed || allowed.length === 0) {
      return true;
    }

    return allowed.includes(style.id);
  })
  .map((style) => (
                  <ChoiceButton
                    key={style.id}
                    selected={selectedAccentStyle === style.id}
                    onClick={() => setSelectedAccentStyle(style.id)}
                    title={style.name}
                    description={style.description}
                  />
                ))}
              </div>

              {selectedAccentStyle === "crescent-moon" &&
                selectedHair === "crescent-hair" && (
                  <p
                    style={{
                      marginTop: "14px",
                      padding: "13px 15px",
                      borderRadius: "12px",
                      background: "rgba(212,175,55,.1)",
                      border: "1px solid rgba(212,175,55,.35)",
                      fontSize: "14px",
                      lineHeight: 1.55,
                    }}
                  >
                    The decorative crescent will automatically be placed on the
                    opposite side of the hair to create a balanced and
                    complementary design.
                  </p>
                )}
            </OptionSection>
          )}

          <OptionSection
            title="Special Request"
            description="Select this option if you would like something different from the choices shown above. Please message us before ordering so we can confirm your request can be completed."
          >
            <div style={optionGridStyle}>
              <ChoiceButton
                selected={!specialRequest}
                onClick={() => setSpecialRequest(false)}
                title="No Special Request"
                description="Included"
              />
              <ChoiceButton
                selected={specialRequest}
                onClick={() => setSpecialRequest(true)}
                title="⭐ Add Special Request"
                description="+$30"
              />
            </div>
          </OptionSection>

          <GlowSelector
            glowPowders={glowPowders}
            selectedGlow={selectedGlow}
            onSelectGlow={setSelectedGlow}
          />
        </section>

        <aside
          style={{
            position: isMobileLayout
                ? "static"
                : "sticky",
              top: isMobileLayout
                ? "auto"
                : "110px",
              minWidth: 0,
              maxHeight: isMobileLayout
                ? "none"
                : "calc(100vh - 130px)",
              overflowY: isMobileLayout
                ? "visible"
                : "auto",
              scrollbarGutter: "stable",
            padding: "22px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(255,255,255,.045)",
          }}
        >
          <h2
            style={{
              fontSize: "27px",
              marginBottom: "20px",
            }}
          >
            Your {collection.name}
          </h2>

          <SummaryRow label="Product" value={collection.name} />
          <SummaryRow
            label="Metal Finish"
            value={selectedFinish?.name || "Not selected"}
          />
          {!isNecklace && (
            <SummaryRow
              label="Ring Size"
              value={selectedRingSize || "Not selected"}
            />
          )}
          <SummaryRow
            label="Bezel Size"
            value={selectedBezel?.name || "Not selected"}
          />
          {isNecklace && (
            <SummaryRow
              label="Chain"
              value={selectedChain?.name || "Pendant Only — No Chain"}
            />
          )}
          <SummaryRow
            label="Keepsake Base"
            value={
              selectedKeepsake === "mineralBase"
                ? selectedBaseMineral
                  ? `${selectedBaseMineral.name} Mineral`
                  : "Mineral Base — not selected"
                : keepsakeOptions.find(
                    (option) => option.id === selectedKeepsake
                  )?.name || "Not selected"
            }
          />
          <SummaryRow
            label="Hair"
            value={
              hairOptions.find((option) => option.id === selectedHair)
                ?.name || "Not selected"
            }
          />
          {selectedKeepsake !== "mineralBase" && (
            <SummaryRow
              label="Natural Mineral"
              value={selectedMineral?.name || "Not selected"}
            />
          )}
          <SummaryRow
            label="Decorative Accent"
            value={
              decorativeAccentOptions.find(
                (option) => option.id === selectedDecorativeAccent
              )?.name || "Not selected"
            }
          />
          {selectedDecorativeAccent !== "none" && (
            <SummaryRow
              label="Accent Style"
              value={
                accentStyleOptions.find(
                  (option) => option.id === selectedAccentStyle
                )?.name || "Not selected"
              }
            />
          )}
          <SummaryRow
            label="Glow Effect"
            value={selectedGlow?.name || "No Glow"}
          />
          <SummaryRow
            label="Special Request"
            value={specialRequest ? "Yes (+$30)" : "None"}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,.15)",
              marginTop: "20px",
              paddingTop: "20px",
            }}
          >
            <strong style={{ fontSize: "18px" }}>Total</strong>

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
            disabled={!requiredSelectionsComplete}
            onClick={handleAddToCart}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              background: requiredSelectionsComplete
                ? "#d4af37"
                : "rgba(212,175,55,.4)",
              color: "#111",
              fontSize: "17px",
              fontWeight: 800,
              cursor: requiredSelectionsComplete ? "pointer" : "not-allowed",
              opacity: requiredSelectionsComplete ? 1 : 0.72,
            }}
          >
            {!isNecklace && !selectedRingSize
              ? "Choose a Ring Size"
              : selectedKeepsake === "mineralBase" && !selectedBaseMineralId
                ? "Choose a Base Mineral"
                : selectedKeepsake !== "mineralBase" && !selectedMineralId
                  ? "Choose a Natural Mineral"
                  : cartButtonText}
          </button>

          <button
            type="button"
            onClick={handleSaveDesign}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "15px",
              border: "1px solid rgba(212,175,55,.65)",
              borderRadius: "10px",
              background: "rgba(255,255,255,.035)",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {saveButtonText}
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
            Carefully handcrafted in North Carolina. Estimated completion
            time is 2–10 weeks.
          </p>
        </aside>
      </div>
    </main>
  );
}

const optionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
};

const secondaryButtonStyle = {
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.06)",
  color: "#fff",
  fontWeight: 750,
  cursor: "pointer",
};

function OptionSection({ title, description, children }) {
  return (
    <section style={{ marginTop: "36px" }}>
      <h2
        style={{
          fontSize: "23px",
          marginBottom: description ? "8px" : "15px",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            opacity: 0.7,
            marginBottom: "15px",
          }}
        >
          {description}
        </p>
      )}

      {children}
    </section>
  );
}

function ChoiceButton({
  selected,
  onClick,
  title,
  description,
  compact = false,
  centered = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: compact ? "14px" : "18px",
        borderRadius: "14px",
        textAlign: centered ? "center" : "left",
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
          fontSize: compact ? "16px" : "17px",
          marginBottom: description ? "5px" : 0,
        }}
      >
        {title}
      </strong>

      {description && (
        <span
          style={{
            display: "block",
            fontSize: compact ? "13px" : "14px",
            lineHeight: 1.5,
            opacity: 0.75,
          }}
        >
          {description}
        </span>
      )}
    </button>
  );
}

function MineralGroup({
  title,
  mineralsToShow,
  selectedMineralId,
  onSelect,
}) {
  return (
    <div style={{ marginTop: "18px" }}>
      <h3
        style={{
          fontSize: "17px",
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "12px",
        }}
      >
        {mineralsToShow.map((mineral) => {
          const selected = selectedMineralId === mineral.id;

          return (
            <button
              key={mineral.id}
              type="button"
              onClick={() => onSelect(mineral.id)}
              style={{
                padding: "8px",
                borderRadius: "14px",
                overflow: "hidden",
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
              <img
                src={mineral.image}
                alt={mineral.name}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,.04)",
                }}
              />

              <div style={{ padding: "10px 6px 6px" }}>
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    lineHeight: 1.3,
                    marginBottom: "5px",
                  }}
                >
                  {mineral.name}
                </strong>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    opacity: 0.68,
                    marginBottom: "4px",
                  }}
                >
                  {mineral.category}
                </span>

                <span
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#d4af37",
                  }}
                >
                  {formatPrice(mineral.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        marginBottom: "14px",
        paddingBottom: "14px",
        borderBottom: "1px solid rgba(255,255,255,.1)",
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