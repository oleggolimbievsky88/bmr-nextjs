// app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import { getProductById } from "@/lib/queries"; // Import the query function

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const product = await getProductById(id); // Fetch product by ID

    console.log("Product:", product);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Helper function to parse the Images field
    const parseImages = (imagesString) => {
      return imagesString
        .split(/[,;]/) // Split on both commas and semicolons
        .map((imgSrc) => imgSrc.trim()) // Trim whitespace
        .filter((imgSrc) => imgSrc !== "" && imgSrc !== "0") // Filter out invalid entries
        .map((imgSrc, index) => ({
          imgSrc: `https://bmrsuspension.com/siteart/products/${imgSrc}`,
          alt: `Image ${index + 1} for ${product?.ProductName}`,
          width: 770,
          height: 1075,
        }));
    };

    // Create the main image object using ImageLarge if valid
    const mainImage =
      product.ImageLarge && product.ImageLarge.trim() !== "0"
        ? {
            imgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim()}`,
            alt: `Main image for ${product?.ProductName}`,
            width: 770,
            height: 1075,
          }
        : null;

    // Parse other images from the Images field
    const otherImages = parseImages(product?.Images);

    // Combine the main image with other images (if mainImage exists)
    const images = mainImage ? [mainImage, ...otherImages] : otherImages;

    // Add the images array to the product object
    product.images = images;

    return NextResponse.json({ product }); // Return the product wrapped in an object
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return NextResponse.json({ error: "Product not found" }, { status: 500 });
  }
}
