import Link from "next/link";

export const metadata = {
  title: "Admin | Timeless Mineral Creations",
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "▦",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "▣",
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: "◉",
  },
  {
    label: "Product Bases",
    href: "/admin/product-bases",
    icon: "⬡",
  },
  {
    label: "Inlay Styles",
    href: "/admin/inlay-styles",
    icon: "◈",
  },
  {
    label: "Minerals",
    href: "/admin/minerals",
    icon: "◆",
  },
  {
    label: "Glow Powders",
    href: "/admin/glow-powders",
    icon: "✦",
  },
  {
    label: "Birthstones",
    href: "/admin/birthstones-catalog",
    icon: "◇",
  },
  {
    label: "Hair Placement",
    href: "/admin/hair-placement",
    icon: "〰",
  },
  {
    label: "Decorative Accents",
    href: "/admin/decorative-accents",
    icon: "✧",
  },
  {
    label: "Accent Styles",
    href: "/admin/accent-styles",
    icon: "◐",
  },
  {
    label: "Engraving Options",
    href: "/admin/engraving-options",
    icon: "✎",
  },
  {
    label: "Bezel Sizes",
    href: "/admin/bezel-sizes",
    icon: "◌",
  },
  {
    label: "Chain Options",
    href: "/admin/chain-options",
    icon: "⌁",
  },
  {
    label: "Memorial Materials",
    href: "/admin/memorial-materials",
    icon: "◍",
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: "▧",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: "★",
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: "$",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "⚙",
  },
];

export default function AdminLayout({ children }) {
  return (
    <div
      className="admin-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07110f 0%, #0b1714 45%, #08100e 100%)",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            boxSizing: "border-box",
            padding: "24px 18px",
            borderRight:
              "1px solid rgba(255, 255, 255, 0.09)",
            background:
              "linear-gradient(180deg, rgba(5, 13, 11, 0.98), rgba(8, 18, 15, 0.98))",
            overflowY: "auto",
          }}
        >
          <Link
            href="/admin"
            style={{
              display: "block",
              color: "inherit",
              textDecoration: "none",
              marginBottom: "28px",
              padding: "0 8px",
            }}
          >
            <p
              style={{
                margin: "0 0 5px",
                color: "#d9b56d",
                fontSize: "11px",
                fontWeight: "900",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Timeless Mineral Creations
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "25px",
                lineHeight: 1.05,
              }}
            >
              Admin
            </h1>
          </Link>

          <nav
            style={{
              display: "grid",
              gap: "7px",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  color: "#d7dfdc",
                  textDecoration: "none",
                  fontWeight: "750",
                  fontSize: "14px",
                  border: "1px solid transparent",
                  background: "rgba(255, 255, 255, 0.015)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "24px",
                    color: "#d9b56d",
                    fontSize: "17px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div
            style={{
              marginTop: "28px",
              padding: "18px 10px 4px",
              borderTop:
                "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#aebbb6",
                textDecoration: "none",
                fontWeight: "750",
                fontSize: "13px",
              }}
            >
              ← View Website
            </Link>
          </div>
        </aside>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <header
            style={{
              minHeight: "72px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
              padding: "0 28px",
              borderBottom:
                "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(5, 13, 11, 0.72)",
              backdropFilter: "blur(14px)",
              position: "sticky",
              top: 0,
              zIndex: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#899690",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Business Management
              </p>

              <p
                style={{
                  margin: "3px 0 0",
                  color: "#f5f5f5",
                  fontWeight: "800",
                }}
              >
                Timeless Mineral Creations
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border:
                    "1px solid rgba(217, 181, 109, 0.35)",
                  background: "rgba(217, 181, 109, 0.11)",
                  color: "#e9c77e",
                  fontWeight: "900",
                }}
              >
                T
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "850",
                  }}
                >
                  Owner
                </p>

                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#899690",
                    fontSize: "11px",
                  }}
                >
                  Administrator
                </p>
              </div>
            </div>
          </header>

          <div
            style={{
              minWidth: 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}