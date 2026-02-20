import { getBrandConfigByKey } from "@bmr/core/brand";
import { readFile } from "fs/promises";
import { join } from "path";

const MIME_BY_EXT = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const ALLOWED_KEYS = ["bmr", "controlfreak"];

export async function GET(request) {
  try {
    const brandParam = request.nextUrl?.searchParams?.get("brand");
    const key =
      brandParam && ALLOWED_KEYS.includes(brandParam.toLowerCase())
        ? brandParam.toLowerCase()
        : null;
    const config = await getBrandConfigByKey(key);
    let path = config.faviconPath && String(config.faviconPath).trim();
    if (!path) path = "/favicon.ico";
    if (!path.startsWith("/")) path = `/${path}`;
    // Only allow paths under /brands/ or root favicon to avoid path traversal
    if (
      path.includes("..") ||
      (!path.startsWith("/brands/") && path !== "/favicon.ico")
    ) {
      return new Response("Forbidden", { status: 403 });
    }
    const publicDir = join(process.cwd(), "public");
    const filePath = join(publicDir, path.replace(/^\//, ""));
    const body = await readFile(filePath);
    const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Favicon route error:", err);
    return new Response("Not Found", { status: 404 });
  }
}
