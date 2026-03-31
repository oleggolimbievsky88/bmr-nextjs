import { NextResponse } from "next/server";
import {
  getR2Client,
  r2DeleteObject,
  r2ListAllObjectKeys,
  r2DeleteKeysBatch,
} from "@/lib/vendorPortal/r2";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  normalizeRelPath,
  resolveVendorBrandKeyFromQuery,
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
    const basePrefix = getBrandR2Prefix(brandKey);
    const type = body?.type;

    if (type === "file") {
      const relKey = normalizeRelPath(body?.key || "");
      if (!relKey) {
        return NextResponse.json({ error: "Missing key" }, { status: 400 });
      }
      const fullKey = `${basePrefix}${relKey}`;
      if (!ensureFullKeyUnderBrandPrefix(fullKey, brandKey)) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      await r2DeleteObject({
        bucketName: r2.bucketName,
        client: r2.client,
        key: fullKey,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "folder") {
      const folderRel = normalizeRelPath(body?.path || "");
      const prefix = folderRel
        ? `${basePrefix}${folderRel.replace(/\/+$/, "")}/`
        : basePrefix;
      if (!ensureFullKeyUnderBrandPrefix(prefix, brandKey)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
      if (prefix === basePrefix) {
        return NextResponse.json(
          { error: "Cannot delete brand root folder" },
          { status: 400 },
        );
      }
      const keys = await r2ListAllObjectKeys({
        bucketName: r2.bucketName,
        client: r2.client,
        prefix,
      });
      if (keys.length > 0) {
        await r2DeleteKeysBatch({
          bucketName: r2.bucketName,
          client: r2.client,
          keys,
        });
      }
      return NextResponse.json({ success: true, deletedCount: keys.length });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("admin vendor-files delete:", err);
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 },
    );
  }
}
