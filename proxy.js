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

    // Redirect unauthenticated /admin requests to unified login
    if (pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      const loginUrl = new URL("/login", req.url);
      // /admin/login is legacy - send to /admin; otherwise preserve requested path
      const callback =
        pathname === "/admin/login"
          ? "/admin"
          : pathname + (nextUrl.search || "");
      loginUrl.searchParams.set("callbackUrl", callback);
      return NextResponse.redirect(loginUrl);
    }

    // Legacy ColdFusion URLs: ?page=products&vehicleid=&maincatid=&catid= or &productid=
    const url = new URL(req.url);
    const isLegacyProducts =
      (pathname === "/" || pathname === "/index.cfm") &&
      url.searchParams.get("page") === "products";

    if (isLegacyProducts) {
      const productid = url.searchParams.get("productid");
      const vehicleid = url.searchParams.get("vehicleid");
      const maincatid = url.searchParams.get("maincatid");
      const catid = url.searchParams.get("catid");

      if (productid) {
        return NextResponse.redirect(
          new URL(`/product/${productid}`, url.origin),
        );
      }
      if (vehicleid && maincatid) {
        const legacyQuery = new URLSearchParams({ vehicleid, maincatid });
        if (catid) legacyQuery.set("catid", catid);
        const legacyUrl = new URL(
          `/api/legacy-redirect?${legacyQuery}`,
          url.origin,
        );
        return NextResponse.redirect(legacyUrl);
      }
    }

    // Allow access to authenticated routes (my-account routes)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
