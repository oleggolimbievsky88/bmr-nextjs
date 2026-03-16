import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  deleteManufacturerAdmin,
  getManufacturerByIdAdmin,
  updateManufacturerAdmin,
} from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { id } = await context.params;
    const manufacturer = await getManufacturerByIdAdmin(id);

    if (!manufacturer) {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ manufacturer });
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturer" },
      { status: 500 },
    );
  }
}

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? body.ManName ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const success = await updateManufacturerAdmin(id, { name });
    if (!success) {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to update manufacturer" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { id } = await context.params;
    const success = await deleteManufacturerAdmin(id);
    if (!success) {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to delete manufacturer" },
      { status: 500 },
    );
  }
}
