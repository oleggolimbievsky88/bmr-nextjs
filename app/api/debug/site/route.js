import { NextResponse } from "next/server";
import { getSiteUrl } from "@bmr/core/url";
import { getBrandConfig } from "@/lib/brandConfig";
import { resolveAssetUrl } from "@bmr/core/brand";

function safeString(v) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function redactUrl(u) {
  const s = safeString(u).trim();
  if (!s) return "";
  // No query/fragment in output; keep origin + pathname only.
  try {
    const url = new URL(s);
    return `${url.origin}${url.pathname}`;
  } catch {
    return s.split("?")[0].split("#")[0];
  }
}

export async function GET() {
  const brand = await getBrandConfig();
  const siteUrl = getSiteUrl();

  const assetsBaseUrl = safeString(brand?.assetsBaseUrl).trim();
  const headerPath = safeString(brand?.logo?.headerPath).trim();
  const footerPath = safeString(brand?.logo?.footerPath).trim();

  const headerResolved = resolveAssetUrl({
    assetsBaseUrl,
    path: headerPath,
    siteUrl,
  });
  const footerResolved = resolveAssetUrl({
    assetsBaseUrl,
    path: footerPath || headerPath,
    siteUrl,
  });

  return NextResponse.json(
    {
      now: new Date().toISOString(),
      computed: {
        siteUrl: redactUrl(siteUrl),
        vercelUrl: safeString(process.env.VERCEL_URL),
      },
      env: {
        NEXT_PUBLIC_SITE_URL: redactUrl(process.env.NEXT_PUBLIC_SITE_URL),
        NEXTAUTH_URL: redactUrl(process.env.NEXTAUTH_URL),
        NEXT_PUBLIC_ASSETS_BASE_URL: redactUrl(
          process.env.NEXT_PUBLIC_ASSETS_BASE_URL,
        ),
        NEXT_PUBLIC_HEADER_LOGO: redactUrl(process.env.NEXT_PUBLIC_HEADER_LOGO),
        NEXT_PUBLIC_FOOTER_LOGO: redactUrl(process.env.NEXT_PUBLIC_FOOTER_LOGO),
        NEXT_PUBLIC_BRAND: safeString(process.env.NEXT_PUBLIC_BRAND),
        BRAND: safeString(process.env.BRAND),
        VERCEL_ENV: safeString(process.env.VERCEL_ENV),
      },
      brand: {
        key: safeString(brand?.key),
        assetsBaseUrl: redactUrl(assetsBaseUrl),
        logo: {
          headerPath: redactUrl(headerPath),
          footerPath: redactUrl(footerPath),
          headerResolved: redactUrl(headerResolved),
          footerResolved: redactUrl(footerResolved),
        },
      },
    },
    { status: 200 },
  );
}
