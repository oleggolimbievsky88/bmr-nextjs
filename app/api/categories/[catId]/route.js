// /app/api/categories/[catId]/route.js

import { getCategoryById } from "../../../../lib/queries"; // Import your query function

export async function GET(req, { params }) {
  const { catId } = params; // Extract catId from the dynamic route

  try {
    const categories = await getCategoryById(catId); // Fetch categories based on catId
    if (!categories.length) {
      return new Response(
        JSON.stringify({ message: `No categories found for CatID ${catId}` }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.error(`Error fetching categories for CatID ${catId}:`, error);
    return new Response(
      JSON.stringify({ message: "Failed to load categories." }),
      { status: 500 }
    );
  }
}
