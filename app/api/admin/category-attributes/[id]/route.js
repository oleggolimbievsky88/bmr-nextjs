import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCategoryAttributeById,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} from "@/lib/queries";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const attribute = await getCategoryAttributeById(id);

    if (!attribute) {
      return NextResponse.json(
        { error: "Category attribute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ categoryAttribute: attribute });
  } catch (error) {
    console.error("Error fetching category attribute:", error);
    return NextResponse.json(
      { error: "Failed to fetch category attribute" },
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
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.label !== undefined) data.label = body.label;
    if (body.type !== undefined) {
      data.type = ["text", "boolean", "select", "multiselect"].includes(
        body.type,
      )
        ? body.type
        : "text";
    }
    if (body.options !== undefined) {
      data.options =
        body.options !== null && body.options !== undefined
          ? String(body.options).trim() || null
          : null;
    }
    if (body.sort_order !== undefined)
      data.sort_order = Number(body.sort_order);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true });
    }

    const success = await updateCategoryAttribute(id, data);
    if (!success) {
      return NextResponse.json(
        { error: "Category attribute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category attribute:", error);
    return NextResponse.json(
      { error: "Failed to update category attribute", details: error.message },
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
    const success = await deleteCategoryAttribute(id);

    if (!success) {
      return NextResponse.json(
        { error: "Category attribute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category attribute:", error);
    return NextResponse.json(
      { error: "Failed to delete category attribute" },
      { status: 500 },
    );
  }
}
