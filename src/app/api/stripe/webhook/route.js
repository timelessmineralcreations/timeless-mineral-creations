import Stripe from "stripe";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

function centsToDollars(amount) {
  return typeof amount === "number" ? amount / 100 : null;
}

function safeParseJson(value) {
  if (!value || typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function stringifyValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return typeof value === "string"
    ? value
    : JSON.stringify(value);
}

function getConfiguration(metadata = {}) {
  const value =
    metadata.configurationJson ||
    metadata.configuration ||
    metadata.designConfiguration ||
    metadata.cartItem;

  return safeParseJson(value) || {};
}

function getMetadataValue(
  metadata,
  configuration,
  keys
) {
  for (const key of keys) {
    const configValue =
      configuration?.[key];

    if (
      configValue !== undefined &&
      configValue !== null &&
      configValue !== ""
    ) {
      return stringifyValue(
        configValue
      );
    }

    const metadataValue =
      metadata?.[key];

    if (
      metadataValue !== undefined &&
      metadataValue !== null &&
      metadataValue !== ""
    ) {
      return stringifyValue(
        metadataValue
      );
    }
  }

  return null;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function formatMoney(value) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return "$0.00";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(amount);
}

function buildOrderNumber(order) {
  const createdAt =
    order?.createdAt
      ? new Date(
          order.createdAt
        )
      : new Date();

  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(
      createdAt
    );

  const getPart = (
    type,
    fallback
  ) =>
    parts.find(
      (part) =>
        part.type === type
    )?.value || fallback;

  const year =
    getPart(
      "year",
      "0000"
    );

  const month =
    getPart(
      "month",
      "00"
    );

  const day =
    getPart(
      "day",
      "00"
    );

  const uniquePart =
    String(
      order?.id || "ORDER"
    )
      .slice(-6)
      .toUpperCase();

  return `TMC-${year}${month}${day}-${uniquePart}`;
}

function parseStoredValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    return value;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith('"')
  ) {
    const parsed =
      safeParseJson(trimmed);

    if (parsed !== null) {
      return parsed;
    }
  }

  return value;
}

const friendlyLabels = {
  ashes:
    "Cremation Ashes",

  cremation:
    "Cremation Ashes",

  cremationAshes:
    "Cremation Ashes",

  "cremation-ashes":
    "Cremation Ashes",

  breastMilk:
    "Breast Milk",

  "breast-milk":
    "Breast Milk",

  petFur:
    "Pet Fur",

  "pet-fur":
    "Pet Fur",

  fur:
    "Pet Fur",

  horseHair:
    "Horse Hair",

  "horse-hair":
    "Horse Hair",

  driedFlowers:
    "Dried Flowers",

  "dried-flowers":
    "Dried Flowers",

  silverFoil:
    "Silver Foil",

  "silver-foil":
    "Silver Foil",

  goldFoil:
    "Gold Foil",

  "gold-foil":
    "Gold Foil",

  opalChameleon:
    "Opal Chameleon",

  "opal-chameleon":
    "Opal Chameleon",

  pinkChameleon:
    "Pink Chameleon",

  "pink-chameleon":
    "Pink Chameleon",

  customSignature:
    "Custom Signature",

  "custom-signature":
    "Custom Signature",

  standardEngraving:
    "Standard Engraving",

  "standard-engraving":
    "Standard Engraving",

  specialRequest:
    "Special Request",

  "special-request":
    "Special Request",

  crescentHair:
    "Crescent Hair",

  "crescent-hair":
    "Crescent Hair",

  scatteredHair:
    "Scattered Hair",

  "scattered-hair":
    "Scattered Hair",

  crescentMoon:
    "Crescent Moon",

  "crescent-moon":
    "Crescent Moon",

  noHair:
    "No Hair",

  "no-hair":
    "No Hair",

  none:
    "None",
};

