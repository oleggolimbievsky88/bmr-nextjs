// app/api/products/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  getFilteredProductsPaginated,
  getPlatformBySlug,
  getPlatformById,
  getMainCategoryIdBySlugAndPlatform,
  getCategoryIdsBySlugAndMainCat,
  getCategoryIdsWithDescendants,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid page or limit" },
        { status: 400 },
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
    const yearParam = searchParams.get("year");
    const applicationYear = yearParam ? parseInt(yearParam, 10) : null;

    let platformId, mainCategoryId, categoryId;

    // 1. Try legacy params
    platformId = vehicleId;
    mainCategoryId = mainCatId;
    categoryId = catId;

    // 2. Try new slugs if legacy params are missing
    let platformSlug = platform;
    if (!platformId && platform) {
      const platformObj = await getPlatformBySlug(platform);
      const rawId = platformObj?.id;
      platformId =
        rawId != null && Number.isFinite(Number(rawId)) ? Number(rawId) : null;
      platformSlug = platform;
    } else if (platformId && !platform) {
      // Legacy params: get platform slug from platformId
      const platformObj = await getPlatformById(platformId);
      if (platformObj) {
        platformSlug = platformObj.slug;
      }
      platformId =
        platformId != null && Number.isFinite(Number(platformId))
          ? Number(platformId)
          : null;
    }
    if (platformId == null || !Number.isFinite(platformId) || platformId < 0) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 },
      );
    }

    // Only get mainCategoryId if no specific category is provided
    if (!mainCategoryId && mainCategory && platformId && platformSlug) {
      mainCategoryId = await getMainCategoryIdBySlugAndPlatform(
        platformSlug,
        mainCategory,
      );
    }

    // Get categoryId(s) if category slug is provided (can be multiple when slug is duplicated)
    const includeDescendants =
      searchParams.get("includeDescendants") === "true" ||
      searchParams.get("includeDescendants") === "1";
    if (!categoryId && category && mainCategoryId) {
      const categoryIds = includeDescendants
        ? await getCategoryIdsWithDescendants(mainCategoryId, category)
        : await getCategoryIdsBySlugAndMainCat(mainCategoryId, category);
      categoryId =
        categoryIds.length === 1
          ? categoryIds[0]
          : categoryIds.length > 1
            ? categoryIds
            : null;
    }

    // If we have a specific category (either by ID or slug), don't use mainCategoryId
    const hasCategoryFilter =
      (categoryId != null &&
        categoryId !== "" &&
        (Array.isArray(categoryId) ? categoryId.length > 0 : true)) ||
      category;
    if (hasCategoryFilter) {
      mainCategoryId = null;
    }

    const products = await getFilteredProductsPaginated({
      platformId,
      mainCategoryId:
        mainCategoryId != null && Number.isFinite(Number(mainCategoryId))
          ? Number(mainCategoryId)
          : undefined,
      categoryId:
        categoryId != null && categoryId !== ""
          ? Array.isArray(categoryId)
            ? categoryId
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id))
            : Number.isFinite(Number(categoryId))
              ? Number(categoryId)
              : undefined
          : undefined,
      limit,
      offset,
      applicationYear: Number.isFinite(applicationYear)
        ? applicationYear
        : undefined,
      colors: colors ? colors.split(",").filter(Boolean) : [],
      brands: brands ? brands.split(",").filter(Boolean) : [],
    });
    return NextResponse.json({ products: products || [] }, { status: 200 });
  } catch (error) {
    console.error("[api/products] GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to load products",
        message: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
