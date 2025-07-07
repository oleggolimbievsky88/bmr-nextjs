import { NextResponse } from "next/server";
import {
  getCategoriesByPlatform,
  getMainCategoryProductCounts,
  getProductsByMainCategory,
  getSubCategoriesWithProductCount,
  getMainCategoryIdBySlugAndPlatform,
} from "@/lib/queries";

// Enable dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { platform, mainCategory } = params;
    if (!platform || !mainCategory) {
      return NextResponse.json(
        { error: "Platform and main category are required" },
        { status: 400 }
      );
    }

    // Get subcategories and initial products
    const [{ categories, platformInfo }, products] = await Promise.all([
      getCategoriesByPlatform(platform, mainCategory),
      getProductsByMainCategory(platform, mainCategory, 16), // Limit to 8 products
      getMainCategoryProductCounts(platform, mainCategory), // Get product counts for each subcategory
    ]);

    // Get mainCatId from slug and platform
    const mainCatId = await getMainCategoryIdBySlugAndPlatform(
      platform,
      mainCategory
    );
    // Get product types (subcategories) with product count
    let productTypes = [];
    if (mainCatId) {
      productTypes = await getSubCategoriesWithProductCount(
        platform,
        mainCatId
      );
    }

    // If you want to merge productCount into your old categories array:
    const categoriesWithCount = categories.map((cat) => {
      const found = productTypes.find((sub) => sub.id === cat.id);
      return {
        ...cat,
        productCount: found ? found.productCount : 0,
      };
    });

    return NextResponse.json({
      categories: categoriesWithCount,
      products,
      platformInfo,
      productTypes,
      platformSlug: platform,
      mainCategorySlug: mainCategory,
    });
  } catch (error) {
    console.error("Error in main category route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
