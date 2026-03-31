import { NextResponse } from "next/server";
import { getR2Client, r2PutObject } from "@/lib/vendorPortal/r2";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  normalizeRelPath,
  resolveVendorBrandKeyFromQuery,
  sanitizeFolderSegment,
  ensureFullKeyUnderBrandPrefix,
} from "@/lib/vendorPortal/paths";
import { getBrandR2Prefix } from "@/lib/vendorPortal/brand";

export async function POST(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  try {
    const r2 = getR2Client();
    if (!r2) {
      return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const brandKey = resolveVendorBrandKeyFromQuery(body?.brand);
    const parentRel = normalizeRelPath(body?.path || "");
    const name = sanitizeFolderSegment(body?.name);
    if (!name) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    const basePrefix = getBrandR2Prefix(brandKey);
    const relFolder = parentRel ? `${parentRel}/${name}` : name;
    const fullKey = `${basePrefix}${relFolder}/`;

    if (!ensureFullKeyUnderBrandPrefix(fullKey, brandKey)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    await r2PutObject({
      bucketName: r2.bucketName,
      client: r2.client,
      key: fullKey,
      body: Buffer.alloc(0),
      contentType: "application/x-directory",
    });

    return NextResponse.json({ success: true, path: relFolder });
  } catch (err) {
    console.error("admin vendor-files mkdir:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create folder" },
      { status: 500 },
    );
  }
}
