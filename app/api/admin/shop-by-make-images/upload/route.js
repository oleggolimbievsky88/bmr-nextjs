import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
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

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const SUBDIR = "logo";
const PUBLIC_PATH = `/images/${SUBDIR}`;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "No image file provided" },
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Cloudflare R2 — upload to bucket; return URL from the base where R2 is actually served
    const r2 = getR2Client();
    if (r2) {
      const key = `images/${SUBDIR}/${filename}`;
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );
      // Use dedicated uploads base when set (R2 public URL); else ASSETS_BASE_URL. Must point to where R2 is served, not the main site.
      const uploadsBase =
        process.env.NEXT_PUBLIC_UPLOADS_BASE_URL?.trim?.() ||
        process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim?.();
      if (!uploadsBase) {
        return NextResponse.json(
          {
            error:
              "When using R2, set NEXT_PUBLIC_UPLOADS_BASE_URL or NEXT_PUBLIC_ASSETS_BASE_URL to your R2 public URL (e.g. https://assets.yoursite.com), not the main site URL, so uploaded image links work.",
          },
          { status: 503 },
        );
      }
      const path = `${uploadsBase.replace(/\/$/, "")}/images/${SUBDIR}/${filename}`;
      return NextResponse.json({ success: true, path });
    }

    // 2. Vercel/serverless without R2 — use Blob and return actual Blob URL (not ASSETS_BASE_URL; file is not on Cloudflare)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const isReadOnlyFs =
      process.cwd().includes("/var/task") || process.env.VERCEL === "1";

    if (isReadOnlyFs && !blobToken) {
      return NextResponse.json(
        {
          error:
            "Shop by Make image uploads require Cloudflare R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) or Blob storage. Set R2 env vars for assets.controlfreaksuspension.com, or add a Blob store and BLOB_READ_WRITE_TOKEN.",
        },
        { status: 503 },
      );
    }

    if (blobToken) {
      const blob = await put(`images/${SUBDIR}/${filename}`, buffer, {
        access: "public",
        token: blobToken,
      });
      return NextResponse.json({
        success: true,
        path: blob.url,
      });
    }

    // 3. Local development: use filesystem
    try {
      const uploadDir = join(process.cwd(), "public", "images", SUBDIR);
      await mkdir(uploadDir, { recursive: true });
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      return NextResponse.json({
        success: true,
        path: `${PUBLIC_PATH}/${filename}`,
      });
    } catch (fsError) {
      if (
        fsError?.code === "EROFS" ||
        fsError?.message?.includes("read-only")
      ) {
        return NextResponse.json(
          {
            error:
              "Shop by Make uploads require Cloudflare R2 or Blob storage on this server.",
          },
          { status: 503 },
        );
      }
      throw fsError;
    }
  } catch (error) {
    console.error("Shop by Make image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 },
    );
  }
}
