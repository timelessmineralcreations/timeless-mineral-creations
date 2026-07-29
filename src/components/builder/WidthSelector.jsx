import OptionCard from "@/components/builder/OptionCard";

function getWidthLabel(width) {
  if (width == null) return "Slim";
  if (width <= 4) return "Slim";
  if (width <= 6) return "Classic";
  if (width <= 8) return "Bold";
  return "Extra Bold";
}

export default function WidthSelector({
  widths,
  selectedWidth,
  onSelectWidth,
}) {
  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>Choose Width</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(115px, 1fr))",
          gap: "12px",
        }}
      >
        {widths?.map((widthOption, index) => {
          const isSlimProfile =
            widthOption.width == null;

          const title = isSlimProfile
            ? "Slim"
            : `${widthOption.width}mm`;

          const subtitle = isSlimProfile
            ? "Delicate Profile"
            : getWidthLabel(widthOption.width);

          const description = isSlimProfile
            ? "Fixed slim keepsake ring profile"
            : widthOption.channel != null
            ? `${widthOption.channel}mm inlay channel`
            : "Fixed ring width";

          return (
            <OptionCard
              key={`${
                widthOption.width ?? "slim"
              }-${widthOption.channel ?? "fixed"}-${index}`}
              title={title}
              subtitle={subtitle}
              description={description}
              active={selectedWidth === widthOption}
              onClick={() =>
                onSelectWidth(widthOption)
              }
            />
          );
        })}
      </div>
    </section>
  );
}