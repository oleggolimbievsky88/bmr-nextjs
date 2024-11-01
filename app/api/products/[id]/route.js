// app/api/products/[id]/route.js

import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/queries';

export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Helper function to parse the Images field and exclude '_small' images
    const parseImages = (imagesString) => {
      return imagesString
        .split(/[,;]/) // Split on both commas and semicolons
        .map((imgSrc) => imgSrc.trim()) // Trim whitespace
        .filter((imgSrc) => imgSrc !== "" && imgSrc !== "0") // Filter out invalid entries
        .filter((imgSrc) => !imgSrc.includes('_small')) // Exclude images with '_small' in the filename
        .map((imgSrc, index) => ({
          imgSrc: `https://bmrsuspension.com/siteart/products/${imgSrc}`,
          alt: `Image ${index + 1} for ${product?.ProductName}`,
          width: 770,
          height: 1075,
        }));
    };

    // Create the main image object using ImageLarge if valid
    const mainImage = product.ImageLarge && product.ImageLarge.trim() !== "0"
      ? {
          imgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim()}`,
          alt: `Main image for ${product?.ProductName}`,
          width: 770,
          height: 1075,
        }
      : null;

    // Parse other images from the Images field and filter out '_small' images
    const otherImages = parseImages(product?.Images);

    // Combine mainImage with otherImages and remove duplicates
    const allImages = mainImage ? [mainImage, ...otherImages] : otherImages;

    // Use a Set to filter out duplicate imgSrc values
    const uniqueImages = Array.from(
      new Map(allImages.map((image) => [image.imgSrc, image])).values()
    );

    // Add the unique images array to the product object
    product.images = uniqueImages;

    return NextResponse.json(product); // Return the modified product object
  } catch (error) {
    console.error(`Failed to fetch product with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 500 }
    );
  }
}
