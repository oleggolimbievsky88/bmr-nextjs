import { NextResponse } from "next/server";
import { getPlatformBySlug } from "@/lib/queries";

export async function GET(request, { params }) {
    console.log("params", params);
    const platformSlug = params.platform;
    try {
        const platformData = await getPlatformBySlug(platformSlug);

        if (!platformData) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        // Add a formatted name if needed
        platformData.formattedName = `${platformData.startYear}-${platformData.endYear} ${platformData.name}`;

        return NextResponse.json(platformData);
    } catch (error) {
        console.error('Error fetching platform:', error);
        return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
    }
}
