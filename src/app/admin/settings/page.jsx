export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
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
        Settings
      </h1>

      <p
        style={{
          marginTop: "12px",
          color: "#9aa5a0",
        }}
      >
        Website settings will be added here.
      </p>
    </main>
  );
}