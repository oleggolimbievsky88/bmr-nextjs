import { notFound, permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { partNumber } = await params;
  const pn = String(partNumber || "").trim();
  if (!pn) return {};
  return {
    alternates: { canonical: `/partnumber/${encodeURIComponent(pn)}` },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyPartResolver({ params }) {
  const { partNumber } = await params;
  const pn = String(partNumber || "").trim();
  if (!pn) return notFound();
  permanentRedirect(`/partnumber/${encodeURIComponent(pn)}`);
}
