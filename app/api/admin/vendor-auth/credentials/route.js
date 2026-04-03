import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdminApi } from "@/lib/vendorPortal/adminAuth";
import {
  getVendorPortalCredentials,
  upsertVendorPortalCredentials,
} from "@/lib/vendorPortal/credentials";
import { resolveVendorBrandKeyFromQuery } from "@/lib/vendorPortal/paths";

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  try {
    const { searchParams } = new URL(request.url);
    const brandKey = resolveVendorBrandKeyFromQuery(searchParams.get("brand"));
    const creds = await getVendorPortalCredentials(brandKey);

    return NextResponse.json({
      success: true,
      brandKey,
      username: creds?.username || "",
      hasPassword: Boolean(creds?.passwordHash),
      updatedAt: creds?.updatedAt || null,
    });
  } catch (err) {
    console.error("admin vendor-auth/credentials GET:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load credentials" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json().catch(() => null);
    const brandKey = resolveVendorBrandKeyFromQuery(body?.brand);
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 },
      );
    }

    let passwordHash = "";
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password, 12);
    } else {
      const existing = await getVendorPortalCredentials(brandKey);
      passwordHash = existing?.passwordHash || "";
    }

    if (!passwordHash) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 },
      );
    }

    const saved = await upsertVendorPortalCredentials({
      brandKey,
      username,
      passwordHash,
    });

    return NextResponse.json({
      success: true,
      brandKey: saved.brandKey,
      username: saved.username,
      updatedAt: saved.updatedAt,
    });
  } catch (err) {
    console.error("admin vendor-auth/credentials POST:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save credentials" },
      { status: 500 },
    );
  }
}
