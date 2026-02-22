import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getMainCategoryByIdAdmin,
  updateMainCategoryAdmin,
  deleteMainCategoryAdmin,
} from "@/lib/queries";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const mainCategory = await getMainCategoryByIdAdmin(id);

    if (!mainCategory) {
      return NextResponse.json(
        { error: "Main category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ mainCategory });
  } catch (error) {
    console.error("Error fetching main category:", error);
    return NextResponse.json(
      { error: "Failed to fetch main category" },
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
    const mainCategoryData = {
      BodyID: formData.get("BodyID") || "0",
      MainCatImage: formData.get("MainCatImage") || "0",
      MainCatName: formData.get("MainCatName") || "",
    };

    // Handle image upload (accept File or any blob with arrayBuffer)
    const imageFile = formData.get("image");
    const hasImage =
      imageFile &&
      typeof imageFile.arrayBuffer === "function" &&
      (imageFile.size > 0 || imageFile.length > 0);
    if (hasImage) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const baseName =
        typeof imageFile.name === "string" && imageFile.name
          ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
          : "image";
      const filename = `maincategory_${Date.now()}_${baseName}`;
      const uploadDir = join(process.cwd(), "public", "images", "categories");

      await mkdir(uploadDir, { recursive: true });
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      mainCategoryData.MainCatImage = `images/categories/${filename}`;
    }

    const success = await updateMainCategoryAdmin(id, mainCategoryData);
    if (!success) {
      return NextResponse.json(
        { error: "Main category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating main category:", error);
    return NextResponse.json(
      { error: "Failed to update main category", details: error.message },
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
    const success = await deleteMainCategoryAdmin(id);

    if (!success) {
      return NextResponse.json(
        { error: "Main category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting main category:", error);
    return NextResponse.json(
      { error: "Failed to delete main category" },
      { status: 500 },
    );
  }
}
