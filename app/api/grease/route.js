import { getAllGreaseOptions } from "@/lib/queries";

export async function GET() {
  try {
    console.log("Grease API - starting database query...");
    const grease = await getAllGreaseOptions();

    console.log("Grease API - fetched grease:", grease);
    console.log("Grease API - grease length:", grease ? grease.length : 0);

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
      { status: 500 }
    );
  }
}
