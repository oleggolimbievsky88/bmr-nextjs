// app/api/topbar-messages/route.js
// Public API for topbar scrolling messages (used by Topbar4, etc.)

import { NextResponse } from "next/server";
import { getTopbarMessages } from "@/lib/queries";

export async function GET() {
  try {
    const messages = await getTopbarMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching topbar messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch topbar messages" },
      { status: 500 },
    );
  }
}
