import { notFound } from "next/navigation";

import CollectionConfigurator from "@/components/CollectionConfigurator";
import KeepsakeConfigurator from "@/components/KeepsakeConfigurator";

import { signatureCollection } from "@/data/collections/signature/collection";
import { tornadoCollection } from "@/data/collections/tornado/collection";
import { clamCollection } from "@/data/collections/clam/collection";
import { dualChannelCollection } from "@/data/collections/dual-channel/collection";
import { mountainCollection } from "@/data/collections/mountain/collection";
import { oceanCollection } from "@/data/collections/ocean/collection";
import { tripleCollection } from "@/data/collections/triple/collection";
import { aztecCollection } from "@/data/collections/aztec/collection";
import { dragonCollection } from "@/data/collections/dragon/collection";
import { greekCollection } from "@/data/collections/greek/collection";
import { pawCollection } from "@/data/collections/paw/collection";
import { pawTrailCollection } from "@/data/collections/paw-trail/collection";
import { puzzleCollection } from "@/data/collections/puzzle/collection";
import { honeycombCollection } from "@/data/collections/honeycomb/collection";
import { leafCollection } from "@/data/collections/leaf/collection";
import { nativeCollection } from "@/data/collections/native/collection";
import { ribbonCollection } from "@/data/collections/ribbon/collection";
import { offsetCollection } from "@/data/collections/offset/collection";
import { dualOffsetCollection } from "@/data/collections/dual-offset/collection";
import { twinOffsetCollection } from "@/data/collections/twin-offset/collection";
import { celticCollection } from "@/data/collections/celtic/collection";
import { quadCollection } from "@/data/collections/quad/collection";
import { cobblestoneCollection } from "@/data/collections/cobblestone/collection";
import { focusCollection } from "@/data/collections/focus/collection";
import { companionCollection } from "@/data/collections/companion/collection";
import { horizonMountainCollection } from "@/data/collections/horizon-mountain/collection";
import { cornerstoneCollection } from "@/data/collections/cornerstone/collection";

import { evermoreRingCollection } from "@/data/collections/evermore/evermore-ring/collection";
import { evermoreBraceletCollection } from "@/data/collections/evermore/evermore-bracelet/collection";
import { evermoreNecklaceCollection } from "@/data/collections/evermore/evermore-necklace/collection";

import { keepsakeBranchCollection } from "@/data/collections/keepsake-branch/keepsake-branch-necklace/collection";
import { keepsakeBranchRingCollection } from "@/data/collections/keepsake-branch/keepsake-branch-ring/collection";
import { remiCollection } from "@/data/collections/remi/collection";
import RemiConfigurator from "@/components/RemiConfigurator";
import { heirloomCollection } from "@/data/collections/heirloom/collection";
import { heirloomNecklaceCollection } from "@/data/collections/heirloom-necklace/collection";
import { legacyCrossCollection } from "@/data/collections/legacy/legacy-cross/collection";
import { legacyHeartCollection } from "@/data/collections/legacy/legacy-heart/collection";

const collections = [
  signatureCollection,
  tornadoCollection,
  clamCollection,
  dualChannelCollection,
  mountainCollection,
  oceanCollection,
  tripleCollection,
  aztecCollection,
  dragonCollection,
  greekCollection,
  pawCollection,
  pawTrailCollection,
  puzzleCollection,
  honeycombCollection,
  leafCollection,
  nativeCollection,
  ribbonCollection,
  offsetCollection,
  dualOffsetCollection,
  twinOffsetCollection,
  celticCollection,
  quadCollection,
  cobblestoneCollection,
  focusCollection,
  companionCollection,
  horizonMountainCollection,
  cornerstoneCollection,

  evermoreRingCollection,
  evermoreBraceletCollection,
  evermoreNecklaceCollection,

  remiCollection,
  heirloomCollection,
  heirloomNecklaceCollection,


  keepsakeBranchRingCollection,
  keepsakeBranchCollection,

  legacyCrossCollection,
  legacyHeartCollection,
  
];

const keepsakeBuilders = [
  "evermore-ring",
  "evermore-bracelet",
  "evermore-necklace",

  "keepsake-branch-ring",
  "keepsake-branch-necklace",
  "keepsake",
];

export default async function CollectionPage({ params }) {
  const { slug } = await params;

  const collection = collections.find(
    (item) => item.slug === slug
  );

  if (!collection) {
    notFound();
  }

  const usesKeepsakeConfigurator =
    collection.category === "keepsake" ||
    keepsakeBuilders.includes(collection.builder);

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      {collection.builder === "remi" ? (
  <RemiConfigurator collection={collection} />
) : usesKeepsakeConfigurator ? (
  <KeepsakeConfigurator collection={collection} />
) : (
  <CollectionConfigurator collection={collection} />
)}  
    </main>
  );
}