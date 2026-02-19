import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./ProductCategories.module.css";
import { getBrandConfig } from "@/lib/brandConfig";

const DEFAULT_CARDS = [
  {
    href: "/products/new",
    title: "New Products",
    subtitle: "Latest releases",
    img: "/images/shop-categories/NewProductsGradient.jpg",
  },
  {
    href: "/products/bmr-merchandise",
    title: "BMR Merchandise",
    subtitle: "Apparel & more",
    img: "/images/shop-categories/MerchGradient.jpg",
  },
  {
    href: "/products/gift-cards",
    title: "BMR Gift Cards",
    subtitle: "Perfect gift",
    img: "/images/shop-categories/GiftCardsGradient.jpg",
  },
];

export default async function ShopCategories() {
  const brand = await getBrandConfig();

  const accent = brand.buttonBadgeColor || brand.themeColor || "#ffd400";
  const onAccent = brand.buttonBadgeTextColor || "#000000";

  const brandVars = {
    "--brand-accent": accent,
    "--brand-on-accent": onAccent,
  };

  const section = brand.shopByCategory || {};
  const sectionTitle = section.sectionTitle?.trim() || "Shop by Category";
  const sectionSubtitle =
    section.sectionSubtitle?.trim() ||
    "Browse our New Products, BMR Merchandise, and Gift Cards.";
  const cards =
    Array.isArray(section.items) && section.items.length > 0
      ? section.items
      : DEFAULT_CARDS;

  return (
    <section className="homepage-section">
      <div className="container">
        <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

        <div className="row mt-4">
          {cards.map((c) => (
            <div className="col-md-4 mb-4" key={c.href || c.title}>
              <Link href={c.href || "#"} className={styles.cardLink}>
                <div className={styles.categoryCard} style={brandVars}>
                  <Image
                    src={
                      c.img || "/images/shop-categories/NewProductsGradient.jpg"
                    }
                    alt={c.title || "Category"}
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={styles.overlay} />
                  <div className={styles.content}>
                    <div className={styles.textBlock}>
                      <h3 className={styles.title}>{c.title}</h3>
                      <p className={styles.subtitle}>{c.subtitle}</p>
                    </div>
                    <span className={styles.cta}>Shop now →</span>
                  </div>
                  <div className={styles.accentBar} />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
