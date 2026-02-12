import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllPlatformsAdmin,
  getPlatformsByPlatformGroupAdmin,
  createPlatformAdmin,
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

    const { searchParams } = new URL(request.url);
    const platformGroupId = searchParams.get("platformGroupId");
    const bodies = platformGroupId
      ? await getPlatformsByPlatformGroupAdmin(Number(platformGroupId))
      : await getAllPlatformsAdmin();
    return NextResponse.json({ bodies });
  } catch (error) {
    console.error("Error fetching bodies:", error);
    return NextResponse.json(
      { error: "Failed to fetch bodies" },
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
    const id = await createPlatformAdmin(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating body:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create" },
      { status: 500 },
    );
  }
}
