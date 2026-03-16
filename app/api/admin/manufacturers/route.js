import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createManufacturerAdmin,
  getAllManufacturersAdmin,
} from "@/lib/queries";

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

    const manufacturers = await getAllManufacturersAdmin();
    return NextResponse.json({ manufacturers });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
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
    const name = String(body.name ?? body.ManName ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const id = await createManufacturerAdmin({ name });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to create manufacturer" },
      { status: 500 },
    );
  }
}
