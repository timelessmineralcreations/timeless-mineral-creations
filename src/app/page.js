import Link from "next/link";
import { collections } from "@/data/collections";
import HomeFeaturedGallery from "@/components/home/HomeFeaturedGallery";
const featuredSlugs = [
  "signature",
  "mountain",
  "ocean",
  "tornado",
  "dual-channel",
  "evermore-ring",
];

function getFeaturedCollections() {
  const selectedCollections = featuredSlugs
    .map((slug) =>
      collections.find(
        (collection) => collection.slug === slug
      )
    )
    .filter(Boolean);

  if (selectedCollections.length === featuredSlugs.length) {
    return selectedCollections;
  }

  const remainingCollections = collections.filter(
    (collection) =>
      collection.heroImage &&
      !selectedCollections.some(
        (selected) => selected.id === collection.id
      )
  );

  return [
    ...selectedCollections,
    ...remainingCollections,
  ].slice(0, 6);
}

function getShortCollectionName(name = "") {
  return name
    .replace(" Collection", "")
    .replace(" Memorial Ring", "")
    .trim();
}

export default function Home() {
  const featuredCollections = getFeaturedCollections();

  return (
    <main className="overflow-hidden bg-[#080808] text-white">
      {/* HERO */}
      <section
        className="relative flex min-h-[720px] items-center bg-cover bg-center lg:min-h-[760px]"
        style={{
          backgroundImage: "url('/hero-ring.jpg')",
          backgroundPosition: "center 48%",
        }}
      >
        {/* Lighter overlays so the ring remains visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/65 via-transparent to-black/15" />

        <div className="relative z-10 mx-auto w-full max-w-[1450px] px-6 py-24 sm:px-10 lg:px-14">
          <div className="max-w-[650px]">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#e8b947] sm:text-base">
              Handcrafted Memorial Jewelry
            </p>

            <h1 className="text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Memories Crafted
              <span className="block text-[#e1ad43]">
                to Last Forever
              </span>
            </h1>

            <p className="mt-6 max-w-[610px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Create a one-of-a-kind keepsake using cremation
              ashes, hair, fur, breast milk, flowers, sand,
              meaningful minerals, and other treasured
              inclusions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/collections"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-r from-[#efc15c] to-[#c99425] px-8 font-bold text-black shadow-[0_10px_35px_rgba(212,175,55,.22)] transition duration-300 hover:scale-[1.03] hover:brightness-110"
              >
                Explore Collections
              </Link>

              <Link
                href="/gallery"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/55 bg-black/20 px-8 font-bold text-white backdrop-blur-sm transition duration-300 hover:border-[#e1ad43] hover:bg-black/40 hover:text-[#e1ad43]"
              >
                View Gallery
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-5">
              <HeroFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 20 9 9l3 5 3-4 6 10H3Z" />
                    <path d="M6 15 3 20h18" />
                  </svg>
                }
                text={
                  <>
                    Handmade in
                    <br />
                    North Carolina
                  </>
                }
              />

              <HeroFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="m12 2 7 5-7 15L5 7l7-5Z" />
                    <path d="M5 7h14M9 7l3 15M15 7l-3 15" />
                  </svg>
                }
                text={
                  <>
                    Completely
                    <br />
                    Custom
                  </>
                }
              />

              <HeroFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                  </svg>
                }
                text={
                  <>
                    Handled
                    <br />
                    With Care
                  </>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#e1ad43]">
                Begin Your Design
              </p>

              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Featured Collections
              </h2>
            </div>

            <Link
              href="/collections"
              className="inline-flex items-center gap-2 font-semibold text-[#e1ad43] transition hover:text-white"
            >
              View All Collections
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        </div>
            </section>

      <HomeFeaturedGallery />

      {/* PROCESS */}
      <section className="border-y border-white/10 bg-[#0b0b0b] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#e1ad43]">
                Simple and Respectful
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How Your Keepsake Is Created
              </h2>
            </div>

            <Link
              href="/faq"
              className="inline-flex items-center gap-2 font-semibold text-[#e1ad43] transition hover:text-white"
            >
              More About Our Process
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProcessCard
              number="01"
              title="Choose Your Piece"
              text="Explore the collections and select your jewelry style, materials, size, minerals, and design."
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <circle cx="12" cy="13" r="7" />
                  <path d="M9 6V3h6v3M8 3h8" />
                </svg>
              }
            />

            <ProcessCard
              number="02"
              title="Place Your Order"
              text="Complete your custom selections and securely submit your order through the website."
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <rect
                    x="5"
                    y="4"
                    width="14"
                    height="17"
                    rx="2"
                  />
                  <path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
                </svg>
              }
            />

            <ProcessCard
              number="03"
              title="Mail Your Keepsake"
              text="You will receive clear instructions for safely mailing your memorial or keepsake material."
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="m3 7 9-5 9 5-9 5-9-5Z" />
                  <path d="M3 7v10l9 5 9-5V7M12 12v10" />
                </svg>
              }
            />

            <ProcessCard
              number="04"
              title="Handcrafted for You"
              text="Your piece is carefully created, finished, inspected, and shipped back to you."
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* CUSTOM MATERIALS */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#e1ad43]">
              Your Story, Your Design
            </p>

            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">
              A Keepsake Made
              <span className="block text-white/50">
                From What Matters Most
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Every memorial piece can be personalized with
              meaningful materials, colors, minerals, and details
              that represent the person, pet, place, or memory you
              want to keep close.
            </p>

            <Link
              href="/collections"
              className="mt-8 inline-flex rounded-full border border-[#d4af37] px-7 py-3 font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Explore Every Collection
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MaterialCard
              title="Cremation Ashes"
              text="Create a lasting memorial using a small portion of your loved one’s ashes."
            />

            <MaterialCard
              title="Hair and Fur"
              text="Preserve hair or pet fur inside a handcrafted piece you can keep nearby."
            />

            <MaterialCard
              title="Breast Milk"
              text="Transform breast milk into a meaningful pearl-white keepsake inlay."
            />

            <MaterialCard
              title="Minerals and More"
              text="Choose birthstones, opals, flowers, sand, soil, fabric, glow powder, and other inclusions."
            />
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative border-t border-white/10 px-5 py-24 text-center sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,.13),transparent_60%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#e1ad43]">
            Create Something Timeless
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-6xl">
            Keep Their Memory Close
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
            Browse the complete catalog and begin creating a custom
            memorial or keepsake piece designed around your story.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/collections"
              className="rounded-full bg-gradient-to-r from-[#efc15c] to-[#c99425] px-8 py-4 font-bold text-black transition hover:scale-[1.03] hover:brightness-110"
            >
              Start Designing
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-8 py-4 font-bold transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-white/85">
      <span className="text-white">{icon}</span>
      <span className="leading-5">{text}</span>
    </div>
  );
}

