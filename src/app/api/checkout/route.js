import Stripe from "stripe";
import { checkoutRateLimit } from "@/lib/checkout-rate-limit";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const STRIPE_ALLOWED_SHIPPING_COUNTRIES =
  "AD AE AF AG AI AL AM AO AQ AR AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VN VU WF WS YE YT ZA ZM ZW".split(" ");

export async function POST(request) {
  /*
   * CHECKOUT RATE LIMIT   *
   * Limit: 10 checkout attempts per minute
   * per IP address.
   */
  const forwardedFor =
    request.headers.get(
      "x-vercel-forwarded-for"
    ) ||
    request.headers.get(
      "x-forwarded-for"
    ) ||
    "";

  const clientIp =
    forwardedFor
      .split(",")[0]
      .trim() ||
    "unknown";

  try {
    const {
      success,
      limit,
      remaining,
      reset,
    } =
      await checkoutRateLimit.limit(
        clientIp
      );

    if (!success) {
      const retryAfter =
        Math.max(
          1,
          Math.ceil(
            (reset - Date.now()) /
            1000
          )
        );

      return Response.json(
        {
          error:
            "Too many checkout attempts. Please wait a moment and try again.",
        },
        {
          status: 429,

          headers: {
            "Retry-After":
              String(retryAfter),

            "X-RateLimit-Limit":
              String(limit),

            "X-RateLimit-Remaining":
              String(remaining),
          },
        }
      );
    }
  } catch (error) {
    /*
     * Fail open if Upstash is temporarily
     * unavailable so a Redis outage cannot
     * prevent a legitimate customer from
     * checking out.
     */
    console.error(
      "Checkout rate limiter unavailable:",
      error
    );
  }

  try {
    const { cart, customerNote } = await request.json();

    if (!Array.isArray(cart) || cart.length === 0) {
      return Response.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    const siteSettings =
      await getCheckoutSiteSettings();

    const salePercent =
      siteSettings.sitewideSaleEnabled
        ? Math.max(
            0,
            Math.min(
              100,
              Number(
                siteSettings.sitewideSalePercent || 0
              )
            )
          )
        : 0;

    const lineItems = cart.map((item) => {
      console.log(item);
      const isRemi =
  item.collectionId === "remi" ||
  item.collectionSlug === "remi" ||
  item.collectionSlug === "the-remi-ring" ||
  item.collectionName?.toLowerCase().includes("remi") ||
  Boolean(
    item.bezelSize ||
      item.hairPlacement ||
      item.decorativeAccent ||
      item.accentStyle
  );

      const isKeepsake =
        item.collectionId === "keepsake" ||
        item.collectionSlug === "keepsake";

      const description = isRemi
        ? buildRemiDescription(item)
        : isKeepsake
          ? buildKeepsakeDescription(item)
          : buildStandardRingDescription(item);

      const originalUnitAmount =
        Math.max(
          0,
          Math.round(
            (Number(item.price) || 0) * 100
          )
        );

      const unitAmount =
        Math.max(
          0,
          Math.round(
            originalUnitAmount *
              ((100 - salePercent) / 100)
          )
        );

      const coreStyle =
        typeof item.core === "object"
          ? [
              item.core?.color,
              item.core?.edge ||
                item.core?.finish,
            ]
              .filter(Boolean)
              .join(" ")
          : "";

      const coreName =
        typeof item.core === "object"
          ? item.core?.name ||
            coreStyle ||
            formatOptionName(item.core?.id) ||
            ""
          : formatOptionName(item.core);

      const designName =
        item.design?.name ||
        item.designName ||
        item.inlayStyleName ||
        "";

      const widthValue =
        typeof item.width === "object"
          ? item.width?.width
          : item.width;

      const channelWidth =
        item.channelWidth ??
        item.width?.channel;

      return {
        price_data: {
          currency: "usd",          product_data: {
  name:
    item.collectionName ||
    "Custom Memorial Jewelry",

  description,

  metadata: {
  collectionName: String(
    item.collectionName || ""
  ).slice(0, 500),

  collection: String(
    item.collectionSlug ||
      item.collectionId ||
      ""
  ).slice(0, 500),

  productType: String(
    item.productType ||
      (isRemi ? "remi" : isKeepsake ? "keepsake" : "ring")
  ).slice(0, 500),

  material: String(
    item.material ||
      item.finish ||
      ""
  ).slice(0, 500),

  core: String(coreName).slice(0, 500),

  style: String(
    coreStyle ||
      formatOptionName(item.core?.id) ||
      ""
  ).slice(0, 500),

  design: String(
    designName
  ).slice(0, 500),

  width: String(
    widthValue != null && widthValue !== ""
      ? `${widthValue}mm`
      : ""
  ).slice(0, 500),

  channelWidth: String(
    channelWidth != null && channelWidth !== ""
      ? `${channelWidth}mm`
      : ""
  ).slice(0, 500),

  size: String(    item.size ?? ""
  ).slice(0, 500),

  memorialMaterials: buildMetadataList(
    item.memorialMaterials,
    formatMemorialMaterial
  ),

  minerals: buildMetadataList(
    item.minerals,
    formatOptionName
  ),

  accentMaterials: buildMetadataList(
    item.accentMaterials,
    formatAccentMaterial
  ),

  glow: String(    item.glow?.name ||
      item.glow?.id ||
      item.glowName ||
      (typeof item.glow === "string"
        ? item.glow
        : "")
  ).slice(0, 500),

  engraving: String(
    !item.engravingEnabled
      ? ""
      : item.engravingType === "customSignature"
        ? "Handwritten Signature"
        : item.engravingText || "Yes"
  ).slice(0, 500),

  engravingFont: String(
    item.engravingFont?.name ||
      formatOptionName(
        item.engravingFont?.id
      ) ||
      ""
  ).slice(0, 500),
  channels: buildChannelMetadata(item).slice(
    0,
    500
  ),

  specialRequest: item.specialRequest
    ? `Yes (+$${Number(
        item.specialRequestPrice || 30
      ).toFixed(0)})`
    : "No",

  itemDescription: description.slice(0, 500),
},
},
unit_amount: unitAmount,
},
quantity: item.quantity || 1,
};    });

    const origin = request.headers.get("origin");

    const allowedCountries =
      siteSettings.usShippingOnly
        ? ["US"]
        : STRIPE_ALLOWED_SHIPPING_COUNTRIES;

    const shippingOptions = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount:
              siteSettings.standardShippingPriceCents,
            currency: "usd",
          },
          display_name:
            "USPS Ground Advantage",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount:
              siteSettings.priorityShippingPriceCents,
            currency: "usd",
          },
          display_name:
            "USPS Priority Mail",
        },
      },
    ];

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: allowedCountries,
        },
        shipping_options: shippingOptions,
        metadata: {
          customerNote: String(
            customerNote || ""
          ).slice(0, 500),
          saleName: String(
            siteSettings.sitewideSaleName || ""
          ).slice(0, 500),
          salePercent: String(salePercent),
          turnaroundMinWeeks: String(
            siteSettings.turnaroundMinWeeks
          ),
          turnaroundMaxWeeks: String(
            siteSettings.turnaroundMaxWeeks
          ),
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
      });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return Response.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}

