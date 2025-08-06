import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    return NextResponse.json({
      message: "Simple API route working",
      bodyId: bodyId,
      type: typeof bodyId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Simple API error:", error);
    return NextResponse.json(
      { error: "Simple API failed", details: error.message },
      { status: 500 }
    );
  }
}
