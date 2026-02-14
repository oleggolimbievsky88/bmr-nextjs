// app/products/[id]/page.js

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import Link from "next/link";
import Details6 from "@/components/shopDetails/Details6";
import TrackView from "@/components/shopDetails/TrackView";
import {
  getProductById,
  getRelatedProducts,
  getPlatformBySlug,
  getPlatformById,
  getCategoryById,
  getMainCategoryById,
  getVehiclesByBodyId,
  getMerchandiseSizeVariants,
} from "@/lib/queries";
import pool from "@/lib/db";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Force dynamic rendering to prevent build-time database access
export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function ProductDetails({ params, searchParams }) {
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

  // Fetch category info based on product's CatID
  const currentCategory = product?.CatID
    ? (await getCategoryById(product.CatID))[0] // getCategoryById returns an array
    : null;

  // Fetch main category info
  const mainCategory = currentCategory?.MainCatID
    ? await getMainCategoryById(currentCategory.MainCatID)
    : null;

  // Fetch vehicle fitment data
  const vehicles = product?.BodyID
    ? await getVehiclesByBodyId(product.BodyID)
    : [];

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
          href: `/products/${platformSlug}/${
            mainCategory?.MainCatName?.toLowerCase().replace(/\s+/g, "-") ||
            "category"
          }`,
        },
        {
          label: currentCategory?.CatName || category,
          href: `/products/${platformSlug}/${
            mainCategory?.MainCatName?.toLowerCase().replace(/\s+/g, "-") ||
            "category"
          }/${
            currentCategory?.CatName?.toLowerCase().replace(/\s+/g, "-") ||
            "category"
          }`,
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
      <PlatformHeader
        platformData={
          isGiftCertificate
            ? {
                HeaderImage: "",
                Name: "Gift Certificates",
                StartYear: "",
                EndYear: "",
                Image: "",
                slug: "gift-cards",
                mainCategory: null,
              }
            : {
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
              }
        }
      />

      <div className="container" style={{ paddingTop: "10px" }}>
        <Breadcrumbs items={breadcrumbItems} />
        <TrackView productId={product?.ProductID} />
        <Details6
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
