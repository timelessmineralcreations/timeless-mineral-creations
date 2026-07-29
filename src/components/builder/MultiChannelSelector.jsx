"use client";

import ChannelCard from "@/components/builder/ChannelCard";

export default function MultiChannelSelector({
  channels = [],
  memorialMaterials = [],
  minerals = [],
  glowPowders = [],
  selectedChannels = {},
  onChangeChannel,
  groupLabel = "Channel",
}) {
  if (!channels.length) return null;

  return (
    <section style={{ marginBottom: "30px" }}>
      <h2 style={{ marginBottom: "8px" }}>
        Customize Each {groupLabel}
      </h2>

      <p
        style={{
          opacity: 0.75,
          lineHeight: 1.5,
          marginBottom: "20px",
        }}
      >
        Select what you would like placed in each separate{" "}
        {groupLabel.toLowerCase()}.
      </p>

      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id || `channel-${index + 1}`}
          channel={channel}
          index={index}
          memorialMaterials={memorialMaterials}
          minerals={minerals}
          glowPowders={glowPowders}
          groupLabel={groupLabel}
          selection={selectedChannels[channel.id] || {}}
          onChange={(selection) =>
            onChangeChannel?.(channel.id, selection)
          }
        />
      ))}
    </section>
  );
}