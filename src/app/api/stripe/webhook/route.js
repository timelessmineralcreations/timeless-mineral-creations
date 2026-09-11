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

function formatEmailMoney(value) {
  const amount = Number(value || 0);

  return Number.isFinite(amount)
    ? amount.toFixed(2)
    : "0.00";
}

function escapeEmailHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEmailOrderNumber(id) {
  const value =
    String(id || "").trim();

  if (!value) {
    return "ORDER";
  }

  return `ORD-${value
    .slice(-8)
    .toUpperCase()}`;
}

function getEmailItemDetails(item) {
  const configuration =
    safeParseJson(
      item?.configurationJson
    ) || {};

  const specialRequest =
    String(
      configuration.specialRequest || ""
    ).trim();

  return [
    ["Material", item?.material],
    ["Core", item?.core],
    ["Style", item?.style],
    ["Width", item?.width],
    [
      "Channel Width",
      configuration.channelWidth,
    ],
    ["Size", item?.size],
    ["Design", item?.design],
    [      "Memorial Material",
      item?.memorialMaterials,
    ],
    ["Mineral", item?.minerals],
    [
      "Accent Material",
      item?.accentMaterials,
    ],
    ["Glow", item?.glow],
    [
      "Channels / Sections",
      configuration.channels,
    ],
    ["Engraving", item?.engraving],
    [
      "Engraving Font",
      configuration.engravingFont,
    ],
    [
      "Special Request",
      specialRequest &&
      specialRequest.toLowerCase() !== "no"
        ? specialRequest
        : "",
    ],
  ].filter(([, value]) =>
    String(value ?? "").trim()
  );
}

