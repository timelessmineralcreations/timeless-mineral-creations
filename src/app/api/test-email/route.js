import { resend } from "@/lib/resend";

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "Timeless Mineral Creations <orders@timelessmineralcreations.com>",
      to: "timelessmineralcreations@gmail.com",
      subject: "🎉 Timeless Mineral Creations Email Test",
      html: `
        <h1>Congratulations!</h1>

        <p>Your website is successfully connected to Resend.</p>

        <p>The next email you receive will be one of your beautiful customer templates.</p>
      `,
    });

    return Response.json(data);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}