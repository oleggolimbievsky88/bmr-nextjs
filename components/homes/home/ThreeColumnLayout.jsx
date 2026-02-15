import Link from "next/link";
import SectionHeader from "@/components/common/SectionHeader";

export default function ThreeColumnLayout() {
  return (
    <section className="homepage-section">
      <div className="container three-column-layout">
        <SectionHeader
          title="Shop by Make"
          subtitle="Find parts for Ford, GM, and Dodge platforms."
        />
        <div className="row mt-4">
          {[
            {
              img: "/images/logo/Ford_Logo.png",
              title: "FORD",
              link: "products/ford",
            },
            {
              img: "/images/logo/gm_logo.png",
              title: "GM",
              link: "products/gm",
            },
            {
              img: "/images/logo/dodge_logo.png",
              title: "Dodge",
              link: "products/mopar",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="col-lg-4 col-md-6 col-sm-12 three-column-card"
            >
              <Link href={`/${item.link}`}>
                <div className="card text-white border-0 custom-card mb-15">
                  <img
                    src={item.img}
                    className="card-img"
                    alt={item.title}
                    style={{
                      height: "210px",
                      width: "450px",
                      borderRadius: "20px",
                      padding: "20px",
                    }}
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-end p-3 image-responsive">
                    <h2 className="card-title mt-0 pt-0 fw-bolder letter-spacing-1 text-white">
                      {item.title}
                    </h2>
                    <span className="shop-now">SHOP NOW</span>
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
