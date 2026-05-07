import { getSiteUrl } from "@bmr/core/url";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getProductImageUrl } from "@/lib/assets";
import {
  buildMerchantFeedDescription,
  buildMerchantFeedTitle,
} from "@/lib/seoProduct";
import { getBrandConfig } from "@/lib/brandConfig";

export const dynamic = "force-dynamic";

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(siteUrl, maybePath) {
  if (!maybePath) return "";
  if (
    String(maybePath).startsWith("http://") ||
    String(maybePath).startsWith("https://")
  ) {
    return String(maybePath);
  }
  const base = siteUrl.replace(/\/$/, "");
  const path = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return `${base}${path}`;
}

function getMerchantFitmentText(row) {
  const startAppYear = Number.parseInt(row?.StartAppYear, 10);
  const endAppYear = Number.parseInt(row?.EndAppYear, 10);
  const platformName = String(row?.PlatformName || "").trim();

  if (
    Number.isFinite(startAppYear) &&
    Number.isFinite(endAppYear) &&
    platformName
  ) {
    return `${startAppYear}-${endAppYear} ${platformName}`;
  }

  const platformStartYear = Number.parseInt(row?.PlatformStartYear, 10);
  const platformEndYear = Number.parseInt(row?.PlatformEndYear, 10);
  if (
    Number.isFinite(platformStartYear) &&
    Number.isFinite(platformEndYear) &&
    platformName
  ) {
    return `${platformStartYear}-${platformEndYear} ${platformName}`;
  }

  return platformName;
}

export async function GET() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const brand = await getBrandConfig().catch(() => null);
  const brandName = brand?.companyName || brand?.name || "BMR Suspension";

  const [rows] = await pool.query(
    `SELECT
      p.ProductID,
      p.ProductName,
      p.PartNumber,
      p.Description,
      p.Price,
      p.Qty,
      p.ImageLarge,
      p.ImageSmall,
      p.StartAppYear,
      p.EndAppYear,
      m.ManName AS ManufacturerName,
      plat.Name AS PlatformName,
      plat.StartYear AS PlatformStartYear,
      plat.EndYear AS PlatformEndYear
    FROM products p
    LEFT JOIN mans m ON p.ManID = m.ManID
    LEFT JOIN platforms plat ON p.BodyID = plat.PlatformID
    WHERE p.Display = '1'
      AND (p.endproduct IS NULL OR p.endproduct != '1')
    ORDER BY p.ProductID DESC`,
  );

  const itemsXml = (rows || [])
    .map((row) => {
      const fitment = getMerchantFitmentText(row);
      const title = buildMerchantFeedTitle(row, fitment);
      const description = buildMerchantFeedDescription(row, brandName);
      const link = `${siteUrl}/product/${row.ProductID}`;
      const imagePath = row.ImageLarge || row.ImageSmall;
      const imageUrl = toAbsoluteUrl(siteUrl, getProductImageUrl(imagePath));
      const priceNum = Number.parseFloat(row.Price);
      const price = Number.isFinite(priceNum)
        ? `${priceNum.toFixed(2)} USD`
        : "0.00 USD";
      const inStock = Number.parseInt(row.Qty, 10) > 0;
      const partNumber = row.PartNumber ? String(row.PartNumber).trim() : "";
      const feedBrand = row.ManufacturerName || brandName;

      return `
      <item>
        <g:id>${escapeXml(row.ProductID)}</g:id>
        <g:title>${escapeXml(title)}</g:title>
        <g:description>${escapeXml(description)}</g:description>
        <g:link>${escapeXml(link)}</g:link>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>
        <g:availability>${inStock ? "in stock" : "out of stock"}</g:availability>
        <g:price>${escapeXml(price)}</g:price>
        <g:condition>new</g:condition>
        <g:brand>${escapeXml(feedBrand)}</g:brand>
        ${partNumber ? `<g:mpn>${escapeXml(partNumber)}</g:mpn>` : ""}
        <g:identifier_exists>${partNumber ? "yes" : "no"}</g:identifier_exists>
        <g:google_product_category>${escapeXml("Vehicles & Parts > Vehicle Parts & Accessories")}</g:google_product_category>
      </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(brandName)} Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(`${brandName} Google Merchant Center feed`)}</description>${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
