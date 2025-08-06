import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menuData = await getMenuData();

    // Get the first item from each platform to see the structure
    const sampleData = {
      ford: menuData.fordLinks?.[0] || null,
      gmLateModel: menuData.gmLateModelLinks?.[0] || null,
      gmMidMuscle: menuData.gmMidMuscleLinks?.[0] || null,
      gmClassicMuscle: menuData.gmClassicMuscleLinks?.[0] || null,
      mopar: menuData.moparLinks?.[0] || null,
    };

    return NextResponse.json({
      message: "Menu data structure",
      sampleData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test menu API error:", error);
    return NextResponse.json(
      { error: "Test menu API failed", details: error.message },
      { status: 500 }
    );
  }
}
