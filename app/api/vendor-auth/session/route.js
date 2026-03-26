import { NextResponse } from "next/server";
import { getVendorBrandFromHost } from "@/lib/vendorPortal/brand";
import {
  verifyVendorSessionToken,
  getVendorSessionCookieName,
} from "@/lib/vendorPortal/session";

export async function GET(request) {
  const token = request.cookies.get(getVendorSessionCookieName())?.value;
  const verified = verifyVendorSessionToken(token);
  if (!verified.ok) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  const brand = getVendorBrandFromHost(request.headers.get("host"));
  return NextResponse.json({
    authenticated: true,
    brandKey: brand.key,
    brandName: brand.name,
  });
}
