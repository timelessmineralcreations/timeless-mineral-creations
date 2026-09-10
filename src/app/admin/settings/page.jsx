import { prisma } from "@/lib/prisma";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { updateSiteSettings } from "./actions";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "site-settings";

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,

  businessName:
    "Timeless Mineral Creations",

  contactEmail: "",
  contactPhone: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",

  turnaroundMinWeeks: 2,
  turnaroundMaxWeeks: 10,

  usShippingOnly: true,

  standardShippingPriceCents: 800,
  priorityShippingPriceCents: 1500,

  shippingInstructions: "",
  memorialInstructions: "",

  // Site-wide sale
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

export default async function AdminSettingsPage({
  searchParams,
}) {
  const params =
    await searchParams;

  const storedSettings =
    await prisma.siteSettings.findUnique(
      {
        where: {
          id: SETTINGS_ID,
        },
      }
    );

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(storedSettings || {}),
  };

  const saved =
    params?.saved === "1";

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding:
          "32px 24px 80px",
      }}
    >
      <p
        style={{
          color: "#d9b56d",
          fontWeight: "700",
          marginBottom: "6px",
        }}
      >
        ADMIN
      </p>

      <h1
        style={{
          margin: 0,
          fontSize: "38px",
        }}
      >
        Settings
      </h1>

      <p
        style={{
          marginTop: "12px",
          marginBottom: "28px",
          color: "#9aa5a0",
          lineHeight: 1.6,
          maxWidth: "760px",
        }}
      >
        Manage your site-wide
        business information,
        turnaround time, shipping,
        sales, announcements, and
        social links.
      </p>

      {saved && (
        <div
          style={{
            marginBottom: "22px",
            padding: "14px 16px",
            borderRadius: "11px",
            border:
              "1px solid rgba(134,239,172,.35)",
            background:
              "rgba(134,239,172,.08)",
            color: "#bbf7d0",
            fontWeight: 700,
          }}
        >
          ✓ Settings saved
          successfully.
        </div>
      )}

      <SiteSettingsForm
        settings={settings}
        action={
          updateSiteSettings
        }
      />
    </main>
  );
}