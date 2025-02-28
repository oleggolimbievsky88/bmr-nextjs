import { getMainCategories } from "@/lib/queries";
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const platformSlug = params.platformSlug;
        const categories = await getMainCategories(platformSlug);

        if (!categories || categories.length === 0) {
            return NextResponse.json({ error: 'No categories found' }, { status: 404 });
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching main categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
