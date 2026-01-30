// app/api/dealer/products/route.js
// Paginated products with dealer pricing (dealer only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProductsForDealer, getProductsForDealerCount } from "@/lib/queries";

function parsePrice(val) {
  if (val === null || val === undefined) return 0;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function applyDealerDiscount(price, discountPercent) {
  const p = parsePrice(price);
  const d = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
  return Math.round(p * (1 - d / 100) * 100) / 100;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "dealer" && role !== "admin") {
      return NextResponse.json(
        { error: "Dealer access required" },
        { status: 403 },
      );
    }

    const discountPercent = session.user.dealerDiscount ?? 0;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10)),
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const search = searchParams.get("search") || null;

    const [rows, total] = await Promise.all([
      getProductsForDealer(limit, offset, search),
      getProductsForDealerCount(search),
    ]);

    const products = (rows || []).map((p) => {
      const price = parsePrice(p.Price);
      const dealerPrice = applyDealerDiscount(p.Price, discountPercent);
      return {
        ProductID: p.ProductID,
        PartNumber: p.PartNumber,
        ProductName: p.ProductName,
        Price: price,
        dealerPrice,
        ImageSmall: p.ImageSmall,
        ImageLarge: p.ImageLarge,
        BodyID: p.BodyID,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      total: total ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching dealer products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
