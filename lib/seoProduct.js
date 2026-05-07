import { getProductFitmentRangeText } from "@/lib/fitmentLabel";

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  return normalizeWhitespace(String(value || "").replace(/<[^>]*>/g, " "));
}

function truncate(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildFitmentTextFromVehicles(vehicles = [], maxEntries = 2) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) return "";

  const byMakeModel = new Map();
  for (const vehicle of vehicles) {
    const make = normalizeWhitespace(vehicle?.Make);
    const model = normalizeWhitespace(vehicle?.Model);
    if (!make || !model) continue;

    const key = `${make.toLowerCase()}|${model.toLowerCase()}`;
    const startYear = Number.parseInt(vehicle?.StartYear, 10);
    const endYear = Number.parseInt(vehicle?.EndYear, 10);
    const safeStart = Number.isFinite(startYear) ? startYear : null;
    const safeEnd = Number.isFinite(endYear) ? endYear : null;

    const existing = byMakeModel.get(key);
    if (!existing) {
      byMakeModel.set(key, {
        make,
        model,
        minYear: safeStart,
        maxYear: safeEnd,
      });
      continue;
    }

    if (safeStart != null) {
      existing.minYear =
        existing.minYear == null
          ? safeStart
          : Math.min(existing.minYear, safeStart);
    }
    if (safeEnd != null) {
      existing.maxYear =
        existing.maxYear == null
          ? safeEnd
          : Math.max(existing.maxYear, safeEnd);
    }
  }

  return Array.from(byMakeModel.values())
    .slice(0, Math.max(1, maxEntries))
    .map(({ make, model, minYear, maxYear }) => {
      if (minYear && maxYear) {
        return `${minYear === maxYear ? minYear : `${minYear}-${maxYear}`} ${make} ${model}`;
      }
      return `${make} ${model}`;
    })
    .join(", ");
}

function getPrimaryImageUrl(product) {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage =
      product.images[0]?.imgSrc || product.images[0]?.smallImgSrc;
    if (firstImage) return firstImage;
  }
  return "";
}

export function buildProductSeoTitle(
  product,
  { vehicles = [], brandName = "" } = {},
) {
  const partNumber = normalizeWhitespace(product?.PartNumber);
  const productName = normalizeWhitespace(product?.ProductName);
  const fitment = buildFitmentTextFromVehicles(vehicles, 2);

  const core = [partNumber, productName].filter(Boolean).join(" - ");
  const fitmentText = fitment ? `for ${fitment}` : "";
  const title = [core, fitmentText, brandName].filter(Boolean).join(" | ");

  return truncate(title || productName || partNumber || "Product", 68);
}

export function buildProductSeoDescription(
  product,
  { vehicles = [], brandName = "" } = {},
) {
  const productName = normalizeWhitespace(product?.ProductName);
  const partNumber = normalizeWhitespace(product?.PartNumber);
  const description = stripHtml(product?.Description);
  const fitment =
    buildFitmentTextFromVehicles(vehicles, 3) ||
    getProductFitmentRangeText(product);

  const parts = [
    partNumber ? `Part #${partNumber}.` : "",
    productName ? `${productName}.` : "",
    fitment ? `Fits ${fitment}.` : "",
    description,
    brandName ? `Shop genuine ${brandName} suspension and chassis parts.` : "",
  ].filter(Boolean);

  return truncate(parts.join(" "), 158);
}

export function buildProductJsonLd({
  product,
  siteUrl,
  canonicalPath,
  brandName,
  vehicles = [],
}) {
  const url = `${siteUrl}${canonicalPath}`;
  const name = normalizeWhitespace(
    product?.ProductName || product?.PartNumber || "Product",
  );
  const description = buildProductSeoDescription(product, {
    vehicles,
    brandName,
  });
  const partNumber = normalizeWhitespace(product?.PartNumber);
  const image = getPrimaryImageUrl(product);
  const priceValue = Number.parseFloat(product?.Price);
  const fitmentText =
    buildFitmentTextFromVehicles(vehicles, 3) ||
    getProductFitmentRangeText(product);
  const inStock = Number.parseInt(product?.Qty, 10) > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name,
    description,
    ...(image ? { image: [image] } : {}),
    ...(partNumber ? { sku: partNumber, mpn: partNumber } : {}),
    brand: {
      "@type": "Brand",
      name: brandName || "BMR Suspension",
    },
    ...(fitmentText
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Vehicle fitment",
              value: fitmentText,
            },
          ],
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      ...(Number.isFinite(priceValue)
        ? { price: Number(priceValue).toFixed(2) }
        : {}),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function buildMerchantFeedTitle(product, fitmentText = "") {
  const partNumber = normalizeWhitespace(product?.PartNumber);
  const productName = normalizeWhitespace(product?.ProductName);
  const title = [partNumber, productName, fitmentText]
    .filter(Boolean)
    .join(" - ");
  return truncate(title || partNumber || productName || "Product", 148);
}

export function buildMerchantFeedDescription(product, brandName = "") {
  return buildProductSeoDescription(product, { brandName });
}
