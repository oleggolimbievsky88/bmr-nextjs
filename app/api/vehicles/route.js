import { getVehiclesByBodyId } from "@/lib/queries";
import { NextResponse } from "next/server";

// Mark the route as dynamically renderable
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

    const vehicles = await getVehiclesByBodyId(bodyId);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);

    // Format the error response based on the error type
    if (error.message === "Missing bodyId parameter") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch vehicles" },
        { status: 500 }
      );
    }
  }
}
