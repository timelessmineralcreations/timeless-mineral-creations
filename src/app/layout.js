import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_SITE_SETTINGS = {
  businessName: "Timeless Mineral Creations",
  contactEmail: "",
  contactPhone: "",
  turnaroundMinWeeks: 2,
  turnaroundMaxWeeks: 10,
  usShippingOnly: true,
  standardShippingPriceCents: 800,
  priorityShippingPriceCents: 1500,
  shippingInstructions: "",
  memorialInstructions: "",
  sitewideSaleEnabled: false,
  sitewideSalePercent: 0,
  sitewideSaleName: "",
  announcementEnabled: false,
  announcementText: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  etsyUrl: "",
};

async function getSiteSettings() {
  try {
    const settings =
      await prisma.siteSettings.findUnique({
        where: {
          id: "site-settings",
        },
        select: {
          businessName: true,
          contactEmail: true,
          contactPhone: true,
          turnaroundMinWeeks: true,
          turnaroundMaxWeeks: true,
          usShippingOnly: true,
          standardShippingPriceCents: true,
          priorityShippingPriceCents: true,
          shippingInstructions: true,
          memorialInstructions: true,
          sitewideSaleEnabled: true,
          sitewideSalePercent: true,
          sitewideSaleName: true,
          announcementEnabled: true,
          announcementText: true,
          facebookUrl: true,
          instagramUrl: true,
          tiktokUrl: true,
          etsyUrl: true,
        },
      });

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...(settings || {}),
    };
  } catch (error) {
    console.error(
      "Unable to load site settings:",
      error
    );

    return DEFAULT_SITE_SETTINGS;
  }
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Timeless Mineral Creations",
  description: "Handcrafted Memorial & Mineral Jewelry",
};

export default async function RootLayout({ children }) {
  const siteSettings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider siteSettings={siteSettings}>
          <Header siteSettings={siteSettings} />

          <main
            style={{              flex: 1,
              width: "100%",
            }}
          >
            {children}
          </main>

          <SiteFooter siteSettings={siteSettings} />
        </CartProvider>
      </body>
    </html>
  );
}


function SiteFooter({ siteSettings }) {
  const socialLinks = [
    ["Facebook", siteSettings.facebookUrl],
    ["Instagram", siteSettings.instagramUrl],
    ["TikTok", siteSettings.tiktokUrl],
    ["Etsy", siteSettings.etsyUrl],
  ].filter(([, url]) =>
    String(url || "").trim()
  );

  return (
    <footer
      style={{
        borderTop:
          "1px solid rgba(255,255,255,.08)",
        padding: "24px 20px",
        background: "rgba(12,12,12,.95)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            opacity: 0.78,
          }}
        >
          {siteSettings.businessName}
          {" | "}
          Current turnaround:{" "}
          {siteSettings.turnaroundMinWeeks}-
          {siteSettings.turnaroundMaxWeeks} weeks
        </div>

        {socialLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            {socialLinks.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#D4AF37",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}