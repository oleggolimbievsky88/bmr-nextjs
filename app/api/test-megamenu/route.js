import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    return NextResponse.json({
      message: "Test API route working",
      bodyId: bodyId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ error: "Test API failed" }, { status: 500 });
  }
}
