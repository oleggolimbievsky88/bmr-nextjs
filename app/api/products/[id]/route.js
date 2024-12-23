// app/api/products/[id]/route.js

import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/queries';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const product = await getProductById(id);
    
    // Add the id property to the product object
    product.id = id;
    const response = NextResponse.json(product);
    response.headers.set('Access-Control-Allow-Origin', 'http://ogwebserver.ddns.net');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    

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
          height: 770,
          dataZoom: `https://bmrsuspension.com/siteart/products/${imgSrc}`,
          currentColor: 'red',
        }));
    };

    // Create the main image object using ImageLarge if valid
    const mainImage = product.ImageLarge && product.ImageLarge.trim() !== "0"
      ? {
          imgSrc: `https://bmrsuspension.com/siteart/products/${product?.ImageLarge.trim()}`,
          alt: `Main image for ${product?.ProductName}`,
          width: 770,
          height: 770,
          dataZoom: `https://bmrsuspension.com/siteart/products/${product?.ImageLarge.trim()}`,
          currentColor: 'red',
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

      console.log('product:', product);
    return NextResponse.json(product); // Return the modified product object
  } catch (error) {
    console.error(`Failed to fetch product with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 500 }
    );
  }
}
