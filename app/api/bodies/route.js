import { getBodyDetailsById } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    if (!bodyId) {
      return NextResponse.json(
        { error: "Missing bodyId parameter" },
        { status: 400 }
      );
    }

    const bodyDetails = await getBodyDetailsById(bodyId);
    return NextResponse.json(bodyDetails);
  } catch (error) {
    console.error("Error fetching body details:", error);

    // Format the error response based on the error type
    if (error.message === "Missing bodyId parameter") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Body not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch body details" },
        { status: 500 }
      );
    }
  }
}
