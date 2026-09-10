import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function cleanFileName(fileName) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() || "jpg";

  const nameWithoutExtension = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${nameWithoutExtension || "image"}.${extension}`;
}

export async function POST(request) {
  try {
    /*
     * ADMIN SECURITY
     *
     * Image uploads are only allowed for the authenticated
     * Timeless Mineral Creations administrator.
     */
    const session = await auth();

    const sessionEmail =
      session?.user?.email
        ?.trim()
        .toLowerCase() || "";

    const adminEmail =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase() || "";

    if (
      !sessionEmail ||
      !adminEmail ||
      sessionEmail !== adminEmail
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    const folder = String(
      formData.get("folder") || "admin-images"
    )
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9/-]+/g, "-")
      .replace(/^\/+|\/+$/g, "");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No image file was received.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error: "The image file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "The image must be smaller than 4 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const safeFolder =
      folder || "admin-images";

    const pathname = `${safeFolder}/${cleanFileName(
      file.name
    )}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
    });
  } catch (error) {
    console.error("Image upload failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
      },
      {
        status: 500,
      }
    );
  }
}