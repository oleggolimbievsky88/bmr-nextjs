const { NextResponse } = require("next/server");
const { getPlatformById } = require("@/lib/queries");

/**
 * API Route: Get platform by ID
 * @param {Request} request
 * @param {Object} context
 * @param {Object} context.params
 * @returns {NextResponse}
 */
async function GET(request, { params }) {
  const { id } = params;

  try {
    const platform = await getPlatformById(id);
    if (!platform) {
      return NextResponse.json({ platform: null }, { status: 404 });
    }
    return NextResponse.json({ platform }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error fetching platform data" },
      { status: 500 }
    );
  }
}

module.exports = { GET };
