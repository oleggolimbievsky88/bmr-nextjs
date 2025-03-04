import { getCategoriesByMainCat } from "@/lib/queries";
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subCategoryId = searchParams.get('subCategoryId');

    if (!subCategoryId) {
      return NextResponse.json(
        { error: 'Sub Category ID is required' }, 
        { status: 400 }
      );
    }

    const subCategories = await getCategoriesByMainCat(subCategoryId);

    // Transform the result to match the previous implementation
    const transformedSubCategories = subCategories.map(category => ({
      CatID: category.CatID,
      CatName: category.CatName,
      CatImage: category.CatImage,
      ProductCount: 0  // You might want to add a method to count products per category
    }));

    return NextResponse.json(transformedSubCategories);
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sub-categories' }, 
      { status: 500 }
    );
  }
} 