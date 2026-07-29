"use client";

import { useMemo, useState } from "react";

const INITIAL_PHOTO_COUNT = 24;

export default function GalleryClient({ photos = [] }) {
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const collections = useMemo(() => {
    const collectionMap = new Map();

    photos.forEach((photo) => {
      if (!collectionMap.has(photo.collectionId)) {
        collectionMap.set(photo.collectionId, photo.collectionName);
      }
    });

    return Array.from(collectionMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesCollection =
        selectedCollection === "all" ||
        photo.collectionId === selectedCollection;

      const matchesSearch =
        !normalizedSearch ||
        photo.title.toLowerCase().includes(normalizedSearch) ||
        photo.collectionName.toLowerCase().includes(normalizedSearch) ||
        photo.filename.toLowerCase().includes(normalizedSearch);

      return matchesCollection && matchesSearch;
    });
  }, [photos, selectedCollection, searchTerm]);

  const visiblePhotos = showAll
    ? filteredPhotos
    : filteredPhotos.slice(0, INITIAL_PHOTO_COUNT);

  const remainingPhotoCount =
    filteredPhotos.length - INITIAL_PHOTO_COUNT;

  function selectCollection(collectionId) {
    setSelectedCollection(collectionId);
    setShowAll(false);
  }

  function handleSearch(event) {
    setSearchTerm(event.target.value);
    setShowAll(false);
  }

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <p className="eyebrow">Timeless Mineral Creations</p>

        <h1>Handcrafted Ring Gallery</h1>

        <p>
          Browse real memorial rings and custom mineral designs handcrafted
          with care. Every ring is completely unique because natural minerals
          and memorial materials create their own individual patterns.
        </p>
      </section>

      <section className="gallery-controls">
        <div className="search-box">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search turquoise, cremation, tungsten, glow..."
            aria-label="Search ring gallery"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setShowAll(false);
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="collection-filters">
          <button
            type="button"
            className={selectedCollection === "all" ? "active" : ""}
            onClick={() => selectCollection("all")}
          >
            All Rings
          </button>

          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              className={
                selectedCollection === collection.id ? "active" : ""
              }
              onClick={() => selectCollection(collection.id)}
            >
              {collection.name}
            </button>
          ))}
        </div>

        <p className="result-count">
          Showing {visiblePhotos.length} of {filteredPhotos.length} ring
          {filteredPhotos.length === 1 ? "" : "s"}
        </p>
      </section>

      {visiblePhotos.length > 0 ? (
        <>
          <section className="gallery-grid">
            {visiblePhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="gallery-card"
                onClick={() => setSelectedPhoto(photo)}
                aria-label={`View ${photo.title}`}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  loading="lazy"
                />

                <div className="photo-overlay">
                  <span className="collection-name">
                    {photo.collectionName}
                  </span>

                  <span className="photo-title">{photo.title}</span>
                </div>
              </button>
            ))}
          </section>

          {filteredPhotos.length > INITIAL_PHOTO_COUNT && (
            <div className="show-more-wrapper">
              <button
                type="button"
                className="show-more-button"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll
                  ? "Show Less"
                  : `View ${remainingPhotoCount} More Customer Rings`}
              </button>
            </div>
          )}
        </>
      ) : (
        <section className="empty-gallery">
          <div>🔎</div>
          <h2>No matching rings found</h2>
          <p>
            Try searching for another mineral, ring material, or collection.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedCollection("all");
              setShowAll(false);
            }}
          >
            View All Rings
          </button>
        </section>
      )}

      <section className="gallery-closing">
        <p className="eyebrow">Your Story, Your Design</p>

        <h2>Inspired by Something You See?</h2>

        <p>
          Every photograph is an example of a handcrafted ring. Your finished
          piece will have its own natural details and character, making it
          completely one of a kind.
        </p>

        <a href="/collections">Create Your Ring</a>
      </section>

      {selectedPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="close-lightbox"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close enlarged image"
          >
            ×
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
            />

            <div className="lightbox-caption">
              <span>{selectedPhoto.collectionName}</span>
              <h2>{selectedPhoto.title}</h2>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-page {
          width: min(1500px, calc(100% - 48px));
          margin: 0 auto;
          padding: 80px 0 110px;
        }

        .gallery-hero {
          max-width: 1000px;
          margin: 0 auto 55px;
          text-align: center;
        }

        .eyebrow {
          margin: 0 0 15px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.62;
        }

        .gallery-hero h1 {
          margin: 0;
          font-size: clamp(45px, 7vw, 76px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .gallery-hero > p:last-child {
          max-width: 880px;
          margin: 27px auto 0;
          font-size: 20px;
          line-height: 1.85;
          opacity: 0.8;
        }

        .gallery-controls {
          margin-bottom: 38px;
        }

        .search-box {
          max-width: 950px;
          min-height: 76px;
          display: flex;
          align-items: center;
          gap: 17px;
          margin: 0 auto;
          padding: 0 25px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 21px;
          background: #191919;
        }

        .search-box > span {
          font-size: 31px;
          opacity: 0.58;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          height: 74px;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-size: 18px;
        }

        .search-box input::placeholder {
          color: inherit;
          opacity: 0.43;
        }

        .search-box button {
          padding: 10px 16px;
          border: none;
          border-radius: 999px;
          background: white;
          color: black;
          cursor: pointer;
          font-weight: 800;
        }

        .collection-filters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 11px;
          margin-top: 30px;
        }

        .collection-filters button {
          padding: 12px 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          color: inherit;
          cursor: pointer;
          font-size: 14px;
          font-weight: 750;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .collection-filters button:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .collection-filters button.active {
          border-color: white;
          background: white;
          color: black;
        }

        .result-count {
          margin: 22px 0 0;
          text-align: center;
          font-size: 14px;
          opacity: 0.58;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .gallery-card {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: #151515;
          color: inherit;
          cursor: zoom-in;
          text-align: left;
        }

        .gallery-card img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .gallery-card:hover img {
          transform: scale(1.045);
        }

        .photo-overlay {
          position: absolute;
          inset: auto 0 0;
          display: grid;
          gap: 5px;
          padding: 48px 17px 16px;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.86),
            rgba(0, 0, 0, 0)
          );
          pointer-events: none;
        }

        .collection-name {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.72;
        }

        .photo-title {
          overflow: hidden;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .show-more-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 38px;
        }

        .show-more-button {
          padding: 15px 26px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: inherit;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
        }

        .empty-gallery {
          padding: 75px 25px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background: #191919;
          text-align: center;
        }

        .empty-gallery > div {
          margin-bottom: 17px;
          font-size: 46px;
        }

        .empty-gallery h2 {
          margin: 0;
          font-size: 31px;
        }

        .empty-gallery p {
          margin: 15px 0 0;
          font-size: 17px;
          opacity: 0.7;
        }

        .empty-gallery button {
          margin-top: 24px;
          padding: 13px 22px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 800;
        }

        .gallery-closing {
          max-width: 850px;
          margin: 90px auto 0;
          text-align: center;
        }

        .gallery-closing h2 {
          margin: 0;
          font-size: 40px;
          letter-spacing: -0.025em;
        }

        .gallery-closing > p:not(.eyebrow) {
          margin: 20px 0 0;
          font-size: 19px;
          line-height: 1.85;
          opacity: 0.8;
        }

        .gallery-closing a {
          display: inline-block;
          margin-top: 29px;
          padding: 15px 28px;
          border-radius: 999px;
          background: white;
          color: black;
          font-weight: 850;
          text-decoration: none;
        }

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 30px;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(9px);
        }

        .lightbox-content {
          width: min(900px, 100%);
          max-height: calc(100vh - 60px);
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 22px;
          background: #111;
        }

        .lightbox-content img {
          width: 100%;
          max-height: 75vh;
          display: block;
          object-fit: contain;
          background: black;
        }

        .lightbox-caption {
          padding: 22px 25px 25px;
        }

        .lightbox-caption span {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .lightbox-caption h2 {
          margin: 8px 0 0;
          font-size: 24px;
          line-height: 1.35;
        }

        .close-lightbox {
          position: fixed;
          top: 20px;
          right: 25px;
          z-index: 1001;
          width: 48px;
          height: 48px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          color: white;
          cursor: pointer;
          font-size: 31px;
          line-height: 1;
        }

        @media (max-width: 1100px) {
          .gallery-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 750px) {
          .gallery-page {
            width: min(100% - 24px, 1500px);
            padding-top: 50px;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 11px;
          }

          .gallery-card {
            border-radius: 14px;
          }

          .photo-overlay {
            padding: 40px 12px 12px;
          }

          .photo-title {
            font-size: 12px;
          }

          .collection-name {
            font-size: 9px;
          }

          .search-box {
            min-height: 64px;
            padding: 0 15px;
          }

          .search-box input {
            height: 62px;
            font-size: 15px;
          }

          .collection-filters {
            justify-content: flex-start;
          }

          .collection-filters button {
            padding: 10px 14px;
            font-size: 13px;
          }

          .lightbox {
            padding: 12px;
          }

          .close-lightbox {
            top: 12px;
            right: 12px;
          }
        }

        @media (max-width: 420px) {
          .gallery-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}