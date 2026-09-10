"use client";

import { useRef, useState } from "react";

export default function ImagePositionEditor({
  title,
  description,
  imagePath,

  scaleName,
  xName,
  yName,

  defaultScale = 1,
  defaultX = 0,
  defaultY = 0,

  aspectRatio = "4 / 3",
  fitMode = "contain",
}) {
  const previewRef = useRef(null);
  const dragRef = useRef(null);

  const [scale, setScale] = useState(
    clamp(toNumber(defaultScale, 1), 0.2, 4)
  );

  const [x, setX] = useState(
    clamp(toNumber(defaultX, 0), -100, 100)
  );

  const [y, setY] = useState(
    clamp(toNumber(defaultY, 0), -100, 100)
  );

  const [isDragging, setIsDragging] =
    useState(false);

  function handlePointerDown(event) {
    if (!imagePath) {
      return;
    }

    event.preventDefault();

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: x,
      startY: y,
    };

    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const preview = previewRef.current;

    if (
      !drag ||
      !preview ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const bounds =
      preview.getBoundingClientRect();

    if (
      bounds.width <= 0 ||
      bounds.height <= 0
    ) {
      return;
    }

    const deltaX =
      event.clientX - drag.startClientX;

    const deltaY =
      event.clientY - drag.startClientY;

    const nextX =
      drag.startX +
      (deltaX / bounds.width) * 100;

    const nextY =
      drag.startY +
      (deltaY / bounds.height) * 100;

    setX(
      clamp(roundToTenth(nextX), -100, 100)
    );

    setY(
      clamp(roundToTenth(nextY), -100, 100)
    );
  }

  function handlePointerEnd(event) {
    if (
      dragRef.current?.pointerId !==
      event.pointerId
    ) {
      return;
    }

    dragRef.current = null;
    setIsDragging(false);
  }

  function handleWheel(event) {
    if (!imagePath) {
      return;
    }

    event.preventDefault();

    const direction =
      event.deltaY > 0 ? -1 : 1;

    setScale((currentScale) =>
      clamp(
        roundToHundredth(
          currentScale + direction * 0.08
        ),
        0.2,
        4
      )
    );
  }

  function resetEditor() {
    setScale(1);
    setX(0);
    setY(0);
  }

  function centerImage() {
    setX(0);
    setY(0);
  }

  function fitImage() {
    setScale(1);
    setX(0);
    setY(0);
  }

  function zoomIn() {
    setScale((currentScale) =>
      clamp(
        roundToHundredth(
          currentScale + 0.1
        ),
        0.2,
        4
      )
    );
  }

  function zoomOut() {
    setScale((currentScale) =>
      clamp(
        roundToHundredth(
          currentScale - 0.1
        ),
        0.2,
        4
      )
    );
  }

  return (
    <section style={editorCardStyle}>
      <input
        type="hidden"
        name={scaleName}
        value={scale}
      />

      <input
        type="hidden"
        name={xName}
        value={x}
      />

      <input
        type="hidden"
        name={yName}
        value={y}
      />

      <div style={headingStyle}>
        <div>
          <h3 style={titleStyle}>
            {title}
          </h3>

          {description ? (
            <p style={descriptionStyle}>
              {description}
            </p>
          ) : null}
        </div>

        <div style={valueBadgeStyle}>
          {scale.toFixed(2)}×
        </div>
      </div>

      <div
        ref={previewRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
        style={{
          ...previewStyle,
          aspectRatio,
          cursor: imagePath
            ? isDragging
              ? "grabbing"
              : "grab"
            : "default",
        }}
      >
        <div style={checkerboardStyle} />

        {imagePath ? (
          <img
            src={imagePath}
            alt={`${title} preview`}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: fitMode,
              objectPosition: "center",
              transformOrigin: "center",
              transform: `translate(${x}%, ${y}%) scale(${scale})`,
              pointerEvents: "none",
              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
        ) : (
          <div style={emptyStateStyle}>
            Enter an image path to begin
            positioning the image.
          </div>
        )}

        {imagePath ? (
          <>
            <div style={centerGuideVerticalStyle} />

            <div style={centerGuideHorizontalStyle} />

            <div style={dragHintStyle}>
              Drag to move · Scroll to zoom
            </div>
          </>
        ) : null}
      </div>

      <div style={toolbarStyle}>
        <button
          type="button"
          onClick={zoomOut}
          disabled={!imagePath}
          style={smallButtonStyle}
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={!imagePath}
          style={smallButtonStyle}
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          onClick={centerImage}
          disabled={!imagePath}
          style={toolbarButtonStyle}
        >
          Center
        </button>

        <button
          type="button"
          onClick={fitImage}
          disabled={!imagePath}
          style={toolbarButtonStyle}
        >
          Fit Image
        </button>

        <button
          type="button"
          onClick={resetEditor}
          disabled={!imagePath}
          style={toolbarButtonStyle}
        >
          Reset
        </button>
      </div>

      <div style={controlsStyle}>
        <RangeControl
          label="Zoom"
          value={`${scale.toFixed(2)}×`}
          min={0.2}
          max={4}
          step={0.01}
          currentValue={scale}
          disabled={!imagePath}
          onChange={(nextValue) =>
            setScale(nextValue)
          }
        />

        <RangeControl
          label="Horizontal Position"
          value={`${x.toFixed(1)}%`}
          min={-100}
          max={100}
          step={0.5}
          currentValue={x}
          disabled={!imagePath}
          onChange={(nextValue) =>
            setX(nextValue)
          }
        />

        <RangeControl
          label="Vertical Position"
          value={`${y.toFixed(1)}%`}
          min={-100}
          max={100}
          step={0.5}
          currentValue={y}
          disabled={!imagePath}
          onChange={(nextValue) =>
            setY(nextValue)
          }
        />
      </div>

      <div style={statusRowStyle}>
        <span>
          X: {x.toFixed(1)}
        </span>

        <span>
          Y: {y.toFixed(1)}
        </span>

        <span>
          Zoom: {scale.toFixed(2)}
        </span>
      </div>
    </section>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  currentValue,
  disabled,
  onChange,
}) {
  return (
    <label style={rangeGroupStyle}>
      <span style={rangeHeadingStyle}>
        <span>{label}</span>

        <strong style={rangeValueStyle}>
          {value}
        </strong>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        style={{
          ...rangeInputStyle,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled
            ? "not-allowed"
            : "pointer",
        }}
      />
    </label>
  );
}

function toNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function roundToHundredth(value) {
  return Math.round(value * 100) / 100;
}

const editorCardStyle = {
  display: "grid",
  gap: "18px",
  padding: "18px",
  borderRadius: "16px",
  border:
    "1px solid rgba(255,255,255,0.11)",
  background:
    "rgba(255,255,255,0.025)",
};

const headingStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
};

