import { auth } from "@/auth";
import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid upload request.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await handleUpload({
      request,
      body,

      onBeforeGenerateToken: async (pathname) => {
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
          throw new Error(
            "Unauthorized."
          );
        }

        if (
          !pathname ||
          !pathname.startsWith("gallery/")
        ) {
          throw new Error(
            "Invalid gallery upload path."
          );
        }

        return {
          allowedContentTypes:
            ALLOWED_CONTENT_TYPES,

          maximumSizeInBytes:
            MAX_FILE_SIZE,

          addRandomSuffix: true,

          cacheControlMaxAge:
            60 * 60 * 24 * 30,

          tokenPayload: JSON.stringify({
            uploadedBy:
              sessionEmail,
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        let uploadInformation = null;

        try {
          uploadInformation =
            tokenPayload
              ? JSON.parse(tokenPayload)
              : null;
        } catch {
          uploadInformation = null;
        }

        console.log(
          "Gallery image upload completed:",
          {
            pathname: blob.pathname,
            url: blob.url,
            uploadedBy:
              uploadInformation?.uploadedBy ||
              "Unknown",
          }
        );
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Gallery upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The gallery image could not be uploaded.",
      },
      {
        status: 400,
      }
    );
  }
}