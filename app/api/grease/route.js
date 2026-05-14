import { getAllGreaseOptions } from "@/lib/queries";

export async function GET() {
  try {
    const grease = await getAllGreaseOptions();

    return Response.json({
      success: true,
      grease: grease || [],
    });
  } catch (error) {
    console.error("Error fetching grease options:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch grease options",
        grease: [],
      },
      { status: 500 },
    );
  }
}
