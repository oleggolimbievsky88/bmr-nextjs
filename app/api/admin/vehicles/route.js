import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getVehiclesByBodyId, createVehicleAdmin } from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");
    if (!bodyId) {
      return NextResponse.json({ error: "Missing bodyId" }, { status: 400 });
    }
    const vehicles = await getVehiclesByBodyId(bodyId);
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;
    const body = await request.json().catch(() => ({}));
    const id = await createVehicleAdmin(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create" },
      { status: 500 },
    );
  }
}
