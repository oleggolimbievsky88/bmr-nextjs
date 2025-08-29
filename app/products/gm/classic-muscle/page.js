import Link from "next/link";
import Image from "next/image";
import { getGMPlatformsWithVehicles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GMClassicMusclePage() {
  const platforms = await getGMPlatformsWithVehicles();
  const list = platforms.filter((p) => p.bodyCatName?.includes("GM Classic Muscle"));

  return (
    <div className="container pt-3 pb-5" style={{ minHeight: "60vh" }}>
      <div className="text-center">
        <h1 className="home-title d-inline-block" style={{ lineHeight: "30px", marginTop: "30px" }}>GM Classic Muscle Cars</h1>
      </div>
      <p className="text-center text_black-2 mt-1 mb-5">Explore classic GM muscle platforms we support.</p>

      <div className="row g-3 g-sm-4 justify-content-center">
        {list.map((p) => (
          <div className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex" key={p.id}>
            <Link href={`/products/${p.slug}`} className="text-decoration-none w-100">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden platform-card">
                <div className="ratio ratio-1x1 position-relative p-3" style={{ backgroundColor: "#ffffff" }}>
                  <Image src={p.image} alt={`${p.startYear}-${p.endYear} ${p.name}`} fill sizes="(max-width: 576px) 35vw, (max-width: 768px) 22vw, (max-width: 1200px) 16vw, 12vw" className="object-fit-contain" style={{ objectFit: "contain" }} />
                </div>
                <div className="card-body p-2 text-center bg-light" style={{ borderTop: "1px solid #e9ecef" }}>
                  <div className="fw-semibold small text-uppercase text-muted">{p.startYear === p.endYear ? p.startYear : `${p.startYear} - ${p.endYear}`}</div>
                  <div className="text-dark fw-semibold">{p.name}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
