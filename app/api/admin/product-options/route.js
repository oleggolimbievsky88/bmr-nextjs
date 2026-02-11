import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllColors,
  getAllGreaseOptions,
  getAllAnglefinderOptions,
  getAllHardwareOptions,
  getHardwarePackProductsForAdmin,
} from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [colors, grease, anglefinder, hardware, hardwarePacks] =
      await Promise.all([
        getAllColors(),
        getAllGreaseOptions(),
        getAllAnglefinderOptions(),
        getAllHardwareOptions(),
        getHardwarePackProductsForAdmin(),
      ]);

    return NextResponse.json({
      colors: colors || [],
      grease: grease || [],
      anglefinder: anglefinder || [],
      hardware: hardware || [],
      hardwarePacks: hardwarePacks || [],
    });
  } catch (error) {
    console.error("Error fetching product options:", error);
    return NextResponse.json(
      { error: "Failed to fetch product options" },
      { status: 500 },
    );
  }
}
