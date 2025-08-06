import { NextResponse } from "next/server";
import {
  getPlatformById,
  getCategoriesByBodyId,
  getVehiclesByBodyId,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    if (!bodyId) {
      return NextResponse.json(
        { error: "Missing bodyId parameter" },
        { status: 400 }
      );
    }

    console.log("🔍 Debug API called with bodyId:", bodyId);

    // Test all three functions
    const [platformResult, categoriesResult, vehiclesResult] =
      await Promise.all([
        getPlatformById(parseInt(bodyId)).catch((err) => ({
          error: err.message,
        })),
        getCategoriesByBodyId(bodyId).catch((err) => ({ error: err.message })),
        getVehiclesByBodyId(bodyId).catch((err) => ({ error: err.message })),
      ]);

    const result = {
      bodyId: bodyId,
      platform: platformResult,
      categories: categoriesResult,
      vehicles: vehiclesResult,
      timestamp: new Date().toISOString(),
    };

    console.log("🔍 Debug API result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Debug API error:", error);
    return NextResponse.json(
      { error: "Debug API failed", details: error.message },
      { status: 500 }
    );
  }
}
