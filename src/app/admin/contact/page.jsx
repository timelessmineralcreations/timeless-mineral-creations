import { prisma } from "@/lib/prisma";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";
import { updateContactSettings } from "./actions";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "site-settings";

const DEFAULTS = {
  contactEmail: "timelessmineralcreations@gmail.com",
  contactCreatorImageUrl: "",
  contactCreatorHeading: "Meet the Craftsman",
  contactCreatorIntro:
    "Hi, I'm Michael, the owner and craftsman behind Timeless Mineral Creations.",
  contactCreatorBodyOne:
    "Every memorial ring is personally handcrafted by me in North Carolina. From the moment your memorial materials arrive to the final polishing and inspection, every step is completed with care, patience, and respect.",
  contactCreatorBodyTwo:
    "Thank you for trusting me with something so meaningful. It is truly an honor to help create a lasting tribute that preserves the memories of those who mean the most, whether they are beloved family members or cherished pets.",
  contactLocationText:
    "Proudly Handcrafted in North Carolina",
  contactResponseTimeText:
    "Within 24 Hours",
  contactClosingText:
    "Every memorial piece is handcrafted with care, respect, and attention to detail. Whether it's created to honor a beloved family member or a cherished pet, it is truly an honor to preserve a memory that will be treasured for a lifetime.",
  contactClosingThankYouText:
    "Thank you for trusting Timeless Mineral Creations.",
};

export default async function AdminContactPage({ searchParams }) {
  const params = await searchParams;

  const storedSettings = await prisma.siteSettings.findUnique({
    where: {
      id: SETTINGS_ID,
    },
  });

  const settings = {
    contactEmail:
      storedSettings?.contactEmail ||
      DEFAULTS.contactEmail,

    contactCreatorImageUrl:
      storedSettings?.contactCreatorImageUrl ||
      DEFAULTS.contactCreatorImageUrl,

    contactCreatorHeading:
      storedSettings?.contactCreatorHeading ||
      DEFAULTS.contactCreatorHeading,

    contactCreatorIntro:
      storedSettings?.contactCreatorIntro ||
      DEFAULTS.contactCreatorIntro,

    contactCreatorBodyOne:
      storedSettings?.contactCreatorBodyOne ||
      DEFAULTS.contactCreatorBodyOne,

    contactCreatorBodyTwo:
      storedSettings?.contactCreatorBodyTwo ||
      DEFAULTS.contactCreatorBodyTwo,

    contactLocationText:
      storedSettings?.contactLocationText ||
      DEFAULTS.contactLocationText,

    contactResponseTimeText:
      storedSettings?.contactResponseTimeText ||
      DEFAULTS.contactResponseTimeText,

    contactClosingText:
      storedSettings?.contactClosingText ||
      DEFAULTS.contactClosingText,

    contactClosingThankYouText:
      storedSettings?.contactClosingThankYouText ||
      DEFAULTS.contactClosingThankYouText,
  };

  const saved = params?.saved === "1";

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px 80px",
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
        Contact Page
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
        Manage your public contact information, Meet the Craftsman
        photo and biography, and closing message.
      </p>

      {saved && (
        <div
          style={{
            marginBottom: "22px",
            padding: "13px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(89, 184, 129, 0.35)",
            background: "rgba(89, 184, 129, 0.09)",
            color: "#b9e6c9",
          }}
        >
          Contact page settings saved successfully.
        </div>
      )}

      <ContactSettingsForm
        settings={settings}
        action={updateContactSettings}
      />
    </main>
  );
}
