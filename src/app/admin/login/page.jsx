import { signIn } from "@/auth";

async function login() {
  "use server";

  await signIn("google", {
    redirectTo: "/admin/dashboard",
  });
}

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
      <form action={login}>
        <button type="submit">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}