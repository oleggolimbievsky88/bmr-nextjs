import { getMainCategoryIdBySlugAndPlatform } from "@/lib/queries";

export async function GET(req, { params }) {
  const { platform, mainCategorySlug } = params;
  try {
    const mainCatId = await getMainCategoryIdBySlugAndPlatform(
      platform,
      mainCategorySlug
    );
    if (!mainCatId) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify({ mainCatId }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to lookup MainCatID" }),
      { status: 500 }
    );
  }
}
