import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/assets";

export default function CategoryGrid({
  categories = [],
  platform,
  isSubCategory = false,
  mainCategory,
  hideEmpty = true,
}) {
  // Only show categories that have products (unless hideEmpty is false)
  const safeCategories = (Array.isArray(categories) ? categories : []).filter(
    (c) => !hideEmpty || (c.productCount ?? 0) > 0,
  );
  return (
    <div className="container m-0 p-0">
      <div className="row m-0 p-0">
        {safeCategories.map((category, index) => {
          // For main categories, use name property
          // For subcategories, use CatName or name property
          const categoryName = category.name || category.CatName;
          const categoryId = category.id || category.CatID;
          const categoryImage = category.image || category.CatImage;
          const categorySlug =
            category.slug ||
            category.CatSlug ||
            category.CatNameSlug ||
            categoryName.toLowerCase().replace(/\s+/g, "-");
          const href = isSubCategory
            ? `/products/${platform}/${mainCategory}/${categorySlug}`
            : mainCategory
              ? `/products/${platform}/${mainCategory}/${categoryId}`
              : `/products/${platform}/${categorySlug}`;

          if (!categoryName) {
            console.warn(`⚠️ Skipping category at index ${index}:`, category);
            return null;
          }

          return (
            <div
              key={categoryId || index}
              className="col-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3 mb-4"
            >
              <div className="card category-card flex-row align-items-center rounded-4 w-100 p-2">
                <Link
                  href={href}
                  className="d-flex align-items-center text-decoration-none"
                >
                  {categoryImage &&
                    (() => {
                      const imageUrl = getCategoryImageUrl(categoryImage);
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={categoryName}
                          width={100}
                          height={90}
                          className="category-card-img flex-shrink-0 me-3"
                          style={{
                            objectFit: "contain",
                            width: "100px",
                            height: "90px",
                            borderRadius: "0.75rem",
                            background: "#ffffff",
                          }}
                        />
                      ) : null;
                    })()}
                  <span className="category-title">{categoryName}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
