import "server-only";

import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  const sessionEmail = String(
    session?.user?.email || ""
  )
    .trim()
    .toLowerCase();

  const adminEmail = String(
    process.env.ADMIN_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  if (
    !sessionEmail ||
    !adminEmail ||
    sessionEmail !== adminEmail
  ) {
    throw new Error("Unauthorized");
  }

  return session;
}
