import { NextResponse } from "next/server";
import Stripe from "stripe";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await auth();

    if (
      !session?.user?.email ||
      session.user.email !==
        "timelessmineralcreations@gmail.com"
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim()
        : "";

    const amountCents = Number(body.amountCents);

    const internalReason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(amountCents) ||
      amountCents <= 0
    ) {
      return NextResponse.json(
        { error: "Enter a valid refund amount." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (!order.paymentIntentId) {
      return NextResponse.json(
        {
          error:
            "This order does not have a Stripe Payment Intent.",
        },
        { status: 400 }
      );
    }

    const totalCents = Math.round(
      Number(order.totalPrice) * 100
    );

    const remainingCents =
      totalCents - order.refundedAmountCents;

    if (remainingCents <= 0) {
      return NextResponse.json(
        { error: "This order is already fully refunded." },
        { status: 400 }
      );
    }

    if (amountCents > remainingCents) {
      return NextResponse.json(
        {
          error: `The maximum remaining refund is $${(
            remainingCents / 100
          ).toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    const stripeRefund =
      await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
        amount: amountCents,
        reason: "requested_by_customer",
        metadata: {
          orderId: order.id,
          internalReason:
            internalReason || "No reason provided",
          requestedBy:
            session.user.email,
        },
      });

    const newRefundedTotal =
      order.refundedAmountCents +
      stripeRefund.amount;

    const isFullyRefunded =
      newRefundedTotal >= totalCents;

    const updatedOrder =
      await prisma.$transaction(async (tx) => {
        await tx.refund.create({
          data: {
            orderId: order.id,
            stripeRefundId: stripeRefund.id,
            amountCents: stripeRefund.amount,
            status:
              stripeRefund.status || "pending",
            reason: internalReason || null,
            requestedByEmail:
              session.user.email,
          },
        });

        return tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            refundedAmountCents:
              newRefundedTotal,
            refundStatus: isFullyRefunded
              ? "Fully Refunded"
              : "Partially Refunded",
            paymentStatus: isFullyRefunded
              ? "Refunded"
              : "Partially Refunded",
          },
        });
      });

    return NextResponse.json({
      success: true,
      refund: {
        id: stripeRefund.id,
        amountCents: stripeRefund.amount,
        status:
          stripeRefund.status || "pending",
      },
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Failed to issue Stripe refund:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to issue the refund.",
      },
      { status: 500 }
    );
  }
}