import { NextResponse } from "next/server";
import { getR2Client, r2List } from "@/lib/vendorPortal/r2";
import { requireVendorSession } from "@/lib/vendorPortal/auth";

function normalizePath(path) {
  const p = String(path || "")
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .trim();
  return p;
}

export async function GET(request) {
  try {
    const auth = requireVendorSession(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const r2 = getR2Client();
    if (!r2) {
      return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const relPath = normalizePath(searchParams.get("path") || "");
    const basePrefix = auth.prefix; // always ends with /
    const fullPrefix = relPath
      ? `${basePrefix}${relPath.replace(/\/+$/, "")}/`
      : basePrefix;

    const data = await r2List({
      bucketName: r2.bucketName,
      client: r2.client,
      prefix: fullPrefix,
      delimiter: "/",
    });

    const folders = (data.CommonPrefixes || [])
      .map((cp) => cp.Prefix)
      .filter(Boolean)
      .map((p) => {
        const name = p.endsWith("/") ? p.slice(0, -1).split("/").pop() : p;
        const rel = p.startsWith(basePrefix) ? p.slice(basePrefix.length) : p;
        return { name, path: rel.replace(/\/$/, "") };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = (data.Contents || [])
      .map((o) => ({
        key: o.Key,
        size: o.Size || 0,
        lastModified: o.LastModified
          ? new Date(o.LastModified).toISOString()
          : null,
      }))
      .filter((o) => o.key && o.key !== fullPrefix) // exclude prefix placeholder
      .map((o) => {
        const relKey = o.key.startsWith(basePrefix)
          ? o.key.slice(basePrefix.length)
          : o.key;
        return {
          name: o.key.split("/").pop(),
          key: relKey,
          size: o.size,
          lastModified: o.lastModified,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      brandKey: auth.brand.key,
      prefix: relPath,
      folders,
      files,
    });
  } catch (err) {
    console.error("vendor-files/list failed:", err);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 },
    );
  }
}