async function sendOrderConfirmationEmail(order, context = {}) {
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

  const resend =
    new Resend(apiKey);

  const fromEmail =
    String(
      process.env.RESEND_FROM_EMAIL || ""
    ).trim() ||
    "Timeless Mineral Creations <onboarding@resend.dev>";

  const orderNumber =
    getEmailOrderNumber(order.id);

  const siteSettings =
    await getEmailSiteSettings();

  const shippingMethod =
    String(
      context.shippingMethod || ""
    ).trim() ||
    "USPS shipping";

  const salePercent =
    Math.max(
      0,
      Math.min(
        100,
        Number(context.salePercent || 0)
      )
    );

  const saleName =
    String(
      context.saleName || ""
    ).trim() ||
    "Sitewide Sale";

  const memorialAddressLines = [
    siteSettings.businessName,
    siteSettings.addressLine1,
    siteSettings.addressLine2,
    [
      siteSettings.city,
      siteSettings.state,
      siteSettings.postalCode,
    ]
      .filter(Boolean)
      .join(", ")
      .replace(
        /,\s*([^,]+)$/,
        " $1"
      ),
    siteSettings.country,
  ]
    .map((value) =>
      String(value || "").trim()
    )
    .filter(Boolean);

  const memorialAddressText =
    memorialAddressLines.join("\n");

  const memorialAddressHtml =
    memorialAddressLines
      .map(escapeEmailHtml)
      .join("<br>");

  const shippingInstructions =
    String(
      siteSettings.shippingInstructions || ""
    ).trim();

  const memorialInstructions =
    String(
      siteSettings.memorialInstructions || ""
    ).trim();

  const items =
    Array.isArray(order.items)
      ? order.items      : [];

  const textItems =
    items.length > 0
      ? items
          .map((item, index) => {
            const quantity =
              Number(item?.quantity || 1);

            const unitPrice =
              Number(item?.unitPrice || 0);

            const productName =
              String(
                item?.productName ||
                  item?.collectionName ||
                  "Custom Memorial Jewelry"
              ).trim();

            const collectionName =
              String(
                item?.collectionName || ""
              ).trim();

            const details =
              getEmailItemDetails(item)
                .map(
                  ([label, value]) =>
                    `${label}: ${String(
                      value
                    ).trim()}`
                )
                .join("\n");

            const collectionLine =
              collectionName &&
              collectionName !==
                productName
                ? `\nCollection: ${collectionName}`
                : "";

            return `${index + 1}. ${productName}${collectionLine}
Quantity: ${quantity}
Price: $${formatEmailMoney(
              unitPrice
            )}${
              details
                ? `\n${details}`
                : ""
            }`;
          })
          .join("\n\n")
      : "Custom Memorial Jewelry";

  const htmlItems =
    items.length > 0
      ? items
          .map((item) => {
            const quantity =
              Number(item?.quantity || 1);

            const unitPrice =
              Number(item?.unitPrice || 0);

            const productName =
              String(
                item?.productName ||
                  item?.collectionName ||
                  "Custom Memorial Jewelry"
              ).trim();

            const collectionName =
              String(
                item?.collectionName || ""
              ).trim();

            const details =
              getEmailItemDetails(item);

            const detailHtml =
              details.length > 0
                ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;">${details
                    .map(
                      ([label, value]) =>
                        `<tr>
                          <td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;width:42%;">
                            ${escapeEmailHtml(
                              label
                            )}
                          </td>
                          <td style="padding:4px 0;font-weight:600;vertical-align:top;">
                            ${escapeEmailHtml(
                              value
                            )}
                          </td>
                        </tr>`
                    )
                    .join("")}</table>`
                : "";

            const collectionHtml =
              collectionName &&
              collectionName !==
                productName
                ? `<div style="color:#666;margin-top:3px;">
                    ${escapeEmailHtml(
                      collectionName
                    )}
                  </div>`
                : "";

            return `<div style="border:1px solid #e5e5e5;border-radius:12px;padding:18px;margin:0 0 16px;">
              <div style="font-size:18px;font-weight:700;">
                ${escapeEmailHtml(
                  productName
                )}
              </div>

              ${collectionHtml}

              <div style="margin-top:10px;">
                Quantity: ${quantity}
              </div>

              <div>
                Price: $${formatEmailMoney(
                  unitPrice
                )}
              </div>

              ${detailHtml}
            </div>`;
          })
          .join("")
      : `<div style="border:1px solid #e5e5e5;border-radius:12px;padding:18px;">
          Custom Memorial Jewelry
        </div>`;

  const shippingLines = [
    order.shippingName,
    order.shippingAddress1,
    order.shippingAddress2,
    [
      order.shippingCity,
      order.shippingState,
      order.shippingPostal,
    ]
      .filter(Boolean)
      .join(", ")
      .replace(
        /,\s*([^,]+)$/,
        " $1"
      ),
    order.shippingCountry,
  ]
    .map((value) =>
      String(value || "").trim()
    )
    .filter(Boolean);

  const shippingText =
    shippingLines.length > 0
      ? shippingLines.join("\n")
      : "Not provided";

  const shippingHtml =
    shippingLines.length > 0
      ? shippingLines
          .map(escapeEmailHtml)
          .join("<br>")
      : "Not provided";

  const customerNote =
    String(
      order.customerNote || ""
    ).trim();

  const text = `Thank you for your order with Timeless Mineral Creations.

Your payment has been received successfully.

ORDER ${orderNumber}

${textItems}

ORDER SUMMARY
Subtotal: $${formatEmailMoney(
    order.subtotal
  )}
Shipping (${shippingMethod}): $${formatEmailMoney(
    order.shippingCost
  )}
Tax: $${formatEmailMoney(    order.taxAmount
  )}
Total: $${formatEmailMoney(
    order.totalPrice
  )}${
    salePercent > 0
      ? `

SALE
${saleName}: ${salePercent}% off applied`
      : ""
  }

SHIPPING ADDRESS
${shippingText}${    customerNote
      ? `

CUSTOMER NOTE
${customerNote}`
      : ""
  }

CURRENT TURNAROUND
${siteSettings.turnaroundMinWeeks}-${siteSettings.turnaroundMaxWeeks} weeks${
    shippingInstructions
      ? `

SHIPPING INFORMATION
${shippingInstructions}`
      : ""
  }

MEMORIAL MATERIAL MAILING INSTRUCTIONS${
    memorialAddressText
      ? `

Mail memorial materials to:
${memorialAddressText}`
      : ""
  }${
    memorialInstructions
      ? `

${memorialInstructions}`
      : ""
  }

We will keep you updated as your order moves through production.

Thank you for trusting Timeless Mineral Creations with something so meaningful.`;
  const html =
    `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:650px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">
        Thank You For Your Order
      </h2>

      <p>
        Thank you for choosing Timeless Mineral Creations.
      </p>

      <p>
        Your payment has been received successfully.
      </p>

      <div style="background:#f6f6f6;border-radius:10px;padding:14px 18px;margin:24px 0;">
        <strong>Order ${escapeEmailHtml(
          orderNumber
        )}</strong>
      </div>

      <h3>Your Order</h3>

      ${htmlItems}

      <h3 style="margin-top:28px;">
        Order Summary
      </h3>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;">
            Subtotal
          </td>
          <td style="padding:5px 0;text-align:right;">
            $${formatEmailMoney(
              order.subtotal
            )}
          </td>
        </tr>

        <tr>
          <td style="padding:5px 0;">
            Shipping (${escapeEmailHtml(
              shippingMethod
            )})
          </td>
          <td style="padding:5px 0;text-align:right;">
            $${formatEmailMoney(              order.shippingCost
            )}
          </td>
        </tr>

        <tr>
          <td style="padding:5px 0;">
            Tax
          </td>
          <td style="padding:5px 0;text-align:right;">
            $${formatEmailMoney(
              order.taxAmount
            )}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;border-top:1px solid #ddd;font-size:18px;font-weight:700;">
            Total
          </td>
          <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;font-size:18px;font-weight:700;">
            $${formatEmailMoney(
              order.totalPrice
            )}
          </td>
        </tr>
      </table>

      ${
        salePercent > 0
          ? `<p style="margin-top:10px;font-weight:700;">
               ${escapeEmailHtml(
                 saleName
               )}: ${salePercent}% off applied
             </p>`
          : ""
      }

      <h3 style="margin-top:28px;">
        Shipping Address
      </h3>
      <p>
        ${shippingHtml}
      </p>

      ${
        customerNote
          ? `<h3 style="margin-top:28px;">Customer Note</h3>
             <p>${escapeEmailHtml(
               customerNote
             ).replace(/\n/g, "<br>")}</p>`
          : ""
      }

      <h3 style="margin-top:28px;">
        Current Turnaround
      </h3>

      <p>
        ${siteSettings.turnaroundMinWeeks}-${siteSettings.turnaroundMaxWeeks} weeks
      </p>

      ${
        shippingInstructions
          ? `<h3 style="margin-top:28px;">Shipping Information</h3>
             <p>${escapeEmailHtml(
               shippingInstructions
             ).replace(/\n/g, "<br>")}</p>`
          : ""
      }

      <div style="margin-top:28px;padding:18px;border:1px solid #e5e5e5;border-radius:12px;background:#fafafa;">
        <h3 style="margin-top:0;">
          Memorial Material Mailing Instructions
        </h3>

        ${
          memorialAddressHtml
            ? `<p>
                 <strong>Mail memorial materials to:</strong><br>
                 ${memorialAddressHtml}
               </p>`
            : ""
        }

        ${
          memorialInstructions
            ? `<p>${escapeEmailHtml(
                 memorialInstructions
               ).replace(/\n/g, "<br>")}</p>`
            : `<p>
                 Please contact Timeless Mineral Creations if you need memorial material mailing instructions.
               </p>`
        }
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e5e5;">
        <p>
          We will keep you updated as your order moves through production.
        </p>

        <p>          Thank you for trusting Timeless Mineral Creations with something so meaningful.
        </p>
      </div>
    </div>`;

  const result =
    await resend.emails.send(
      {
        from: fromEmail,
        to: [order.customerEmail],
        subject:
          `${orderNumber} Order Confirmed - Timeless Mineral Creations`,
        text,
        html,
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
async function getEmailSiteSettings() {
  const defaults = {
    businessName:
      "Timeless Mineral Creations",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    turnaroundMinWeeks: 2,
    turnaroundMaxWeeks: 10,
    shippingInstructions: "",
    memorialInstructions: "",
  };

  try {
    const settings =
      await prisma.siteSettings.findUnique({
        where: {
          id: "site-settings",
        },
        select: {
          businessName: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          turnaroundMinWeeks: true,
          turnaroundMaxWeeks: true,
          shippingInstructions: true,
          memorialInstructions: true,
        },
      });

    return {
      ...defaults,
      ...(settings || {}),
    };
  } catch (error) {
    console.error(
      "Unable to load email site settings:",
      error
    );

    return defaults;
  }
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
              "shipping_cost.shipping_rate",
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

        const shippingRate =
          session.shipping_cost?.shipping_rate;

        const shippingMethod =
          shippingRate &&
          typeof shippingRate === "object"
            ? shippingRate.display_name ||
              shippingRate.name ||
              null
            : null;

        const stripeLineItems = session.line_items?.data || [];

        const orderItems = stripeLineItems.map((lineItem) => {          const product =
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
            order,
            {
              shippingMethod,
              saleName:
                session.metadata?.saleName ||
                "",
              salePercent:
                session.metadata?.salePercent ||
                "0",
            }
          );
        } catch (emailError) {
          console.error(            "Order was saved, but confirmation email failed:",
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