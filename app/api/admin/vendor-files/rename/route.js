import { NextResponse } from "next/server";
import {
  getR2Client,
  r2CopyObject,
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
    const kind = body?.kind;

    if (kind === "file") {
      const fromRel = normalizeRelPath(body?.fromKey || "");
      const toRel = normalizeRelPath(body?.toKey || "");
      if (!fromRel || !toRel) {
        return NextResponse.json(
          { error: "fromKey and toKey are required" },
          { status: 400 },
        );
      }
      const fromFull = `${basePrefix}${fromRel}`;
      const toFull = `${basePrefix}${toRel}`;
      if (
        !ensureFullKeyUnderBrandPrefix(fromFull, brandKey) ||
        !ensureFullKeyUnderBrandPrefix(toFull, brandKey)
      ) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      await r2CopyObject({
        bucketName: r2.bucketName,
        client: r2.client,
        sourceKey: fromFull,
        destKey: toFull,
      });
      await r2DeleteObject({
        bucketName: r2.bucketName,
        client: r2.client,
        key: fromFull,
      });
      return NextResponse.json({ success: true });
    }

    if (kind === "folder") {
      const fromPath = normalizeRelPath(body?.fromPath || "");
      const toPath = normalizeRelPath(body?.toPath || "");
      if (!fromPath || !toPath) {
        return NextResponse.json(
          { error: "fromPath and toPath are required" },
          { status: 400 },
        );
      }
      const fromPrefix = `${basePrefix}${fromPath.replace(/\/+$/, "")}/`;
      const toPrefix = `${basePrefix}${toPath.replace(/\/+$/, "")}/`;
      if (
        !ensureFullKeyUnderBrandPrefix(fromPrefix, brandKey) ||
        !ensureFullKeyUnderBrandPrefix(toPrefix, brandKey)
      ) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
      if (
        toPrefix.startsWith(fromPrefix) ||
        (fromPrefix.startsWith(toPrefix) && fromPrefix !== toPrefix)
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid rename: source folder is inside destination or vice versa",
          },
          { status: 400 },
        );
      }
      const keys = await r2ListAllObjectKeys({
        bucketName: r2.bucketName,
        client: r2.client,
        prefix: fromPrefix,
      });
      for (const key of keys) {
        const suffix = key.slice(fromPrefix.length);
        const destKey = `${toPrefix}${suffix}`;
        await r2CopyObject({
          bucketName: r2.bucketName,
          client: r2.client,
          sourceKey: key,
          destKey: destKey,
        });
      }
      if (keys.length > 0) {
        await r2DeleteKeysBatch({
          bucketName: r2.bucketName,
          client: r2.client,
          keys,
        });
      }
      return NextResponse.json({ success: true, movedCount: keys.length });
    }

    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("admin vendor-files rename:", err);
    return NextResponse.json(
      { error: err.message || "Rename failed" },
      { status: 500 },
    );
  }
}
