import { getSiteUrl } from "@bmr/core/url";
import { resolveAssetUrl } from "@bmr/core/brand";

/**
 * Server-friendly JSON-LD. Receives brand from layout.
 */

function absoluteUrl(base, maybePath) {
  if (!maybePath) return "";
  if (maybePath.startsWith("http://") || maybePath.startsWith("https://"))
    return maybePath;
  const b = base.replace(/\/$/, "");
  const p = maybePath.startsWith("/") ? maybePath : `/${maybePath}`;
  return `${b}${p}`;
}

function getBrandLogoUrl(brand, SITE_URL) {
  const assetsBaseUrl = brand?.assetsBaseUrl || "";
  const headerPath = brand?.logo?.headerPath || "";
  const resolved = resolveAssetUrl({ assetsBaseUrl, path: headerPath });
  return absoluteUrl(SITE_URL, resolved);
}

function buildSameAs(brand) {
  const social = brand?.social || {};
  const urls = [
    social.facebook,
    social.instagram,
    social.youtube,
    social.tiktok,
    social.x,
    social.linkedin,
  ].filter(Boolean);

  const extra = Array.isArray(brand?.sameAs) ? brand.sameAs : [];
  return Array.from(new Set([...urls, ...extra]));
}

export default function JsonLd({ brand }) {
  if (!brand) return null;
  const SITE_URL = getSiteUrl();
  const logoUrl = getBrandLogoUrl(brand, SITE_URL);

  const email = brand.contact?.email || "";
  const phoneTel = brand.contact?.phoneTel || "";
  const contactUrl = `${SITE_URL}/contact`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.companyName,
    url: SITE_URL,
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(email || phoneTel
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              ...(email ? { email } : {}),
              ...(phoneTel ? { telephone: `+1${phoneTel}` } : {}),
              url: contactUrl,
            },
          ],
        }
      : {}),
    sameAs: buildSameAs(brand),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.companyName,
    url: SITE_URL,
    description:
      brand.defaultDescription ||
      "High-performance suspension and chassis parts.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/homes/home-search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
