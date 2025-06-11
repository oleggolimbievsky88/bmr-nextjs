import { getCategoriesByMainCatId } from "@/lib/queries";

export async function GET(req, { params }) {
  const { mainCatId } = params;
  try {
    const categories = await getCategoriesByMainCatId(mainCatId);
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed to load categories." }),
      { status: 500 }
    );
  }
}
