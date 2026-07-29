/*
  Warnings:

  - You are about to drop the column `collectionName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `design` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `engraving` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `glow` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `memorialMaterials` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `minerals` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Order` table. All the data in the column will be lost.
  - Made the column `stripeSessionId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "productType" TEXT,
    "productName" TEXT,
    "collectionName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    "material" TEXT,
    "core" TEXT,
    "style" TEXT,
    "width" TEXT,
    "size" TEXT,
    "design" TEXT,
    "memorialMaterials" TEXT,
    "minerals" TEXT,
    "accentMaterials" TEXT,
    "glow" TEXT,
    "engraving" TEXT,
    "configurationJson" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "stripeRefundId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "requestedByEmail" TEXT,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroImage" TEXT,
    "cardImage" TEXT,
    "startingPrice" REAL NOT NULL DEFAULT 0,
    "productType" TEXT NOT NULL DEFAULT 'Ring',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "comingSoon" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "configurationJson" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT
);

-- CreateTable
CREATE TABLE "CollectionPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "collectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CollectionPhoto_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RingCore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "finish" TEXT,
    "color" TEXT,
    "supplier" TEXT,
    "supplierUrl" TEXT,
    "supplierCostCents" INTEGER NOT NULL DEFAULT 0,
    "widthsJson" TEXT,
    "sizesJson" TEXT,
    "channelDimensionsJson" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CollectionRingCore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionId" TEXT NOT NULL,
    "ringCoreId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CollectionRingCore_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionRingCore_ringCoreId_fkey" FOREIGN KEY ("ringCoreId") REFERENCES "RingCore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InlayStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CollectionInlayStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionId" TEXT NOT NULL,
    "inlayStyleId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CollectionInlayStyle_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionInlayStyle_inlayStyleId_fkey" FOREIGN KEY ("inlayStyleId") REFERENCES "InlayStyle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mineral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "colorHex" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "BirthstoneMonth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "monthNumber" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CollectionBirthstoneOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "collectionId" TEXT NOT NULL,
    "birthstoneMonthId" TEXT NOT NULL,
    "mineralId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "priceAdjustmentCents" INTEGER NOT NULL DEFAULT 0,
    "defaultSelected" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CollectionBirthstoneOption_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionBirthstoneOption_birthstoneMonthId_fkey" FOREIGN KEY ("birthstoneMonthId") REFERENCES "BirthstoneMonth" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionBirthstoneOption_mineralId_fkey" FOREIGN KEY ("mineralId") REFERENCES "Mineral" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Paid',
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    "refundedAmountCents" INTEGER NOT NULL DEFAULT 0,
    "refundStatus" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "shippingName" TEXT,
    "shippingAddress1" TEXT,
    "shippingAddress2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostal" TEXT,
    "shippingCountry" TEXT,
    "subtotal" REAL,
    "shippingCost" REAL,
    "taxAmount" REAL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Awaiting Memorial Materials',
    "customerNote" TEXT,
    "internalNotes" TEXT,
    "coreConfirmedAt" DATETIME,
    "sizeConfirmedAt" DATETIME,
    "materialsPreparedAt" DATETIME,
    "buildCompletedAt" DATETIME,
    "engravingCompletedAt" DATETIME,
    "qualityCheckedAt" DATETIME,
    "photosTakenAt" DATETIME,
    "packagedAt" DATETIME,
    "incomingCarrier" TEXT,
    "incomingTrackingNumber" TEXT,
    "incomingTrackingStatus" TEXT,
    "incomingEstimatedDate" DATETIME,
    "incomingDeliveredAt" DATETIME,
    "materialsReceivedAt" DATETIME,
    "materialsVerifiedAt" DATETIME,
    "waitingReminderSentAt" DATETIME,
    "waitingReminderMuted" BOOLEAN NOT NULL DEFAULT false,
    "outgoingCarrier" TEXT,
    "outgoingTrackingNumber" TEXT,
    "outgoingTrackingStatus" TEXT,
    "outgoingLabelUrl" TEXT,
    "outgoingShippedAt" DATETIME,
    "outgoingDeliveredAt" DATETIME
);
INSERT INTO "new_Order" ("createdAt", "customerEmail", "customerName", "customerPhone", "id", "paymentStatus", "status", "stripeSessionId", "totalPrice", "updatedAt") SELECT "createdAt", "customerEmail", "customerName", "customerPhone", "id", "paymentStatus", "status", "stripeSessionId", "totalPrice", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_stripeRefundId_key" ON "Refund"("stripeRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RingCore_slug_key" ON "RingCore"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionRingCore_collectionId_ringCoreId_key" ON "CollectionRingCore"("collectionId", "ringCoreId");

-- CreateIndex
CREATE UNIQUE INDEX "InlayStyle_slug_key" ON "InlayStyle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionInlayStyle_collectionId_inlayStyleId_key" ON "CollectionInlayStyle"("collectionId", "inlayStyleId");

-- CreateIndex
CREATE UNIQUE INDEX "Mineral_slug_key" ON "Mineral"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BirthstoneMonth_monthNumber_key" ON "BirthstoneMonth"("monthNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionBirthstoneOption_collectionId_birthstoneMonthId_mineralId_key" ON "CollectionBirthstoneOption"("collectionId", "birthstoneMonthId", "mineralId");
