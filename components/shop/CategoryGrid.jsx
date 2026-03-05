import Link from "next/link";
import { getCategoryImageUrl, getProductImageUrl } from "@/lib/assets";

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
    <div className="m-0 p-0">
      <div className="bm-catGrid">
        {safeCategories.map((cat, index) => {
          const name = cat.CatName || cat.name || "Category";
          const count = cat.productCount ?? cat.count ?? 0;
          const imgSrc = cat.image
            ? getCategoryImageUrl(cat.image)
            : cat.heroImage
              ? getProductImageUrl(cat.heroImage)
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
            <Link key={categoryId} href={href} className="bm-catHero">
              <div className="bm-catHero__media">
                {imgSrc ? (
                  <img src={imgSrc} alt={name} className="bm-catHero__img" />
                ) : null}

                <div className="bm-catHero__sweep" />

                <div className="bm-catHero__overlay" />
                <div className="bm-catHero__vignette" />
                <div className="bm-catHero__carbon" />

                <div className="bm-catHero__top">
                  <span className="bm-catHero__pill">{count} items</span>
                </div>

                <div className="bm-catHero__bottom">
                  <div className="bm-catHero__title">{name}</div>
                  <div className="bm-catHero__cta">
                    Shop <span aria-hidden="true">→</span>
                  </div>
                </div>

                <div className="bm-catHero__accent" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
