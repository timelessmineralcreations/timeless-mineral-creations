export const dynamic = "force-dynamic";

export default function CustomersPage() {
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
        Customers
      </h1>

      <p
        style={{
          marginTop: "12px",
          color: "#9aa5a0",
        }}
      >
        Customer management will be added here.
      </p>
    </main>
  );
}