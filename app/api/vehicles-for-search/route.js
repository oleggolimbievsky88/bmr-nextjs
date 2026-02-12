import { NextResponse } from "next/server";
import { getVehiclesForSearch } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getVehiclesForSearch();
    return NextResponse.json(list, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles for search:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}
