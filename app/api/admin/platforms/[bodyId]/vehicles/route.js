import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getVehiclesByBodyId } from "@/lib/queries";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const raw = params?.bodyId;
    const id = parseInt(String(raw), 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid BodyID" }, { status: 400 });
    }

    const vehicles = await getVehiclesByBodyId(id);
    return NextResponse.json({ vehicles: vehicles || [] });
  } catch (error) {
    console.error("[admin/platforms/bodyId/vehicles] GET", error);
    return NextResponse.json(
      { error: "Failed to load vehicles" },
      { status: 500 },
    );
  }
}
