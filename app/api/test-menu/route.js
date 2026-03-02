import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/queries";
import { getBrandConfig } from "@/lib/brandConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brand = await getBrandConfig();
    const menuData = await getMenuData(brand);

    // Sample one item per nav platform (keys are dynamic: { [id + 'Links']: [...] })
    const sampleData = {};
    for (const [key, links] of Object.entries(menuData)) {
      if (Array.isArray(links) && links.length > 0) {
        sampleData[key] = links[0];
      }
    }

    return NextResponse.json({
      message: "Menu data structure (dynamic from brand navPlatformIds)",
      sampleData,
      keys: Object.keys(menuData),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test menu API error:", error);
    return NextResponse.json(
      { error: "Test menu API failed", details: error.message },
      { status: 500 },
    );
  }
}
