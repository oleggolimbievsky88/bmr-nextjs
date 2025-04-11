import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/queries";
import { getDirectMenuData } from "@/lib/menuData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try first with the direct method that doesn't depend on the pool connection
    let menuData;
    try {
      menuData = await getDirectMenuData();
      console.log("Menu data loaded using direct connection");
    } catch (directError) {
      console.error(
        "Error using direct menu data, falling back to pool:",
        directError
      );
      menuData = await getMenuData();
    }

    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data" },
      { status: 500 }
    );
  }
}
