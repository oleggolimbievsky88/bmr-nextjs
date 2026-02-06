// app/api/product-by-id/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    try {
      const product = await getProductById(id);
      // product already includes images and hardwarePackProducts from getProductById

      // When product has exactly one color, set defaultColorName for cart/checkout
      const colorIds = (product.Color || "")
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "" && s !== "0");
      if (colorIds.length === 1) {
        const [colorRows] = await pool.query(
          "SELECT ColorName FROM colors WHERE ColorID = ? LIMIT 1",
          [colorIds[0]],
        );
        if (colorRows[0]) {
          product.defaultColorName = colorRows[0].ColorName;
        }
      }

      return NextResponse.json({ product });
    } catch (error) {
      if (error.message === "Product not found") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      console.error(`Failed to fetch product with id ${id}:`, error);
      return NextResponse.json({ error: "Product not found" }, { status: 500 });
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
