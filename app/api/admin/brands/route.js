import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllBrands } from "@/lib/brandQueries";
import { defaultBrands } from "@bmr/core/brand";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const brands = await getAllBrands();
    if (brands.length === 0) {
      return NextResponse.json(
        Object.keys(defaultBrands).map((key) => ({
          key,
          name: defaultBrands[key]?.name || key,
          isActive: true,
        })),
      );
    }
    return NextResponse.json(
      brands.map((b) => ({
        key: b.key,
        name: b.name || b.companyName || b.key,
        isActive: b.isActive,
      })),
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}
