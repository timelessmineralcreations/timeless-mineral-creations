import Link from "next/link";

import GeneralSection from "./GeneralSection";
import ImagesSection from "./ImagesSection";
import PricingSection from "./PricingSection";
import RingCoresSection from "./RingCoresSection";
import InlayStylesSection from "./InlayStylesSection";
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
  ringCores,
  inlayStyles,
  selectedRingCoreIds,
  selectedInlayStyleIds,
  updateAction,
  deleteAction,
}) {
  return (
    <form action={updateAction}>
      <input type="hidden" name="id" value={collection.id} />

      <div style={formGridStyle}>
        <GeneralSection collection={collection} />

        <ImagesSection collection={collection} />

        <PricingSection collection={collection} />

        <RingCoresSection
          ringCores={ringCores}
          selectedRingCoreIds={selectedRingCoreIds}
        />

        <InlayStylesSection
          inlayStyles={inlayStyles}
          selectedInlayStyleIds={selectedInlayStyleIds}
        />

        <VisibilitySection collection={collection} />

        <SeoSection collection={collection} />

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
  );
}