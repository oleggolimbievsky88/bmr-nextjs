import React from "react";

export default function PageHeader({ title, subtitle = null }) {
  if (!title) return null;

  // Use a default banner image or fallback to solid color
  const imageUrl = `/images/platformHeaders/default_Banner.jpg`;

  // URL encode the image URL to handle spaces and special characters
  const encodedImageUrl = imageUrl ? encodeURI(imageUrl) : imageUrl;

  return (
    <div className="platform-header-wrapper">
      <div className="container">
        <div
          className="platform-header-container"
          style={{
            backgroundImage: `url(${encodedImageUrl})`,
            backgroundColor: "#000", // Fallback solid color if image doesn't exist
          }}
        >
          <div className="platform-header-overlay" />
          <div className="platform-header-content">
            <h1 className="platform-header-title">
              {title}
              {subtitle && (
                <>
                  <br />
                  {subtitle}
                </>
              )}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
