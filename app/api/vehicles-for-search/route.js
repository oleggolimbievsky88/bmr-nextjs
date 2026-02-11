import { NextResponse } from "next/server";
import { getVehiclesForSearch } from "@/lib/queries";

export async function GET() {
  try {
    const list = await getVehiclesForSearch();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching vehicles for search:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}
