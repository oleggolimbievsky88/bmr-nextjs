// proxy.js
// Handle authentication and legacy redirects

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // /admin/login is allowed without auth (handled in authorized callback)
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    // Redirect unauthenticated /admin requests to admin login
    if (pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
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
    }

    // Allow access to authenticated routes (my-account routes)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow /admin/login without auth so users can reach the login page
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // Other admin routes require admin role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }
        // My-account routes require any authenticated user
        if (req.nextUrl.pathname.startsWith("/my-account")) {
          return !!token;
        }
        // Allow other routes
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
