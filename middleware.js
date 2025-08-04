import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Handle admin authentication
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Handle legacy URL redirects
    const url = new URL(req.url);
    if (
      url.pathname === "/index.cfm" &&
      url.searchParams.get("page") === "products"
    ) {
      const productid = url.searchParams.get("productid");
      if (productid) {
        return NextResponse.redirect(`/product/${productid}`);
      }
      // ...handle other legacy params
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
