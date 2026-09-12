import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { easypost } from "@/lib/easypost";

export const runtime = "nodejs";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTrackingUrl(trackingNumber) {
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
    trackingNumber
  )}`;
}

function buildShippingEmailHtml({
  order,
  businessName,
  trackingNumber,
}) {
  const customerName =
    order.customerName ||
    order.shippingName ||
    "there";

  const trackingUrl =
    getTrackingUrl(trackingNumber);

  return `
    <!DOCTYPE html>
    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#f5f5f5;
          font-family:Arial,Helvetica,sans-serif;
          color:#222222;
        "
      >
        <div
          style="
            max-width:620px;
            margin:0 auto;
            padding:32px 18px;
          "
        >
          <div
            style="
              background:#ffffff;
              border-radius:14px;
              padding:32px;
              border:1px solid #e5e5e5;
            "
          >
            <h1
              style="
                margin:0 0 20px;
                font-size:26px;
                color:#222222;
              "
            >
              Your order has shipped
            </h1>

            <p
              style="
                margin:0 0 18px;
                font-size:16px;
                line-height:1.7;
              "
            >
              Hi ${escapeHtml(customerName)},
            </p>

            <p
              style="
                margin:0 0 18px;
                font-size:16px;
                line-height:1.7;
              "
            >
              Your completed order from
              <strong>${escapeHtml(
                businessName
              )}</strong>
              has been packaged and shipped through USPS Ground Advantage.
            </p>

            <div
              style="
                margin:24px 0;
                padding:18px;
                background:#f8f8f8;
                border-radius:10px;
                border:1px solid #e5e5e5;
              "
            >
              <div
                style="
                  margin-bottom:6px;
                  font-size:13px;
                  color:#666666;
                  text-transform:uppercase;
                  font-weight:bold;
                "
              >
                USPS Tracking Number
              </div>

              <div
                style="
                  font-size:18px;
                  font-weight:bold;
                  word-break:break-all;
                "
              >
                ${escapeHtml(
                  trackingNumber
                )}
              </div>
            </div>

            <a
              href="${trackingUrl}"
              style="
                display:inline-block;
                padding:13px 20px;
                background:#d4af37;
                color:#111111;
                text-decoration:none;
                border-radius:9px;
                font-weight:bold;
              "
            >
              Track Your Package
            </a>

            <p
              style="
                margin:28px 0 0;
                font-size:15px;
                line-height:1.7;
                color:#555555;
              "
            >
              USPS tracking may take a little time to begin showing movement after the shipping label is created.
            </p>

            <p
              style="
                margin:26px 0 0;
                font-size:16px;
                line-height:1.7;
              "
            >
              Thank you for trusting me to create something meaningful for you.
            </p>

            <p
              style="
                margin:10px 0 0;
                font-size:16px;
                font-weight:bold;
              "
            >
              ${escapeHtml(
                businessName
              )}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildShippingEmailText({
  order,
  businessName,
  trackingNumber,
}) {
  const customerName =
    order.customerName ||
    order.shippingName ||
    "there";

  const trackingUrl =
    getTrackingUrl(trackingNumber);

  return `
Hi ${customerName},

Your completed order from ${businessName} has been packaged and shipped through USPS Ground Advantage.

USPS TRACKING NUMBER

${trackingNumber}

Track your package:
${trackingUrl}

USPS tracking may take a little time to begin showing movement after the shipping label is created.

Thank you for trusting me to create something meaningful for you.

${businessName}
  `.trim();
}

async function sendShippingEmail({
  order,
  trackingNumber,
}) {
  if (!order.customerEmail) {
    return {
      sent: false,
      reason:
        "This order does not have a customer email address.",
    };
  }

  /*
   * Do not send the same shipping
   * notification more than once.
   */
  if (order.shippingEmailSentAt) {
    return {
      sent: true,
      alreadySent: true,
    };
  }

  if (!process.env.RESEND_API_KEY) {
    return {
      sent: false,
      reason:
        "RESEND_API_KEY is not configured.",
    };
  }

  const settings =
    await prisma.siteSettings.findUnique({
      where: {
        id: "site-settings",
      },

      select: {
        businessName: true,
        contactEmail: true,
      },
    });

  const businessName =
    settings?.businessName ||
    "Timeless Mineral Creations";

  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Timeless Mineral Creations <onboarding@resend.dev>";

  const resend =
    new Resend(
      process.env.RESEND_API_KEY
    );

  const emailPayload = {
    from:
      fromEmail,

    to: [
      order.customerEmail,
    ],

    subject:
      `Your order has shipped — ${businessName}`,

    html:
      buildShippingEmailHtml({
        order,
        businessName,
        trackingNumber,
      }),

    text:
      buildShippingEmailText({
        order,
        businessName,
        trackingNumber,
      }),

    ...(settings?.contactEmail
      ? {
          replyTo:
            settings.contactEmail,
        }
      : {}),
  };

  const {
    data: emailData,
    error: emailError,
  } =
    await resend.emails.send(
      emailPayload,
      {
        /*
         * Resend also protects against
         * accidental duplicate requests.
         */
        idempotencyKey:
          `shipping-confirmation/${order.id}`,
      }
    );

  if (emailError) {
    throw new Error(
      emailError.message ||
        "Resend could not send the shipping email."
    );
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },

    data: {
      shippingEmailSentAt:
        new Date(),
    },
  });

  console.log(
    "Customer shipping email sent:",
    {
      orderId:
        order.id,

      resendEmailId:
        emailData?.id || null,
    }
  );

  return {
    sent: true,
    alreadySent: false,
  };
}

