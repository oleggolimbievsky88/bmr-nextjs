// proxy.js
// Handle device-based routing, authentication, and legacy redirects

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isMobileOrTablet } from "./lib/deviceDetection";

/**
 * Build a clean search string with at most one "view" param to prevent
 * ?view=mobile?view=mobile&view=mobile... redirect loops from CF or bad links.
 */
function getCleanViewSearch(existingParams, viewValue) {
  const params = new URLSearchParams();
  for (const [key, value] of existingParams.entries()) {
    if (key === "view") continue;
    params.set(key, value);
  }
  if (viewValue) params.set("view", viewValue);
  const s = params.toString();
  return s ? "?" + s : "";
}

/** True if URL search has duplicate or malformed view= params (e.g. ?view=mobile?view=mobile). */
function isViewSearchMalformed(search) {
  if (!search || search.length < 2) return false;
  const viewMatches = search.match(/[?&]view=/g);
  return viewMatches ? viewMatches.length > 1 : false;
}

export default withAuth(
  function proxy(req) {
    const { nextUrl, headers } = req;
    const pathname = nextUrl.pathname;

    // Skip device routing for localhost/development, API routes, static files, and protected routes
    const hostname = nextUrl.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      process.env.NODE_ENV === "development";

    const skipDeviceRouting =
      isLocalhost ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/my-account") ||
      pathname === "/favicon.ico" ||
      process.env.DISABLE_DEVICE_ROUTING === "true";

    // Handle device-based routing for public routes
    if (!skipDeviceRouting) {
      const userAgent = headers.get("user-agent") || "";
      const viewPreference = nextUrl.searchParams.get("view");
      const viewCookie = req.cookies.get("viewPreference")?.value;

      // Get the ColdFusion site URL from environment or default
      const cfUrl = process.env.CF_SITE_URL || "https://www.bmrsuspension.com";

      // Check if user has a view preference
      let shouldUseDesktop = false;
      let shouldUseMobile = false;

      // Priority: query param > cookie > device detection
      if (viewPreference === "desktop") {
        shouldUseDesktop = true;
      } else if (viewPreference === "mobile") {
        shouldUseMobile = true;
      } else if (viewCookie === "desktop") {
        shouldUseDesktop = true;
      } else if (viewCookie === "mobile") {
        shouldUseMobile = true;
      } else {
        // Default: desktop users go to CF, mobile/tablet stay on NextJS
        shouldUseDesktop = !isMobileOrTablet(userAgent);
      }

      // If user wants desktop view, redirect to CF site
      if (shouldUseDesktop) {
        // Build redirect URL with clean query (no duplicate/malformed view params)
        const redirectPath = pathname === "/" ? "/index.cfm" : pathname;
        const cleanSearch = getCleanViewSearch(nextUrl.searchParams, "desktop");
        const redirectUrl = new URL(redirectPath + cleanSearch, cfUrl);

        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set("viewPreference", "desktop", {
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: "lax",
        });
        return response;
      }

      // If user wants mobile view or is on mobile device, stay on NextJS
      if (shouldUseMobile || isMobileOrTablet(userAgent)) {
        if (viewPreference === "mobile") {
          // If URL has duplicate/malformed view=mobile (redirect loop), redirect once to clean URL
          const search = nextUrl.search || "";
          if (isViewSearchMalformed(search)) {
            const cleanSearch = getCleanViewSearch(nextUrl.searchParams, "mobile");
            const cleanUrl = new URL(pathname + cleanSearch, nextUrl.origin);
            const response = NextResponse.redirect(cleanUrl);
            response.cookies.set("viewPreference", "mobile", {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
              sameSite: "lax",
            });
            return response;
          }
          const response = NextResponse.next();
          response.cookies.set("viewPreference", "mobile", {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
          });
          return response;
        }
        // Mobile user with no explicit preference - continue to NextJS
        return NextResponse.next();
      }
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
      // ...handle other legacy params
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
