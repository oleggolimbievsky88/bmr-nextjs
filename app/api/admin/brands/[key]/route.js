import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getBrandByKeyAdmin,
  updateBrand,
  getBrandFaqs,
  updateBrandFaqs,
  getBrandFaqSections,
  updateBrandFaqSections,
} from "@/lib/brandQueries";
import { defaultBrands } from "@bmr/core/brand";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const resolved = await params;
    const key =
      typeof resolved?.key === "string" ? resolved.key : resolved?.key?.key;
    if (!key) {
      return NextResponse.json({ error: "Missing brand key" }, { status: 400 });
    }

    let brand = await getBrandByKeyAdmin(key);
    if (!brand && defaultBrands[key]) {
      brand = { ...defaultBrands[key], key };
    }
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const faqs = await getBrandFaqs(key);
    const faqSections = await getBrandFaqSections(key);
    brand.faqs = faqs;
    brand.faqSections = faqSections;

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const resolved = await params;
    const key =
      typeof resolved?.key === "string" ? resolved.key : resolved?.key?.key;
    if (!key) {
      return NextResponse.json({ error: "Missing brand key" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    await updateBrand(key, body);

    if (Array.isArray(body.faqs)) {
      await updateBrandFaqs(key, body.faqs);
    }
    if (Array.isArray(body.faqSections)) {
      await updateBrandFaqSections(key, body.faqSections);
    }

    // Invalidate brand-driven pages so updates show on the site.
    // (FAQs, contact info, legal pages, etc. can be brand-specific.)
    revalidatePath("/");
    revalidatePath("/faq");
    revalidatePath("/contact");
    revalidatePath("/terms-conditions");
    revalidatePath("/privacy-policy");
    revalidatePath("/delivery-return");
    revalidatePath("/brands");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update brand" },
      { status: 500 },
    );
  }
}
