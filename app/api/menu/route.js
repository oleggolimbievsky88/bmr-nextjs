import { getMenuStructure } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const menuData = await getMenuStructure();
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Menu API error:", error);
    return NextResponse.json(
      { message: "Error fetching menu data" },
      { status: 500 }
    );
  }
}
