"use client";

export default function ShippingReminder({
  selectedChannels = {},
  label = "Channel",
}) {
  const memorialCount = Object.values(
    selectedChannels
  ).filter(
    (selection) => selection?.memorial
  ).length;

  if (memorialCount < 2) {
    return null;
  }

  const isSection =
    label === "Section";

  return (
    <section
      style={{
        marginTop: "30px",
        padding: "22px",
        borderRadius: "16px",
        border:
          "1px solid rgba(212,175,55,.35)",
        background:
          "rgba(212,175,55,.08)",
        lineHeight: 1.7,
      }}
    >
      <h2
        style={{
          marginBottom: "12px",
        }}
      >
        📦 Important
      </h2>

      <p>
        If you&apos;re sending multiple memorial
        materials, please include a small note
        indicating which memorial material belongs
        in each selected{" "}
        {isSection
          ? "section"
          : "channel"}.
      </p>

      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          borderRadius: "10px",
          background:
            "rgba(255,255,255,.05)",
        }}
      >
        <strong>
          Example
        </strong>

        <ul
          style={{
            marginTop: "10px",
            paddingLeft: "20px",
          }}
        >
          {isSection ? (
            <>
              <li>
                Section 1 → Dad&apos;s Ashes
              </li>
              <li>
                Section 2 → Blue Opal
              </li>
              <li>
                Section 3 → Mom&apos;s Ashes
              </li>
              <li>
                Section 4 → Turquoise
              </li>
            </>
          ) : (
            <>
              <li>
                Channel 1 → Dad&apos;s Ashes + Blue Opal
              </li>
              <li>
                Channel 2 → Mom&apos;s Ashes + Turquoise
              </li>
            </>
          )}
        </ul>
      </div>

      <p
        style={{
          marginTop: "16px",
          opacity: 0.85,
        }}
      >
        This helps ensure each memorial material is
        placed exactly where you intended.
      </p>
    </section>
  );
}