export async function POST(
  request,
  { params }
) {
  try {
    const session =
      await auth();

    const sessionEmail =
      session?.user?.email?.toLowerCase();

    const adminEmail =
      process.env.ADMIN_EMAIL?.toLowerCase();

    if (
      !sessionEmail ||
      !adminEmail ||
      sessionEmail !== adminEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await params;

    const body =
      await request.json();

    const shipmentId =
      typeof body?.shipmentId === "string"
        ? body.shipmentId.trim()
        : "";

    const rateId =
      typeof body?.rateId === "string"
        ? body.rateId.trim()
        : "";

    if (
      !shipmentId ||
      !rateId
    ) {
      return NextResponse.json(
        {
          error:
            "Shipment and shipping rate are required.",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    const shipment =
      await easypost.Shipment.retrieve(
        shipmentId
      );

    if (
      shipment.reference !==
      order.id
    ) {
      return NextResponse.json(
        {
          error:
            "This EasyPost shipment does not belong to this order.",
        },
        {
          status: 400,
        }
      );
    }

    const shipmentMode =
      shipment.mode === "production"
        ? "production"
        : "test";

    const isTestMode =
      shipmentMode === "test";

    /*
     * A real order should never
     * accidentally purchase a second
     * production label here.
     */
    if (
      !isTestMode &&
      order.outgoingTrackingNumber
    ) {
      return NextResponse.json(
        {
          error:
            "This order already has an outgoing tracking number.",
        },
        {
          status: 400,
        }
      );
    }

    const selectedRate = (
      shipment.rates || []
    ).find(
      (rate) =>
        rate.id === rateId
    );

    if (!selectedRate) {
      return NextResponse.json(
        {
          error:
            "The selected shipping rate could not be found.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      selectedRate.carrier !== "USPS" ||
      selectedRate.service !==
        "GroundAdvantage"
    ) {
      return NextResponse.json(
        {
          error:
            "Only USPS Ground Advantage can be purchased here.",
        },
        {
          status: 400,
        }
      );
    }

    const purchasedShipment =
      await easypost.Shipment.buy(
        shipmentId,
        selectedRate
      );

    const trackingNumber =
      purchasedShipment.tracking_code ||
      null;

    const originalLabelUrl =
      purchasedShipment.postage_label
        ?.label_url || null;

    if (
      !trackingNumber ||
      !originalLabelUrl
    ) {
      return NextResponse.json(
        {
          error:
            "EasyPost created the label but did not return the expected tracking or label information.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Get the printable PDF version.
     */
    let printableLabelUrl =
      purchasedShipment.postage_label
        ?.label_pdf_url || null;

    if (!printableLabelUrl) {
      try {
        const convertedShipment =
          await easypost.Shipment
            .convertLabelFormat(
              shipmentId,
              "PDF"
            );

        printableLabelUrl =
          convertedShipment.postage_label
            ?.label_pdf_url ||
          convertedShipment.postage_label
            ?.label_url ||
          null;
      } catch (
        conversionError
      ) {
        console.error(
          "EasyPost PDF label conversion error:",
          conversionError
        );
      }
    }

    /*
     * Use the original label if PDF
     * conversion ever fails.
     */
    const labelUrl =
      printableLabelUrl ||
      originalLabelUrl;

    /*
     * TEST MODE
     *
     * Absolutely no database shipping
     * changes and no customer email.
     */
    if (isTestMode) {
      return NextResponse.json({
        success: true,

        mode:
          "test",

        testMode:
          true,

        trackingNumber,

        labelUrl,

        originalLabelUrl,

        carrier:
          "USPS",

        service:
          "Ground Advantage",

        rate:
          selectedRate.rate,

        orderStatus:
          order.status,

        orderUpdated:
          false,

        shippingEmailSent:
          false,
      });
    }

    /*
     * PRODUCTION MODE
     *
     * Save the purchased label FIRST.
     * This is important because postage
     * has already been purchased.
     */
    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          outgoingCarrier:
            "USPS",

          outgoingTrackingNumber:
            trackingNumber,

          outgoingTrackingStatus:
            "Pre-Transit",

          outgoingLabelUrl:
            labelUrl,

          outgoingShippedAt:
            new Date(),

          status:
            "Shipped",
        },
      });

    /*
     * Now send the customer shipping
     * notification.
     *
     * Email failure must NOT make the
     * label purchase appear to have
     * failed, because real postage has
     * already been purchased.
     */
    let shippingEmailSent =
      false;

    let shippingEmailWarning =
      null;

    try {
      const emailResult =
        await sendShippingEmail({
          order: updatedOrder,
          trackingNumber,
        });

      shippingEmailSent =
        Boolean(
          emailResult.sent
        );

      if (
        !emailResult.sent &&
        emailResult.reason
      ) {
        shippingEmailWarning =
          emailResult.reason;
      }
    } catch (emailError) {
      console.error(
        "Shipping email failed:",
        emailError
      );

      shippingEmailWarning =
        "The shipping label was purchased successfully, but the customer shipping email could not be sent.";
    }

    return NextResponse.json({
      success: true,

      mode:
        "production",

      testMode:
        false,

      trackingNumber,

      labelUrl,

      originalLabelUrl,

      carrier:
        "USPS",

      service:
        "Ground Advantage",

      rate:
        selectedRate.rate,

      orderStatus:
        updatedOrder.status,

      orderUpdated:
        true,

      shippingEmailSent,

      shippingEmailWarning,
    });
  } catch (error) {
    console.error(
      "EasyPost label purchase error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to purchase the shipping label.",
      },
      {
        status: 500,
      }
    );
  }
}