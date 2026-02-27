import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./ShopByMake.module.css";
import { getBrandConfig } from "@/lib/brandConfig";
import { getShopByMakeImageUrl } from "@/lib/assets";

export default async function ThreeColumnLayout({ shopByMake }) {
  const brand = await getBrandConfig();
  const accent = brand.buttonBadgeColor || brand.themeColor || "#ffd400";
  const onAccent = brand.buttonBadgeTextColor || "#000";

  const brandVars = {
    "--brand-accent": accent,
    "--brand-on-accent": onAccent,
  };

  const sectionTitle = shopByMake?.sectionTitle || "Shop by Make";
  const sectionSubtitle =
    shopByMake?.sectionSubtitle ||
    "Find parts for Ford, GM, and Dodge platforms.";

  const items =
    Array.isArray(shopByMake?.items) && shopByMake.items.length > 0
      ? shopByMake.items
      : [
          {
            imagePath: "/images/logo/Ford_Logo.png",
            title: "FORD",
            link: "products/ford",
          },
          {
            imagePath: "/images/logo/gm_logo.png",
            title: "GM",
            link: "products/gm",
          },
          {
            imagePath: "/images/logo/dodge_logo.png",
            title: "Dodge",
            link: "products/mopar",
          },
        ];

  return (
    <section className="homepage-section">
      <div className="container">
        <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

        <div className="row mt-4">
          {items.map((item, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-4">
              <Link
                href={`/${(item.link || "").replace(/^\/+/, "")}`}
                className={styles.cardLink}
              >
                <div className={styles.makeCard} style={brandVars}>
                  <Image
                    src={getShopByMakeImageUrl(
                      item.imagePath || item.img || "",
                    )}
                    alt={item.title || ""}
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                  <div className={styles.overlay} />

                  <div className={styles.content}>
                    <h3 className={styles.title}>{item.title || ""}</h3>
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
