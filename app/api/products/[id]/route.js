// app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Import the pool directly

export const dynamic = "force-dynamic";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    try {
      // Enhanced query to get all the data the page needs
      const [rows] = await pool.query(
        `SELECT
        p.*,
        CONCAT(b.StartYear, '-', b.EndYear) AS YearRange,
        b.Name AS PlatformName,
        c.CatName AS CategoryName,
        mc.MainCatName AS MainCategoryName
      FROM products p
      JOIN bodies b ON p.BodyID = b.BodyID
      LEFT JOIN categories c ON p.CatID = c.CatID
      LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
      WHERE p.ProductID = ?
      LIMIT 1`,
        [id]
      );

      const product = rows[0];

      console.log("Product:", product);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Helper function to parse the Images field and create small/large image pairs
      const parseImages = (imagesString) => {
        return imagesString
          .split(/[,;]/) // Split on both commas and semicolons
          .map((imgSrc) => imgSrc.trim()) // Trim whitespace
          .filter((imgSrc) => imgSrc !== "" && imgSrc !== "0") // Filter out invalid entries
          .reduce((acc, imgSrc, index, array) => {
            // Check if this is a small image (followed by a large image)
            if (index % 2 === 0 && index + 1 < array.length) {
              const smallImg = imgSrc;
              const largeImg = array[index + 1];

              // Only add if both small and large images are valid
              if (smallImg !== "0" && largeImg !== "0") {
                acc.push({
                  imgSrc: `https://bmrsuspension.com/siteart/products/${largeImg}`,
                  smallImgSrc: `https://bmrsuspension.com/siteart/products/${smallImg}`,
                  alt: `Image ${acc.length + 1} for ${product?.ProductName}`,
                  width: 770,
                  height: 1075,
                });
              }
            }
            return acc;
          }, []);
      };

      // Create the main image object using ImageLarge if valid
      const mainImage =
        product.ImageLarge && product.ImageLarge.trim() !== "0"
          ? {
              imgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim()}`,
              smallImgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim().replace(
                /\.(jpg|jpeg|png|gif|webp)$/i,
                "_small.$1"
              )}`,
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
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
