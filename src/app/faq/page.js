"use client";

import { useMemo, useState } from "react";
import { faqCategories } from "@/data/faqData";

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState("memorial-materials");
  const [openQuestions, setOpenQuestions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return faqCategories;

    return faqCategories
      .map((category) => {
        const categoryMatches =
          category.title.toLowerCase().includes(normalizedSearch) ||
          category.description.toLowerCase().includes(normalizedSearch);

        const matchingQuestions = category.questions.filter((item) => {
          return (
            item.question.toLowerCase().includes(normalizedSearch) ||
            item.answer.toLowerCase().includes(normalizedSearch)
          );
        });

        if (categoryMatches) {
          return category;
        }

        if (matchingQuestions.length > 0) {
          return {
            ...category,
            questions: matchingQuestions,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [normalizedSearch]);

  function toggleCategory(categoryId) {
    setOpenCategory((current) =>
      current === categoryId ? null : categoryId
    );
  }

  function toggleQuestion(questionId) {
    setOpenQuestions((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  }

  function handleQuickLink(categoryId) {
    setOpenCategory(categoryId);

    setTimeout(() => {
      document.getElementById(categoryId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <p className="eyebrow">Timeless Mineral Creations</p>

        <h1>Frequently Asked Questions</h1>

        <p className="hero-description">
          Creating a memorial ring is deeply personal. This page explains what
          to expect, how to prepare your materials, how customization works,
          and how to care for your finished piece.
        </p>

        <p className="hero-contact">
          Can&apos;t find what you need? Visit the{" "}
          <a href="/contact">Contact page</a>, and your message will be
          personally answered by Michael.
        </p>
      </section>

     <section className="search-wrapper">
  <div className="search-header">
    <p className="section-label">Find Your Answer</p>

    <h2>Search Frequently Asked Questions</h2>

    <p>
      Search by keywords like <strong>ashes</strong>,{" "}
      <strong>glow</strong>, <strong>engraving</strong>,{" "}
      <strong>shipping</strong>, <strong>sizing</strong>, or{" "}
      <strong>minerals</strong>.
    </p>
  </div>

  <div className="search-box">
    <span className="search-icon">⌕</span>

    <input
      type="search"
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      placeholder="Search the FAQ..."
      aria-label="Search frequently asked questions"
    />

    {searchTerm && (
      <button
        type="button"
        className="clear-search"
        onClick={() => setSearchTerm("")}
      >
        Clear
      </button>
    )}
  </div>

  {normalizedSearch && (
    <p className="search-result-count">
      {filteredCategories.reduce(
        (total, category) => total + category.questions.length,
        0
      )}{" "}
      matching question
      {filteredCategories.reduce(
        (total, category) => total + category.questions.length,
        0
      ) === 1
        ? ""
        : "s"}
    </p>
  )}
</section>
       
      {!normalizedSearch && (
        <section className="quick-links">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleQuickLink(category.id)}
            >
              <span className="quick-icon">{category.icon}</span>
              <span>{category.title}</span>
            </button>
          ))}
        </section>
      )}

      <section className="faq-categories">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const categoryIsOpen =
              normalizedSearch || openCategory === category.id;

            return (
              <article
                key={category.id}
                id={category.id}
                className="faq-category"
              >
                <button
                  type="button"
                  className="category-heading"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={categoryIsOpen}
                >
                  <span className="category-icon">{category.icon}</span>

                  <span className="category-copy">
                    <span className="category-title">{category.title}</span>
                    <span className="category-description">
                      {category.description}
                    </span>
                  </span>

                  <span className="category-count">
                    {category.questions.length}
                  </span>

                  <span className="category-arrow">
                    {categoryIsOpen ? "−" : "+"}
                  </span>
                </button>

                {categoryIsOpen && (
                  <div className="question-list">
                    {category.questions.map((item, index) => {
                      const questionId = `${category.id}-${index}`;
                      const questionIsOpen =
                        normalizedSearch ||
                        openQuestions[questionId] ||
                        false;

                      return (
                        <div className="question-card" key={questionId}>
                          <button
                            type="button"
                            className="question-heading"
                            onClick={() => toggleQuestion(questionId)}
                            aria-expanded={questionIsOpen}
                          >
                            <span>{item.question}</span>

                            <span className="question-arrow">
                              {questionIsOpen ? "−" : "+"}
                            </span>
                          </button>

                          {questionIsOpen && (
                            <div className="answer">
                              <p>{item.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <section className="no-results">
            <div className="no-results-icon">🔎</div>
            <h2>No matching questions found</h2>
            <p>
              Try a broader search, or contact Michael directly for help with
              your memorial ring.
            </p>
            <button type="button" onClick={() => setSearchTerm("")}>
              Clear Search
            </button>
          </section>
        )}
      </section>

      <section className="glow-instructions">
        <div className="glow-heading">
          <div className="glow-icon">✨</div>

          <div>
            <p className="section-label">Glow Powder Guide</p>
            <h2>How to Get the Brightest Glow</h2>
          </div>
        </div>

        <p className="glow-description">
          Place your ring in direct sunlight or beneath a UV or black light for
          several minutes. Move the ring into a dark area to see the strongest
          glow. The glow will begin brightly and gradually fade, but it can be
          recharged repeatedly.
        </p>

        <div className="glow-steps">
  <div className="glow-step">
    <strong>1) Charge the Ring</strong>
    <p>
      Use direct sunlight, a UV light, or a black light for several
      minutes.
    </p>
  </div>

  <div className="glow-step">
    <strong>2) Move Into Darkness</strong>
    <p>
      The glow appears strongest immediately after charging in a dark
      room.
    </p>
  </div>

  <div className="glow-step">
    <strong>3) Recharge Anytime</strong>
    <p>
      When the glow fades, simply expose the ring to light again.
    </p>
  </div>
</div>

        <div className="glow-note">
          <strong>Helpful tip:</strong> UV and black lights normally create a
          stronger and faster charge than ordinary indoor lighting.
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-card">
          <span className="trust-icon">🤍</span>
          <h3>Handled With Care</h3>
          <p>
            Every memorial material is treated carefully and respectfully from
            arrival through final packaging.
          </p>
        </div>

        <div className="trust-card">
          <span className="trust-icon">🛠️</span>
          <h3>Personally Handcrafted</h3>
          <p>
            Each memorial ring is personally created by Michael in North
            Carolina.
          </p>
        </div>

        <div className="trust-card">
          <span className="trust-icon">💍</span>
          <h3>Truly One of a Kind</h3>
          <p>
            Natural minerals and memorial materials ensure that no two rings
            are exactly alike.
          </p>
        </div>
      </section>

      <section className="faq-closing">
        <p className="section-label">Personal Help Is Always Available</p>

        <h2>Still Have Questions?</h2>

        <p>
          Every memorial design is unique. I am always happy to help you choose
          materials, minerals, glow colors, engraving, or a design that feels
          right for the memory you are honoring.
        </p>

        <a href="/contact">Contact Michael</a>
      </section>

      <style>{`
        .faq-page {
          width: min(1400px, calc(100% - 48px));
          margin: 0 auto;
          padding: 80px 0 110px;
        }
.eyebrow,
.section-label {
  display: block;
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.62;
  text-align: center;
}
  .eyebrow,
.section-label {
  display: block;
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.62;
  text-align: center;
}
        .faq-hero {
  max-width: 1100px;
  margin: 0 auto 70px;
  text-align: center;
}

.faq-hero h1 {
  margin: 0;
  font-size: clamp(54px, 7vw, 82px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  text-align: center;
}

.hero-description {
  max-width: 900px;
  margin: 34px auto 0;
  font-size: 23px;
  line-height: 1.9;
  opacity: 0.82;
  text-align: center;
}

.hero-contact {
  max-width: 760px;
  margin: 28px auto 0;
  font-size: 18px;
  line-height: 1.8;
  opacity: 0.72;
  text-align: center;
}

         .search-wrapper {
  max-width: 1100px;
  margin: 70px auto;
}

.search-header {
  text-align: center;
  margin-bottom: 35px;
}

.search-header h2 {
  margin: 12px 0 18px;
  font-size: 42px;
}

.search-header p {
  margin: 0 auto;
  max-width: 700px;
  font-size: 19px;
  line-height: 1.8;
  opacity: .75;
}

.search-box {
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 30px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,.12);
  background:#1a1a1a;
}

.search-icon{
  font-size:34px;
  opacity:.6;
}

.search-box input{
  flex:1;
  border:none;
  background:transparent;
  color:white;
  font-size:21px;
  outline:none;
}

.search-box input::placeholder{
  opacity:.45;
}

.clear-search{
  border:none;
  background:white;
  color:black;
  padding:12px 18px;
  border-radius:999px;
  cursor:pointer;
  font-weight:bold;
}

.search-result-count {
  margin: 18px 0 0;
  text-align: center;
  font-size: 15px;
  opacity: 0.65;
}

        .quick-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 50px;
        }

        .quick-links button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 21px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          font-weight: 750;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .quick-links button:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.09);
        }

        .quick-icon {
          font-size: 20px;
        }

        .faq-categories{
    display:grid;
    gap:42px;
    margin-top:60px;
}

        .faq-category {
          scroll-margin-top: 110px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 24px;
          background: #1a1a1a;
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.16);
        }

        .category-heading {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 22px;
         padding:42px;
          border: none;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .category-icon {
          flex: 0 0 auto;
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          font-size: 32px;
        }

        .category-copy {
          flex: 1;
          min-width: 0;
          display: grid;
          gap: 8px;
        }

        .category-title {
          font-size: 29px;
          font-weight: 850;
          letter-spacing: -0.015em;
        }

        .category-description {
          font-size: 17px;
          line-height: 1.55;
          opacity: 0.68;
        }

        .category-count {
          flex: 0 0 auto;
          min-width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          font-size: 15px;
          font-weight: 800;
          opacity: 0.76;
        }

        .category-arrow {
          flex: 0 0 auto;
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.07);
          font-size: 28px;
        }

        .question-list {
  display: grid;
  gap: 20px;
  padding: 0 42px 42px;
}

        .question-card {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 17px;
          background: #111;
        }

        .question-heading {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 28px;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  font-size: 22px;
  font-weight: 760;
  line-height: 1.45;
}

        .question-arrow {
          flex: 0 0 auto;
          font-size: 25px;
          opacity: 0.68;
        }

        .answer {
  padding: 0 28px 30px;
}

.answer p {
  max-width: 1120px;
  margin: 0;
  font-size: 19px;
  line-height: 1.9;
  opacity: 0.8;
}

        .no-results {
          padding: 70px 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background: #1a1a1a;
          text-align: center;
        }

        .no-results-icon {
          margin-bottom: 18px;
          font-size: 48px;
        }

        .no-results h2 {
          margin: 0;
          font-size: 32px;
        }

        .no-results p {
          max-width: 650px;
          margin: 15px auto 0;
          font-size: 18px;
          line-height: 1.8;
          opacity: 0.74;
        }

        .no-results button {
          margin-top: 24px;
          padding: 13px 22px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 800;
        }

        .glow-instructions {
          margin-top: 70px;
          padding: 46px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          background:
            radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.1),
              transparent 36%
            ),
            #1a1a1a;
        }

        .glow-heading {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .glow-icon {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.07);
          font-size: 35px;
        }

        .glow-heading h2 {
          margin: 0;
          font-size: 36px;
          letter-spacing: -0.02em;
        }

        .glow-description {
          max-width: 1050px;
          margin: 25px 0 0;
          font-size: 19px;
          line-height: 1.85;
          opacity: 0.81;
        }

        .glow-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 30px;
        }

        .glow-step {
          min-height: 210px;
          padding: 26px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.24);
        }

       

        .glow-step strong {
          display: block;
          font-size: 20px;
        }

        .glow-step p {
          margin: 12px 0 0;
          font-size: 16px;
          line-height: 1.75;
          opacity: 0.73;
        }

        .glow-note {
          margin-top: 22px;
          padding: 18px 20px;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.05);
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.82;
        }

        .trust-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 70px;
        }

        .trust-card {
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: #1a1a1a;
        }

        .trust-icon {
          font-size: 34px;
        }

        .trust-card h3 {
          margin: 18px 0 10px;
          font-size: 23px;
        }

        .trust-card p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          opacity: 0.74;
        }

        .faq-closing {
          max-width: 900px;
          margin: 90px auto 0;
          text-align: center;
        }

        .faq-closing h2 {
          margin: 0;
          font-size: 42px;
          letter-spacing: -0.025em;
        }

        .faq-closing p:not(.section-label) {
          margin: 20px 0 0;
          font-size: 20px;
          line-height: 1.85;
          opacity: 0.81;
        }

        .faq-closing a {
          display: inline-block;
          margin-top: 30px;
          padding: 16px 30px;
          border-radius: 999px;
          background: white;
          color: black;
          font-size: 16px;
          font-weight: 850;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .faq-page {
            width: min(100% - 28px, 1400px);
            padding-top: 55px;
          }

          .glow-steps,
          .trust-section {
            grid-template-columns: 1fr;
          }

          .glow-step {
            min-height: 0;
          }
        }

        @media (max-width: 680px) {
          .faq-page {
            width: min(100% - 20px, 1400px);
            padding-bottom: 80px;
          }

          .hero-description {
            font-size: 18px;
          }

          .search-box {
            min-height: 62px;
            padding: 0 16px;
          }

          .search-box input {
            height: 60px;
            font-size: 16px;
          }

          .search-icon {
            font-size: 25px;
          }

          .clear-search {
            padding: 8px 11px;
            font-size: 13px;
          }

          .quick-links {
            justify-content: flex-start;
          }

          .quick-links button {
            padding: 12px 16px;
            font-size: 14px;
          }

          .category-heading {
            gap: 14px;
            padding: 22px 18px;
          }

          .category-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            font-size: 24px;
          }

          .category-title {
            font-size: 21px;
          }

          .category-description {
            display: none;
          }

          .category-count {
            display: none;
          }

          .category-arrow {
            width: 36px;
            height: 36px;
            font-size: 23px;
          }

          .question-list {
            gap: 10px;
            padding: 0 12px 12px;
          }

          .question-heading {
            padding: 18px 16px;
            font-size: 17px;
          }

          .answer {
            padding: 0 16px 18px;
          }

          .answer p {
            font-size: 16px;
            line-height: 1.8;
          }

          .glow-instructions {
            padding: 27px 20px;
          }

          .glow-heading {
            align-items: flex-start;
          }

          .glow-icon {
            width: 50px;
            height: 50px;
            border-radius: 15px;
            font-size: 25px;
          }

          .glow-heading h2 {
            font-size: 28px;
          }

          .glow-description {
            font-size: 17px;
          }

          .trust-card {
            padding: 26px 22px;
          }

          .faq-closing {
            margin-top: 70px;
          }

          .faq-closing h2 {
            font-size: 34px;
          }

          .faq-closing p:not(.section-label) {
            font-size: 17px;
          }
        }
      `}</style>
    </main>
  );
}