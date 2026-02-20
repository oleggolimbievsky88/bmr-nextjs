import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBrandByKeyAdmin, updateBrand } from "@/lib/brandQueries";
import { defaultBrands } from "@bmr/core/brand";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const resolved = await params;
    const key =
      typeof resolved?.key === "string" ? resolved.key : resolved?.key?.key;
    if (!key) {
      return NextResponse.json({ error: "Missing brand key" }, { status: 400 });
    }

    let brand = await getBrandByKeyAdmin(key);
    if (!brand && defaultBrands[key]) {
      brand = { ...defaultBrands[key], key };
    }
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const resolved = await params;
    const key =
      typeof resolved?.key === "string" ? resolved.key : resolved?.key?.key;
    if (!key) {
      return NextResponse.json({ error: "Missing brand key" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    await updateBrand(key, body);

    // Invalidate homepage so Shop by Make and other brand-dependent content updates in production
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update brand" },
      { status: 500 },
    );
  }
}
