import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

const UPLOAD_TYPES = ["thumbnail", "banner"];

/** Path under bucket/public for uploads. Must match frontend (lib/assets.js) so URLs resolve. */
function getUploadPath(type) {
  const brand = (
    process.env.NEXT_PUBLIC_BRAND ||
    process.env.BRAND ||
    "bmr"
  ).toLowerCase();
  if (type === "thumbnail") {
    const env = process.env.NEXT_PUBLIC_PLATFORM_IMAGE_PATH?.trim();
    if (env) return env.replace(/^\//, "");
    return brand === "controlfreak" ? "cars" : "siteart/cars";
  }
  if (type === "banner") {
    const env = process.env.NEXT_PUBLIC_PLATFORM_BANNER_PATH?.trim();
    if (env) return env.replace(/^\//, "");
    return brand === "controlfreak"
      ? "platformHeaders"
      : "siteart/platformHeaders";
  }
  return type === "thumbnail" ? "siteart/cars" : "siteart/platformHeaders";
}

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }
  const endpoint =
    process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  return {
    client: new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
    bucketName,
  };
}

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

    if (!UPLOAD_TYPES.includes(type)) {
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
    const uploadPath = getUploadPath(type);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Cloudflare R2 — path from env/brand so it matches frontend URLs
    const r2 = getR2Client();
    if (r2) {
      const key = `${uploadPath}/${filename}`;
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );
      return NextResponse.json({ success: true, filename });
    }

    // 2. Vercel/serverless: no writable filesystem — R2 required
    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error:
            "Platform image uploads require Cloudflare R2. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME to Vercel env vars.",
        },
        { status: 503 },
      );
    }

    // 3. Local filesystem (dev fallback only) — same path as R2
    try {
      const uploadDir = join(process.cwd(), "public", uploadPath);
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
              "Platform image uploads require Cloudflare R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).",
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
