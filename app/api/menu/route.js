import { getMenuData } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menuData = await getMenuData();
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data", details: error.message },
      { status: 500 }
    );
  }
}
