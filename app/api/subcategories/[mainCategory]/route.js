import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
    try {
        const { mainCategory } = params;

        // Step 1: Get MainCategoryID from `maincategories` table
        const [mainCategoryData] = await db.query(
            "SELECT MainCategoryID FROM maincategories WHERE slug = ?",
            [mainCategory]
        );

        if (!mainCategoryData) {
            return NextResponse.json({ error: "Main category not found" }, { status: 404 });
        }

        const { MainCategoryID } = mainCategoryData;

        // Step 2: Get subcategories under this MainCategoryID
        const subcategories = await db.query(
            "SELECT * FROM categories WHERE MainCategoryID = ?",
            [MainCategoryID]
        );

        if (!subcategories.length) {
            return NextResponse.json({ error: "No subcategories found" }, { status: 404 });
        }

        return NextResponse.json(subcategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
    }
}
