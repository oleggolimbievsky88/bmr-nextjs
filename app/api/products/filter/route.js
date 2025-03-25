import { getFilteredProducts } from "@/lib/queries";

export async function POST(request) {
  try {
    const filters = await request.json();
    const filteredProducts = await getFilteredProducts(filters);
    return Response.json(filteredProducts);
  } catch (error) {
    console.error("Error filtering products:", error);
    return Response.json(
      { error: "Failed to filter products" },
      { status: 500 }
    );
  }
}
