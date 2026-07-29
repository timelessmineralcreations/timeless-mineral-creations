import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedStatuses = [
  "Awaiting Memorial Materials",
  "Materials Received",
  "Preparing Materials",
  "In Production",
  "Quality Check",
  "Ready to Ship",
  "Shipped",
  "Completed",
  "Cancelled",
];

function cleanOptionalString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();
  return cleanedValue || null;
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return Response.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const data = {};

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return Response.json(
          { error: "Invalid production status." },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    if (body.internalNotes !== undefined) {
      data.internalNotes = cleanOptionalString(body.internalNotes);
    }

    if (body.incomingCarrier !== undefined) {
      data.incomingCarrier = cleanOptionalString(body.incomingCarrier);
    }

    if (body.incomingTrackingNumber !== undefined) {
      data.incomingTrackingNumber = cleanOptionalString(
        body.incomingTrackingNumber
      );
    }

    if (body.incomingTrackingStatus !== undefined) {
      data.incomingTrackingStatus = cleanOptionalString(
        body.incomingTrackingStatus
      );
    }

    if (body.materialsReceived === true) {
      data.materialsReceivedAt =
        existingOrder.materialsReceivedAt || new Date();

      if (
        existingOrder.status === "Awaiting Memorial Materials" &&
        body.status === undefined
      ) {
        data.status = "Materials Received";
      }
    }

    if (body.materialsReceived === false) {
      data.materialsReceivedAt = null;
    }

    if (body.materialsVerified === true) {
      data.materialsVerifiedAt =
        existingOrder.materialsVerifiedAt || new Date();
    }

    if (body.materialsVerified === false) {
      data.materialsVerifiedAt = null;
    }

    if (body.waitingReminderMuted !== undefined) {
      data.waitingReminderMuted = Boolean(
        body.waitingReminderMuted
      );
    }

    if (body.outgoingCarrier !== undefined) {
      data.outgoingCarrier = cleanOptionalString(body.outgoingCarrier);
    }

    if (body.outgoingTrackingNumber !== undefined) {
      data.outgoingTrackingNumber = cleanOptionalString(
        body.outgoingTrackingNumber
      );
    }

    if (body.outgoingTrackingStatus !== undefined) {
      data.outgoingTrackingStatus = cleanOptionalString(
        body.outgoingTrackingStatus
      );
    }

    if (body.outgoingShipped === true) {
      data.outgoingShippedAt =
        existingOrder.outgoingShippedAt || new Date();

      data.status = "Shipped";
    }

    if (body.outgoingShipped === false) {
      data.outgoingShippedAt = null;
    }

    if (body.coreConfirmed === true) {
      data.coreConfirmedAt =
        existingOrder.coreConfirmedAt || new Date();
    }

    if (body.coreConfirmed === false) {
      data.coreConfirmedAt = null;
    }

    if (body.sizeConfirmed === true) {
      data.sizeConfirmedAt =
        existingOrder.sizeConfirmedAt || new Date();
    }

    if (body.sizeConfirmed === false) {
      data.sizeConfirmedAt = null;
    }

    if (body.materialsPrepared === true) {
      data.materialsPreparedAt =
        existingOrder.materialsPreparedAt || new Date();

      if (body.status === undefined) {
        data.status = "Preparing Materials";
      }
    }

    if (body.materialsPrepared === false) {
      data.materialsPreparedAt = null;
    }

    if (body.buildCompleted === true) {
      data.buildCompletedAt =
        existingOrder.buildCompletedAt || new Date();

      if (body.status === undefined) {
        data.status = "In Production";
      }
    }

    if (body.buildCompleted === false) {
      data.buildCompletedAt = null;
    }

    if (body.engravingCompleted === true) {
      data.engravingCompletedAt =
        existingOrder.engravingCompletedAt || new Date();
    }

    if (body.engravingCompleted === false) {
      data.engravingCompletedAt = null;
    }

    if (body.qualityChecked === true) {
      data.qualityCheckedAt =
        existingOrder.qualityCheckedAt || new Date();

      if (body.status === undefined) {
        data.status = "Quality Check";
      }
    }

    if (body.qualityChecked === false) {
      data.qualityCheckedAt = null;
    }

    if (body.photosTaken === true) {
      data.photosTakenAt =
        existingOrder.photosTakenAt || new Date();
    }

    if (body.photosTaken === false) {
      data.photosTakenAt = null;
    }

    if (body.packaged === true) {
      data.packagedAt =
        existingOrder.packagedAt || new Date();

      if (body.status === undefined) {
        data.status = "Ready to Ship";
      }
    }

    if (body.packaged === false) {
      data.packagedAt = null;
    }
// Cancel order
if (body.cancelOrder === true) {
  data.status = "Cancelled";
  data.cancelledAt =
    existingOrder.cancelledAt || new Date();

  data.cancellationReason = cleanOptionalString(
    body.cancellationReason
  );
}

// Restore cancelled order
if (body.cancelOrder === false) {
  data.cancelledAt = null;
  data.cancellationReason = null;

  if (existingOrder.status === "Cancelled") {
    data.status = "Awaiting Memorial Materials";
  }
}
    if (Object.keys(data).length === 0) {
      return Response.json(
        { error: "No valid order changes were provided." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });

    return Response.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Failed to update order:", error);

    return Response.json(
      { error: "Unable to update the order." },
      { status: 500 }
    );
  }
}