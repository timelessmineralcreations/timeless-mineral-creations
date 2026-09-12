"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount } = useCart();
  const pathname = usePathname();

  const [isMobile, setIsMobile] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 768px)"
    );

    const updateMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateMobile();

    mediaQuery.addEventListener(
      "change",
      updateMobile
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMobile
      );
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const headerInnerStyle = {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    padding: isMobile
      ? "8px 12px"
      : "10px 30px",

    gap: isMobile
      ? "10px"
      : "30px",

    minHeight: isMobile
      ? "64px"
      : undefined,
  };

  const logoStyle = {
    display: "block",

    width: isMobile
      ? "105px"
      : "210px",

    maxWidth: isMobile
      ? "105px"
      : "210px",

    height: "auto",
    objectFit: "contain",
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        background:
          "rgba(12,12,12,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter:
          "blur(12px)",
        borderBottom:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={headerInnerStyle}>
        <Link
          href="/"
          aria-label="Timeless Mineral Creations home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            flex: "0 0 auto",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo/logo.png"
            alt="Timeless Mineral Creations"
            style={logoStyle}
          />
        </Link>

        {!isMobile && (
          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "24px",
            }}
          >
            <NavLink href="/">
              Home
            </NavLink>

            <NavLink href="/collections">
              Collections
            </NavLink>

            <NavLink href="/gallery">
              Gallery
            </NavLink>

            <NavLink href="/reviews">
              Reviews
            </NavLink>

            <NavLink href="/faq">
              FAQ
            </NavLink>

            <NavLink href="/contact">
              Contact
            </NavLink>

            <NavLink href="/cart">
              🛒 Cart
              {cartCount > 0
                ? ` (${cartCount})`
                : ""}
            </NavLink>
          </nav>
        )}

        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "flex-end",
              gap: "8px",
              marginLeft: "auto",
            }}
          >
            <Link
              href="/cart"
              aria-label={`Cart${
                cartCount > 0
                  ? ` with ${cartCount} item${
                      cartCount === 1
                        ? ""
                        : "s"
                    }`
                  : ""
              }`}
              style={{
                position: "relative",
                width: "42px",
                height: "42px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background:
                  "rgba(255,255,255,0.035)",
                color: "#e4e4e7",
                textDecoration: "none",
                boxSizing:
                  "border-box",
                flex: "0 0 42px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                🛒
              </span>

              {cartCount > 0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: "-5px",
                    right: "-5px",
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 5px",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius:
                      "999px",
                    background:
                      "#d6b56d",
                    color: "#111",
                    border:
                      "2px solid #0c0c0c",
                    fontSize: "11px",
                    lineHeight: 1,
                    fontWeight: 800,
                    boxSizing:
                      "border-box",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={
                mobileMenuOpen
              }
              onClick={() =>
                setMobileMenuOpen(
                  (current) =>
                    !current
                )
              }
              style={{
                width: "42px",
                height: "42px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",
                padding: 0,
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background:
                  "rgba(255,255,255,0.035)",
                color: "#f4f4f5",
                cursor: "pointer",
                fontSize: "24px",
                lineHeight: 1,
                flex: "0 0 42px",
                boxSizing:
                  "border-box",
              }}
            >
              {mobileMenuOpen
                ? "✕"
                : "☰"}
            </button>
          </div>
        )}
      </div>

      {isMobile &&
        mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background:
                "rgba(12,12,12,0.985)",
              borderTop:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <MobileNavLink href="/">
              Home
            </MobileNavLink>

            <MobileNavLink href="/collections">
              Collections
            </MobileNavLink>

            <MobileNavLink href="/gallery">
              Gallery
            </MobileNavLink>

            <MobileNavLink href="/reviews">
              Reviews
            </MobileNavLink>

            <MobileNavLink href="/faq">
              FAQ
            </MobileNavLink>

            <MobileNavLink href="/contact">
              Contact
            </MobileNavLink>
          </nav>
        )}
    </header>
  );
}

function NavLink({
  href,
  children,
}) {
  return (
    <Link
      href={href}
      style={{
        color: "#d4d4d8",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        width: "100%",
        padding: "15px 20px",
        borderBottom:
          "1px solid rgba(255,255,255,0.06)",
        color: "#e4e4e7",
        textDecoration: "none",
        fontSize: "16px",
        fontWeight: 600,
        boxSizing: "border-box",
      }}
    >
      {children}
    </Link>
  );
}