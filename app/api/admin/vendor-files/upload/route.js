import { NextResponse } from "next/server";
import { getR2Client, r2PutObject } from "@/lib/vendorPortal/r2";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  normalizeRelPath,
  resolveVendorBrandKeyFromQuery,
  sanitizeFilename,
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

    const formData = await request.formData();
    const brandKey = resolveVendorBrandKeyFromQuery(
      formData.get("brand") || "",
    );
    const parentRel = normalizeRelPath(formData.get("path") || "");
    const file = formData.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const basePrefix = getBrandR2Prefix(brandKey);
    const name = sanitizeFilename(file.name);
    const relKey = parentRel ? `${parentRel}/${name}` : name;
    const fullKey = `${basePrefix}${relKey}`;

    if (!ensureFullKeyUnderBrandPrefix(fullKey, brandKey)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2PutObject({
      bucketName: r2.bucketName,
      client: r2.client,
      key: fullKey,
      body: buffer,
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ success: true, key: relKey });
  } catch (err) {
    console.error("admin vendor-files upload:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 },
    );
  }
}
