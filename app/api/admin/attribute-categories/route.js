import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllAttributeCategories,
  getAttributeCategoryAttributeCount,
  createAttributeCategory,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await getAllAttributeCategories();
    const withCount = await Promise.all(
      list.map(async (row) => {
        const count = await getAttributeCategoryAttributeCount(row.id);
        return { ...row, attributeCount: count };
      }),
    );
    return NextResponse.json({ attributeCategories: withCount });
  } catch (error) {
    console.error("Error fetching attribute categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch attribute categories" },
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
    const data = {
      name: body.name || "",
      slug: (body.slug || "").trim().toLowerCase().replace(/\s+/g, "-"),
      sort_order: body.sort_order != null ? Number(body.sort_order) : 0,
    };
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, "-");

    const id = await createAttributeCategory(data);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating attribute category:", error);
    return NextResponse.json(
      { error: "Failed to create attribute category", details: error.message },
      { status: 500 },
    );
  }
}
