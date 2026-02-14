import React from "react";
import { getPlatformBannerUrl } from "@/lib/assets";

export default function PlatformHeader({
  platformData,
  title = "Select a category to shop through our latest selection of Suspension & Chassis Parts",
  subtitle,
  slug = "platformData.slug",
  mainCategoryName = null,
}) {
  if (!platformData) return null;
  // Format the year display - omit when StartYear is 0 or "0" to avoid "0-" prefix
  const startYear = platformData.StartYear;
  const endYear = platformData.EndYear;
  const hasValidYear =
    startYear &&
    startYear !== "0" &&
    String(startYear).trim() !== "" &&
    parseInt(startYear, 10) > 0;
  const yearDisplay = hasValidYear
    ? startYear === endYear
      ? startYear
      : `${startYear}-${endYear || ""}`
    : "";

  // Prefer HeaderImage from DB, fall back to slug-based naming: platform-slug_Banner.jpg
  const imageUrl =
    platformData.HeaderImage && platformData.HeaderImage !== "0"
      ? getPlatformBannerUrl(platformData.HeaderImage)
      : platformData.slug
        ? getPlatformBannerUrl(`${platformData.slug}_Banner.jpg`)
        : null;
  const encodedImageUrl = imageUrl ? encodeURI(imageUrl) : null;

  // Use mainCategoryName prop if provided, otherwise fall back to platformData.mainCategory
  const displayMainCategory =
    mainCategoryName ||
    (platformData.mainCategory &&
      platformData.mainCategory.charAt(0).toUpperCase() +
        platformData.mainCategory.slice(1));

  return (
    <div className="platform-header-wrapper">
      <div className="container-fluid p-0 m-0">
        <div
          className="platform-header-container"
          style={{
            backgroundColor: "#000",
            ...(encodedImageUrl && {
              backgroundImage: `url(${encodedImageUrl})`,
            }),
          }}
        >
          <div className="platform-header-overlay" />
          <div className="platform-header-content">
            <div className="container">
              <h1 className="platform-header-title">
                {yearDisplay && (
                  <>
                    {yearDisplay}
                    <br />
                  </>
                )}
                {platformData.Name} {displayMainCategory && displayMainCategory}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Responsive styles (can be moved to SCSS if desired)
// @media (max-width: 768px) {
//   .platform-header-container { flex-direction: column !important; }
//   .platform-header-left, .platform-header-image { width: 100% !important; min-height: 180px !important; }
//   .platform-header-title { font-size: 2.2rem !important; text-align: center !important; }
// }
