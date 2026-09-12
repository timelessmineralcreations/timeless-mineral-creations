"use client";

import {
  useEffect,
  useState,
} from "react";

export default function GalleryViewer({
  title,
  images = [],
}) {
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  const selectedImage =
    images[selectedIndex] || images[0];

  useEffect(() => {
    if (!lightboxOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (
        event.key === "ArrowRight" &&
        images.length > 1
      ) {
        setSelectedIndex(
          (currentIndex) =>
            (currentIndex + 1) %
            images.length
        );
      }

      if (
        event.key === "ArrowLeft" &&
        images.length > 1
      ) {
        setSelectedIndex(
          (currentIndex) =>
            (currentIndex -
              1 +
              images.length) %
            images.length
        );
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [lightboxOpen, images.length]);

  if (!selectedImage) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl border border-white/10 bg-[#101010] text-6xl text-white/30">
        📸
      </div>
    );
  }

  function showPreviousImage() {
    setSelectedIndex(
      (currentIndex) =>
        (currentIndex -
          1 +
          images.length) %
        images.length
    );
  }

  function showNextImage() {
    setSelectedIndex(
      (currentIndex) =>
        (currentIndex + 1) %
        images.length
    );
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="group relative overflow-hidden rounded-2xl border border-white/12 bg-[#090909]">
          <button
            type="button"
            onClick={() =>
              setLightboxOpen(true)
            }
            className="block w-full cursor-zoom-in"
            aria-label="Open full-screen image"
          >
            <img
              src={selectedImage.imageUrl}
              alt={
                selectedImage.altText ||
                title
              }
              className="mx-auto block max-h-[720px] min-h-[320px] w-full object-contain"
            />
          </button>

          <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/65 px-3 py-2 text-xs font-bold text-white backdrop-blur">
            Click to enlarge
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/70 text-xl font-bold text-white backdrop-blur transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/70 text-xl font-bold text-white backdrop-blur transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                ›
              </button>
            </>
          ) : null}
        </div>

        {selectedImage.caption ? (
          <p className="text-center text-sm italic text-white/55">
            {selectedImage.caption}
          </p>
        ) : null}

        {images.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => {
              const selected =
                index === selectedIndex;

              return (
                <button
                  key={
                    image.id ||
                    image.imageUrl
                  }
                  type="button"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  aria-label={`View image ${
                    index + 1
                  }`}
                  className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selected
                      ? "border-[#d4af37]"
                      : "border-white/10 hover:border-white/35"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={
                      image.altText ||
                      `${title} image ${
                        index + 1
                      }`
                    }
                    className="h-full w-full object-cover"
                  />

                  {selected ? (
                    <div className="absolute inset-x-0 bottom-0 bg-[#d4af37] py-1 text-[10px] font-black uppercase tracking-wide text-black">
                      Selected
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4 sm:p-8"
          onClick={() =>
            setLightboxOpen(false)
          }
        >
          <button
            type="button"
            onClick={() =>
              setLightboxOpen(false)
            }
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/70 text-2xl text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
            aria-label="Close image viewer"
          >
            ×
          </button>

          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage.imageUrl}
              alt={
                selectedImage.altText ||
                title
              }
              className="max-h-full max-w-full object-contain"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/70 text-3xl text-white transition hover:border-[#d4af37] hover:text-[#d4af37] sm:left-4"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/70 text-3xl text-white transition hover:border-[#d4af37] hover:text-[#d4af37] sm:right-4"
                >
                  ›
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/75 px-4 py-2 text-sm font-bold text-white">
                  {selectedIndex + 1} /{" "}
                  {images.length}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}