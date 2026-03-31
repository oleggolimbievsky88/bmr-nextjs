import { getNewProductsDays } from "@/lib/settings";

function toInt(value) {
  const n = typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseYmdDate(value) {
  if (!value || value === "0") return null;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isNewProductRow(product, days) {
  if (!product) return false;
  const isNewPart =
    String(product.NewPart) === "1" || toInt(product.NewPart) === 1;
  const isBlem =
    String(product.BlemProduct) === "1" || toInt(product.BlemProduct) === 1;
  if (!isNewPart || isBlem) return false;
  const dt = parseYmdDate(product.NewPartDate);
  if (!dt) return false;
  const windowDays =
    Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : 90;
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  return dt >= cutoff;
}

export async function withComputedBadges(productOrProducts) {
  const days = await getNewProductsDays();
  const apply = (p) =>
    p ? { ...p, isNewProduct: isNewProductRow(p, days) } : p;
  return Array.isArray(productOrProducts)
    ? productOrProducts.map(apply)
    : apply(productOrProducts);
}
