// app/api/admin/topbar-messages/route.js
// Admin API: GET and PUT topbar scrolling messages (HTML allowed, sanitized on save)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTopbarMessages, saveTopbarMessages } from "@/lib/queries";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["a", "br", "strong", "em", "b", "i", "span"];
const ALLOWED_ATTR = ["href", "target", "rel", "title"];

function sanitizeTopbarHtml(html) {
  if (typeof html !== "string") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const messages = await getTopbarMessages({ activeOnly: false });
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching topbar messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch topbar messages" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const raw = body.messages;
    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { error: "Body must contain messages array" },
        { status: 400 },
      );
    }

    const messages = raw.map((m) => {
      const sec = Number(m.duration);
      const durationMs =
        Number.isFinite(sec) && sec >= 1 && sec <= 60
          ? Math.round(sec * 1000)
          : 3000;
      return {
        content: sanitizeTopbarHtml(m.content || ""),
        duration: durationMs,
        is_active: m.is_active !== false && m.is_active !== 0,
      };
    });

    await saveTopbarMessages(messages);
    return NextResponse.json({
      success: true,
      message: "Topbar messages saved",
    });
  } catch (error) {
    console.error("Error saving topbar messages:", error);
    return NextResponse.json(
      { error: "Failed to save topbar messages" },
      { status: 500 },
    );
  }
}
