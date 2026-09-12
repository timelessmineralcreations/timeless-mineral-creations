import { auth } from "@/auth";
import { resend } from "@/lib/resend";

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

export async function GET() {
  try {
    const session = await auth();

    const sessionEmail = String(
      session?.user?.email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !ADMIN_EMAIL ||
      sessionEmail !== ADMIN_EMAIL
    ) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const data =
      await resend.emails.send({
        from:
          "Timeless Mineral Creations <orders@timelessmineralcreations.com>",

        to: ADMIN_EMAIL,

        subject:
          "Timeless Mineral Creations Email Test",

        html: `
          <h1>Email Test Successful</h1>

          <p>Your website is successfully connected to Resend.</p>
        `,
      });

    return Response.json(data);
  } catch (error) {
    console.error(
      "Test email error:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to send test email.",
      },
      {
        status: 500,
      }
    );
  }
}