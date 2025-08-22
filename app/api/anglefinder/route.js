import { getAllAnglefinderOptions } from "@/lib/queries";

export async function GET() {
  try {
    const anglefinder = await getAllAnglefinderOptions();

    return Response.json({
      success: true,
      anglefinder: anglefinder,
    });
  } catch (error) {
    console.error("Error fetching anglefinder options:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch anglefinder options",
        anglefinder: [],
      },
      { status: 500 }
    );
  }
}
