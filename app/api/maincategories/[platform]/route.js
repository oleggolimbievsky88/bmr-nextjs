import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Ensure pool is imported correctly

export async function GET(req, { params }) {
    try {
        const { platform } = params;

        // Step 1: Get BodyID from `bodies` table using slug
        const [bodyData] = await pool.query(
            "SELECT BodyID FROM bodies WHERE slug = ?",
            [platform]
        );

        if (!bodyData || bodyData.length === 0) {
            return NextResponse.json({ error: "Platform not found" }, { status: 404 });
        }

        const { BodyID } = bodyData[0]; // ✅ Correct extraction of BodyID

        console.log("✅ Found BodyID:", BodyID);

        // Step 2: Get main categories linked to this BodyID
        const [mainCategories] = await pool.query(
            "SELECT MainCatID, MainCatName, MainCatImage FROM maincategories WHERE BodyID = ?",
            [BodyID]
        );

        if (!mainCategories.length) {
            return NextResponse.json({ error: "No main categories found" }, { status: 404 });
        }

        console.log("✅ Main Categories:", mainCategories);

        return NextResponse.json(mainCategories);
    } catch (error) {
        console.error("❌ Error fetching main categories:", error);
        return NextResponse.json({ error: "Failed to fetch main categories" }, { status: 500 });
    }
}
