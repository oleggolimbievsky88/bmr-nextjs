import { NextResponse } from "next/server";
import { getBrandConfig } from "@/lib/brandConfig";
import { getBrandFaqs } from "@/lib/brandQueries";

/**
 * GET /api/faqs — returns FAQs for the current brand (from getBrandConfig).
 */
export async function GET() {
  try {
    const config = await getBrandConfig();
    const brandKey = config?.key || "bmr";
    const faqs = await getBrandFaqs(brandKey);
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 },
    );
  }
}
