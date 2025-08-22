import { getAllHardwareOptions } from "@/lib/queries";

export async function GET() {
  try {
    const hardware = await getAllHardwareOptions();

    return Response.json({
      success: true,
      hardware: hardware,
    });
  } catch (error) {
    console.error("Error fetching hardware options:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch hardware options",
        hardware: [],
      },
      { status: 500 }
    );
  }
}
