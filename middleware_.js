import { NextResponse } from "next/server";

export function middleware(request) {
  const url = new URL(request.url);
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
}