function buildRemiDescription(item) {
  const mineralName =
    item.mineral?.name ||
    item.naturalMineral ||
    item.naturalMineralName ||
    "";

  const keepsakeBase =
    item.keepsakeMaterialName ||
    formatKeepsakeMaterial(item.keepsakeMaterial) ||
    "Not selected";

  const glowName =
    item.glow?.name ||
    item.glowName ||
    (typeof item.glow === "string"
      ? formatOptionName(item.glow)
      : "") ||
    "No Glow";

  const lines = [
    item.finish || item.material
      ? `Metal Finish: ${item.finish || item.material}`
      : null,

    item.size ? `Ring Size: ${item.size}` : null,

    item.bezelSize
      ? `Bezel Size: ${item.bezelSize}`
      : null,

      item.chain
  ? `Chain: ${item.chain}`
  : null,
  
    `Keepsake Base: ${keepsakeBase}`,

    item.hairPlacementName || item.hairPlacement
      ? `Hair Placement: ${
          item.hairPlacementName ||
          formatOptionName(item.hairPlacement)
        }`
      : null,

    item.keepsakeMaterial !== "mineralBase" &&
    mineralName
      ? `Natural Mineral: ${mineralName}`
      : null,

    `Decorative Accent: ${
      item.decorativeAccentName ||
      formatOptionName(item.decorativeAccent) ||
      "None"
    }`,

    item.decorativeAccent !== "none" &&
    (item.accentStyleName || item.accentStyle)
      ? `Accent Style: ${
          item.accentStyleName ||
          formatOptionName(item.accentStyle)
        }`
      : null,

    `Glow Effect: ${glowName}`,

    item.specialRequest
      ? `Special Request: Yes (+$${Number(
          item.specialRequestPrice || 30
        ).toFixed(0)})`
      : null,
  ];

  return lines.filter(Boolean).join(" • ");
}

function buildKeepsakeDescription(item) {
  const lines = [
    item.material
      ? `Material: ${item.material}`
      : null,

    item.size ? `Size: ${item.size}` : null,

    `Keepsake Material: ${formatKeepsakeMaterial(
      item.keepsakeMaterial
    )}`,

    item.birthstone
      ? `Birthstone: ${item.birthstone.month} • ${item.birthstone.stone}`
      : null,

    item.specialRequest
      ? "Special Request: Yes"
      : null,
  ];

  return lines.filter(Boolean).join(" • ");
}

