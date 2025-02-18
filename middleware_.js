import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// List of known platforms
const knownPlatforms = [
  "2024-mustang", "2015-2023-mustang", "1993-2002-f-body", 
  "1970-1981-f-body", "1964-1972-a-body"
];

function customMiddleware(req) {
    const { pathname } = req.nextUrl;
    const segments = pathname.split("/");

    if (segments.length < 3 || segments[1] !== "products") {
        return NextResponse.next();
    }

    const identifier = segments[2]; // This is either a platform or a product ID

    // If it's a known platform, rewrite the request to `/products/platform/{platform}`
    if (knownPlatforms.includes(identifier)) {
        return NextResponse.rewrite(new URL(`/products/platform/${identifier}`, req.url));
    }

    // Otherwise, assume it's a product ID and rewrite to `/products/id/{id}`
    return NextResponse.rewrite(new URL(`/products/id/${identifier}`, req.url));
}

// Combine NextAuth with custom middleware
export default withAuth(
  function middleware(req) {
    // Admin authentication logic
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Apply custom product routing logic
    return customMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Ensure middleware runs on both `/admin` and `/products`
export const config = {
  matcher: ["/admin/:path*", "/products/:path*"]
};
