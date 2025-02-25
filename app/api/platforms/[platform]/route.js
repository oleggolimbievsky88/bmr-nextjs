import { NextResponse } from "next/server";
import { getPlatformBySlug } from "@/lib/queries";

export async function GET(req, { params }) {
    try {
        const { platform } = params;

        console.log("platform slug:", platform);

        // Fetch platform details
        const platformData = await getPlatformBySlug(platform);

        if (!platformData) {
            console.error("❌ Platform not found in database:", platform);
            return NextResponse.json({ error: "Platform not found" }, { status: 404 });
        }

        const { name, startYear, endYear, platformImage, headerImage, slug } = platformData;

        // Format platform name with years
        const formattedName = startYear === endYear ? `${startYear} ${name}` : `${startYear}-${endYear} ${name}`;

        console.log("✅ Platform Found:", { formattedName, platformImage, headerImage, slug: platformData.slug });

        return NextResponse.json({ formattedName, platformImage, headerImage, slug: platformData.slug });
    } catch (error) {
        console.error("❌ Error fetching platform data:", error);
        return NextResponse.json({ error: "Failed to fetch platform data" }, { status: 500 });
    }
}
