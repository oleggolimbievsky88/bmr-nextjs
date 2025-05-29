"use client";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/queries";

// Generate static params for static generation
export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    platform: product.platformSlug,
    mainCategory: product.mainCategorySlug,
    category: product.categorySlug,
    product: `${product.productSlug}-${product.PartNumber}`,
  }));
}

export async function generateMetadata({ params }) {
  const { platform, mainCategory, category, product } = params;
  const productSlug = product.split("-").slice(0, -1).join("-");
  // Extract the part number from the product slug
  // The product URL format is: [productSlug]-[partNumber]
  // Example: "front-lower-control-arm-BK080"
  const partNumber = product.partNumber;

  const productData = await getProductBySlug(productSlug, partNumber);

  if (!productData) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }

  return {
    title: `${productData.ProductName} - BMR Suspension`,
    description: productData.Description,
    canonical: `https://dev.bmrsuspension.com/${platform}/${mainCategory}/${category}/${product}`,
    alternates: {
      canonical: `https://dev.bmrsuspension.com/${platform}/${mainCategory}/${category}/${product}`,
    },
  };
}

export default async function ProductPage({ params }) {
  const { platform, mainCategory, category, product } = params;
  const productSlug = product.split("-").slice(0, -1).join("-");
  const partNumber = product.split("-").pop();

  const productData = await getProductBySlug(productSlug, partNumber);

  if (!productData) {
    notFound();
  }

  // Add a hidden link to the legacy URL for search engines
  return (
    <div>
      <link
        rel="canonical"
        href={`https://dev.bmrsuspension.com/${platform}/${mainCategory}/${category}/${product}`}
      />
      {/* Your product detail page UI here */}
      <h1>{productData.ProductName}</h1>
      <p>Part Number: {productData.PartNumber}</p>
      {/* Rest of your product detail page */}
    </div>
  );
}
