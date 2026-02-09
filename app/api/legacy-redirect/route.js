import { NextResponse } from "next/server";
import {
  getProductById,
  getPlatformById,
  getMainCategoryById,
  getCategoryById,
  getCategorySlugById,
  getBodyIdByVehicleId,
} from "@/lib/queries";

/** Build slug from name when DB slug is missing. */
function toSlug(name) {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productid");
  const vehicleId = searchParams.get("vehicleid");
  const maincatId = searchParams.get("maincatid");
  const catId = searchParams.get("catid");

  const baseUrl = new URL(request.url).origin;

  try {
    // Category listing: vehicleid + maincatid (+ optional catid) -> /products/platform/mainCat or /products/platform/mainCat/cat
    if (!productId && vehicleId && maincatId) {
      const bodyId = await getBodyIdByVehicleId(vehicleId);
      if (!bodyId) {
        return NextResponse.redirect(new URL("/products", baseUrl), {
          status: 301,
        });
      }
      const platform = await getPlatformById(bodyId);
      const mainCat = await getMainCategoryById(maincatId);
      const mainCatSlug =
        mainCat?.MainCatSlug?.trim() || toSlug(mainCat?.MainCatName) || "";

      if (!platform?.slug || !mainCatSlug) {
        return NextResponse.redirect(new URL("/products", baseUrl), {
          status: 301,
        });
      }

      if (catId) {
        const catRow = (await getCategoryById(catId))?.[0];
        const catSlug =
          (await getCategorySlugById(catId)) || toSlug(catRow?.CatName) || "";
        if (catSlug) {
          const newPath = `/products/${platform.slug}/${mainCatSlug}/${catSlug}`;
          return NextResponse.redirect(new URL(newPath, baseUrl), {
            status: 301,
          });
        }
      }

      const newPath = `/products/${platform.slug}/${mainCatSlug}`;
      return NextResponse.redirect(new URL(newPath, baseUrl), { status: 301 });
    }

    // Product page: ?page=products&productid=123 (optional vehicleid, maincatid, catid)
    if (!productId) {
      return NextResponse.redirect(new URL("/products", baseUrl), {
        status: 301,
      });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.redirect(new URL("/products", baseUrl), {
        status: 301,
      });
    }

    const platform = await getPlatformById(product.BodyID);
    const mainCategory = await getMainCategoryById(
      maincatId || product.MainCatID
    );
    const category = await getCategoryById(catId || product.CatID);

    if (!platform || !mainCategory || !category) {
      return NextResponse.redirect(new URL("/product/" + productId, baseUrl), {
        status: 301,
      });
    }

    const platformSlug =
      platform.slug || platform.Name?.toLowerCase().replace(/\s+/g, "-") || "";
    const mainCategorySlug =
      mainCategory.MainCatSlug?.trim() ||
      mainCategory.MainCatName?.toLowerCase().replace(/\s+/g, "-") ||
      "";
    const categorySlug =
      category.CatSlug?.trim() ||
      category.CatName?.toLowerCase().replace(/\s+/g, "-") ||
      "";
    const productSlug =
      product.ProductName?.toLowerCase().replace(/\s+/g, "-") || productId;

    const newPath = `/product/${productId}`;
    return NextResponse.redirect(new URL(newPath, baseUrl), { status: 301 });
  } catch (error) {
    console.error("Legacy redirect error:", error);
    return NextResponse.redirect(new URL("/products", baseUrl), {
      status: 301,
    });
  }
}
