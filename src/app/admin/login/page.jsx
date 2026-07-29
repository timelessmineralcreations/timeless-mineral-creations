import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        action={async () => {
          "use server";

          await signIn("google", {
            redirectTo: "/admin/dashboard",
          });
        }}
      >
        <button
          type="submit"
          style={{
            padding: "14px 24px",
            border: "none",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#E9C054,#B8860B)",
            color: "#111",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}