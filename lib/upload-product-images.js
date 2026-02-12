// Upload helpers for product images on serverless (Vercel Blob) or local filesystem.
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Upload product image buffer to Blob or local filesystem.
 * On serverless (read-only FS), requires BLOB_READ_WRITE_TOKEN.
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Filename (e.g. p_123_abc.jpg)
 * @returns {Promise<string>} - Blob URL or filename for local
 */
export async function uploadProductImage(buffer, filename) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const cwd = process.cwd();
  const isReadOnlyFs = cwd.includes("/var/task") || process.env.VERCEL === "1";

  if (isReadOnlyFs && !blobToken) {
    throw new Error(
      "Product image uploads require Blob storage on this server. Add a Blob store in Vercel Dashboard → Storage, then set BLOB_READ_WRITE_TOKEN in environment variables.",
    );
  }

  if (blobToken) {
    const blob = await put(`images/products/${filename}`, buffer, {
      access: "public",
      token: blobToken,
    });
    return blob.url;
  }

  const uploadDir = join(process.cwd(), "public", "images", "products");
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);
  return filename;
}
