import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getPlatformGroupsAdmin,
  createPlatformGroupAdmin,
} from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;
    const list = await getPlatformGroupsAdmin();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching platform groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform groups" },
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
    const id = await createPlatformGroupAdmin(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating platform group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create" },
      { status: 500 },
    );
  }
}
