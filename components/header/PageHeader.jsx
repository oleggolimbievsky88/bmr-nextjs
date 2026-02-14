import React from "react";

export default function PageHeader({
  title,
  subtitle = null,
  subtitleAsSecondary = false,
}) {
  if (!title) return null;
  if (title === "ABOUT BMR") return null;

  // Use the same banner image as installation page or fallback
  const imageUrl = `/images/slider/S650 Mustang_Banner.jpg`;

  // URL encode the image URL to handle spaces and special characters
  const encodedImageUrl = imageUrl ? encodeURI(imageUrl) : imageUrl;

  return (
    <section className="installation-hero">
      <div className="installation-hero-bg">
        <div className="installation-hero-content">
          <div className="container">
            <h1 className="installation-hero-title">
              {title}
              {subtitle &&
                (subtitleAsSecondary ? (
                  <span className="installation-hero-subtitle">{subtitle}</span>
                ) : (
                  <>
                    <br />
                    {subtitle}
                  </>
                ))}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
