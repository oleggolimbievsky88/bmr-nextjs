import { NextResponse } from "next/server";

// Store up to N recent product ids in an httpOnly cookie
const COOKIE_NAME = "recentlyViewed";
const MAX_ITEMS = 20;
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parseCookie(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(/;\s*/)
      .map((c) => c.split("=", 2))
      .map(([k, v]) => [k, decodeURIComponent(v || "")])
  );
}

export async function POST(request) {
  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "productId required" },
        { status: 400 }
      );
    }

    const cookies = parseCookie(request.headers.get("cookie"));
    const current = cookies[COOKIE_NAME]
      ? currentSafe(cookies[COOKIE_NAME])
      : [];

    // Put new id at front, de-dupe, clamp length
    const next = [
      String(productId),
      ...current.filter((id) => id !== String(productId)),
    ].slice(0, MAX_ITEMS);

    const res = NextResponse.json({ success: true, items: next });
    res.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(next)
      )}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`
    );
    return res;
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

function currentSafe(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return [];
  }
}

export async function GET(request) {
  const cookies = parseCookie(request.headers.get("cookie"));
  const items = cookies[COOKIE_NAME] ? currentSafe(cookies[COOKIE_NAME]) : [];
  return NextResponse.json({ items });
}
