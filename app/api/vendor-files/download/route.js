import { NextResponse } from "next/server";
import { getR2Client, r2SignedDownloadUrl } from "@/lib/vendorPortal/r2";
import {
  requireVendorSession,
  ensureKeyInPrefix,
} from "@/lib/vendorPortal/auth";

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
    const relKey = String(searchParams.get("key") || "").replace(/^\/+/, "");
    const fullKey = `${auth.prefix}${relKey}`;

    if (!ensureKeyInPrefix(fullKey, auth.prefix)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const url = await r2SignedDownloadUrl({
      bucketName: r2.bucketName,
      client: r2.client,
      key: fullKey,
      expiresInSeconds: 60,
    });

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("vendor-files/download failed:", err);
    return NextResponse.json(
      { error: "Failed to create download link" },
      { status: 500 },
    );
  }
}
