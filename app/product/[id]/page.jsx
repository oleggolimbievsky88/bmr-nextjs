// app/products/[id]/page.js

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import ProductDetailsOuterZoom from "@/components/shopDetails/ProductDetailsOuterZoom";
import ProductDetails from "@/components/shopDetails/ProductDetails";
import TrackView from "@/components/shopDetails/TrackView";
import {
  getProductById,
  getRelatedProducts,
  getPlatformBySlug,
  getPlatformById,
  getCategoryById,
  getMainCategoryById,
  getVehiclesForProduct,
  getMerchandiseSizeVariants,
} from "@/lib/queries";
import pool from "@/lib/db";
import PlatformHeader from "@/components/header/PlatformHeader";
import GiftCertificateHero from "@/components/header/GiftCertificateHero";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Force dynamic rendering to prevent build-time database access
export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function ProductPage({ params, searchParams }) {
  // Await params and searchParams
  const { id } = await params;
  const awaitedSearchParams = await searchParams;
  const color = awaitedSearchParams?.color
    ? String(awaitedSearchParams.color)
    : null;

  console.log("ProductDetailid", id);
  console.log("Color query param:", color);

  // Fetch product details
  const product = await getProductById(id);

  // Fetch related products
  const relatedProducts = await getRelatedProducts(id);

  // Debug logging for related products
  console.log("Related Products:", relatedProducts);
  if (relatedProducts.length > 0) {
    console.log("First related product:", relatedProducts[0]);
    console.log("PartNumber field:", relatedProducts[0].PartNumber);
  }

  // Fetch platform info based on product's BodyID
  const platformInfo = product?.BodyID
    ? await getPlatformById(product.BodyID)
    : null;

  // Fetch category info based on product's CatID (use first if comma-separated)
  const productCatId = product?.CatID
    ? String(product.CatID).split(",")[0].trim()
    : null;
  const currentCategory = productCatId
    ? (await getCategoryById(productCatId))[0]
    : null;

  // Fetch parent category for breadcrumbs when product is in a sub-category (e.g. Koni under Shocks)
  const parentCategory =
    currentCategory?.ParentID > 0
      ? (await getCategoryById(currentCategory.ParentID))[0]
      : null;

  // Fetch main category info
  const mainCategory = currentCategory?.MainCatID
    ? await getMainCategoryById(currentCategory.MainCatID)
    : null;

  // Fetch vehicle fitment data (filtered by product application years)
  const vehicles = await getVehiclesForProduct(product);

  // Debug logging
  console.log("Product:", product);
  console.log("Platform Info:", platformInfo);
  console.log("Current Category:", currentCategory);
  console.log("Main Category:", mainCategory);
  console.log("Vehicles:", vehicles);

  // Fetch size variants for merchandise (hats, t-shirts, etc.)
  const isMerchandise =
    (mainCategory?.MainCatName &&
      /hats|tshirt|tee|banner|merchandise|apparel/i.test(
        String(mainCategory.MainCatName),
      )) ||
    (currentCategory?.CatName &&
      /hats|tshirt|tee|banner|merchandise|apparel/i.test(
        String(currentCategory.CatName),
      ));
  const sizeVariants = isMerchandise
    ? await getMerchandiseSizeVariants(product?.ProductID)
    : [];

  // Detect gift certificate product - use simplified banner and breadcrumbs
  const isGiftCertificate =
    (mainCategory?.MainCatName &&
      String(mainCategory.MainCatName)
        .toLowerCase()
        .includes("gift certificate")) ||
    (currentCategory?.CatName &&
      String(currentCategory.CatName)
        .toLowerCase()
        .includes("gift certificate")) ||
    (product?.ProductName &&
      String(product.ProductName).toLowerCase().includes("gift certificate"));

  const platform = platformInfo?.name || "Platform";
  const platformSlug = platformInfo?.slug || "Platform";

  // For gift certificates: no year prefix. Else avoid "0-" when startYear is 0.
  const hasValidYear =
    platformInfo?.startYear &&
    platformInfo.startYear !== "0" &&
    String(platformInfo.startYear).trim() !== "" &&
    parseInt(platformInfo.startYear, 10) > 0;
  const platformNameFormatted = isGiftCertificate
    ? "Gift Certificates"
    : platformInfo
      ? hasValidYear
        ? `${platformInfo.startYear}-${platformInfo.endYear || ""} ${
            platformInfo.name || ""
          }`.trim()
        : (platformInfo.name || "").trim() || "Platform"
      : "Platform";

  const category = currentCategory?.CatName || "Category";
  const mainCatSlug =
    mainCategory?.MainCatName?.toLowerCase().replace(/\s+/g, "-") || "category";
  const parentCatSlug = parentCategory
    ? parentCategory.CatSlug ||
      parentCategory.CatName?.toLowerCase().replace(/\s+/g, "-") ||
      ""
    : null;
  const currentCatSlug =
    currentCategory?.CatName?.toLowerCase().replace(/\s+/g, "-") || "category";

  // Breadcrumb items - simplified for gift certificates
  const breadcrumbItems = isGiftCertificate
    ? [
        { label: "Home", href: "/" },
        { label: "Gift Certificates", href: "/products/gift-cards" },
        {
          label: product?.PartNumber || product?.ProductName || "Product",
          href: `/product/${product?.ProductID}`,
        },
      ]
    : [
        { label: "Home", href: "/" },
        {
          label: platformNameFormatted,
          href: `/products/${platformSlug.toLowerCase().replace(/\s+/g, "-")}`,
        },
        {
          label: mainCategory?.MainCatName || "Category",
          href: `/products/${platformSlug}/${mainCatSlug}`,
        },
        ...(parentCategory
          ? [
              {
                label: parentCategory.CatName || "Category",
                href: `/products/${platformSlug}/${mainCatSlug}/${parentCatSlug}`,
              },
            ]
          : []),
        {
          label: currentCategory?.CatName || category,
          href: `/products/${platformSlug}/${mainCatSlug}/${currentCatSlug}`,
        },
        {
          label: product?.PartNumber || "Product",
          href: `/product/${product?.ProductID}`,
        },
      ];

  return (
    <div
      className="p-0 m-0 container-fluid"
      style={{ backgroundColor: "#ffffff" }}
    >
      {isGiftCertificate ? (
        <GiftCertificateHero product={product} />
      ) : (
        <PlatformHeader
          platformData={{
            HeaderImage: platformInfo?.headerImage || "",
            Name: platformInfo?.name || "",
            StartYear: platformInfo?.startYear || "",
            EndYear: platformInfo?.endYear || "",
            Image: platformInfo?.platformImage || "",
            slug:
              platformInfo?.slug ||
              platformInfo?.name?.toLowerCase().replace(/\s+/g, "-") ||
              "",
            mainCategory: mainCategory?.MainCatName || null,
          }}
        />
      )}

      <div className="container" style={{ paddingTop: "10px" }}>
        <Breadcrumbs items={breadcrumbItems} />
        <TrackView productId={product?.ProductID} />
        <ProductDetails
          product={product}
          initialColor={color}
          searchParams={awaitedSearchParams || {}}
          sizeVariants={sizeVariants}
          className=""
        />
        <ShopDetailsTab product={product} vehicles={vehicles} />
        {relatedProducts && relatedProducts.length > 0 && (
          <Products products={relatedProducts} />
        )}
      </div>
    </div>
  );
}
