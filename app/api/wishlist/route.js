// app/api/wishlist/route.js
// GET: fetch wishlist (guest from body, logged-in from DB)
// POST: add product to wishlist
// DELETE: remove product from wishlist

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

async function getWishlistFromDb(customerId) {
  const [rows] = await pool.query(
    "SELECT productId FROM customer_wishlist WHERE customerId = ? ORDER BY createdAt DESC",
    [customerId],
  );
  return rows.map((r) => r.productId);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ wishlist: [] });
    }
    const customerId = parseInt(session.user.id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ wishlist: [] });
    }
    const wishlist = await getWishlistFromDb(customerId);
    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const productId = body?.productId ?? body?.productID ?? body?.id;
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }
    const pid = parseInt(productId, 10);
    if (isNaN(pid)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        saved: "local",
        message: "Add to wishlist when logged in to save across devices",
      });
    }

    const customerId = parseInt(session.user.id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await pool.query(
      "INSERT IGNORE INTO customer_wishlist (customerId, productId) VALUES (?, ?)",
      [customerId, pid],
    );
    const wishlist = await getWishlistFromDb(customerId);
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    // Table might not exist yet
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.warn(
        "customer_wishlist table not found. Run database/wishlist_schema.sql",
      );
      return NextResponse.json({
        success: true,
        saved: "local",
        message: "Wishlist DB not configured; using local storage",
      });
    }
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") ?? searchParams.get("id");
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }
    const pid = parseInt(productId, 10);
    if (isNaN(pid)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, wishlist: [] });
    }

    const customerId = parseInt(session.user.id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await pool.query(
      "DELETE FROM customer_wishlist WHERE customerId = ? AND productId = ?",
      [customerId, pid],
    );
    const wishlist = await getWishlistFromDb(customerId);
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json({ success: true, wishlist: [] });
    }
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
