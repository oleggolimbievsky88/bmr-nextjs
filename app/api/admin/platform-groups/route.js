import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getPlatformGroupsAdmin,
  createPlatformGroupAdmin,
} from "@/lib/queries";
import { getBrandConfig } from "@/lib/brandConfig";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const FALLBACK_SIMPLE_NAV_IDS = ["installation", "cart"];

function navIdFromPlatformGroupName(name) {
  const n = String(name || "")
    .trim()
    .toLowerCase();
  if (!n) return null;
  if (n.includes("ford")) return "ford";
  if (n.includes("mopar")) return "mopar";
  if (n.includes("amc")) return "amc";
  if (n.includes("gm") && n.includes("late")) return "gmLateModel";
  if (n.includes("gm") && n.includes("mid")) return "gmMidMuscle";
  if (n.includes("gm") && n.includes("classic")) return "gmClassicMuscle";
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;
    const list = await getPlatformGroupsAdmin();

    // Order platform groups based on brand nav order (admin brands page controls this).
    let brand = null;
    try {
      brand = await getBrandConfig();
    } catch (e) {
      brand = null;
    }

    const navOrder =
      Array.isArray(brand?.navOrder) && brand.navOrder.length > 0
        ? brand.navOrder
        : [];
    const platformIds =
      Array.isArray(brand?.navPlatformIds) && brand.navPlatformIds.length > 0
        ? brand.navPlatformIds
        : navOrder.filter((id) => !FALLBACK_SIMPLE_NAV_IDS.includes(id));
    const rank = new Map(platformIds.map((id, i) => [id, i]));

    const sorted = [...(Array.isArray(list) ? list : [])].sort((a, b) => {
      const aKey = navIdFromPlatformGroupName(a?.name);
      const bKey = navIdFromPlatformGroupName(b?.name);
      const aRank = aKey != null ? rank.get(aKey) : undefined;
      const bRank = bKey != null ? rank.get(bKey) : undefined;

      const aHas = typeof aRank === "number";
      const bHas = typeof bRank === "number";
      if (aHas && bHas) return aRank - bRank || (a.id ?? 0) - (b.id ?? 0);
      if (aHas) return -1;
      if (bHas) return 1;

      const an = String(a?.name || "");
      const bn = String(b?.name || "");
      const byName = an.localeCompare(bn);
      if (byName) return byName;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    return NextResponse.json(sorted);
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
