import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNewProductsDays, setSetting } from "@/lib/settings";

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

    const days = await getNewProductsDays();
    return NextResponse.json({ days });
  } catch (error) {
    console.error("Error fetching new products days:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const body = await request.json();
    const days = body?.days != null ? parseInt(String(body.days), 10) : null;
    if (days === null || !Number.isFinite(days) || days < 1 || days > 9999) {
      return NextResponse.json(
        { error: "Invalid days; use a number between 1 and 9999" },
        { status: 400 },
      );
    }

    await setSetting("new_products_days", days);
    return NextResponse.json({ days });
  } catch (error) {
    console.error("Error saving new products days:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 },
    );
  }
}
