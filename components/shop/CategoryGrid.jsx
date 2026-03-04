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
          const productCount =
            category.productCount ??
            category.ProductCount ??
            category.CatProductCount ??
            0;
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

          const imageUrl = categoryImage
            ? getCategoryImageUrl(categoryImage)
            : null;

          return (
            <div
              key={categoryId || index}
              className="col-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3 mb-4"
            >
              <Link href={href} className="bm-catTile">
                <div className="bm-catTile__icon">
                  {imageUrl ? (
                    <img src={imageUrl} alt={categoryName} />
                  ) : (
                    <span aria-hidden>{categoryName?.[0] ?? ""}</span>
                  )}
                </div>
                <div className="bm-catTile__content">
                  <div className="bm-catTile__title">{categoryName}</div>
                  <div className="bm-catTile__meta">{productCount} items</div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
