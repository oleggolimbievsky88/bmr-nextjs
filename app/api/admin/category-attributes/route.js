import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCategoryAttributesByAttributeCategoryId,
  createCategoryAttribute,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const attributeCategoryId = url.searchParams.get("attributeCategoryId");
    if (!attributeCategoryId) {
      return NextResponse.json(
        { error: "attributeCategoryId is required" },
        { status: 400 },
      );
    }

    const list =
      await getCategoryAttributesByAttributeCategoryId(attributeCategoryId);
    return NextResponse.json({ categoryAttributes: list });
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch category attributes" },
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

    const body = await request.json().catch(() => ({}));
    const attributeCategoryId =
      body.attribute_category_id ?? body.attributeCategoryId;
    if (!attributeCategoryId) {
      return NextResponse.json(
        { error: "attribute_category_id is required" },
        { status: 400 },
      );
    }
    const label = body.label || "";
    let slug = (body.slug || "").trim();
    if (!slug && label) {
      slug = label
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    }
    if (!slug) {
      return NextResponse.json(
        { error: "slug or label is required" },
        { status: 400 },
      );
    }

    const data = {
      attribute_category_id: Number(attributeCategoryId),
      slug,
      label: label || slug,
      type: ["text", "boolean", "select", "multiselect"].includes(body.type)
        ? body.type
        : "text",
      options:
        body.options !== undefined && body.options !== null
          ? String(body.options).trim() || null
          : null,
      sort_order: body.sort_order != null ? Number(body.sort_order) : 0,
    };

    const id = await createCategoryAttribute(data);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating category attribute:", error);
    return NextResponse.json(
      { error: "Failed to create category attribute", details: error.message },
      { status: 500 },
    );
  }
}