function buildStandardRingDescription(item) {
  const style =
    `${item.core?.color ? `${item.core.color} ` : ""}${
      item.core?.edge || item.core?.finish || ""
    }`.trim();

  const channelWidth =
    item.channelWidth ?? item.width?.channel;

  const channelDescriptions =
    buildChannelDescriptions(item);

  const accentMaterialNames =
    item.accentMaterials?.length
      ? item.accentMaterials
          .map((accent) => {
            const value =
              typeof accent === "string"
                ? accent
                : accent?.id;

            return (
              accent?.name ||
              formatAccentMaterial(value)
            );
          })
          .filter(Boolean)
          .join(", ")
      : "None";

  const engravingDescription =
    !item.engravingEnabled
      ? "None"
      : item.engravingType === "customSignature"
        ? "Handwritten Signature"
        : item.engravingText || "Yes";

  const hasChannelDescriptions =
    channelDescriptions.length > 0;

  const lines = [
    item.material
      ? `Material: ${item.material}`
      : null,

    style ? `Style: ${style}` : null,

    item.width?.width != null
      ? `Width: ${item.width.width}mm`
      : typeof item.width === "number"
        ? `Width: ${item.width}mm`
        : null,

    channelWidth != null
      ? `Channel Width: ${channelWidth}mm`
      : null,

    item.size ? `Size: ${item.size}` : null,

    item.design?.name
      ? `Design: ${item.design.name}`
      : null,

    ...channelDescriptions,

    !hasChannelDescriptions
      ? buildFlatMemorialDescription(item)
      : null,

    !hasChannelDescriptions
      ? buildFlatMineralDescription(item)
      : null,

    `Accent Materials: ${accentMaterialNames}`,

    !hasChannelDescriptions
      ? `Glow Powder: ${getGlowName(item.glow)}`
      : null,

    `Engraving: ${engravingDescription}`,

    item.engravingEnabled &&
    item.engravingType !== "customSignature"
      ? `Font: ${
          item.engravingFont?.name ||
          formatOptionName(item.engravingFont?.id) ||
          "Not selected"
        }`
      : null,

    item.specialRequest
      ? "Special Request: Yes"
      : null,
  ];

  return lines.filter(Boolean).join(" • ");
}

function buildChannelDescriptions(item) {
  const channelDefinitions =
    item.design?.channels || [];

  if (
    !channelDefinitions.length ||
    !item.channels ||
    typeof item.channels !== "object"
  ) {
    return [];
  }

  return channelDefinitions.map((channel, index) => {
    const selection =
      item.channels[channel.id] || {};

    const channelName =
      channel.name ||
      `Channel ${index + 1}`;

    const memorialValue =
      selection.memorial?.id ||
      selection.memorial;

    const mineralValue =
      selection.mineral?.id ||
      selection.mineral;

    const glowValue =
      selection.glow?.id ||
      selection.glow;

    const accentValue =
      selection.accent?.id ||
      selection.accentMaterial?.id ||
      selection.accent ||
      selection.accentMaterial;

    const memorialName =
      selection.memorial?.name ||
      formatMemorialMaterial(memorialValue) ||
      "None";

    const mineralName =
      selection.mineral?.name ||
      formatOptionName(mineralValue) ||
      "None";

    const glowName =
      selection.glow?.name ||
      formatOptionName(glowValue);

    const accentName =
      selection.accent?.name ||
      selection.accentMaterial?.name ||
      formatAccentMaterial(accentValue);

    const parts = [
      `Memorial: ${memorialName}`,
      `Mineral: ${mineralName}`,
      accentName ? `Accent: ${accentName}` : null,
      glowName ? `Glow: ${glowName}` : null,
    ];

    return `${channelName}: ${parts
      .filter(Boolean)
      .join(", ")}`;
  });
}

function buildFlatMemorialDescription(item) {
  if (!item.memorialMaterials?.length) {
    return "Memorial Material: None";
  }

  const names = item.memorialMaterials
    .map((material) => {
      const value =
        typeof material === "string"
          ? material
          : material?.id;

      return (
        material?.name ||
        formatMemorialMaterial(value)
      );
    })
    .filter(Boolean)
    .join(", ");

  return `Memorial Material: ${names || "None"}`;
}

function buildFlatMineralDescription(item) {
  if (!item.minerals?.length) {
    return "Minerals: None";
  }

  const names = item.minerals
    .map((mineral) => {
      const value =
        typeof mineral === "string"
          ? mineral
          : mineral?.id;

      return (
        mineral?.name ||
        formatOptionName(value)
      );
    })
    .filter(Boolean)
    .join(", ");

  return `Minerals: ${names || "None"}`;
}

