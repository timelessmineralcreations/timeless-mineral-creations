import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import Script from "next/script";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "Timeless Mineral Creations",
  description:
    "Handcrafted Memorial & Mineral Jewelry",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}) {
  const siteSettings =
    await prisma.siteSettings.findUnique({
      where: {
        id: "site-settings",
      },

      select: {
        businessName: true,

        announcementEnabled: true,
        announcementText: true,

        facebookUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        etsyUrl: true,
      },
    });

  const showAnnouncement =
    siteSettings?.announcementEnabled &&
    siteSettings?.announcementText?.trim();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-61349C6EBT"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-61349C6EBT');
          `}
        </Script>
        <CartProvider>
          {showAnnouncement && (
            <div
              style={{
                width: "100%",
                padding: "9px 18px",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, rgb(233, 192, 84), rgb(184, 134, 11))",
                color: "#111",
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: 1.4,
                letterSpacing:
                  "0.01em",
                boxSizing:
                  "border-box",
              }}
            >
              {
                siteSettings.announcementText
              }
            </div>
          )}

          <Header />

          <main
            style={{
              flex: 1,
              width: "100%",
            }}
          >
            {children}
          </main>

          <Footer
            settings={
              siteSettings || {}
            }
          />
        </CartProvider>
      </body>
    </html>
  );
}