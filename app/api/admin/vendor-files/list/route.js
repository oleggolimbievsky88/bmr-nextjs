import { NextResponse } from "next/server";
import { getR2Client, r2List } from "@/lib/vendorPortal/r2";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  normalizeRelPath,
  resolveVendorBrandKeyFromQuery,
} from "@/lib/vendorPortal/paths";
import { getBrandR2Prefix } from "@/lib/vendorPortal/brand";
import { mapR2ListToExplorer } from "@/lib/vendorPortal/listing";

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
    const basePrefix = getBrandR2Prefix(brandKey);
    const relPath = normalizeRelPath(searchParams.get("path") || "");

    const data = await r2List({
      bucketName: r2.bucketName,
      client: r2.client,
      prefix: relPath
        ? `${basePrefix}${relPath.replace(/\/+$/, "")}/`
        : basePrefix,
      delimiter: "/",
    });

    const { folders, files } = mapR2ListToExplorer({
      data,
      basePrefix,
      relPath,
    });

    return NextResponse.json({
      success: true,
      brandKey,
      prefix: relPath,
      folders,
      files,
    });
  } catch (err) {
    console.error("admin vendor-files list:", err);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 },
    );
  }
}
