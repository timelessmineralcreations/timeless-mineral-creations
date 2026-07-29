import { reviews, reviewSummary } from "@/data/reviews";

export const metadata = {
  title: "Customer Reviews | Timeless Mineral Creations",
  description:
    "Read customer experiences with handcrafted memorial rings from Timeless Mineral Creations.",
};

function Stars({ rating = 5 }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
    </div>
  );
}

export default function ReviewsPage() {
  const featuredReviews = reviews.filter((review) => review.featured);
  const additionalReviews = reviews.filter((review) => !review.featured);

  return (
    <main className="reviews-page">
      {/* Hero */}
      <section className="reviews-hero">
        <p className="eyebrow">Timeless Mineral Creations</p>

        <h1>Stories From Our Customers</h1>

        <p className="hero-description">
          Every memorial ring represents a life, a relationship, and a memory
          worth preserving. It is an honor to receive these thoughtful words
          from the families who have trusted me with something so meaningful.
        </p>

        <div className="rating-summary">
          <div className="rating-number">
            <strong>{reviewSummary.rating.toFixed(1)}</strong>
            <Stars rating={5} />
          </div>

          <div className="rating-copy">
            <span>Average Customer Rating</span>

            <p>
              Based on {reviewSummary.reviewCount} customer reviews on{" "}
              {reviewSummary.source}
            </p>
          </div>
        </div>

        <a
          className="etsy-link"
          href={reviewSummary.shopUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View All Reviews on Etsy →
        </a>
      </section>

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <>
          <section className="section-heading">
            <p className="eyebrow">Featured Experiences</p>
            <h2>Memories Carried Forward</h2>
          </section>

          <section className="featured-grid">
            {featuredReviews.map((review) => (
              <article className="review-card featured" key={review.id}>
                {review.image && (
                  <div className="review-image">
                    <img
                      src={review.image}
                      alt={`${review.product} customer review`}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="review-content">
                  <div className="review-top">
                    <Stars rating={review.rating} />

                    {review.hasPhoto && (
                      <span className="photo-badge">Customer Photo</span>
                    )}
                  </div>

                  <blockquote>“{review.text}”</blockquote>

                  <div className="review-footer">
                    <div className="review-customer">
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>

                    <p>{review.product}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Additional Reviews */}
      {additionalReviews.length > 0 && (
        <>
          <section className="section-heading additional-heading">
            <p className="eyebrow">More Kind Words</p>

            <h2>Trusted With Their Most Meaningful Memories</h2>
          </section>

          <section className="additional-grid">
            {additionalReviews.map((review) => (
              <article className="review-card" key={review.id}>
                {review.image && (
                  <div className="review-image">
                    <img
                      src={review.image}
                      alt={`${review.product} customer review`}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="review-content">
                  <Stars rating={review.rating} />

                  <blockquote>“{review.text}”</blockquote>

                  <div className="review-footer">
                    <div className="review-customer">
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>

                    <p>{review.product}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Trust Section */}
      <section className="trust-banner">
        <div>
          <span className="trust-icon">🤍</span>
          <h3>Handled With Respect</h3>

          <p>
            Every memorial material is personally handled with care throughout
            the entire creation process.
          </p>
        </div>

        <div>
          <span className="trust-icon">🛠️</span>
          <h3>Personally Handcrafted</h3>

          <p>
            Each ring is personally created and inspected by Michael in North
            Carolina.
          </p>
        </div>

        <div>
          <span className="trust-icon">💍</span>
          <h3>Made for Your Story</h3>

          <p>
            Natural minerals and meaningful materials make every finished piece
            completely unique.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="reviews-closing">
        <p className="eyebrow">Create Something Meaningful</p>

        <h2>Ready to Design Your Memorial Ring?</h2>

        <p>
          Explore the available collections and create a piece that honors the
          memory of a beloved family member or cherished pet.
        </p>

        <a href="/collections">Explore the Collections</a>
      </section>

      <style>{`
        .reviews-page {
          width: min(1400px, calc(100% - 48px));
          margin: 0 auto;
          padding: 80px 0 110px;
        }

        .reviews-hero {
          max-width: 1000px;
          margin: 0 auto 75px;
          text-align: center;
        }

        .eyebrow {
          margin: 0 0 15px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.62;
          text-align: center;
        }

        .reviews-hero h1 {
          margin: 0;
          font-size: clamp(46px, 7vw, 76px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .hero-description {
          max-width: 900px;
          margin: 28px auto 0;
          font-size: 21px;
          line-height: 1.85;
          opacity: 0.82;
        }

        .rating-summary {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 25px;
          margin: 38px auto 0;
          padding: 22px 28px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          background: #191919;
          text-align: left;
        }

        .rating-number strong {
          display: block;
          margin-bottom: 6px;
          font-size: 42px;
          line-height: 1;
        }

        .stars {
          color: #f5c451;
          font-size: 20px;
          letter-spacing: 3px;
          white-space: nowrap;
        }

        .rating-copy span {
          font-size: 17px;
          font-weight: 800;
        }

        .rating-copy p {
          margin: 6px 0 0;
          line-height: 1.5;
          opacity: 0.67;
        }

        .etsy-link {
          display: inline-block;
          margin-top: 27px;
          color: inherit;
          font-weight: 800;
          text-underline-offset: 5px;
        }

        .section-heading {
          max-width: 850px;
          margin: 0 auto 35px;
          text-align: center;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.15;
          letter-spacing: -0.025em;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .additional-heading {
          margin-top: 85px;
        }

        .additional-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .review-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: #191919;
        }

        .review-card.featured {
          min-height: 330px;
        }

        .review-image {
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #111;
        }

        .review-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .review-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 30px;
        }

        .featured .review-content {
          padding: 36px;
        }

        .review-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .photo-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
          font-size: 12px;
          font-weight: 800;
          opacity: 0.76;
        }

        blockquote {
          flex: 1;
          margin: 25px 0 32px;
          font-size: 18px;
          line-height: 1.85;
          opacity: 0.86;
        }

        .featured blockquote {
          font-size: 20px;
        }

        .review-footer {
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.09);
        }

        .review-customer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .review-footer strong {
          font-size: 17px;
        }

        .review-footer span {
          font-size: 14px;
          opacity: 0.58;
        }

        .review-footer p {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.62;
        }

        .trust-banner {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-top: 80px;
        }

        .trust-banner > div {
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: #191919;
        }

        .trust-icon {
          font-size: 34px;
        }

        .trust-banner h3 {
          margin: 18px 0 10px;
          font-size: 23px;
        }

        .trust-banner p {
          margin: 0;
          line-height: 1.75;
          opacity: 0.72;
        }

        .reviews-closing {
          max-width: 850px;
          margin: 90px auto 0;
          text-align: center;
        }

        .reviews-closing h2 {
          margin: 0;
          font-size: 42px;
          line-height: 1.15;
          letter-spacing: -0.025em;
        }

        .reviews-closing > p:not(.eyebrow) {
          margin: 20px 0 0;
          font-size: 19px;
          line-height: 1.85;
          opacity: 0.8;
        }

        .reviews-closing a {
          display: inline-block;
          margin-top: 29px;
          padding: 15px 28px;
          border-radius: 999px;
          background: white;
          color: black;
          font-weight: 850;
          text-decoration: none;
        }

        @media (max-width: 950px) {
          .featured-grid,
          .additional-grid,
          .trust-banner {
            grid-template-columns: 1fr;
          }

          .review-card.featured {
            min-height: 0;
          }
        }

        @media (max-width: 650px) {
          .reviews-page {
            width: min(100% - 24px, 1400px);
            padding-top: 52px;
          }

          .hero-description {
            font-size: 18px;
          }

          .rating-summary {
            width: auto;
            align-items: flex-start;
            padding: 20px;
          }

          .rating-number strong {
            font-size: 36px;
          }

          .stars {
            font-size: 17px;
            letter-spacing: 2px;
          }

          .review-content,
          .featured .review-content {
            padding: 25px 21px;
          }

          .featured blockquote,
          blockquote {
            font-size: 17px;
          }

          .review-customer {
            flex-direction: column;
            gap: 5px;
          }

          .reviews-closing h2 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}