import { getSiteUrl } from "@bmr/core/url";

const SITE_URL = getSiteUrl();
import { getProductIdsForSitemap } from "@/lib/queries";

const staticRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "products", changeFrequency: "daily", priority: 0.9 },
  { path: "products/new", changeFrequency: "daily", priority: 0.8 },
  { path: "platform", changeFrequency: "weekly", priority: 0.8 },
  { path: "brands", changeFrequency: "monthly", priority: 0.6 },
  { path: "shipping-delivery", changeFrequency: "monthly", priority: 0.5 },
  { path: "store-locations", changeFrequency: "monthly", priority: 0.5 },
  { path: "our-store", changeFrequency: "monthly", priority: 0.5 },
  { path: "dealers-portal", changeFrequency: "yearly", priority: 0.4 },
  { path: "bmr-merchandise", changeFrequency: "monthly", priority: 0.5 },
  { path: "gift-cards", changeFrequency: "monthly", priority: 0.5 },
  { path: "installation", changeFrequency: "monthly", priority: 0.6 },
  { path: "terms-conditions", changeFrequency: "yearly", priority: 0.3 },
  { path: "privacy-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap() {
  const base = SITE_URL;
  const now = new Date();

  const urls = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${base}/${path}` : base,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let productIds = [];
  try {
    productIds = await getProductIdsForSitemap();
  } catch (e) {
    console.warn("Sitemap: could not fetch product IDs", e?.message);
  }

  productIds.forEach((id) => {
    urls.push({
      url: `${base}/product/${id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  return urls;
}
