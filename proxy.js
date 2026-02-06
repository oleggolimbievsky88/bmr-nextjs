// proxy.js
// Handle authentication and legacy redirects

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/** Redirect if URL has duplicate/malformed view= params (e.g. from old CF "Mobile View" link). */
function hasMalformedViewQuery(search) {
  if (!search || search.length < 2) return false;
  const viewMatches = search.match(/[?&]view=/g);
  return viewMatches ? viewMatches.length > 1 : false;
}

/** Build search string without any view param. */
function searchWithoutView(searchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key === "view") continue;
    params.set(key, value);
  }
  const s = params.toString();
  return s ? "?" + s : "";
}

export default withAuth(
  function proxy(req) {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Clean malformed ?view=mobile?view=mobile&... from old ColdFusion "Mobile View" links
    const search = nextUrl.search || "";
    if (hasMalformedViewQuery(search)) {
      const cleanSearch = searchWithoutView(nextUrl.searchParams);
      const cleanUrl = new URL(pathname + cleanSearch, nextUrl.origin);
      return NextResponse.redirect(cleanUrl);
    }

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
