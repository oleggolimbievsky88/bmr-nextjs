import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updatePlatformGroupAdmin,
  deletePlatformGroupAdmin,
} from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    await updatePlatformGroupAdmin(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating platform group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await deletePlatformGroupAdmin(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting platform group:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