function CollectionCard({ collection }) {
  const name = getShortCollectionName(collection.name);

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative min-h-[510px] overflow-hidden rounded-2xl border border-white/15 bg-[#111]"
    >
      <img
        src={collection.heroImage || "/hero-ring.jpg"}
        alt={collection.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="text-2xl font-bold sm:text-[28px]">
          {name}
        </h3>

        <p className="mt-2 line-clamp-3 max-w-[95%] text-sm leading-6 text-white/80">
          {collection.shortDescription ||
            collection.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-bold text-[#e8b947]">
            {collection.startingPrice != null
              ? `From $${collection.startingPrice}`
              : "Custom Pricing"}
          </span>

          <span className="font-bold text-white transition duration-300 group-hover:translate-x-1 group-hover:text-[#e8b947]">
            Design →
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProcessCard({
  number,
  title,
  text,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.045] to-transparent p-6">
      <div className="flex items-center gap-4">
        <div className="text-[#e1ad43]">{icon}</div>

        <span className="text-xl font-bold text-[#e1ad43]">
          {number}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-white/62">
        {text}
      </p>
    </div>
  );
}

function MaterialCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/50">
      <div className="mb-4 h-[2px] w-12 bg-[#d4af37]" />

      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-white/62">
        {text}
      </p>
    </div>
  );
}