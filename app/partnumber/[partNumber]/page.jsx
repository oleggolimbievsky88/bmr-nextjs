import { notFound, permanentRedirect } from "next/navigation";
import pool from "@/lib/db";
import { expandPartNumberAliases } from "@/lib/partNumberSearch";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { partNumber } = await params;
  const pn = String(partNumber || "").trim();
  if (!pn) return {};
  return {
    title: `Part #${pn} | BMR Suspension`,
    description: `Part number lookup for ${pn}.`,
  };
}

export default async function PartNumberResolverPage({ params }) {
  const { partNumber } = await params;
  const pn = String(partNumber || "").trim();
  if (!pn) return notFound();

  const aliases = expandPartNumberAliases(pn);
  const upperAliases = aliases.map((a) => a.toUpperCase());

  // Prefer exact matches first, then fall back to "starts with"
  const placeholders = upperAliases.map(() => "?").join(",");
  const [exactRows] = await pool.query(
    `SELECT ProductID
     FROM products
     WHERE Display = '1'
       AND (endproduct IS NULL OR endproduct != '1')
       AND UPPER(PartNumber) IN (${placeholders})
     ORDER BY ProductID DESC
     LIMIT 1`,
    upperAliases,
  );
  const exactId = exactRows?.[0]?.ProductID;
  if (exactId) {
    permanentRedirect(`/product/${exactId}`);
  }

  const startLikes = upperAliases.map((a) => `${a}%`);
  const [likeRows] = await pool.query(
    `SELECT ProductID
     FROM products
     WHERE Display = '1'
       AND (endproduct IS NULL OR endproduct != '1')
       AND (${startLikes.map(() => "UPPER(PartNumber) LIKE ?").join(" OR ")})
     ORDER BY ProductID DESC
     LIMIT 1`,
    startLikes,
  );
  const likeId = likeRows?.[0]?.ProductID;
  if (likeId) {
    permanentRedirect(`/product/${likeId}`);
  }

  return notFound();
}
