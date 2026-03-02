import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAttributeCategoryById,
  updateAttributeCategory,
  deleteAttributeCategory,
} from "@/lib/queries";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const attributeCategory = await getAttributeCategoryById(id);

    if (!attributeCategory) {
      return NextResponse.json(
        { error: "Attribute category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ attributeCategory });
  } catch (error) {
    console.error("Error fetching attribute category:", error);
    return NextResponse.json(
      { error: "Failed to fetch attribute category" },
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
    const body = await request.json().catch(() => ({}));
    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined)
      data.slug = String(body.slug).trim().toLowerCase().replace(/\s+/g, "-");
    if (body.sort_order !== undefined)
      data.sort_order = Number(body.sort_order);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true });
    }

    const success = await updateAttributeCategory(id, data);
    if (!success) {
      return NextResponse.json(
        { error: "Attribute category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating attribute category:", error);
    return NextResponse.json(
      { error: "Failed to update attribute category", details: error.message },
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
    const success = await deleteAttributeCategory(id);

    if (!success) {
      return NextResponse.json(
        { error: "Attribute category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attribute category:", error);
    return NextResponse.json(
      { error: "Failed to delete attribute category" },
      { status: 500 },
    );
  }
}
