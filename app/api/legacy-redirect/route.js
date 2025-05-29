import { NextResponse } from "next/server";
import {
  getProductById,
  getPlatformById,
  getMainCategoryById,
  getCategoryById,
} from "@/lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productid");
  const vehicleId = searchParams.get("vehicleid");
  const maincatId = searchParams.get("maincatid");
  const catId = searchParams.get("catid");

  try {
    // Fetch the necessary data to construct the new URL
    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.redirect(new URL("/products", request.url));
    }

    const platform = await getPlatformById(product.BodyID);
    const mainCategory = await getMainCategoryById(
      maincatId || product.MainCatID
    );
    const category = await getCategoryById(catId || product.CatID);

    // Create the new URL slug
    const platformSlug = platform.Name.toLowerCase().replace(/\s+/g, "-");
    const mainCategorySlug = mainCategory.MainCatName.toLowerCase().replace(
      /\s+/g,
      "-"
    );
    const categorySlug = category.CatName.toLowerCase().replace(/\s+/g, "-");
    const productSlug = product.ProductName.toLowerCase().replace(/\s+/g, "-");

    // Construct the new URL path
    const newUrl = `/${platformSlug}/${mainCategorySlug}/${categorySlug}/${productSlug}-${product.PartNumber}`;

    return NextResponse.redirect(new URL(newUrl, request.url), { status: 301 });
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/products", request.url));
  }
}
