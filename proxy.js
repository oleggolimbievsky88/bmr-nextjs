// proxy.js
// Handle authentication and routing for protected routes and legacy redirects

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function proxy(req) {
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

		// Allow access to authenticated routes (my-account routes)
		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Admin routes require admin role
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
	}
);

export const config = {
	matcher: [
		"/admin/:path*",
		"/my-account/:path*",
		"/my-account-orders/:path*",
		"/my-account-address/:path*",
		"/my-account-edit/:path*",
		"/my-account-wishlist/:path*",
	],
};
