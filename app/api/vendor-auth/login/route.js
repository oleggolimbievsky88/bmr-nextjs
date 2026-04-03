import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createVendorSessionToken,
  getVendorSessionCookieName,
  getVendorSessionCookieOptions,
} from "@/lib/vendorPortal/session";
import { getVendorBrandFromHost } from "@/lib/vendorPortal/brand";
import { getVendorPortalCredentials } from "@/lib/vendorPortal/credentials";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const username = String(body?.username || "");
    const password = String(body?.password || "");

    const brand = getVendorBrandFromHost(request.headers.get("host"));

    const creds = await getVendorPortalCredentials(brand.key);
    if (creds?.username && creds?.passwordHash) {
      const okUser = username === creds.username;
      const okPass = await bcrypt.compare(password, creds.passwordHash);
      if (!okUser || !okPass) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 },
        );
      }
    } else {
      // Backward-compatible fallback (env vars) if DB isn't configured yet.
      const expectedUser = process.env.VENDOR_PORTAL_USER || "";
      const expectedPass = process.env.VENDOR_PORTAL_PASS || "";

      if (!expectedUser || !expectedPass) {
        return NextResponse.json(
          { success: false, error: "Server not configured" },
          { status: 500 },
        );
      }

      if (username !== expectedUser || password !== expectedPass) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 },
        );
      }
    }

    const token = createVendorSessionToken({ brandKey: brand.key });

    const res = NextResponse.json({
      success: true,
      brandKey: brand.key,
      brandName: brand.name,
    });

    res.cookies.set(getVendorSessionCookieName(), token, {
      ...getVendorSessionCookieOptions(),
    });
    return res;
  } catch (err) {
    console.error("vendor-auth/login failed:", err);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 },
    );
  }
}
