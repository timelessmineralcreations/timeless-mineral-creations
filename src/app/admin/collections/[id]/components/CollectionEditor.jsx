import Link from "next/link";

import GeneralSection from "./GeneralSection";
import ImagesSection from "./ImagesSection";
import PhotosSection from "./PhotosSection";
import PricingSection from "./PricingSection";
import RingCoresSection from "./RingCoresSection";
import InlayStylesSection from "./InlayStylesSection";
import MineralsSection from "./MineralsSection";
import GlowPowdersSection from "./GlowPowdersSection";
import BirthstonesSection from "./BirthstonesSection";
import BezelSizesSection from "./BezelSizesSection";
import ChainOptionsSection from "./ChainOptionsSection";
import MemorialMaterialsSection from "./MemorialMaterialsSection";
import EngravingOptionsSection from "./EngravingOptionsSection";
import HairPlacementSection from "./HairPlacementSection";
import AccentsSection from "./AccentsSection";
import VisibilitySection from "./VisibilitySection";
import SeoSection from "./SeoSection";

import {
  actionGroupStyle,
  actionRowStyle,
  dangerButtonStyle,
  formGridStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "./styles";

export default function CollectionEditor({
  collection,

  productBases,
  inlayStyles,
  minerals,
  glowPowders,
  birthstones,
  bezelSizeOptions,
  chainOptions,
  memorialMaterialOptions,
  engravingOptions,
  hairPlacementOptions,
  decorativeAccentOptions,
  accentStyleOptions,
  memorialMaterialRules,

  selectedProductBaseIds,
  selectedInlayStyleIds,
  selectedMineralIds,
  selectedGlowPowderIds,
  selectedBirthstoneIds,
  selectedBezelSizeSlugs,
  selectedChainOptionSlugs,
  selectedEngravingOptionSlugs,

  updateAction,
  deleteAction,
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      <form action={updateAction}>
        <input
          type="hidden"
          name="id"
          value={collection.id}
        />

        <div style={formGridStyle}>
          <GeneralSection
            collection={collection}
          />

          <ImagesSection
            collection={collection}
          />

          <PricingSection
            collection={collection}
          />

          <RingCoresSection
            ringCores={productBases}
            selectedRingCoreIds={
              selectedProductBaseIds
            }
          />

          <InlayStylesSection
            inlayStyles={inlayStyles}
            selectedInlayStyleIds={
              selectedInlayStyleIds
            }
          />

          <MineralsSection
            minerals={minerals}
            selectedMineralIds={
              selectedMineralIds
            }
          />

          <GlowPowdersSection
            glowPowders={glowPowders}
            selectedGlowPowderIds={
              selectedGlowPowderIds
            }
          />

          <BirthstonesSection
            collection={collection}
            birthstones={birthstones}
            selectedBirthstoneIds={
              selectedBirthstoneIds
            }
          />

          <BezelSizesSection
            bezelSizeOptions={
              bezelSizeOptions || []
            }
            selectedBezelSizeSlugs={
              selectedBezelSizeSlugs || []
            }
          />

          <ChainOptionsSection
            chainOptions={
              chainOptions || []
            }
            selectedChainOptionSlugs={
              selectedChainOptionSlugs || []
            }
          />

          <MemorialMaterialsSection
            memorialMaterialOptions={
              memorialMaterialOptions || []
            }
            memorialMaterialRules={
              memorialMaterialRules || []
            }
          />

          <EngravingOptionsSection
            engravingOptions={
              engravingOptions || []
            }
            selectedEngravingOptionSlugs={
              selectedEngravingOptionSlugs || []
            }
          />

          <HairPlacementSection
            collection={collection}
            hairPlacementOptions={
              hairPlacementOptions || []
            }
          />

          <AccentsSection
            collection={collection}
            decorativeAccentOptions={
              decorativeAccentOptions || []
            }
            accentStyleOptions={
              accentStyleOptions || []
            }
          />

          <VisibilitySection
            collection={collection}
          />

          <SeoSection
            collection={collection}
          />

          <div style={actionRowStyle}>
            <button
              type="submit"
              formAction={deleteAction}
              style={dangerButtonStyle}
            >
              Delete Collection
            </button>

            <div style={actionGroupStyle}>
              <Link
                href="/admin/collections"
                style={secondaryButtonStyle}
              >
                Cancel
              </Link>

              <button
                type="submit"
                style={primaryButtonStyle}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>

      <PhotosSection
        collection={collection}
        photos={collection.photos || []}
        productBases={productBases}
        inlayStyles={inlayStyles}
        minerals={minerals}
        glowPowders={glowPowders}
      />
    </div>
  );
}