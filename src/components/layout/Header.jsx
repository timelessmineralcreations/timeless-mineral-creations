"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header({ siteSettings = {} }) {
  const { cartCount } = useCart();

  const salePercent = Math.max(
    0,
    Math.min(
      100,
      Number(siteSettings.sitewideSalePercent || 0)
    )
  );

  const showSale =
    Boolean(siteSettings.sitewideSaleEnabled) &&
    salePercent > 0;

  const showAnnouncement =
    Boolean(siteSettings.announcementEnabled) &&
    String(
      siteSettings.announcementText || ""
    ).trim();

  return (
    <header
      style={{        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(12,12,12,.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      {showAnnouncement && (
        <div
          style={{
            padding: "8px 20px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            background: "#1f1f1f",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          {siteSettings.announcementText}
        </div>
      )}

      {showSale && (
        <div
          style={{
            padding: "8px 20px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 800,
            color: "#111",
            background:
              "linear-gradient(135deg, rgb(233, 192, 84), rgb(184, 134, 11))",
          }}
        >
          {siteSettings.sitewideSaleName ||
            "Sitewide Sale"}
          : {salePercent}% off sitewide
        </div>
      )}

      <div
        style={{
          maxWidth: "1500px",          margin: "0 auto",
          padding: "10px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <img
            src="/logo/logo.png"
            alt="Timeless Mineral Creations"
            style={{
              width: "210px",
              height: "auto",
              display: "block",
            }}
          />
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <NavLink href="/">Home</NavLink>
          <NavLink href="/collections">Collections</NavLink>
          <NavLink href="/gallery">Gallery</NavLink>
          <NavLink href="/reviews">Reviews</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
          <NavLink href="/contact">Contact</NavLink>

          <NavLink href="/cart">
            🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        color: "#d4d4d8",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}