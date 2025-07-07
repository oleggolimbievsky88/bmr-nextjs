import React from "react";

export default function PlatformHeader({
  platformData,
  title = "Select a category to shop through our latest selection of Suspension & Chassis Parts",
  subtitle,
  slug = "platformData.slug",
}) {
  if (!platformData) return null;
  console.log("Platform Header Data:", platformData);
  // Format the year display
  const yearDisplay =
    platformData.StartYear === platformData.EndYear
      ? platformData.StartYear
      : `${platformData.StartYear}-${platformData.EndYear}`;

  // Use local image from public/images/platform-headers
  const imageUrl = `/images/platformHeaders/${platformData.slug}_Banner.jpg`;

  return (
    <div className="container-fluid px-0 m-0 p-0">
      <div
        className="platform-header-container"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="platform-header-overlay" />
        <div className="platform-header-content">
          <h1 className="platform-header-title">
            {yearDisplay}
            <br />
            {platformData.Name}
          </h1>
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
