import { NextResponse } from "next/server";
import {
  getVendorSessionCookieName,
  getVendorSessionCookieOptions,
} from "@/lib/vendorPortal/session";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(getVendorSessionCookieName(), "", {
    ...getVendorSessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
