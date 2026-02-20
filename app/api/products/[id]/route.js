// app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Import the pool directly
import { getProductImageUrl } from "@/lib/assets";

export const dynamic = "force-dynamic";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
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
        [id],
      );

      const product = rows[0];

      console.log("Product:", product);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      // Parse Images field: comma-separated list of paths (one per image); each used for both main and thumbnail
      const parseImages = (imagesString) => {
        if (
          !imagesString ||
          typeof imagesString !== "string" ||
          imagesString.trim() === "" ||
          imagesString === "0"
        ) {
          return [];
        }
        return imagesString
          .split(/[,;]/)
          .map((path) => path.trim())
          .filter((path) => path !== "" && path !== "0")
          .map((path, index) => ({
            imgSrc: getProductImageUrl(path),
            smallImgSrc: getProductImageUrl(path),
            alt: `Image ${index + 1} for ${product?.ProductName}`,
            width: 770,
            height: 1075,
          }));
      };

      // Create the main image object using ImageLarge if valid
      const mainImage =
        product.ImageLarge && product.ImageLarge.trim() !== "0"
          ? {
              imgSrc: getProductImageUrl(product.ImageLarge.trim()),
              smallImgSrc: getProductImageUrl(
                product.ImageLarge.trim().replace(
                  /\.(jpg|jpeg|png|gif|webp)$/i,
                  "_small.$1",
                ),
              ),
              alt: `Image for${product?.PartNumber} - ${product?.ProductName}`,
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
      { status: 500 },
    );
  }
}
