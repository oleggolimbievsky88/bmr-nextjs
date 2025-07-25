// app/api/products/route.js
export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import {
  getFilteredProducts,
  getNewProducts,
  getFilteredProductsPaginated,
  getPlatformBySlug,
  getMainCategoryIdBySlugAndPlatform,
  getCategoryIdBySlugAndMainCat,
} from "@/lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const offset = (page - 1) * limit;

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return NextResponse.json(
      { error: "Invalid page or limit" },
      { status: 400 }
    );
  }

  // Legacy params
  const vehicleId = searchParams.get("vehicleid");
  const mainCatId = searchParams.get("maincatid");
  const catId = searchParams.get("catid");
  // New SEO slugs
  const platform = searchParams.get("platform");
  const mainCategory = searchParams.get("mainCategory");
  const category = searchParams.get("category");
  const colors = searchParams.get("colors"); // e.g. "Red,Black Hammertone"
  const brands = searchParams.get("brands"); // e.g. "BMR Suspension,Qa1"

  let platformId, mainCategoryId, categoryId;

  // 1. Try legacy params
  platformId = vehicleId;
  mainCategoryId = mainCatId;
  categoryId = catId;

  // 2. Try new slugs if legacy params are missing
  if (!platformId && platform) {
    const platformObj = await getPlatformBySlug(platform);
    platformId = platformObj?.id;
  }
  if (!platformId) {
    return NextResponse.json({ error: "Platform not found" }, { status: 404 });
  }

  // Only get mainCategoryId if no specific category is provided
  if (!mainCategoryId && mainCategory && platformId) {
    mainCategoryId = await getMainCategoryIdBySlugAndPlatform(
      platform,
      mainCategory
    );
  }

  console.log("categoryId", categoryId);
  console.log("mainCategoryId", mainCategoryId);
  console.log("platformId", platformId);
  console.log("category", category);
  console.log("mainCategory", mainCategory);
  console.log("platform", platform);

  // Get categoryId if category slug is provided
  if (!categoryId && category && mainCategoryId) {
    categoryId = await getCategoryIdBySlugAndMainCat(mainCategoryId, category);
  }

  // If we have a specific category (either by ID or slug), don't use mainCategoryId
  if (categoryId || category) {
    mainCategoryId = null;
  }

  const products = await getFilteredProductsPaginated({
    platformId,
    mainCategoryId,
    categoryId,
    limit,
    offset,
    colors: colors ? colors.split(",") : [],
    brands: brands ? brands.split(",") : [],
  });
  console.log("Products", products);
  return NextResponse.json({ products: products || [] }, { status: 200 });
}