const titleStyle = {
  margin: "0 0 5px",
  color: "#eef3f0",
  fontSize: "17px",
};

const descriptionStyle = {
  margin: 0,
  color: "#98a49f",
  fontSize: "13px",
  lineHeight: 1.5,
};

const valueBadgeStyle = {
  flexShrink: 0,
  padding: "6px 10px",
  borderRadius: "999px",
  border:
    "1px solid rgba(217,181,109,0.3)",
  background:
    "rgba(217,181,109,0.08)",
  color: "#e6c475",
  fontSize: "12px",
  fontWeight: "900",
};

const previewStyle = {
  position: "relative",
  width: "100%",
  overflow: "hidden",
  borderRadius: "13px",
  border:
    "1px solid rgba(255,255,255,0.14)",
  background: "#08110e",
  touchAction: "none",
  userSelect: "none",
};

const checkerboardStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(45deg, rgba(255,255,255,0.035) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.035) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.035) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.035) 75%)",
  backgroundSize: "24px 24px",
  backgroundPosition:
    "0 0, 0 12px, 12px -12px, -12px 0",
  pointerEvents: "none",
};

const emptyStateStyle = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  padding: "24px",
  color: "#78857f",
  textAlign: "center",
  fontSize: "13px",
  lineHeight: 1.5,
};

const dragHintStyle = {
  position: "absolute",
  left: "12px",
  bottom: "12px",
  padding: "6px 9px",
  borderRadius: "8px",
  background: "rgba(0,0,0,0.72)",
  color: "#f5f5f5",
  fontSize: "11px",
  fontWeight: "800",
  pointerEvents: "none",
};

const centerGuideVerticalStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  width: "1px",
  background:
    "rgba(217,181,109,0.16)",
  pointerEvents: "none",
};

const centerGuideHorizontalStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  height: "1px",
  background:
    "rgba(217,181,109,0.16)",
  pointerEvents: "none",
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const smallButtonStyle = {
  width: "38px",
  minHeight: "38px",
  borderRadius: "9px",
  border:
    "1px solid rgba(255,255,255,0.14)",
  background:
    "rgba(255,255,255,0.04)",
  color: "#e8eeeb",
  fontSize: "20px",
  fontWeight: "800",
  cursor: "pointer",
};

const toolbarButtonStyle = {
  minHeight: "38px",
  padding: "0 13px",
  borderRadius: "9px",
  border:
    "1px solid rgba(255,255,255,0.14)",
  background:
    "rgba(255,255,255,0.04)",
  color: "#dfe7e3",
  fontSize: "12px",
  fontWeight: "850",
  cursor: "pointer",
};

const controlsStyle = {
  display: "grid",
  gap: "14px",
};

const rangeGroupStyle = {
  display: "grid",
  gap: "8px",
};

const rangeHeadingStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  color: "#dfe7e3",
  fontSize: "13px",
  fontWeight: "800",
};

const rangeValueStyle = {
  color: "#d9b56d",
};

const rangeInputStyle = {
  width: "100%",
  accentColor: "#d9b56d",
};

const statusRowStyle = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  color: "#82908a",
  fontSize: "12px",
};