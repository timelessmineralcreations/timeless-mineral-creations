import Stripe from "stripe";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



function centsToDollars(amount) {
  if (typeof amount !== "number") {
    return null;
  }

  return amount / 100;
}

function safeParseJson(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function stringifyValue(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function getConfiguration(metadata = {}) {
  const possibleConfiguration =
    metadata.configurationJson ||
    metadata.configuration ||
    metadata.designConfiguration ||
    metadata.cartItem;

  return safeParseJson(possibleConfiguration) || {};
}

function getMetadataValue(metadata, configuration, possibleKeys) {
  for (const key of possibleKeys) {
    const configurationValue = configuration?.[key];

    if (
      configurationValue !== undefined &&
      configurationValue !== null &&
      configurationValue !== ""
    ) {
      return stringifyValue(configurationValue);
    }

    const metadataValue = metadata?.[key];

    if (
      metadataValue !== undefined &&
      metadataValue !== null &&
      metadataValue !== ""
    ) {
      return stringifyValue(metadataValue);
    }
  }

  return null;
}

async function sendOrderConfirmationEmail(order) {
  const apiKey = String(
    process.env.RESEND_API_KEY || ""
  ).trim();

  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is missing. Order confirmation email was not sent."
    );
    return false;
  }

  if (!order?.customerEmail) {
    console.warn(
      `Order ${order?.id || "unknown"} has no customer email address.`
    );
    return false;
  }

  if (order.confirmationEmailSentAt) {
    return true;
  }

  const resend = new Resend(apiKey);

  const fromEmail =
    String(
      process.env.RESEND_FROM_EMAIL || ""
    ).trim() ||
    "Timeless Mineral Creations <onboarding@resend.dev>";

  const total = Number(
    order.totalPrice || 0
  ).toFixed(2);

  const result =
    await resend.emails.send(
      {
        from: fromEmail,
        to: [order.customerEmail],
        subject:
          "Order Confirmed - Timeless Mineral Creations",
        text:
          `Thank you for your order with Timeless Mineral Creations.

Your payment has been received successfully.

Order total: $${total}

Your order is now awaiting your memorial materials. We will keep you updated as your order moves through production.

Thank you for trusting Timeless Mineral Creations with something so meaningful.`,
        html:
          `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:620px;margin:0 auto;">
            <h2>Thank You For Your Order</h2>
            <p>Thank you for choosing Timeless Mineral Creations.</p>
            <p>Your payment has been received successfully.</p>
            <p><strong>Order total: $${total}</strong></p>
            <p>Your order is now awaiting your memorial materials. We will keep you updated as your order moves through production.</p>
            <p>Thank you for trusting Timeless Mineral Creations with something so meaningful.</p>
          </div>`,
      },
      {
        idempotencyKey:
          `order-confirmation/${order.id}`,
      }
    );

  if (result.error) {
    throw new Error(
      result.error.message ||
        "Resend failed to send the confirmation email."
    );
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      confirmationEmailSentAt:
        new Date(),
    },
  });

  console.log(
    "Customer confirmation email sent:",
    {
      orderId: order.id,
      customerEmail:
        order.customerEmail,
      resendEmailId:
        result.data?.id || null,
    }
  );

  return true;
}
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature failed:", error.message);

    return Response.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const webhookSession = event.data.object;

        const session = await stripe.checkout.sessions.retrieve(
          webhookSession.id,
          {
            expand: [
              "line_items.data.price.product",
              "payment_intent",
            ],
          }
        );

        if (
          session.payment_status !== "paid" &&
          event.type !== "checkout.session.async_payment_succeeded"
        ) {
          console.log(
            `Checkout session ${session.id} is not paid yet. Current status: ${session.payment_status}`
          );

          break;
        }

        const existingOrder = await prisma.order.findUnique({
          where: {
            stripeSessionId: session.id,
          },
        });

        if (existingOrder) {
          console.log(
            `Order already exists for Stripe session ${session.id}.`
          );

          break;
        }

        const customerDetails = session.customer_details;

        const shippingDetails =
          session.collected_information?.shipping_details ||
          session.shipping_details ||
          null;

        const shippingAddress =
          shippingDetails?.address ||
          customerDetails?.address ||
          null;

        const stripeLineItems = session.line_items?.data || [];

        const orderItems = stripeLineItems.map((lineItem) => {
          const product =
            lineItem.price?.product &&
            typeof lineItem.price.product === "object"
              ? lineItem.price.product
              : null;

          const metadata = product?.metadata || {};
          const configuration = getConfiguration(metadata);

          const quantity = lineItem.quantity || 1;

          const lineTotal =
            typeof lineItem.amount_total === "number"
              ? lineItem.amount_total / 100
              : 0;

          const unitPrice =
            quantity > 0
              ? lineTotal / quantity
              : lineTotal;

          const productName =
            product?.name ||
            lineItem.description ||
            "Custom Memorial Jewelry";

          const productType =
            getMetadataValue(metadata, configuration, [
              "productType",
              "type",
              "category",
            ]) || "Custom Jewelry";

          const collectionName =
            getMetadataValue(metadata, configuration, [
              "collectionName",
              "collection",
              "collectionTitle",
            ]) || productName;

          const configurationJson =
            Object.keys(configuration).length > 0
              ? JSON.stringify(configuration)
              : Object.keys(metadata).length > 0
                ? JSON.stringify(metadata)
                : null;

          return {
            productType,
            productName,
            collectionName,
            quantity,
            unitPrice,

            material: getMetadataValue(metadata, configuration, [
              "material",
              "selectedMaterial",
              "finish",
              "selectedFinish",
            ]),

            core: getMetadataValue(metadata, configuration, [
              "core",
              "selectedCore",
              "coreName",
            ]),

            style: getMetadataValue(metadata, configuration, [
              "style",
              "selectedStyle",
              "inlayStyle",
              "selectedInlayStyle",
            ]),

            width: getMetadataValue(metadata, configuration, [
              "width",
              "selectedWidth",
            ]),

            size: getMetadataValue(metadata, configuration, [
              "size",
              "selectedSize",
              "ringSize",
            ]),

            design: getMetadataValue(metadata, configuration, [
              "design",
              "designName",
              "selectedDesign",
            ]),

            memorialMaterials: getMetadataValue(
              metadata,
              configuration,
              [
                "memorialMaterials",
                "selectedMaterials",
                "memorialMaterial",
              ]
            ),

            minerals: getMetadataValue(metadata, configuration, [
              "minerals",
              "selectedMinerals",
              "mineral",
            ]),

            accentMaterials: getMetadataValue(
              metadata,
              configuration,
              [
                "accentMaterials",
                "selectedAccentMaterials",
                "accents",
              ]
            ),

            glow: getMetadataValue(metadata, configuration, [
              "glow",
              "selectedGlow",
              "glowColor",
            ]),

            engraving: getMetadataValue(metadata, configuration, [
              "engraving",
              "engravingText",
              "selectedEngraving",
            ]),

            configurationJson,
          };
        });

        if (orderItems.length === 0) {
          orderItems.push({
            productType: "Custom Jewelry",
            productName: "Custom Memorial Jewelry",
            collectionName: "Custom Memorial Jewelry",
            quantity: 1,
            unitPrice: centsToDollars(session.amount_total) || 0,
            material: null,
            core: null,
            style: null,
            width: null,
            size: null,
            design: null,
            memorialMaterials: null,
            minerals: null,
            accentMaterials: null,
            glow: null,
            engraving: null,
            configurationJson: session.metadata
              ? JSON.stringify(session.metadata)
              : null,
          });
        }

        const order = await prisma.order.create({
          data: {
            stripeSessionId: session.id,

            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,

            paymentStatus: session.payment_status || "paid",

            customerName:
              customerDetails?.name ||
              shippingDetails?.name ||
              null,

            customerEmail:
              customerDetails?.email ||
              session.customer_email ||
              null,

            customerNote: session.metadata?.customerNote || null,

            customerPhone:
              customerDetails?.phone ||
              null,

            shippingName:
              shippingDetails?.name ||
              customerDetails?.name ||
              null,

            shippingAddress1:
              shippingAddress?.line1 ||
              null,

            shippingAddress2:
              shippingAddress?.line2 ||
              null,

            shippingCity:
              shippingAddress?.city ||
              null,

            shippingState:
              shippingAddress?.state ||
              null,

            shippingPostal:
              shippingAddress?.postal_code ||
              null,

            shippingCountry:
              shippingAddress?.country ||
              null,

            subtotal: centsToDollars(session.amount_subtotal),

            shippingCost: centsToDollars(
              session.total_details?.amount_shipping
            ),

            taxAmount: centsToDollars(
              session.total_details?.amount_tax
            ),

            totalPrice:
              centsToDollars(session.amount_total) || 0,

            status: "Awaiting Memorial Materials",

            items: {
              create: orderItems,
            },
          },

          include: {
            items: true,
          },
        });

        console.log("✅ Order saved to Prisma:", {
          orderId: order.id,
          stripeSessionId: order.stripeSessionId,
          customerEmail: order.customerEmail,
          totalPrice: order.totalPrice,
          itemCount: order.items.length,
        });

        try {
          await sendOrderConfirmationEmail(
            order
          );
        } catch (emailError) {
          console.error(
            "Order was saved, but confirmation email failed:",
            emailError
          );
        }

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Failed to process Stripe webhook:", error);

    return Response.json(
      {
        error: "Failed to save the Stripe order.",
      },
      {
        status: 500,
      }
    );
  }
}