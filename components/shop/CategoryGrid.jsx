import Link from "next/link";
import { getCategoryImageUrl, getProductImageUrl } from "@/lib/assets";

export default function CategoryGrid({
  categories = [],
  platform,
  isSubCategory = false,
  mainCategory,
  hideEmpty = true,
}) {
  const getCategoryCount = (cat) => {
    const countValue = cat?.productCount ?? cat?.count ?? 0;
    const numericCount = Number(countValue);
    return Number.isFinite(numericCount) ? numericCount : 0;
  };

  const isFeaturedCategory = (cat) =>
    Boolean(
      cat?.isFeatured ??
      cat?.featured ??
      cat?.Featured ??
      cat?.featuredCategory ??
      cat?.featuredFlag ??
      cat?.FeaturedFlag ??
      cat?.is_featured ??
      false,
    );

  const resolveImageValue = (value) => {
    if (value == null) return "";
    const normalized = String(value).trim();
    return normalized && normalized !== "0" ? normalized : "";
  };

  // Only show categories that have products (unless hideEmpty is false)
  const safeCategories = (Array.isArray(categories) ? categories : []).filter(
    (c) => !hideEmpty || getCategoryCount(c) > 0,
  );

  const sortedCategories = [...safeCategories].sort((a, b) => {
    const featuredDiff =
      Number(isFeaturedCategory(b)) - Number(isFeaturedCategory(a));
    if (featuredDiff !== 0) {
      return featuredDiff;
    }

    const countDiff = getCategoryCount(b) - getCategoryCount(a);
    if (countDiff !== 0) {
      return countDiff;
    }

    const nameA = (a?.CatName || a?.name || "").toString();
    const nameB = (b?.CatName || b?.name || "").toString();
    return nameA.localeCompare(nameB);
  });
  return (
    <div className="container m-0 p-0">
      <div className="bm-catGridClean">
        {sortedCategories.map((cat, index) => {
          const name = cat.CatName || cat.name || "Category";
          const count = getCategoryCount(cat);
          const categoryImage = resolveImageValue(cat.image);
          const heroImage = resolveImageValue(cat.heroImage);
          const imgSrc = categoryImage
            ? getCategoryImageUrl(categoryImage)
            : heroImage
              ? getProductImageUrl(heroImage)
              : "";
          const categoryId = cat.id || cat.CatID || index;
          const categorySlug =
            cat.slug ||
            cat.CatSlug ||
            cat.CatNameSlug ||
            name.toLowerCase().replace(/\s+/g, "-");
          const href = isSubCategory
            ? `/products/${platform}/${mainCategory}/${categorySlug}`
            : mainCategory
              ? `/products/${platform}/${mainCategory}/${categoryId}`
              : `/products/${platform}/${categorySlug}`;

          return (
            <Link key={categoryId} href={href} className="bm-catCardClean">
              <div className="bm-catCardClean__media">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={name}
                    className="bm-catCardClean__img"
                    loading="lazy"
                  />
                ) : (
                  <span className="bm-catCardClean__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="presentation">
                      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
                      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
                      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
                      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
                    </svg>
                  </span>
                )}
              </div>

              <div className="bm-catCardClean__body">
                <div className="bm-catCardClean__title">{name}</div>
                <div className="bm-catCardClean__meta">{count} items</div>
              </div>

              <div className="bm-catCardClean__arrow">→</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
