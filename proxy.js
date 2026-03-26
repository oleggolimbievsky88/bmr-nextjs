import { NextResponse } from "next/server";

function isVendorHost(hostname) {
  const host = (hostname || "").toLowerCase();
  return (
    host === "vendors.bmrsuspension.com" ||
    host === "vendors.controlfreaksuspension.com" ||
    host.endsWith(".vendors.bmrsuspension.com") ||
    host.endsWith(".vendors.controlfreaksuspension.com")
  );
}

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  // Only affect the vendor subdomains; leave main site untouched.
  if (!isVendorHost(host)) return NextResponse.next();

  // Vendor subdomain root should land on the portal.
  if (url.pathname === "/") {
    url.pathname = "/vendor-portal";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run proxy for vendor subdomains traffic.
  // (Still needs a path matcher; host gating is done in code above.)
  matcher: ["/:path*"],
};