function humanizeLabel(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  const original =
    String(value).trim();

  if (!original) {
    return "";
  }

  if (
    friendlyLabels[original]
  ) {
    return friendlyLabels[
      original
    ];
  }

  return original
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .split(" ")
    .map((word) => {
      if (
        word.toUpperCase() ===
          word &&
        word.length <= 4
      ) {
        return word;
      }

      return (
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function displayValue(value) {
  const parsed =
    parseStoredValue(value);

  if (
    parsed === undefined ||
    parsed === null ||
    parsed === ""
  ) {
    return "";
  }

  if (
    Array.isArray(parsed)
  ) {
    return parsed
      .map(displayValue)
      .filter(Boolean)
      .join(", ");
  }

  if (
    typeof parsed ===
    "object"
  ) {
    if (parsed.name) {
      return String(
        parsed.name
      );
    }

    if (parsed.label) {
      return String(
        parsed.label
      );
    }

    if (
      parsed.width !==
        undefined &&
      parsed.width !== null
    ) {
      const width =
        String(
          parsed.width
        );

      return width
        .toLowerCase()
        .includes("mm")
        ? width
        : `${width}mm`;
    }

    if (
      parsed.value !==
        undefined &&
      parsed.value !== null
    ) {
      return displayValue(
        parsed.value
      );
    }

    if (parsed.id) {
      return humanizeLabel(
        parsed.id
      );
    }

    return "";
  }

  if (
    typeof parsed ===
    "boolean"
  ) {
    return parsed
      ? "Yes"
      : "No";
  }

  return humanizeLabel(
    parsed
  );
}

function formatWidth(value) {
  const parsed =
    parseStoredValue(value);

  if (
    parsed === undefined ||
    parsed === null ||
    parsed === ""
  ) {
    return "";
  }

  if (
    typeof parsed ===
      "object" &&
    parsed.width !==
      undefined
  ) {
    return formatWidth(
      parsed.width
    );
  }

  const text =
    String(parsed).trim();

  if (!text) {
    return "";
  }

  if (
    text
      .toLowerCase()
      .includes("mm")
  ) {
    return text;
  }

  if (
    !Number.isNaN(
      Number(text)
    )
  ) {
    return `${text}mm`;
  }

  return displayValue(
    parsed
  );
}

function getItemConfiguration(
  item
) {
  return (
    safeParseJson(
      item.configurationJson
    ) || {}
  );
}

function firstValue(
  configuration,
  keys,
  fallback = null
) {
  for (
    const key of keys
  ) {
    const value =
      configuration?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

function formatEngraving(
  item,
  configuration
) {
  const engravingEnabled =
    configuration
      .engravingEnabled;

  const engravingType =
    firstValue(
      configuration,
      [
        "engravingType",
        "selectedEngravingType",
      ],
      item.engraving
    );

  const engravingText =
    firstValue(
      configuration,
      [
        "engravingText",
        "text",
      ],
      null
    );

  const engravingFont =
    firstValue(
      configuration,
      [
        "engravingFont",
        "font",
      ],
      null
    );

  if (
    engravingEnabled ===
      false &&
    !engravingType &&
    !engravingText
  ) {
    return "";
  }

  if (
    !engravingType &&
    !engravingText &&
    !engravingFont &&
    engravingEnabled !==
      true
  ) {
    return "";
  }

  const parts = [];

  if (engravingType) {
    const typeText =
      displayValue(
        engravingType
      );

    if (typeText) {
      parts.push(typeText);
    }
  }

  if (engravingText) {
    parts.push(
      `"${String(
        engravingText
      )}"`
    );
  }

  if (
    engravingFont &&
    String(
      typeof engravingType === "object"
        ? engravingType?.id ||
          engravingType?.value ||
          engravingType?.name ||
          ""
        : engravingType || ""
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") !==
      "customsignature"
  ) {
    const fontText =
      displayValue(
        engravingFont
      );

    if (fontText) {
      parts.push(
        `Font: ${fontText}`
      );
    }
  }

  if (
    !parts.length &&
    engravingEnabled === true
  ) {
    return "Yes";
  }

  return parts.join(
    " — "
  );
}

function normalizeChannelDisplayValue(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "None";
  }

  const text =
    String(value).trim();

  if (
    !text ||
    /^none$/i.test(text) ||
    /^not provided$/i.test(
      text
    ) ||
    /^null$/i.test(text) ||
    /^undefined$/i.test(
      text
    )
  ) {
    return "None";
  }

  return (
    displayValue(value) ||
    "None"
  );
}

function getChannelLabel(
  key,
  index
) {
  const normalized =
    String(key || "")
      .toLowerCase()
      .replace(
        /[-_\s]/g,
        ""
      );

  if (
    normalized.includes(
      "top"
    ) ||
    normalized === "1" ||
    normalized ===
      "channel1"
  ) {
    return "Top Channel";
  }

  if (
    normalized.includes(
      "middle"
    ) ||
    normalized.includes(
      "center"
    ) ||
    normalized === "2" ||
    normalized ===
      "channel2"
  ) {
    return "Middle Channel";
  }

  if (
    normalized.includes(
      "bottom"
    ) ||
    normalized === "3" ||
    normalized ===
      "channel3"
  ) {
    return "Bottom Channel";
  }

  const humanized =
    humanizeLabel(key);

  if (humanized) {
    return humanized
      .toLowerCase()
      .includes(
        "channel"
      )
      ? humanized
      : `${humanized} Channel`;
  }

  return `Channel ${
    index + 1
  }`;
}

function getChannelObjectValue(
  channel,
  keys
) {
  if (
    !channel ||
    typeof channel !==
      "object" ||
    Array.isArray(channel)
  ) {
    return null;
  }

  for (
    const key of keys
  ) {
    const value =
      channel[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function parseChannelDetailsString(
  value
) {
  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    return [];
  }

  return value
    .split(
      /\s*\|\|\s*/
    )
    .map((segment) =>
      segment.trim()
    )
    .filter(Boolean)
    .map(
      (
        segment,
        index
      ) => {
        const parts =
          segment
            .split(
              /\s*\|\s*/
            )
            .map(
              (part) =>
                part.trim()
            )
            .filter(
              Boolean
            );

        if (
          !parts.length
        ) {
          return null;
        }

        const rawLabel =
          parts[0];

        let memorial =
          "None";

        let mineral =
          "None";

        for (
          const part of
            parts.slice(1)
        ) {
          const separatorIndex =
            part.indexOf(
              ":"
            );

          if (
            separatorIndex ===
            -1
          ) {
            continue;
          }

          const key =
            part
              .slice(
                0,
                separatorIndex
              )
              .trim()
              .toLowerCase();

          const rawValue =
            part
              .slice(
                separatorIndex +
                  1
              )
              .trim();

          if (
            key.includes(
              "memorial"
            )
          ) {
            memorial =
              normalizeChannelDisplayValue(
                rawValue
              );
          }

          if (
            key.includes(
              "mineral"
            )
          ) {
            mineral =
              normalizeChannelDisplayValue(
                rawValue
              );
          }
        }

        return {
          label:
            getChannelLabel(
              rawLabel,
              index
            ),

          memorial,

          mineral,
        };
      }
    )
    .filter(Boolean);
}

function getChannelDetails(
  configuration
) {
  const channels =
    configuration?.channels;

  if (
    typeof channels ===
    "string"
  ) {
    return parseChannelDetailsString(
      channels
    );
  }

  if (
    Array.isArray(channels)
  ) {
    return channels
      .map(
        (
          channel,
          index
        ) => {
          if (
            !channel ||
            typeof channel !==
              "object"
          ) {
            return null;
          }

          const label =
            channel.name ||
            channel.label ||
            channel.id ||
            `Channel ${
              index + 1
            }`;

          return {
            label:
              getChannelLabel(
                label,
                index
              ),

            memorial:
              normalizeChannelDisplayValue(
                getChannelObjectValue(
                  channel,
                  [
                    "memorial",
                    "memorialMaterial",
                    "memorialMaterials",
                    "selectedMemorial",
                    "selectedMemorialMaterial",
                    "keepsakeMaterial",
                    "keepsakeMaterials",
                  ]
                )
              ),

            mineral:
              normalizeChannelDisplayValue(
                getChannelObjectValue(
                  channel,
                  [
                    "mineral",
                    "minerals",
                    "selectedMineral",
                    "selectedMinerals",
                  ]
                )
              ),
          };
        }
      )
      .filter(Boolean);
  }

  if (
    channels &&
    typeof channels ===
      "object"
  ) {
    return Object.entries(
      channels
    ).map(
      (
        [
          key,
          channel,
        ],
        index
      ) => {
        if (
          typeof channel ===
          "string"
        ) {
          const parsed =
            parseChannelDetailsString(
              `${getChannelLabel(
                key,
                index
              )} | ${channel}`
            );

          if (
            parsed.length
          ) {
            return parsed[0];
          }
        }

        return {
          label:
            getChannelLabel(
              key,
              index
            ),

          memorial:
            normalizeChannelDisplayValue(
              getChannelObjectValue(
                channel,
                [
                  "memorial",
                  "memorialMaterial",
                  "memorialMaterials",
                  "selectedMemorial",
                  "selectedMemorialMaterial",
                  "keepsakeMaterial",
                  "keepsakeMaterials",
                ]
              )
            ),

          mineral:
            normalizeChannelDisplayValue(
              getChannelObjectValue(
                channel,
                [
                  "mineral",
                  "minerals",
                  "selectedMineral",
                  "selectedMinerals",
                ]
              )
            ),
        };
      }
    );
  }

  return [];
}

function buildChannelDetailsHtml(
  configuration
) {
  const channels =
    getChannelDetails(
      configuration
    );

  if (
    !channels.length
  ) {
    return "";
  }

  return `
    <div
      style="
        margin-top:18px;
        padding-top:18px;
        border-top:1px solid #e5e7eb;
      "
    >
      <div
        style="
          font-size:16px;
          font-weight:700;
          color:#171717;
          margin-bottom:14px;
        "
      >
        Channel Details
      </div>

      ${channels
        .map(
          (
            channel
          ) => `
            <div
              style="
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:8px;
                padding:14px 16px;
                margin-bottom:10px;
              "
            >
              <div
                style="
                  font-size:15px;
                  font-weight:700;
                  color:#171717;
                  margin-bottom:9px;
                "
              >
                ${escapeHtml(
                  channel.label
                )}
              </div>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse:collapse;
                "
              >
                <tr>
                  <td
                    style="
                      padding:3px 12px 3px 0;
                      color:#6b7280;
                      font-size:14px;
                      width:95px;
                      vertical-align:top;
                    "
                  >
                    Memorial
                  </td>

                  <td
                    style="
                      padding:3px 0;
                      color:#171717;
                      font-size:14px;
                      font-weight:600;
                      vertical-align:top;
                    "
                  >
                    ${escapeHtml(
                      channel.memorial
                    )}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:3px 12px 3px 0;
                      color:#6b7280;
                      font-size:14px;
                      vertical-align:top;
                    "
                  >
                    Mineral
                  </td>

                  <td
                    style="
                      padding:3px 0;
                      color:#171717;
                      font-size:14px;
                      font-weight:600;
                      vertical-align:top;
                    "
                  >
                    ${escapeHtml(
                      channel.mineral
                    )}
                  </td>
                </tr>
              </table>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildChannelDetailsText(
  configuration
) {
  const channels =
    getChannelDetails(
      configuration
    );

  if (
    !channels.length
  ) {
    return "";
  }

  return [
    "   Channel Details:",

    ...channels.flatMap(
      (channel) => [
        `   ${channel.label}`,
        `      Memorial: ${channel.memorial}`,
        `      Mineral: ${channel.mineral}`,
      ]
    ),
  ].join("\n");
}


function parseItemDescriptionDetails(
  value
) {
  if (!value) {
    return [];
  }

  const details = [];

  const segments =
    String(value)
      .split(/\s*\u2022\s*/)
      .map(
        (segment) =>
          segment.trim()
      )
      .filter(Boolean);

  for (
    const segment of segments
  ) {
    const colonIndex =
      segment.indexOf(":");

    if (colonIndex > 0) {
      const label =
        segment
          .slice(
            0,
            colonIndex
          )
          .trim();

      const detailValue =
        segment
          .slice(
            colonIndex + 1
          )
          .trim();

      if (
        label &&
        detailValue
      ) {
        details.push({
          label,
          value:
            detailValue,
        });
      }

      continue;
    }

    if (details.length) {
      details[
        details.length - 1
      ].value +=
        " \u2022 " + segment;
    }
  }

  return details;
}

function canonicalEmailDetailLabel(
  value
) {
  const normalized =
    String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        ""
      );

  const aliases = {
    size:
      "ringsize",

    ringsize:
      "ringsize",

    glow:
      "glow",

    glowpowder:
      "glow",

    gloweffect:
      "glow",

    memorialmaterial:
      "memorialmaterial",

    memorialmaterials:
      "memorialmaterial",

    mineral:
      "mineral",

    minerals:
      "mineral",

    naturalmineral:
      "mineral",

    decorativeaccent:
      "decorativeaccent",

    accentmaterial:
      "decorativeaccent",

    accentmaterials:
      "decorativeaccent",

    keepsakebase:
      "keepsakebase",

    keepsakematerial:
      "keepsakebase",
  };

  return (
    aliases[
      normalized
    ] ||
    normalized
  );
}

function descriptionHasChannelDetails(
  configuration
) {
  return parseItemDescriptionDetails(
    configuration
      ?.itemDescription
  ).some(
    (detail) => {
      const label =
        canonicalEmailDetailLabel(
          detail.label
        );

      return (
        label.endsWith(
          "channel"
        ) ||
        /^channel\d+$/.test(
          label
        )
      );
    }
  );
}

function buildItemDetails(
  item
) {
  const configuration =
    getItemConfiguration(
      item
    );

  const material =
    firstValue(
      configuration,
      [
        "material",
        "selectedMaterial",
        "finish",
        "selectedFinish",
      ],
      item.material
    );

  const core =
    firstValue(
      configuration,
      [
        "core",
        "selectedCore",
        "coreName",
      ],
      item.core
    );
  const style =
    firstValue(
      configuration,
      [
        "style",
        "selectedStyle",
        "inlayStyle",
        "selectedInlayStyle",
      ],
      item.style
    );



  const width =
    firstValue(
      configuration,
      [
        "width",
        "selectedWidth",
      ],
      item.width
    );

  const size =
    firstValue(
      configuration,
      [
        "size",
        "selectedSize",
        "ringSize",
      ],
      item.size
    );

  const design =
    firstValue(
      configuration,
      [
        "design",
        "selectedDesign",
        "designName",
      ],
      item.design
    );

  const memorialMaterials =
    firstValue(
      configuration,
      [
        "memorialMaterials",
        "selectedMaterials",
        "memorialMaterial",
      ],
      item.memorialMaterials
    );

  const minerals =
    firstValue(
      configuration,
      [
        "minerals",
        "selectedMinerals",
        "mineral",
      ],
      item.minerals
    );

  const accentMaterials =
    firstValue(
      configuration,
      [
        "accentMaterials",
        "selectedAccentMaterials",
        "decorativeAccents",
        "accents",
      ],
      item.accentMaterials
    );

  const hairPlacement =
    firstValue(
      configuration,
      [
        "hairPlacement",
        "hairPlacementStyle",
        "selectedHairPlacement",
      ],
      null
    );

  const accentStyle =
    firstValue(
      configuration,
      [
        "accentStyle",
        "selectedAccentStyle",
      ],
      null
    );

  const glow =
    firstValue(
      configuration,
      [
        "glow",
        "selectedGlow",
        "glowColor",
      ],
      item.glow
    );

  const specialRequest =
    firstValue(
      configuration,
      [
        "specialRequest",
        "specialRequests",
      ],
      null
    );

  const engraving =
    formatEngraving(
      item,
      configuration
    );

  const details = [];

  const addDetail = (
    label,
    value
  ) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      details.push({
        label,
        value,
      });
    }
  };

  addDetail(
    "Material",
    displayValue(
      material
    )
  );

  addDetail(
    "Core",
    displayValue(core)
  );
  addDetail(
    "Style",
    displayValue(style)
  );



  addDetail(
    "Width",
    formatWidth(width)
  );
  addDetail(
    "Channel Width",
    formatWidth(
      firstValue(
        configuration,
        [
          "channelWidth",
          "selectedChannelWidth",
        ],
        configuration?.width?.channel
      )
    )
  );



  addDetail(
    "Ring Size",
    displayValue(size)
  );

  addDetail(
    "Design",
    displayValue(design)
  );

  addDetail(
    "Memorial Material",
    displayValue(
      memorialMaterials
    )
  );

  addDetail(
    "Mineral",
    displayValue(
      minerals
    )
  );

  addDetail(
    "Decorative Accent",
    displayValue(
      accentMaterials
    )
  );

  addDetail(
    "Hair Placement",
    displayValue(
      hairPlacement
    )
  );

  addDetail(
    "Accent Style",
    displayValue(
      accentStyle
    )
  );

  addDetail(
    "Glow",
    displayValue(glow)
  );

  addDetail(
    "Engraving",
    engraving
  );

  if (
    specialRequest === true ||
    specialRequest ===
      "true"
  ) {
    addDetail(
      "Special Request",
      "Yes"
    );
  } else if (
    specialRequest &&
    specialRequest !==
      false &&
    specialRequest !==
      "false"
  ) {
    addDetail(
      "Special Request",
      displayValue(
        specialRequest
      )
    );
  }


  const checkoutDescriptionDetails =
    parseItemDescriptionDetails(
      configuration
        ?.itemDescription
    );

  for (
    const checkoutDetail of
      checkoutDescriptionDetails
  ) {
    const checkoutLabel =
      canonicalEmailDetailLabel(
        checkoutDetail.label
      );

    if (!checkoutLabel) {
      continue;
    }

    const existingIndex =
      details.findIndex(
        (detail) =>
          canonicalEmailDetailLabel(
            detail.label
          ) === checkoutLabel
      );

    if (
      existingIndex >= 0
    ) {
      details[
        existingIndex
      ] = {
        label:
          checkoutDetail.label,

        value:
          checkoutDetail.value,
      };
    } else {
      details.push({
        label:
          checkoutDetail.label,

        value:
          checkoutDetail.value,
      });
    }
  }

  return details;
}

function buildMailingAddress(
  settings
) {
  const lines = [];

  if (
    settings.businessName
  ) {
    lines.push(
      settings.businessName
    );
  }

  if (
    settings.addressLine1
  ) {
    lines.push(
      settings.addressLine1
    );
  }

  if (
    settings.addressLine2
  ) {
    lines.push(
      settings.addressLine2
    );
  }

  const cityStatePostal =
    [
      settings.city,
      settings.state,
      settings.postalCode,
    ]
      .filter(Boolean)
      .join(" ");

  if (
    cityStatePostal
  ) {
    lines.push(
      cityStatePostal
    );
  }

  if (
    settings.country
  ) {
    lines.push(
      settings.country
    );
  }

  return lines;
}

function buildOrderItemsHtml(
  order
) {
  if (
    !order.items?.length
  ) {
    return `
      <p
        style="
          margin:0;
          color:#4b5563;
        "
      >
        Custom Memorial Jewelry
      </p>
    `;
  }

  return order.items
    .map((item) => {
      const productName =
        item.productName ||
        item.collectionName ||
        "Custom Memorial Jewelry";

      const collectionName =
        item.collectionName &&
        item.collectionName !==
          productName
          ? item.collectionName
          : null;

      const details =
        buildItemDetails(
          item
        );

      const configuration =
        getItemConfiguration(
          item
        );

      const channelDetailsHtml =
        descriptionHasChannelDetails(
          configuration
        )
          ? ""
          : buildChannelDetailsHtml(
              configuration
            );

      const quantity =
        item.quantity || 1;

      const detailsHtml =
        details.length
          ? `
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                border-collapse:collapse;
                margin-top:14px;
              "
            >
              ${details
                .map(
                  (
                    detail
                  ) => `
                    <tr>
                      <td
                        style="
                          padding:6px 12px 6px 0;
                          color:#6b7280;
                          font-size:14px;
                          vertical-align:top;
                          width:145px;
                        "
                      >
                        ${escapeHtml(
                          detail.label
                        )}
                      </td>

                      <td
                        style="
                          padding:6px 0;
                          color:#171717;
                          font-size:14px;
                          font-weight:600;
                          vertical-align:top;
                        "
                      >
                        ${escapeHtml(
                          detail.value
                        )}
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </table>
          `
          : "";

      return `
        <div
          style="
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:18px;
            margin-bottom:16px;
            background:#ffffff;
          "
        >
          <div
            style="
              font-size:17px;
              font-weight:700;
              color:#171717;
            "
          >
            ${escapeHtml(
              productName
            )}
          </div>

          ${
            collectionName
              ? `
                <div
                  style="
                    margin-top:3px;
                    color:#6b7280;
                    font-size:13px;
                  "
                >
                  ${escapeHtml(
                    collectionName
                  )}
                </div>
              `
              : ""
          }

          ${
            quantity > 1
              ? `
                <div
                  style="
                    margin-top:5px;
                    color:#6b7280;
                    font-size:13px;
                  "
                >
                  Quantity:
                  ${quantity}
                </div>
              `
              : ""
          }

          ${detailsHtml}

          ${channelDetailsHtml}

          <div
            style="
              border-top:1px solid #eeeeee;
              margin-top:14px;
              padding-top:12px;
              font-size:14px;
              color:#171717;
            "
          >
            <strong>
              Item Price:
              ${formatMoney(
                item.unitPrice
              )}
            </strong>
          </div>
        </div>
      `;
    })
    .join("");
}

function buildOrderItemsText(
  order
) {
  if (
    !order.items?.length
  ) {
    return (
      "Custom Memorial Jewelry"
    );
  }

  return order.items
    .map(
      (
        item,
        index
      ) => {
        const productName =
          item.productName ||
          item.collectionName ||
          "Custom Memorial Jewelry";

        const details =
          buildItemDetails(
            item
          );

        const configuration =
          getItemConfiguration(
            item
          );

        const channelDetailsText =
          descriptionHasChannelDetails(
            configuration
          )
            ? ""
            : buildChannelDetailsText(
                configuration
              );

        const lines = [
          `${
            index + 1
          }. ${productName}`,
        ];

        if (
          item.collectionName &&
          item.collectionName !==
            productName
        ) {
          lines.push(
            `   Collection: ${item.collectionName}`
          );
        }

        if (
          (item.quantity ||
            1) > 1
        ) {
          lines.push(
            `   Quantity: ${item.quantity}`
          );
        }

        for (
          const detail of
            details
        ) {
          lines.push(
            `   ${detail.label}: ${detail.value}`
          );
        }

        if (
          channelDetailsText
        ) {
          lines.push(
            channelDetailsText
          );
        }

        lines.push(
          `   Item Price: ${formatMoney(
            item.unitPrice
          )}`
        );

        return lines.join(
          "\n"
        );
      }
    )
    .join("\n\n");
}

function buildOrderTotalsHtml(
  order
) {
  const rows = [];

  if (
    order.subtotal !==
      null &&
    order.subtotal !==
      undefined
  ) {
    rows.push({
      label:
        "Subtotal",

      value:
        formatMoney(
          order.subtotal
        ),
    });
  }

  if (
    order.shippingCost !==
      null &&
    order.shippingCost !==
      undefined
  ) {
    rows.push({
      label:
        "Shipping",

      value:
        formatMoney(
          order.shippingCost
        ),
    });
  }

  if (
    order.taxAmount !==
      null &&
    order.taxAmount !==
      undefined &&
    Number(
      order.taxAmount
    ) > 0
  ) {
    rows.push({
      label:
        "Tax",

      value:
        formatMoney(
          order.taxAmount
        ),
    });
  }

  rows.push({
    label:
      "Order Total",

    value:
      formatMoney(
        order.totalPrice
      ),

    total:
      true,
  });

  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-top:18px;
        background:#f9fafb;
        border-radius:8px;
        padding:16px 18px;
      "
    >
      ${rows
        .map(
          (row) => `
            <tr>
              <td
                style="
                  padding:${
                    row.total
                      ? "12px 0 0"
                      : "0 0 8px"
                  };
                  font-size:${
                    row.total
                      ? "17px"
                      : "14px"
                  };
                  font-weight:${
                    row.total
                      ? "700"
                      : "400"
                  };
                  color:#171717;
                "
              >
                ${escapeHtml(
                  row.label
                )}
              </td>

              <td
                align="right"
                style="
                  padding:${
                    row.total
                      ? "12px 0 0"
                      : "0 0 8px"
                  };
                  font-size:${
                    row.total
                      ? "17px"
                      : "14px"
                  };
                  font-weight:${
                    row.total
                      ? "700"
                      : "400"
                  };
                  color:#171717;
                "
              >
                ${escapeHtml(
                  row.value
                )}
              </td>
            </tr>
          `
        )
        .join("")}
    </table>
  `;
}

function buildOrderTotalsText(
  order
) {
  const lines = [];

  if (
    order.subtotal !==
      null &&
    order.subtotal !==
      undefined
  ) {
    lines.push(
      `Subtotal: ${formatMoney(
        order.subtotal
      )}`
    );
  }

  if (
    order.shippingCost !==
      null &&
    order.shippingCost !==
      undefined
  ) {
    lines.push(
      `Shipping: ${formatMoney(
        order.shippingCost
      )}`
    );
  }

  if (
    order.taxAmount !==
      null &&
    order.taxAmount !==
      undefined &&
    Number(
      order.taxAmount
    ) > 0
  ) {
    lines.push(
      `Tax: ${formatMoney(
        order.taxAmount
      )}`
    );
  }

  lines.push(
    `Order Total: ${formatMoney(
      order.totalPrice
    )}`
  );

  return lines.join(
    "\n"
  );
}

function buildCustomerNoteHtml(
  order
) {
  if (
    !order.customerNote?.trim()
  ) {
    return "";
  }

  return `
    <div
      style="
        margin-top:24px;
        padding:16px 18px;
        border-radius:8px;
        background:#f7f3e8;
        border:1px solid #e8dcc2;
      "
    >
      <strong
        style="
          display:block;
          margin-bottom:8px;
          color:#171717;
        "
      >
        Your Note
      </strong>

      <div
        style="
          color:#4b5563;
          line-height:1.6;
        "
      >
        ${escapeHtml(
          order.customerNote
        ).replace(
          /\r?\n/g,
          "<br />"
        )}
      </div>
    </div>
  `;
}

function buildConfirmationEmailHtml({
  order,
  settings,
}) {
  const businessName =
    settings.businessName ||
    "Timeless Mineral Creations";

  const orderNumber =
    buildOrderNumber(
      order
    );

  const customerFirstName =
    order.customerName
      ?.trim()
      ?.split(
        /\s+/
      )?.[0] ||
    "there";

  const addressHtml =
    buildMailingAddress(
      settings
    )
      .map(
        (line) =>
          `${escapeHtml(
            line
          )}<br />`
      )
      .join("");

  const memorialInstructions =
    escapeHtml(
      settings
        .memorialInstructions ||
        ""
    ).replace(
      /\r?\n/g,
      "<br />"
    );

  const turnaroundMin =
    settings
      .turnaroundMinWeeks ??
    2;

  const turnaroundMax =
    settings
      .turnaroundMaxWeeks ??
    10;

  const contactBlock =
    settings.contactEmail
      ? `
        <p
          style="
            margin:24px 0 0;
            color:#4b5563;
            line-height:1.6;
          "
        >
          If you have any questions,
          simply reply to this email or
          contact us at
          <strong
            style="
              white-space:nowrap;
            "
          >
            ${escapeHtml(
              settings.contactEmail
            )}
          </strong>.
        </p>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#f5f2ec;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color:#1f2937;
        "
      >
        <div
          style="
            max-width:640px;
            margin:0 auto;
            padding:32px 16px;
          "
        >
          <div
            style="
              background:#ffffff;
              border-radius:12px;
              overflow:hidden;
              border:1px solid #e5e7eb;
            "
          >
            <div
              style="
                background:#171717;
                padding:30px 28px;
                text-align:center;
              "
            >
              <div
                style="
                  color:#d6b56d;
                  font-size:25px;
                  font-weight:700;
                  letter-spacing:.3px;
                "
              >
                ${escapeHtml(
                  businessName
                )}
              </div>
            </div>

            <div
              style="
                padding:32px 28px;
              "
            >
              <h1
                style="
                  margin:0 0 18px;
                  font-size:25px;
                  color:#171717;
                "
              >
                Thank you for your order
              </h1>

              <p
                style="
                  margin:0 0 18px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Hi
                ${escapeHtml(
                  customerFirstName
                )},
              </p>

              <p
                style="
                  margin:0 0 24px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Your payment has been
                received and your order
                with
                <strong>
                  ${escapeHtml(
                    businessName
                  )}
                </strong>
                is confirmed.
              </p>

              <div
                style="
                  padding:18px;
                  border-radius:8px;
                  background:#f7f3e8;
                  border:1px solid #e8dcc2;
                  margin-bottom:26px;
                "
              >
                <strong
                  style="
                    display:block;
                    margin-bottom:6px;
                    color:#171717;
                  "
                >
                  Order Number
                </strong>

                <span
                  style="
                    color:#4b5563;
                    font-weight:600;
                  "
                >
                  ${escapeHtml(
                    orderNumber
                  )}
                </span>
              </div>

              <h2
                style="
                  font-size:20px;
                  margin:0 0 14px;
                  color:#171717;
                "
              >
                Your Order
              </h2>

              ${buildOrderItemsHtml(
                order
              )}

              ${buildOrderTotalsHtml(
                order
              )}

              ${buildCustomerNoteHtml(
                order
              )}

              <div
                style="
                  border-top:
                    1px solid #e5e7eb;
                  margin:30px 0 28px;
                "
              ></div>

              <h2
                style="
                  font-size:20px;
                  margin:0 0 12px;
                  color:#171717;
                "
              >
                Mailing Your Memorial
                Materials
              </h2>

              <p
                style="
                  margin:0 0 18px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Please send your memorial
                or keepsake materials to:
              </p>

              <div
                style="
                  background:#f9fafb;
                  border-left:
                    4px solid #d6b56d;
                  padding:18px 20px;
                  margin-bottom:26px;
                  line-height:1.7;
                  color:#171717;
                "
              >
                <strong>
                  ${addressHtml}
                </strong>
              </div>

              <p
                style="
                  margin:0 0 22px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Please include your
                <strong>
                  name and order number
                </strong>
                inside your package so
                your materials can be
                matched to your order when
                they arrive.
              </p>

              <h2
                style="
                  font-size:20px;
                  margin:0 0 12px;
                  color:#171717;
                "
              >
                Memorial Material
                Instructions
              </h2>

              <div
                style="
                  line-height:1.7;
                  color:#4b5563;
                  margin-bottom:28px;
                "
              >
                ${memorialInstructions}
              </div>

              <div
                style="
                  padding:18px;
                  border-radius:8px;
                  background:#f7f3e8;
                  border:1px solid #e8dcc2;
                "
              >
                <strong
                  style="
                    display:block;
                    color:#171717;
                    margin-bottom:6px;
                  "
                >
                  Estimated Completion Time
                </strong>

                <span
                  style="
                    color:#4b5563;
                    line-height:1.6;
                  "
                >
                  Current estimated
                  handcrafted completion
                  time is
                  ${turnaroundMin}–${turnaroundMax}
                  weeks.
                </span>
              </div>

              ${contactBlock}

              <p
                style="
                  margin:26px 0 0;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Thank you for trusting us
                to create something
                meaningful for you.
              </p>
            </div>

            <div
              style="
                padding:20px 28px;
                text-align:center;
                background:#171717;
                color:#d1d5db;
                font-size:12px;
              "
            >
              ${escapeHtml(
                businessName
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildConfirmationEmailText({
  order,
  settings,
}) {
  const businessName =
    settings.businessName ||
    "Timeless Mineral Creations";

  const orderNumber =
    buildOrderNumber(
      order
    );

  const address =
    buildMailingAddress(
      settings
    ).join("\n");

  const turnaroundMin =
    settings
      .turnaroundMinWeeks ??
    2;

  const turnaroundMax =
    settings
      .turnaroundMaxWeeks ??
    10;

  const customerNote =
    order.customerNote?.trim()
      ? `

YOUR NOTE

${order.customerNote.trim()}
`
      : "";

  return `
Thank you for your order with ${businessName}.

Your payment has been received and your order is confirmed.

ORDER NUMBER
${orderNumber}

YOUR ORDER

${buildOrderItemsText(order)}

${buildOrderTotalsText(order)}${customerNote}

MAILING YOUR MEMORIAL MATERIALS

Please send your memorial or keepsake materials to:

${address}

Please include your name and order number inside your package so your materials can be matched to your order when they arrive.

MEMORIAL MATERIAL INSTRUCTIONS

${settings.memorialInstructions || ""}

ESTIMATED COMPLETION TIME

Current estimated handcrafted completion time is ${turnaroundMin}–${turnaroundMax} weeks.

${
  settings.contactEmail
    ? `Questions? Contact ${settings.contactEmail}`
    : ""
}

Thank you for trusting us to create something meaningful for you.

${businessName}
  `.trim();
}

async function sendOrderConfirmationEmail(
  order
) {
  if (
    !process.env
      .RESEND_API_KEY
  ) {
    throw new Error(
      "RESEND_API_KEY is missing."
    );
  }

  if (
    !order.customerEmail
  ) {
    console.warn(
      `Order ${order.id} has no customer email address.`
    );

    return false;
  }

  if (
    order
      .confirmationEmailSentAt
  ) {
    console.log(
      `Confirmation email already sent for order ${order.id}.`
    );

    return true;
  }

  const settings =
    await prisma.siteSettings.findUnique(
      {
        where: {
          id:
            "site-settings",
        },

        select: {
          businessName:
            true,

          contactEmail:
            true,

          addressLine1:
            true,

          addressLine2:
            true,

          city:
            true,

          state:
            true,

          postalCode:
            true,

          country:
            true,

          memorialInstructions:
            true,

          turnaroundMinWeeks:
            true,

          turnaroundMaxWeeks:
            true,
        },
      }
    );

  if (!settings) {
    throw new Error(
      "Site Settings could not be found."
    );
  }

  if (
    !settings.addressLine1 ||
    !settings.city ||
    !settings.state ||
    !settings.postalCode
  ) {
    throw new Error(
      "The private memorial mailing address in Admin Settings is incomplete."
    );
  }

  if (
    !settings
      .memorialInstructions
      ?.trim()
  ) {
    throw new Error(
      "Memorial instructions are missing from Admin Settings."
    );
  }

  const businessName =
    settings.businessName ||
    "Timeless Mineral Creations";

  const orderNumber =
    buildOrderNumber(
      order
    );

  const fromEmail =
    process.env
      .RESEND_FROM_EMAIL
      ?.trim() ||
    "Timeless Mineral Creations <onboarding@resend.dev>";

  const {
    data:
      emailData,

    error:
      emailError,
  } =
    await resend.emails.send(
      {
        from:
          fromEmail,

        to: [
          order.customerEmail,
        ],

        subject:
          `Order Confirmed — ${businessName} — ${orderNumber}`,

        html:
          buildConfirmationEmailHtml(
            {
              order,
              settings,
            }
          ),

        text:
          buildConfirmationEmailText(
            {
              order,
              settings,
            }
          ),

        ...(settings
          .contactEmail
          ? {
              replyTo:
                settings.contactEmail,
            }
          : {}),
      },

      {
        idempotencyKey:
          `order-confirmation/${order.id}`,
      }
    );

  if (emailError) {
    throw new Error(
      `Resend failed to send the confirmation email: ${
        emailError.message ||
        JSON.stringify(
          emailError
        )
      }`
    );
  }

  await prisma.order.update(
    {
      where: {
        id:
          order.id,
      },

      data: {
        confirmationEmailSentAt:
          new Date(),
      },
    }
  );

  console.log(
    "✅ Customer confirmation email sent:",
    {
      orderId:
        order.id,

      orderNumber,

      customerEmail:
        order.customerEmail,

      resendEmailId:
        emailData?.id ||
        null,
    }
  );

  return true;
}

function buildOrderItem(
  lineItem
) {
  const product =
    lineItem.price?.product &&
    typeof lineItem.price
      .product ===
      "object"
      ? lineItem.price
          .product
      : null;

  const metadata =
    product?.metadata ||
    {};

  const configuration =
    getConfiguration(
      metadata
    );

  const quantity =
    lineItem.quantity ||
    1;

  const lineTotal =
    typeof lineItem
      .amount_total ===
    "number"
      ? lineItem
          .amount_total /
        100
      : 0;

  const unitPrice =
    quantity > 0
      ? lineTotal /
        quantity
      : lineTotal;

  const productName =
    product?.name ||
    lineItem.description ||
    "Custom Memorial Jewelry";

  const productType =
    getMetadataValue(
      metadata,
      configuration,
      [
        "productType",
        "type",
        "category",
      ]
    ) ||
    "Custom Jewelry";

  const collectionName =
    getMetadataValue(
      metadata,
      configuration,
      [
        "collectionName",
        "collection",
        "collectionTitle",
      ]
    ) ||
    productName;

  const storedConfiguration = {
    ...metadata,
    ...configuration,

    itemDescription:
      product?.description ||
      configuration?.itemDescription ||
      metadata?.itemDescription ||
      "",
  };

  const configurationJson =
    Object.keys(
      storedConfiguration
    ).length > 0
      ? JSON.stringify(
          storedConfiguration
        )
      : null;

  return {
    productType,

    productName,

    collectionName,

    quantity,

    unitPrice,

    material:
      getMetadataValue(
        metadata,
        configuration,
        [
          "material",
          "selectedMaterial",
          "finish",
          "selectedFinish",
        ]
      ),

    core:
      getMetadataValue(
        metadata,
        configuration,
        [
          "core",
          "selectedCore",
          "coreName",
        ]
      ),

    style:
      getMetadataValue(
        metadata,
        configuration,
        [
          "style",
          "selectedStyle",
          "inlayStyle",
          "selectedInlayStyle",
        ]
      ),

    width:
      getMetadataValue(
        metadata,
        configuration,
        [
          "width",
          "selectedWidth",
        ]
      ),

    size:
      getMetadataValue(
        metadata,
        configuration,
        [
          "size",
          "selectedSize",
          "ringSize",
        ]
      ),

    design:
      getMetadataValue(
        metadata,
        configuration,
        [
          "design",
          "designName",
          "selectedDesign",
        ]
      ),

    memorialMaterials:
      getMetadataValue(
        metadata,
        configuration,
        [
          "memorialMaterials",
          "selectedMaterials",
          "memorialMaterial",
        ]
      ),

    minerals:
      getMetadataValue(
        metadata,
        configuration,
        [
          "minerals",
          "selectedMinerals",
          "mineral",
        ]
      ),

    accentMaterials:
      getMetadataValue(
        metadata,
        configuration,
        [
          "accentMaterials",
          "selectedAccentMaterials",
          "accents",
        ]
      ),

    glow:
      getMetadataValue(
        metadata,
        configuration,
        [
          "glow",
          "selectedGlow",
          "glowColor",
        ]
      ),

    engraving:
      getMetadataValue(
        metadata,
        configuration,
        [
          "engraving",
          "engravingText",
          "selectedEngraving",
        ]
      ),

    configurationJson,
  };
}

export async function POST(
  request
) {
  const body =
    await request.text();

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return Response.json(
      {
        error:
          "Missing Stripe signature.",
      },
      {
        status:
          400,
      }
    );
  }

  let event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        process.env
          .STRIPE_WEBHOOK_SECRET
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature failed:",
      error.message
    );

    return Response.json(
      {
        error:
          `Webhook Error: ${error.message}`,
      },
      {
        status:
          400,
      }
    );
  }

  try {
    switch (
      event.type
    ) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const webhookSession =
          event.data.object;

        const session =
          await stripe.checkout.sessions.retrieve(
            webhookSession.id,
            {
              expand: [
                "line_items.data.price.product",
                "payment_intent",
              ],
            }
          );

        if (
          session
            .payment_status !==
            "paid" &&
          event.type !==
            "checkout.session.async_payment_succeeded"
        ) {
          console.log(
            `Checkout session ${session.id} is not paid yet. Current status: ${session.payment_status}`
          );

          break;
        }

        let order =
          await prisma.order.findUnique(
            {
              where: {
                stripeSessionId:
                  session.id,
              },

              include: {
                items:
                  true,
              },
            }
          );

        if (
          order
            ?.confirmationEmailSentAt
        ) {
          console.log(
            `Order already exists and confirmation email was already sent for Stripe session ${session.id}.`
          );

          break;
        }

        if (order) {
          console.log(
            `Order already exists for Stripe session ${session.id}, but confirmation email has not been recorded yet. Retrying email delivery.`
          );
        }

        if (!order) {
          const customerDetails =
            session
              .customer_details;

          const shippingDetails =
            session
              .collected_information
              ?.shipping_details ||
            session
              .shipping_details ||
            null;

          const shippingAddress =
            shippingDetails
              ?.address ||
            customerDetails
              ?.address ||
            null;

          const stripeLineItems =
            session
              .line_items
              ?.data ||
            [];

          const orderItems =
            stripeLineItems.map(
              buildOrderItem
            );

          if (
            !orderItems.length
          ) {
            orderItems.push(
              {
                productType:
                  "Custom Jewelry",

                productName:
                  "Custom Memorial Jewelry",

                collectionName:
                  "Custom Memorial Jewelry",

                quantity:
                  1,

                unitPrice:
                  centsToDollars(
                    session
                      .amount_total
                  ) || 0,

                material:
                  null,

                core:
                  null,

                style:
                  null,

                width:
                  null,

                size:
                  null,

                design:
                  null,

                memorialMaterials:
                  null,

                minerals:
                  null,

                accentMaterials:
                  null,

                glow:
                  null,

                engraving:
                  null,

                configurationJson:
                  session.metadata
                    ? JSON.stringify(
                        session.metadata
                      )
                    : null,
              }
            );
          }

          order =
            await prisma.order.create(
              {
                data: {
                  stripeSessionId:
                    session.id,

                  paymentIntentId:
                    typeof session
                      .payment_intent ===
                    "string"
                      ? session
                          .payment_intent
                      : session
                          .payment_intent
                          ?.id ||
                        null,

                  paymentStatus:
                    session
                      .payment_status ||
                    "paid",

                  customerName:
                    customerDetails
                      ?.name ||
                    shippingDetails
                      ?.name ||
                    null,

                  customerEmail:
                    customerDetails
                      ?.email ||
                    session
                      .customer_email ||
                    null,

                  customerNote:
                    session
                      .metadata
                      ?.customerNote ||
                    null,

                  customerPhone:
                    customerDetails
                      ?.phone ||
                    null,

                  shippingName:
                    shippingDetails
                      ?.name ||
                    customerDetails
                      ?.name ||
                    null,

                  shippingAddress1:
                    shippingAddress
                      ?.line1 ||
                    null,

                  shippingAddress2:
                    shippingAddress
                      ?.line2 ||
                    null,

                  shippingCity:
                    shippingAddress
                      ?.city ||
                    null,

                  shippingState:
                    shippingAddress
                      ?.state ||
                    null,

                  shippingPostal:
                    shippingAddress
                      ?.postal_code ||
                    null,

                  shippingCountry:
                    shippingAddress
                      ?.country ||
                    null,

                  subtotal:
                    centsToDollars(
                      session
                        .amount_subtotal
                    ),

                  shippingCost:
                    centsToDollars(
                      session
                        .total_details
                        ?.amount_shipping
                    ),

                  taxAmount:
                    centsToDollars(
                      session
                        .total_details
                        ?.amount_tax
                    ),

                  totalPrice:
                    centsToDollars(
                      session
                        .amount_total
                    ) || 0,

                  status:
                    "Awaiting Memorial Materials",

                  items: {
                    create:
                      orderItems,
                  },
                },

                include: {
                  items:
                    true,
                },
              }
            );

          console.log(
            "✅ Order saved to Prisma:",
            {
              orderId:
                order.id,

              orderNumber:
                buildOrderNumber(
                  order
                ),

              stripeSessionId:
                order
                  .stripeSessionId,

              customerEmail:
                order
                  .customerEmail,

              totalPrice:
                order
                  .totalPrice,

              itemCount:
                order.items
                  .length,
            }
          );
        }

        await sendOrderConfirmationEmail(
          order
        );

        break;
      }

      default: {
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
      }
    }

    return Response.json(
      {
        received:
          true,
      }
    );
  } catch (error) {
    console.error(
      "Failed to process Stripe webhook:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to process the Stripe order.",
      },
      {
        status:
          500,
      }
    );
  }
}