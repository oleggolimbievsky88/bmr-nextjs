import Link from "next/link";
import SectionHeader from "@/components/common/SectionHeader";

export default function ThreeColumnLayout({ shopByMake }) {
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
            shopNowLabel: "SHOP NOW",
          },
          {
            imagePath: "/images/logo/gm_logo.png",
            title: "GM",
            link: "products/gm",
            shopNowLabel: "SHOP NOW",
          },
          {
            imagePath: "/images/logo/dodge_logo.png",
            title: "Dodge",
            link: "products/mopar",
            shopNowLabel: "SHOP NOW",
          },
        ];

  return (
    <section className="homepage-section">
      <div className="container three-column-layout">
        <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />
        <div className="row mt-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="col-lg-4 col-md-6 col-sm-12 three-column-card"
            >
              <Link href={`/${(item.link || "").replace(/^\/+/, "")}`}>
                <div className="card text-white border-0 custom-card mb-15">
                  <img
                    src={item.imagePath || item.img || ""}
                    className="card-img"
                    alt={item.title || ""}
                    style={{
                      height: "210px",
                      width: "450px",
                      borderRadius: "20px",
                      padding: "20px",
                    }}
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-end p-3 image-responsive">
                    <h2 className="card-title mt-0 pt-0 fw-bolder letter-spacing-1 text-white">
                      {item.title || ""}
                    </h2>
                    <span className="shop-now">
                      {item.shopNowLabel || "SHOP NOW"}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
