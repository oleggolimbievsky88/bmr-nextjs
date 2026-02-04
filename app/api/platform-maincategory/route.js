import { NextResponse } from "next/server";
import {
  getPlatformBySlug,
  getCategoriesByMainCatId,
  getMainCategoryIdBySlugAndPlatform,
  getFilteredProductsPaginated,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const mainCategory = searchParams.get("mainCategory");

    if (!platform || !mainCategory) {
      return NextResponse.json(
        { error: "Platform and mainCategory are required" },
        { status: 400 }
      );
    }

    // Get platform info
    const platformInfo = await getPlatformBySlug(platform);
    if (!platformInfo) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    // Get main category ID using the correct function
    const mainCategoryId = await getMainCategoryIdBySlugAndPlatform(
      platform,
      mainCategory
    );
    if (!mainCategoryId) {
      return NextResponse.json(
        { error: "Main category not found" },
        { status: 404 }
      );
    }

    // Get categories for this main category (including CatSlug)
    const rawCategories = await getCategoriesByMainCatId(mainCategoryId);

    // Deduplicate by slug so the same slug (e.g. "vertical-links") appears once with combined product count
    const slugMap = new Map();
    for (const cat of rawCategories) {
      const slug =
        (cat.CatSlug || cat.CatNameSlug || cat.slug || "").toString().trim() ||
        (cat.CatName || "").toLowerCase().replace(/\s+/g, "-");
      if (!slug) continue;
      const existing = slugMap.get(slug);
      const productCount = Number(cat.productCount || 0);
      if (!existing) {
        slugMap.set(slug, {
          ...cat,
          productCount,
        });
      } else {
        existing.productCount += productCount;
      }
    }
    const categories = Array.from(slugMap.values());

    // Get initial products for this main category using the working pagination function
    const products = await getFilteredProductsPaginated({
      platformId: platformInfo.id,
      mainCategoryId: mainCategoryId,
      limit: 12, // Load more initially to reduce need for scrolling
      offset: 0,
    });

    return NextResponse.json({
      platformInfo,
      mainCategoryId,
      categories: categories.map((cat) => ({
        CatID: cat.CatID,
        CatName: cat.CatName,
        CatSlug: cat.CatSlug || cat.CatNameSlug,
        CatImage: cat.CatImage,
        MainCatID: cat.MainCatID,
        productCount: cat.productCount || 0,
        // Add aliases for easier access
        id: cat.CatID,
        name: cat.CatName,
        slug: cat.CatSlug || cat.CatNameSlug,
        image: cat.CatImage,
      })),
      products: products || [],
      totalProducts: products?.length || 0,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
