import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const UPLOAD_DIRS = {
  thumbnail: "cars",
  banner: "platformHeaders",
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const formData = await request.formData();
    const file = formData.get("image");
    const type = formData.get("type") || "thumbnail";

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    if (!UPLOAD_DIRS[type]) {
      return NextResponse.json(
        {
          error: `Invalid type. Use "thumbnail" (megamenu) or "banner" (hero)`,
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: JPG, PNG, GIF, WebP (got ${file.type})`,
        },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const baseName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${baseName}_${Date.now()}.${ext}`;
    const subdir = UPLOAD_DIRS[type];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const cwd = process.cwd();
    const isReadOnlyFs =
      cwd.includes("/var/task") || process.env.VERCEL === "1";

    if (isReadOnlyFs && !blobToken) {
      return NextResponse.json(
        {
          error:
            "Platform image uploads require Blob storage on this server. Add a Blob store in Vercel Dashboard → Storage, then set BLOB_READ_WRITE_TOKEN in environment variables.",
        },
        { status: 503 },
      );
    }

    if (blobToken) {
      const blob = await put(`images/${subdir}/${filename}`, buffer, {
        access: "public",
        token: blobToken,
      });
      return NextResponse.json({
        success: true,
        filename: blob.url,
      });
    }

    try {
      const uploadDir = join(process.cwd(), "public", "images", subdir);
      await mkdir(uploadDir, { recursive: true });
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      return NextResponse.json({ success: true, filename });
    } catch (fsError) {
      if (
        fsError?.code === "EROFS" ||
        fsError?.message?.includes("read-only")
      ) {
        return NextResponse.json(
          {
            error:
              "Platform image uploads require Blob storage on this server.",
          },
          { status: 503 },
        );
      }
      throw fsError;
    }
  } catch (error) {
    console.error("Platform image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 },
    );
  }
}
