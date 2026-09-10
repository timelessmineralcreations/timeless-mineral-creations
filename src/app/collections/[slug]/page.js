import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

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

  const databaseCollection =
    await prisma.collection.findFirst({
      where: {
        slug,
      },
      select: {
        published: true,
        comingSoon: true,
        heroImage: true,
        photos: {
          where: {
            active: true,
          },
          orderBy: [
            { featured: "desc" },
            { sortOrder: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            caption: true,
            material: true,
            finish: true,
            coreId: true,
            widthMm: true,
            inlayStyleId: true,
            mineralIdsJson: true,
            memorialMaterialIdsJson: true,
            accentMaterialIdsJson: true,
            glowPowderIdsJson: true,
            tagsJson: true,
            featured: true,
            sortOrder: true,
          },
        },
        galleryItems: {
          where: {
            active: true,
          },
          orderBy: [
            { featured: "desc" },
            { sortOrder: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            altText: true,
            featured: true,
            sortOrder: true,
            images: {
              orderBy: [
                { primary: "desc" },
                { sortOrder: "asc" },
                { createdAt: "asc" },
              ],
              select: {
                imageUrl: true,
                altText: true,
              },
            },
          },
        },
      },
    });

  if (
    !databaseCollection ||
    (!databaseCollection.published &&
      !databaseCollection.comingSoon)
  ) {
    notFound();
  }

  const parsePhotoJsonArray = (value) => {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map(String)
        : [];
    } catch {
      return [];
    }
  };

  const adminPhotos =
    databaseCollection.photos.map((photo) => {
      const mineralIds =
        parsePhotoJsonArray(photo.mineralIdsJson);

      const memorialMaterialIds =
        parsePhotoJsonArray(
          photo.memorialMaterialIdsJson
        );

      const accentMaterialIds =
        parsePhotoJsonArray(
          photo.accentMaterialIdsJson
        );

      const glowPowderIds =
        parsePhotoJsonArray(
          photo.glowPowderIdsJson
        );

      const tags =
        parsePhotoJsonArray(photo.tagsJson);

      return {
        id: photo.id,
        image: photo.imageUrl,
        imageUrl: photo.imageUrl,
        altText: photo.altText || "",
        caption: photo.caption || "",
        material: photo.material || null,
        finish: photo.finish || null,
        coreId: photo.coreId || null,
        width: photo.widthMm ?? null,
        widthMm: photo.widthMm ?? null,
        inlayStyleId: photo.inlayStyleId || null,
        mineral: mineralIds[0] || null,
        minerals: mineralIds,
        mineralIds,
        keepsakeMaterial:
          memorialMaterialIds[0] || null,
        memorialMaterials:
          memorialMaterialIds,
        accentMaterials:
          accentMaterialIds,
        glow: glowPowderIds[0] || null,
        glowPowders: glowPowderIds,
        tags,
        hair:
          memorialMaterialIds.includes("hair") ||
          tags.includes("hair"),
        featured: photo.featured,
        active: true,
        sortOrder: photo.sortOrder,
      };
    });

  const galleryPhotos =
    (databaseCollection?.galleryItems || [])
      .map((item) => {
        const galleryImage =
          item.imageUrl ||
          item.images?.[0]?.imageUrl ||
          null;

        if (!galleryImage) {
          return null;
        }

        return {
          id: `gallery-${item.id}`,
          image: galleryImage,
          imageUrl: galleryImage,
          altText:
            item.altText ||
            item.images?.[0]?.altText ||
            item.title ||
            "",
          caption:
            item.description ||
            item.title ||
            "",
          featured: item.featured,
          sortOrder: item.sortOrder,
        };
      })
      .filter(Boolean);

  const customerPhotos =
    adminPhotos.length > 0
      ? adminPhotos
      : galleryPhotos;

  const hasAdminPhotos =
    customerPhotos.length > 0;

  const collectionWithGallery = {
    ...collection,
    published: databaseCollection.published,
    comingSoon: databaseCollection.comingSoon,
    heroImage:
      databaseCollection.heroImage ||
      customerPhotos[0]?.imageUrl ||
      customerPhotos[0]?.image ||
      collection.heroImage,
    ringPhotos: hasAdminPhotos
      ? customerPhotos
      : collection.ringPhotos || [],
    pendantPhotos: hasAdminPhotos
      ? customerPhotos
      : collection.pendantPhotos || [],
    photos: hasAdminPhotos
      ? customerPhotos
      : collection.photos || [],
  };

  if (databaseCollection.comingSoon) {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>
          {collection.name}
        </h1>

        <p
          style={{
            margin: "0 auto",
            maxWidth: "620px",
            fontSize: "18px",
            lineHeight: 1.7,
            opacity: 0.78,
          }}
        >
          This collection is coming soon and is not
          available to order yet.
        </p>
      </main>
    );
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
  <RemiConfigurator collection={collectionWithGallery} />
) : usesKeepsakeConfigurator ? (
  <KeepsakeConfigurator collection={collectionWithGallery} />
) : (
  <CollectionConfigurator collection={collectionWithGallery} />
)}  
    </main>
  );
}
