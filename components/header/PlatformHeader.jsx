import React from "react";

export default function PlatformHeader({
  platformData,
  title = "Select a category to shop through our latest selection of Suspension & Chassis Parts",
  subtitle,
  slug = "platformData.slug",
  mainCategoryName = null,
}) {
  if (!platformData) return null;
  console.log("Platform Header Data:", platformData);
  // Format the year display
  const yearDisplay =
    platformData.StartYear === platformData.EndYear
      ? platformData.StartYear
      : `${platformData.StartYear}-${platformData.EndYear}`;

  // Use local platform header images with the naming convention: platform-slug_Banner.jpg
  const imageUrl = `/images/platformHeaders/${platformData.slug}_Banner.jpg`;

  // URL encode the image URL to handle spaces and special characters
  const encodedImageUrl = imageUrl ? encodeURI(imageUrl) : imageUrl;

  console.log("Platform Header Image URL:", imageUrl);
  console.log("Encoded Platform Header Image URL:", encodedImageUrl);

  // Use mainCategoryName prop if provided, otherwise fall back to platformData.mainCategory
  const displayMainCategory =
    mainCategoryName ||
    (platformData.mainCategory &&
      platformData.mainCategory.charAt(0).toUpperCase() +
        platformData.mainCategory.slice(1));

  return (
    <div className="platform-header-wrapper">
      <div className="container">
        <div
          className="platform-header-container"
          style={{
            backgroundImage: `url(${encodedImageUrl})`,
          }}
        >
          <div className="platform-header-overlay" />
          <div className="platform-header-content">
            <h1 className="platform-header-title">
              {yearDisplay}
              <br />
              {platformData.Name} {displayMainCategory && displayMainCategory}
            </h1>
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