function getGlowName(glow) {
  return (
    glow?.name ||
    formatOptionName(glow?.id) ||
    (typeof glow === "string"
      ? formatOptionName(glow)
      : "") ||
    "None"
  );
}

function formatMemorialMaterial(value) {
  if (!value) return "";

  const labels = {
    ashes: "Cremation Ashes",
    cremation: "Cremation Ashes",
    hair: "Hair",
    fur: "Pet Fur",
    horseHair: "Horse Hair",
    sand: "Sand",
    soil: "Soil",
    fabric: "Fabric",
    breastMilk: "Breast Milk",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatAccentMaterial(value) {
  if (!value) return "";

  const labels = {
    goldFoil: "Gold Foil",
    silverFoil: "Silver Foil",
  };

  return (
    labels[value] ||
    formatOptionName(value)
  );
}

function formatKeepsakeMaterial(value) {
  const labels = {
    breastMilk: "Breast Milk",
    cremation: "Cremation Ashes",
    ashes: "Cremation Ashes",
    sand: "Sand",
    soil: "Soil",
    mineralBase: "Mineral Base",
  };

  return (
    labels[value] ||
    formatOptionName(value) ||
    "Not selected"
  );
}

function formatOptionName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildMetadataList(
  values,
  formatter = formatOptionName
) {
  if (!Array.isArray(values)) {
    return "";
  }
  return values
    .map((value) => {
      if (typeof value === "string") {
        return (
          formatter(value) ||
          value
        );
      }

      const rawValue =
        value?.id ||
        value?.value ||
        value?.label ||
        "";

      return (
        value?.name ||
        formatter(rawValue) ||
        rawValue
      );
    })
    .filter(Boolean)
    .join(", ")    .slice(0, 500);
}

function buildChannelMetadata(item) {
  const channelDefinitions = item.design?.channels || [];

  if (
    !channelDefinitions.length ||
    !item.channels ||
    typeof item.channels !== "object"
  ) {
    return "";
  }

  return channelDefinitions
    .map((channel, index) => {
      const selection = item.channels[channel.id] || {};

      const channelName =
        channel.name || `Channel ${index + 1}`;

      const memorialValue =
        selection.memorial?.id ||
        selection.memorial;

      const memorial =
        selection.memorial?.name ||
        formatMemorialMaterial(
          memorialValue
        ) ||
        "None";

      const mineralValue =
        selection.mineral?.id ||
        selection.mineral;

      const mineral =
        selection.mineral?.name ||
        formatOptionName(
          mineralValue
        ) ||
        "None";

      const accentValue =
        selection.accent?.id ||
        selection.accentMaterial?.id ||
        selection.accent ||
        selection.accentMaterial;

      const accent =
        selection.accent?.name ||
        selection.accentMaterial?.name ||
        formatAccentMaterial(
          accentValue
        ) ||
        "";

      const glowValue =
        selection.glow?.id ||
        selection.glow;

      const glow =
        selection.glow?.name ||
        formatOptionName(
          glowValue
        ) ||
        "";

      return [        channelName,
        `Memorial: ${memorial}`,
        `Mineral: ${mineral}`,
        accent ? `Accent: ${accent}` : null,
        glow ? `Glow: ${glow}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join(" || ");
}

async function getCheckoutSiteSettings() {
  const defaults = {
    turnaroundMinWeeks: 2,
    turnaroundMaxWeeks: 10,
    usShippingOnly: true,
    standardShippingPriceCents: 800,
    priorityShippingPriceCents: 1500,
    sitewideSaleEnabled: false,
    sitewideSalePercent: 0,
    sitewideSaleName: "",
  };

  try {
    const settings =
      await prisma.siteSettings.findUnique({
        where: {
          id: "site-settings",
        },
        select: {
          turnaroundMinWeeks: true,
          turnaroundMaxWeeks: true,
          usShippingOnly: true,
          standardShippingPriceCents: true,
          priorityShippingPriceCents: true,
          sitewideSaleEnabled: true,
          sitewideSalePercent: true,
          sitewideSaleName: true,
        },
      });

    return {
      ...defaults,
      ...(settings || {}),
      standardShippingPriceCents:
        Math.max(
          0,
          Number(
            settings?.standardShippingPriceCents ??
              defaults.standardShippingPriceCents
          ) || 0
        ),
      priorityShippingPriceCents:
        Math.max(
          0,
          Number(
            settings?.priorityShippingPriceCents ??
              defaults.priorityShippingPriceCents
          ) || 0
        ),
    };
  } catch (error) {
    console.error(
      "Unable to load checkout settings:",
      error
    );

    return defaults;
  }
}