import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getProductByIdAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} from "@/lib/queries";
import { uploadProductImage } from "@/lib/upload-product-images";
import { put } from "@vercel/blob";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const product = await getProductByIdAdmin(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
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

    // Handle main image upload (uses Vercel Blob on serverless)
    const mainImageFile = formData.get("mainImage");
    if (
      mainImageFile &&
      mainImageFile instanceof File &&
      mainImageFile.size > 0
    ) {
      const bytes = await mainImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = shortImageName(mainImageFile.name);
      try {
        const stored = await uploadProductImage(buffer, filename);
        productData.ImageLarge = stored;
        productData.ImageSmall = stored;
      } catch (error) {
        console.error("Error saving image:", error);
        if (error?.code === "EROFS" || error?.message?.includes("read-only")) {
          return NextResponse.json(
            {
              error:
                "Product image uploads require Blob storage on this server. Add a Blob store in Vercel Dashboard → Storage, then set BLOB_READ_WRITE_TOKEN.",
            },
            { status: 503 },
          );
        }
      }
    }

    // Handle additional images
    const additionalImages = formData.getAll("additionalImages");
    if (additionalImages && additionalImages.length > 0) {
      const imagePaths = [];
      for (const imgFile of additionalImages) {
        if (imgFile instanceof File && imgFile.size > 0) {
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
          }
        }
      }
      if (imagePaths.length > 0) {
        const existingImages = productData.Images || "";
        productData.Images = existingImages
          ? `${existingImages},${imagePaths.join(",")}`
          : imagePaths.join(",");
      }
    }

    // Instructions PDF: delete and/or upload
    const instructionsDelete = formData.get("instructionsDelete");
    const instructionsPdf = formData.get("instructionsPdf");
    const hasPdf =
      instructionsPdf &&
      instructionsPdf instanceof File &&
      instructionsPdf.size > 0;
    if (instructionsDelete === "1" || instructionsDelete === "true" || hasPdf) {
      const existing = await getProductByIdAdmin(id);
      const instructionsDir = join(process.cwd(), "public", "instructions");

      const tryDeleteOld = (oldName) => {
        if (!oldName || oldName === "0" || /[\/\\]/.test(oldName)) return;
        const p = join(instructionsDir, oldName);
        if (existsSync(p)) {
          unlink(p).catch((e) =>
            console.error("Error deleting old instructions:", e),
          );
        }
      };

      if (instructionsDelete === "1" || instructionsDelete === "true") {
        productData.Instructions = "0";
        if (existing && existing.Instructions)
          tryDeleteOld(existing.Instructions);
      } else if (hasPdf) {
        const bytes = await instructionsPdf.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safe = instructionsPdf.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filename = `inst_${Date.now()}_${safe}`;
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        const cwd = process.cwd();
        const isReadOnlyFs =
          cwd.includes("/var/task") || process.env.VERCEL === "1";

        if (isReadOnlyFs && !blobToken) {
          console.warn(
            "Skipping instructions PDF upload: Blob storage required",
          );
        } else if (blobToken) {
          try {
            const blob = await put(`instructions/${filename}`, buffer, {
              access: "public",
              token: blobToken,
            });
            productData.Instructions = blob.url;
            if (existing && existing.Instructions)
              tryDeleteOld(existing.Instructions);
          } catch (err) {
            console.error("Error saving instructions PDF:", err);
          }
        } else {
          try {
            await mkdir(instructionsDir, { recursive: true });
            await writeFile(join(instructionsDir, filename), buffer);
            productData.Instructions = filename;
            if (existing && existing.Instructions)
              tryDeleteOld(existing.Instructions);
          } catch (err) {
            console.error("Error saving instructions PDF:", err);
          }
        }
      }
    }

    // Multiple platforms: BodyIDs as JSON array from form
    const bodyIdsRaw = formData.get("BodyIDs");
    if (bodyIdsRaw !== null && bodyIdsRaw !== undefined) {
      try {
        productData.BodyIDs = JSON.parse(bodyIdsRaw);
      } catch {
        productData.BodyIDs = bodyIdsRaw;
      }
    }

    const success = await updateProductAdmin(id, productData);
    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await deleteProductAdmin(id);

    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
