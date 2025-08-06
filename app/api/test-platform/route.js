import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    return NextResponse.json({
      message: "Platform test API route working",
      bodyId: bodyId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Platform test API error:", error);
    return NextResponse.json(
      { error: "Platform test API failed", details: error.message },
      { status: 500 }
    );
  }
}
