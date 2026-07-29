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

  const [collection, ringCores] = await Promise.all([
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
  ]);

  if (!collection) {
    notFound();
  }

  const selectedRingCoreIds = collection.ringCores.map(
    (assignment) => assignment.ringCoreId
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
            visibility, search information, and the ring cores
            available to customers.
          </p>
        </div>

        <CollectionEditor
          collection={collection}
          ringCores={ringCores}
          selectedRingCoreIds={selectedRingCoreIds}
          updateAction={updateCollection}
          deleteAction={deleteCollection}
        />
      </div>
    </main>
  );
}