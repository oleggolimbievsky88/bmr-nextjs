import { NextResponse } from "next/server";
import { getR2Client, r2SignedDownloadUrl } from "@/lib/vendorPortal/r2";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  normalizeRelPath,
  resolveVendorBrandKeyFromQuery,
  ensureFullKeyUnderBrandPrefix,
} from "@/lib/vendorPortal/paths";
import { getBrandR2Prefix } from "@/lib/vendorPortal/brand";

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  try {
    const r2 = getR2Client();
    if (!r2) {
      return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const brandKey = resolveVendorBrandKeyFromQuery(searchParams.get("brand"));
    const relKey = normalizeRelPath(searchParams.get("key") || "");
    if (!relKey) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const basePrefix = getBrandR2Prefix(brandKey);
    const fullKey = `${basePrefix}${relKey}`;
    if (!ensureFullKeyUnderBrandPrefix(fullKey, brandKey)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const url = await r2SignedDownloadUrl({
      bucketName: r2.bucketName,
      client: r2.client,
      key: fullKey,
      expiresInSeconds: 120,
    });

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("admin vendor-files download:", err);
    return NextResponse.json(
      { error: "Failed to create download link" },
      { status: 500 },
    );
  }
}
