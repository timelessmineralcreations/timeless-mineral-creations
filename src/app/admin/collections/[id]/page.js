import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import CollectionEditor from "./components/CollectionEditor";
import {
  deleteCollection,
  updateCollection,
} from "./actions";

import {
  eyebrowStyle,
  pageDescriptionStyle,
  pageHeaderStyle,
  pageInnerStyle,
  pageStyle,
  pageTitleStyle,
  secondaryButtonStyle,
} from "./components/styles";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }) {
  const { id } = await params;

  const [collection, ringCores, inlayStyles] = await Promise.all([
    prisma.collection.findUnique({
      where: {
        id,
      },
      include: {
        ringCores: {
          where: {
            active: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            ringCoreId: true,
          },
        },

        inlayStyles: {
          where: {
            active: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            inlayStyleId: true,
          },
        },
      },
    }),

    prisma.ringCore.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.inlayStyle.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const selectedRingCoreIds = collection.ringCores.map(
    (assignment) => assignment.ringCoreId
  );

  const selectedInlayStyleIds = collection.inlayStyles.map(
    (assignment) => assignment.inlayStyleId
  );

  return (
    <main style={pageStyle}>
      <div style={pageInnerStyle}>
        <div style={pageHeaderStyle}>
          <Link
            href="/admin/collections"
            style={{
              ...secondaryButtonStyle,
              minHeight: "42px",
              marginBottom: "20px",
            }}
          >
            ← Back to Collections
          </Link>

          <p style={eyebrowStyle}>
            Collection Management
          </p>

          <h1 style={pageTitleStyle}>
            Edit {collection.name}
          </h1>

          <p style={pageDescriptionStyle}>
            Update the collection details, pricing, images,
            visibility, search information, ring cores, and inlay
            styles available to customers.
          </p>
        </div>

        <CollectionEditor
          collection={collection}
          ringCores={ringCores}
          inlayStyles={inlayStyles}
          selectedRingCoreIds={selectedRingCoreIds}
          selectedInlayStyleIds={selectedInlayStyleIds}
          updateAction={updateCollection}
          deleteAction={deleteCollection}
        />
      </div>
    </main>
  );
}