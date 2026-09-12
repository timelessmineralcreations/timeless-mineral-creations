import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",

    // Require a fresh login after eight hours.
    maxAge: 8 * 60 * 60,

    // Refresh active sessions hourly.
    updateAge: 60 * 60,
  },

  callbacks: {
    async signIn({
      account,
      profile,
    }) {
      if (
        account?.provider !== "google"
      ) {
        return false;
      }

      const email = String(
        profile?.email || ""
      )
        .trim()
        .toLowerCase();

      const emailIsVerified =
        profile?.email_verified === true;

      if (!ADMIN_EMAIL) {
        console.error(
          "ADMIN_EMAIL is missing."
        );

        return false;
      }

      return (
        emailIsVerified &&
        email === ADMIN_EMAIL
      );
    },

    async session({ session }) {
      if (session?.user?.email) {
        session.user.email =
          session.user.email
            .trim()
            .toLowerCase();
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});