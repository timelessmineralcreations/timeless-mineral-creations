import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

export async function POST(request) {
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
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid upload request.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response =
      await handleUpload({
        body,
        request,

        onBeforeGenerateToken:
          async () => {
            return {
              allowedContentTypes:
                ALLOWED_CONTENT_TYPES,

              maximumSizeInBytes:
                MAX_FILE_SIZE,

              addRandomSuffix: true,

              tokenPayload:
                JSON.stringify({
                  uploadedBy:
                    sessionEmail,
                }),
            };
          },

        onUploadCompleted:
          async () => {
            /*
             * No sensitive upload
             * information is logged.
             */
          },
      });

    return NextResponse.json(
      response
    );
  } catch (error) {
    console.error(
      "Vercel Blob upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Image upload failed.",
      },
      {
        status: 400,
      }
    );
  }
}