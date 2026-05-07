import { notFound, permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!id) return {};

  return {
    alternates: { canonical: `/product/${id}` },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyProductDetailPage({ params }) {
  const { id } = await params;
  if (!id) return notFound();
  permanentRedirect(`/product/${id}`);
}
