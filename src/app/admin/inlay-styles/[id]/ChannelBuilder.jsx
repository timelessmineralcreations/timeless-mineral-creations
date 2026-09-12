"use client";

import { useMemo, useState } from "react";

function formatMemorialMaterialKey(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "Unknown Material";
  }

  return text
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2"
    )
    .replace(/[-_]+/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function createBlankChannel(index) {
  return {
    id: `channel-${index + 1}`,
    name: `Channel ${index + 1}`,
    selectionMode: "either",

    memorialMaterials: {
      enabled: true,
      allowed: [],
      required: [],
      min: 0,
      max: 1,
    },

    minerals: {
      enabled: true,
      min: 0,
      max: 1,
    },

    glow: {
      enabled: false,
      required: false,
    },

    required: false,
  };
}

function normalizeChannel(channel, index) {
  return {
    ...createBlankChannel(index),
    ...channel,

    id:
      channel?.id ||
      `channel-${index + 1}`,

    name:
      channel?.name ||
      `Channel ${index + 1}`,

    memorialMaterials: {
      ...createBlankChannel(index).memorialMaterials,
      ...(channel?.memorialMaterials || {}),
    },

    minerals: {
      ...createBlankChannel(index).minerals,
      ...(channel?.minerals || {}),
    },

    glow: {
      ...createBlankChannel(index).glow,
      ...(channel?.glow || {}),
    },
  };
}

export default function ChannelBuilder({
  initialChannels = [],
  memorialMaterialOptions = [],
}) {
  const [channels, setChannels] = useState(() =>
    initialChannels.map(normalizeChannel)
  );

  /*
   * Active materials are supplied by
   * Admin → Memorial Materials.
   *
   * If an existing channel still references
   * an inactive legacy material, keep it
   * visible so editing the channel does not
   * silently erase that rule.
   */
  const displayMemorialMaterialOptions =
    useMemo(() => {
      const optionMap = new Map();

      for (
        const option of
          memorialMaterialOptions
      ) {
        const id = String(
          option?.id || ""
        ).trim();

        if (!id) {
          continue;
        }

        optionMap.set(id, {
          id,
          name:
            String(
              option?.name || id
            ).trim() || id,
        });
      }

      for (const channel of channels) {
        const memorial =
          channel?.memorialMaterials || {};

        for (
          const list of [
            memorial.allowed,
            memorial.required,
          ]
        ) {
          if (!Array.isArray(list)) {
            continue;
          }

          for (const value of list) {
            const id = String(
              value || ""
            ).trim();

            if (
              !id ||
              optionMap.has(id)
            ) {
              continue;
            }

            optionMap.set(id, {
              id,
              name: `${formatMemorialMaterialKey(
                id
              )} (Inactive in Master)`,
            });
          }
        }
      }

      return [
        ...optionMap.values(),
      ];
    }, [
      memorialMaterialOptions,
      channels,
    ]);

  const channelCount = channels.length;

  const channelsJson = useMemo(
    () => JSON.stringify(channels),
    [channels]
  );

  function setChannelCount(value) {
    const count = Math.max(
      0,
      Math.min(12, Number(value) || 0)
    );

    setChannels((current) => {
      if (count === current.length) {
        return current;
      }

      if (count < current.length) {
        return current.slice(0, count);
      }

      const next = [...current];

      while (next.length < count) {
        next.push(
          createBlankChannel(next.length)
        );
      }

      return next;
    });
  }

  function updateChannel(
    channelIndex,
    updater
  ) {
    setChannels((current) =>
      current.map((channel, index) => {
        if (index !== channelIndex) {
          return channel;
        }

        return typeof updater === "function"
          ? updater(channel)
          : {
              ...channel,
              ...updater,
            };
      })
    );
  }

  function updateNested(
    channelIndex,
    section,
    patch
  ) {
    updateChannel(
      channelIndex,
      (channel) => ({
        ...channel,

        [section]: {
          ...(channel[section] || {}),
          ...patch,
        },
      })
    );
  }

  function toggleAllowedMaterial(
    channelIndex,
    materialId
  ) {
    updateChannel(
      channelIndex,
      (channel) => {
        const current =
          channel.memorialMaterials?.allowed ||
          [];

        const exists =
          current.includes(materialId);

        return {
          ...channel,

          memorialMaterials: {
            ...channel.memorialMaterials,

            allowed: exists
              ? current.filter(
                  (id) =>
                    id !== materialId
                )
              : [
                  ...current,
                  materialId,
                ],
          },
        };
      }
    );
  }

  function toggleRequiredMaterial(
    channelIndex,
    materialId
  ) {
    updateChannel(
      channelIndex,
      (channel) => {
        const current =
          channel.memorialMaterials?.required ||
          [];

        const exists =
          current.includes(materialId);

        return {
          ...channel,

          memorialMaterials: {
            ...channel.memorialMaterials,

            required: exists
              ? current.filter(
                  (id) =>
                    id !== materialId
                )
              : [
                  ...current,
                  materialId,
                ],
          },
        };
      }
    );
  }

  function moveChannel(
    index,
    direction
  ) {
    setChannels((current) => {
      const targetIndex =
        index + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];

      const [item] = next.splice(
        index,
        1
      );

      next.splice(
        targetIndex,
        0,
        item
      );

      return next;
    });
  }

  function removeChannel(index) {
    setChannels((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
      }}
    >
      <input
        type="hidden"
        name="channelsJson"
        value={channelsJson}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "16px",
        }}
      >
        <label
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontWeight: 850,
              fontSize: "14px",
            }}
          >
            Number of Channels / Sections
          </span>

          <input
            type="number"
            min="0"
            max="12"
            value={channelCount}
            onChange={(event) =>
              setChannelCount(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <span style={helpStyle}>
            Use 0 for a normal single-inlay design.
            Use 2, 3, 4, etc. for designs where the
            customer chooses each channel separately.
          </span>
        </label>
      </div>

      {channelCount === 0 ? (
        <div
          style={{
            padding: "16px",
            border:
              "1px solid rgba(255,255,255,.1)",
            borderRadius: "12px",
            color: "#98a49f",
            lineHeight: 1.5,
          }}
        >
          This style does not currently use separate
          channel selections.
        </div>
      ) : null}

      {channels.map(
        (channel, index) => {
          const memorial =
            channel.memorialMaterials ||
            {};

          const mineral =
            channel.minerals ||
            {};

          const glow =
            channel.glow || {};

          const allowedMaterials =
            memorial.allowed || [];

          const requiredMaterials =
            memorial.required || [];

          return (
            <section
              key={`${channel.id}-${index}`}
              style={{
                border:
                  "1px solid rgba(217,181,109,.22)",
                borderRadius: "15px",
                padding: "18px",
                background:
                  "rgba(217,181,109,.035)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "19px",
                    }}
                  >
                    {channel.name ||
                      `Channel ${
                        index + 1
                      }`}
                  </h3>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#98a49f",
                      fontSize: "12px",
                    }}
                  >
                    Position {index + 1}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      moveChannel(
                        index,
                        -1
                      )
                    }
                    disabled={
                      index === 0
                    }
                    style={
                      smallButtonStyle
                    }
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveChannel(
                        index,
                        1
                      )
                    }
                    disabled={
                      index ===
                      channels.length - 1
                    }
                    style={
                      smallButtonStyle
                    }
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeChannel(index)
                    }
                    style={{
                      ...smallButtonStyle,
                      border:
                        "1px solid rgba(221,92,92,.5)",
                      color:
                        "#ff9d9d",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div
                style={twoColumnStyle}
              >
                <label
                  style={fieldStyle}
                >
                  <span
                    style={
                      fieldLabelStyle
                    }
                  >
                    Channel ID
                  </span>

                  <input
                    type="text"
                    value={
                      channel.id || ""
                    }
                    onChange={(event) =>
                      updateChannel(
                        index,
                        {
                          id:
                            event.target
                              .value,
                        }
                      )
                    }
                    style={inputStyle}
                  />

                  <span style={helpStyle}>
                    Internal identifier. Keep it unique.
                    Example: channel-1 or center-channel.
                  </span>
                </label>

                <label
                  style={fieldStyle}
                >
                  <span
                    style={
                      fieldLabelStyle
                    }
                  >
                    Customer Label
                  </span>

                  <input
                    type="text"
                    value={
                      channel.name || ""
                    }
                    onChange={(event) =>
                      updateChannel(
                        index,
                        {
                          name:
                            event.target
                              .value,
                        }
                      )
                    }
                    style={inputStyle}
                  />

                  <span style={helpStyle}>
                    Example: Channel 1, Left Channel,
                    Center Channel, Section A.
                  </span>
                </label>
              </div>

              <label
                style={fieldStyle}
              >
                <span
                  style={
                    fieldLabelStyle
                  }
                >
                  What can the customer choose here?
                </span>

                <select
                  value={
                    channel.selectionMode ||
                    "either"
                  }
                  onChange={(event) =>
                    updateChannel(
                      index,
                      {
                        selectionMode:
                          event.target
                            .value,
                      }
                    )
                  }
                  style={inputStyle}
                >
                  <option value="memorial">
                    Memorial Material Only
                  </option>

                  <option value="mineral">
                    Mineral Only
                  </option>

                  <option value="either">
                    Memorial OR Mineral
                  </option>

                  <option value="both">
                    Memorial AND Mineral
                  </option>
                </select>
              </label>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <ToggleCard
                  label="Channel Required"
                  description="The customer must make a selection for this channel before the design is complete."
                  checked={
                    channel.required ===
                    true
                  }
                  onChange={(checked) =>
                    updateChannel(
                      index,
                      {
                        required:
                          checked,
                      }
                    )
                  }
                />

                <ToggleCard
                  label="Enable Memorial Materials"
                  description="Allow memorial materials in this channel."
                  checked={
                    memorial.enabled ===
                    true
                  }
                  onChange={(checked) =>
                    updateNested(
                      index,
                      "memorialMaterials",
                      {
                        enabled:
                          checked,
                      }
                    )
                  }
                />

                <ToggleCard
                  label="Enable Minerals"
                  description="Allow natural mineral selections in this channel."
                  checked={
                    mineral.enabled ===
                    true
                  }
                  onChange={(checked) =>
                    updateNested(
                      index,
                      "minerals",
                      {
                        enabled:
                          checked,
                      }
                    )
                  }
                />

                <ToggleCard
                  label="Enable Glow Powder"
                  description="Allow glow powder to be chosen for this channel."
                  checked={
                    glow.enabled ===
                    true
                  }
                  onChange={(checked) =>
                    updateNested(
                      index,
                      "glow",
                      {
                        enabled:
                          checked,
                      }
                    )
                  }
                />
              </div>

              {memorial.enabled ? (
                <div
                  style={{
                    marginTop: "22px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 6px",
                      fontSize: "16px",
                    }}
                  >
                    Allowed Memorial Materials
                  </h4>

                  <p
                    style={{
                      ...helpStyle,
                      marginBottom:
                        "12px",
                    }}
                  >
                    Choose exactly which keepsake
                    materials can be selected for this
                    channel.
                  </p>

                  <div
                    style={
                      optionGridStyle
                    }
                  >
                    {displayMemorialMaterialOptions.map(
                      (material) => (
                        <CheckCard
                          key={
                            material.id
                          }
                          label={
                            material.name
                          }
                          checked={allowedMaterials.includes(
                            material.id
                          )}
                          onChange={() =>
                            toggleAllowedMaterial(
                              index,
                              material.id
                            )
                          }
                        />
                      )
                    )}
                  </div>

                  <div
                    style={{
                      ...twoColumnStyle,
                      marginTop:
                        "16px",
                    }}
                  >
                    <label
                      style={
                        fieldStyle
                      }
                    >
                      <span
                        style={
                          fieldLabelStyle
                        }
                      >
                        Minimum Memorial Selections
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={
                          memorial.min ??
                          0
                        }
                        onChange={(
                          event
                        ) =>
                          updateNested(
                            index,
                            "memorialMaterials",
                            {
                              min:
                                Number(
                                  event
                                    .target
                                    .value
                                ) ||
                                0,
                            }
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    </label>

                    <label
                      style={
                        fieldStyle
                      }
                    >
                      <span
                        style={
                          fieldLabelStyle
                        }
                      >
                        Maximum Memorial Selections
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={
                          memorial.max ??
                          1
                        }
                        onChange={(
                          event
                        ) =>
                          updateNested(
                            index,
                            "memorialMaterials",
                            {
                              max:
                                Number(
                                  event
                                    .target
                                    .value
                                ) ||
                                0,
                            }
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "18px",
                    }}
                  >
                    <h4
                      style={{
                        margin:
                          "0 0 6px",
                        fontSize:
                          "16px",
                      }}
                    >
                      Required Memorial Materials
                    </h4>

                    <p
                      style={{
                        ...helpStyle,
                        marginBottom:
                          "12px",
                      }}
                    >
                      Only use this if a specific
                      memorial material must always be
                      present in this channel.
                    </p>

                    <div
                      style={
                        optionGridStyle
                      }
                    >
                      {displayMemorialMaterialOptions.map(
                        (material) => (
                          <CheckCard
                            key={`required-${material.id}`}
                            label={
                              material.name
                            }
                            checked={requiredMaterials.includes(
                              material.id
                            )}
                            onChange={() =>
                              toggleRequiredMaterial(
                                index,
                                material.id
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {mineral.enabled ? (
                <div
                  style={{
                    ...twoColumnStyle,
                    marginTop: "22px",
                  }}
                >
                  <label
                    style={fieldStyle}
                  >
                    <span
                      style={
                        fieldLabelStyle
                      }
                    >
                      Minimum Minerals
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        mineral.min ?? 0
                      }
                      onChange={(
                        event
                      ) =>
                        updateNested(
                          index,
                          "minerals",
                          {
                            min:
                              Number(
                                event
                                  .target
                                  .value
                              ) || 0,
                          }
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </label>

                  <label
                    style={fieldStyle}
                  >
                    <span
                      style={
                        fieldLabelStyle
                      }
                    >
                      Maximum Minerals
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        mineral.max ?? 1
                      }
                      onChange={(
                        event
                      ) =>
                        updateNested(
                          index,
                          "minerals",
                          {
                            max:
                              Number(
                                event
                                  .target
                                  .value
                              ) || 0,
                          }
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </label>
                </div>
              ) : null}

              {glow.enabled ? (
                <div
                  style={{
                    marginTop: "18px",
                  }}
                >
                  <ToggleCard
                    label="Glow Required"
                    description="The customer must choose a glow powder for this channel."
                    checked={
                      glow.required ===
                      true
                    }
                    onChange={(checked) =>
                      updateNested(
                        index,
                        "glow",
                        {
                          required:
                            checked,
                        }
                      )
                    }
                  />
                </div>
              ) : null}
            </section>
          );
        }
      )}
    </div>
  );
}

function ToggleCard({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "14px",
        border:
          "1px solid rgba(255,255,255,.1)",
        borderRadius: "11px",
        background:
          "rgba(255,255,255,.025)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        style={{
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor:
            "#d9b56d",
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            marginBottom: "3px",
          }}
        >
          {label}
        </strong>

        <span style={helpStyle}>
          {description}
        </span>
      </span>
    </label>
  );
}

function CheckCard({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "11px",
        border:
          "1px solid rgba(255,255,255,.1)",
        borderRadius: "10px",
        background:
          "rgba(255,255,255,.025)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: "17px",
          height: "17px",
          accentColor:
            "#d9b56d",
        }}
      />

      <span
        style={{
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {label}
      </span>
    </label>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "44px",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background:
    "rgba(0,0,0,.2)",
  color: "#f3f7f5",
  fontSize: "14px",
};

const fieldStyle = {
  display: "grid",
  gap: "8px",
};

const fieldLabelStyle = {
  fontSize: "14px",
  fontWeight: 850,
};

const helpStyle = {
  color: "#98a49f",
  fontSize: "12px",
  lineHeight: 1.45,
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
  gap: "14px",
};

const optionGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: "10px",
};

const smallButtonStyle = {
  minHeight: "38px",
  padding: "0 12px",
  borderRadius: "9px",
  border:
    "1px solid rgba(255,255,255,.14)",
  background:
    "rgba(255,255,255,.035)",
  color: "#dfe7e3",
  cursor: "pointer",
  fontWeight: 800,
};