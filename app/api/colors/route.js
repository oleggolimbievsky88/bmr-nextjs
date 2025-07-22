import { getAllColors } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const colors = await getAllColors(); // This should return an array of all color objects
    console.log("API colors:", colors);
    return NextResponse.json({ colors });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}
