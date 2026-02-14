import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/queries";
import { getCategoryImageUrl } from "@/lib/assets";

// Homepage slides (used by Categories.jsx if enabled): New Products, BMR Merchandise, Gift Cards
const HOMEPAGE_SLIDES = [
  {
    imgSrc: "/images/shop-categories/NewProductsGradient.jpg",
    alt: "New Products",
    title: "New Products",
    price: "$199",
    href: "/products/new",
  },
  {
    imgSrc: "/images/shop-categories/MerchGradient.jpg",
    alt: "BMR Merchandise",
    title: "BMR Merchandise",
    price: "$199",
    href: "/products/bmr-merchandise",
  },
  {
    imgSrc: "/images/shop-categories/GiftCardsGradient.jpg",
    alt: "BMR Gift Cards",
    title: "BMR Gift Cards",
    price: "$199",
    href: "/products/gift-cards",
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'slides' | 'maincategories'

    if (type === "maincategories") {
      const mainCategories = await fetchCategories();
      const items = (mainCategories || []).slice(0, 6).map((mc, i) => {
        const imgUrl =
          mc.MainCatImage && mc.MainCatImage !== "0"
            ? getCategoryImageUrl(mc.MainCatImage)
            : "/images/collections/collection-8.jpg";
        return {
          id: `mc-${mc.MainCatID || i}`,
          imgSrc: imgUrl,
          alt: mc.MainCatName || "Category",
          title: mc.MainCatName || "Category",
          href: "/shop",
        };
      });
      return NextResponse.json({ items });
    }

    if (type === "slides") {
      return NextResponse.json({ slides: HOMEPAGE_SLIDES });
    }

    return NextResponse.json({ slides: HOMEPAGE_SLIDES });
  } catch (error) {
    console.error("Error fetching homepage collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}
