import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllProductsAdmin,
  getProductsCountAdmin,
  createProductAdmin,
} from "@/lib/queries";
import { uploadProductImage } from "@/lib/upload-product-images";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || null;
    const sortColumn = searchParams.get("sortColumn") || "PartNumber";
    const sortDirection = searchParams.get("sortDirection") || "asc";
    const display = searchParams.get("display") || null;
    const displayFilter = display === "1" || display === "0" ? display : null;

    const filters = {};
    const bodyId = searchParams.get("bodyId");
    if (bodyId) filters.bodyId = bodyId;
    const categoryId = searchParams.get("categoryId");
    if (categoryId) filters.categoryId = categoryId;
    const manufacturerId = searchParams.get("manufacturerId");
    if (manufacturerId) filters.manufacturerId = manufacturerId;
    if (searchParams.get("scratchAndDent") === "1")
      filters.scratchAndDent = true;
    const newProductsParam = searchParams.get("newProducts");
    if (newProductsParam === "all" || newProductsParam === "onsite")
      filters.newProducts = newProductsParam;
    if (searchParams.get("noImage") === "1") filters.noImage = true;
    if (searchParams.get("featured") === "1") filters.featured = true;
    if (searchParams.get("lowMargin") === "1") filters.lowMargin = true;
    if (searchParams.get("hardwarePacks") === "1") filters.hardwarePacks = true;
    if (searchParams.get("multipleBoxes") === "1") filters.multipleBoxes = true;
    if (searchParams.get("package") === "1") filters.package = true;
    if (searchParams.get("noManufacturer") === "1")
      filters.noManufacturer = true;

    const [products, total] = await Promise.all([
      getAllProductsAdmin(
        limit,
        offset,
        search,
        sortColumn,
        sortDirection,
        displayFilter,
        filters,
      ),
      getProductsCountAdmin(search, displayFilter, filters),
    ]);

    return NextResponse.json({ products, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const productData = {};

    // Extract all product fields
    const fields = [
      "PartNumber",
      "ProductName",
      "Description",
      "Retail",
      "Price",
      "ImageSmall",
      "Qty",
      "BodyID",
      "CatID",
      "ImageLarge",
      "Features",
      "Instructions",
      "Blength",
      "Bheight",
      "Bwidth",
      "Bweight",
      "Color",
      "Hardware",
      "Grease",
      "Images",
      "NewPart",
      "NewPartDate",
      "PackagePartnumbers",
      "FreeShipping",
      "Display",
      "PackagePartnumbersQty",
      "Package",
      "StartAppYear",
      "EndAppYear",
      "UsaMade",
      "fproduct",
      "CrossRef",
      "ManID",
      "LowMargin",
      "mbox",
      "flatrate",
      "AngleFinder",
      "endproduct",
      "domhandling",
      "hardwarepack",
      "hardwarepacks",
      "video",
      "taxexempt",
      "couponexempt",
      "BlemProduct",
    ];

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null) {
        if (
          [
            "Qty",
            "BodyID",
            "NewPart",
            "Display",
            "Package",
            "UsaMade",
            "fproduct",
            "ManID",
            "LowMargin",
            "hardwarepack",
            "taxexempt",
            "couponexempt",
            "BlemProduct",
            "Blength",
            "Bheight",
            "Bwidth",
            "Bweight",
          ].includes(field)
        ) {
          productData[field] = value ? parseInt(value) : 0;
        } else {
          productData[field] = value;
        }
      }
    });

    // New product (NewPart): only when checkbox checked; 90-day rules apply.
    // Scratch & Dent (BlemProduct): needs NewPartDate != "0" to show in that section; set to today when empty.
    const today = new Date().toISOString().slice(0, 10);
    const validDate = (d) => d && d !== "0";
    if (productData.NewPart && productData.NewPart === 1) {
      productData.NewPart = 1;
      productData.NewPartDate = validDate(productData.NewPartDate)
        ? productData.NewPartDate
        : today;
    } else if (productData.BlemProduct && productData.BlemProduct === 1) {
      productData.NewPart = productData.NewPart || 0;
      productData.NewPartDate = validDate(productData.NewPartDate)
        ? productData.NewPartDate
        : today;
    } else {
      productData.NewPart = 0;
      productData.NewPartDate = "0";
    }

    // Short filename for DB (ImageSmall/ImageLarge are varchar(45))
    const shortImageName = (originalName) => {
      const match =
        originalName && /\.(jpe?g|png|gif|webp)$/i.exec(originalName);
      const ext = match ? match[1].toLowerCase() : "jpg";
      const r = Math.random().toString(36).slice(2, 8);
      return `p_${Date.now()}_${r}.${ext}`;
    };

    // Handle image uploads (uses Vercel Blob on serverless, local FS otherwise)
    const mainImageFile = formData.get("mainImage");
    if (mainImageFile && mainImageFile instanceof File) {
      const bytes = await mainImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = shortImageName(mainImageFile.name);
      try {
        const stored = await uploadProductImage(buffer, filename);
        productData.ImageLarge = stored;
        productData.ImageSmall = stored;
      } catch (error) {
        console.error("Error saving main image:", error);
        if (error?.code === "EROFS" || error?.message?.includes("read-only")) {
          return NextResponse.json(
            {
              error:
                "Product image uploads require Blob storage on this server. Add a Blob store in Vercel Dashboard → Storage, then set BLOB_READ_WRITE_TOKEN.",
            },
            { status: 503 },
          );
        }
        throw new Error(`Failed to save main image: ${error.message}`);
      }
    }

    // Handle additional images
    const additionalImages = formData.getAll("additionalImages");
    if (additionalImages && additionalImages.length > 0) {
      const imagePaths = [];
      for (const imgFile of additionalImages) {
        if (imgFile instanceof File) {
          const bytes = await imgFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = shortImageName(imgFile.name);
          try {
            const stored = await uploadProductImage(buffer, filename);
            imagePaths.push(stored);
          } catch (error) {
            console.error("Error saving additional image:", error);
            if (
              error?.code === "EROFS" ||
              error?.message?.includes("read-only")
            ) {
              return NextResponse.json(
                {
                  error:
                    "Product image uploads require Blob storage on this server. Add a Blob store in Vercel Dashboard → Storage, then set BLOB_READ_WRITE_TOKEN.",
                },
                { status: 503 },
              );
            }
            throw new Error(
              `Failed to save image ${imgFile.name}: ${error.message}`,
            );
          }
        }
      }
      if (imagePaths.length > 0) {
        productData.Images = imagePaths.join(",");
      }
    }

    // Instructions PDF: upload to Blob or public/instructions/
    const instructionsPdf = formData.get("instructionsPdf");
    if (
      instructionsPdf &&
      instructionsPdf instanceof File &&
      instructionsPdf.size > 0
    ) {
      const bytes = await instructionsPdf.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safe = instructionsPdf.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `inst_${Date.now()}_${safe}`;
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      const cwd = process.cwd();
      const isReadOnlyFs =
        cwd.includes("/var/task") || process.env.VERCEL === "1";

      if (isReadOnlyFs && !blobToken) {
        // Skip PDF upload on serverless without Blob (don't fail the whole request)
        console.warn("Skipping instructions PDF upload: Blob storage required");
      } else if (blobToken) {
        try {
          const blob = await put(`instructions/${filename}`, buffer, {
            access: "public",
            token: blobToken,
          });
          productData.Instructions = blob.url;
        } catch (err) {
          console.error("Error saving instructions PDF:", err);
        }
      } else {
        try {
          const uploadDir = join(process.cwd(), "public", "instructions");
          await mkdir(uploadDir, { recursive: true });
          await writeFile(join(uploadDir, filename), buffer);
          productData.Instructions = filename;
        } catch (err) {
          console.error("Error saving instructions PDF:", err);
        }
      }
    }

    // FreeShipping: default to "1" when not provided (e.g. new product)
    if (
      productData.FreeShipping === undefined ||
      productData.FreeShipping === null
    ) {
      productData.FreeShipping = "1";
    }

    const productId = await createProductAdmin(productData);
    return NextResponse.json({ success: true, productId });
  } catch (error) {
    console.error("Error creating product:", error);
    const message =
      error?.sqlMessage ||
      error?.message ||
      error?.code ||
      "Failed to create product";
    const hint =
      error?.code === "ER_DATA_TOO_LONG" ||
      (error?.sqlMessage && String(error.sqlMessage).includes("Data too long"))
        ? "Run database/products_expand_image_columns.sql if image URLs are long."
        : null;
    return NextResponse.json(
      {
        error: message,
        details: error?.message,
        sqlMessage: error?.sqlMessage,
        hint,
      },
      { status: 500 },
    );
  }
}
