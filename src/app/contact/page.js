export default function ContactPage() {
  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "70px 20px",
      }}
    >
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          marginBottom: "60px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          Let&apos;s Create Something Meaningful Together
        </h1>

        <p
          style={{
            fontSize: "20px",
            opacity: 0.85,
            lineHeight: 1.8,
            maxWidth: "850px",
            margin: "0 auto",
          }}
        >
          Whether you have questions about a memorial ring, choosing minerals,
          creating a custom design, or checking on an existing order, I&apos;d
          love to hear from you.
        </p>

        <p
          style={{
            marginTop: "22px",
            fontSize: "18px",
            opacity: 0.8,
            maxWidth: "850px",
            marginInline: "auto",
            lineHeight: 1.8,
          }}
        >
          Questions are always welcome. Whether you&apos;re just beginning your
          memorial journey or already know exactly what you&apos;d like,
          I&apos;m here to help every step of the way.
        </p>

        <p
          style={{
            marginTop: "25px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Every message is personally answered by Michael, the craftsman behind
          Timeless Mineral Creations.
        </p>
      </section>

      {/* Contact Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
          gap: "35px",
          alignItems: "start",
        }}
      >
        {/* Contact Form */}
        <section
          style={{
            background: "#1b1b1b",
            borderRadius: "18px",
            padding: "35px",
          }}
        >
          <h2 style={{ marginBottom: "25px" }}>Send a Message</h2>

          <form>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              style={inputStyle}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              style={inputStyle}
              required
            />

            <select name="subject" style={inputStyle} defaultValue="General Question">
              <option>General Question</option>
              <option>Memorial Ring Question</option>
              <option>Existing Order</option>
              <option>Custom Design</option>
              <option>Wholesale Inquiry</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              name="orderNumber"
              placeholder="Order Number (Optional)"
              style={inputStyle}
            />

            <textarea
              name="message"
              rows={8}
              placeholder="How can I help you?"
              required
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              style={{
                marginTop: "15px",
                padding: "15px 30px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Send My Message →
            </button>
          </form>
        </section>

        {/* Contact Information */}
        <aside
          style={{
            background: "#1b1b1b",
            borderRadius: "18px",
            padding: "35px",
            overflowWrap: "anywhere",
          }}
        >
          <h2>Contact Information</h2>

          <div
            style={{
              marginTop: "30px",
              lineHeight: 2,
            }}
          >
            <div style={{ marginBottom: "30px" }}>
              <div style={{ fontSize: "24px" }}>📧</div>
              <strong>Email</strong>
              <br />
              <a
                href="mailto:timelessmineralcreations@gmail.com"
                style={{
                  color: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                timelessmineralcreations@gmail.com
              </a>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <div style={{ fontSize: "24px" }}>📍</div>
              <strong>Location</strong>
              <br />
              Proudly Handcrafted in North Carolina
            </div>

            <div>
              <div style={{ fontSize: "24px" }}>⏱</div>
              <strong>Typical Response Time</strong>
              <br />
              Within 24 Hours
            </div>
          </div>
        </aside>
      </div>

      {/* FAQ */}
      <section
        style={{
          marginTop: "80px",
          background: "#1b1b1b",
          borderRadius: "18px",
          padding: "40px",
        }}
      >
        <h2 style={{ marginBottom: "35px" }}>
          Frequently Asked Questions
        </h2>

        <FAQ
          question="How long does my ring take?"
          answer="Most memorial rings are completed in approximately 2–10 weeks, depending on the design and current order volume."
        />

        <FAQ
          question="How much memorial material do I send?"
          answer="About one tablespoon of ashes is more than enough for a single ring."
        />

        <FAQ
          question="Can I use pet ashes or fur?"
          answer="Absolutely! I create memorial rings honoring both family members and beloved pets."
        />

        <FAQ
          question="Can I combine multiple materials?"
          answer="Yes. Many customers combine ashes, hair, minerals, glow powders, and engravings to create a truly one-of-a-kind memorial."
        />

        <FAQ
          question="Can you make a completely custom design?"
          answer="Absolutely. If you have an idea that is not shown on the website, I would be happy to discuss creating something unique just for you."
        />
      </section>

      {/* Meet the Craftsman */}
      <section
        style={{
          marginTop: "80px",
          background: "#1b1b1b",
          borderRadius: "18px",
          padding: "40px",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "18px",
            background: "#2b2b2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <span
            style={{
              opacity: 0.55,
              fontSize: "15px",
              textAlign: "center",
              padding: "20px",
              lineHeight: 1.7,
            }}
          >
            Workshop photo
            <br />
            coming soon
          </span>
        </div>

        <div>
          <h2 style={{ marginBottom: "20px" }}>Meet the Craftsman</h2>

          <p
            style={{
              lineHeight: 1.9,
              fontSize: "17px",
              opacity: 0.88,
            }}
          >
            Hi, I&apos;m Michael, the owner and craftsman behind Timeless
            Mineral Creations.
          </p>

          <p
            style={{
              lineHeight: 1.9,
              fontSize: "17px",
              opacity: 0.88,
              marginTop: "18px",
            }}
          >
            Every memorial ring is personally handcrafted by me in North
            Carolina. From the moment your memorial materials arrive to the
            final polishing and inspection, every step is completed with care,
            patience, and respect.
          </p>

          <p
            style={{
              lineHeight: 1.9,
              fontSize: "17px",
              opacity: 0.88,
              marginTop: "18px",
            }}
          >
            Thank you for trusting me with something so meaningful. It is truly
            an honor to help create a lasting tribute that preserves the
            memories of those who mean the most, whether they are beloved family
            members or cherished pets.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section
        style={{
          textAlign: "center",
          marginTop: "80px",
          maxWidth: "850px",
          marginInline: "auto",
        }}
      >
        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.9,
            opacity: 0.9,
          }}
        >
          Every memorial piece is handcrafted with care, respect, and attention
          to detail. Whether it&apos;s created to honor a beloved family member
          or a cherished pet, it is truly an honor to preserve a memory that
          will be treasured for a lifetime.
        </p>

        <p
          style={{
            marginTop: "40px",
            fontWeight: "bold",
            fontSize: "22px",
          }}
        >
          Thank you for trusting Timeless Mineral Creations.
        </p>
      </section>
    </main>
  );
}

function FAQ({ question, answer }) {
  return (
    <div
      style={{
        marginBottom: "35px",
      }}
    >
      <h3
        style={{
          marginBottom: "10px",
          fontSize: "21px",
        }}
      >
        {question}
      </h3>

      <p
        style={{
          opacity: 0.82,
          lineHeight: 1.8,
          fontSize: "17px",
        }}
      >
        {answer}
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "18px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,.2)",
  background: "#111",
  color: "white",
  fontSize: "15px",
  boxSizing: "border-box",
};