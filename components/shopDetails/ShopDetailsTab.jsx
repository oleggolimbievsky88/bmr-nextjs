"use client";

import { useState } from "react";
import Link from "next/link";
import { getInstallUrl } from "@/lib/assets";

function FeatureCards({ items }) {
  if (!items) return null;

  let list = [];
  if (Array.isArray(items)) {
    list = items.map((x) => String(x || "").trim()).filter(Boolean);
  } else if (typeof items === "string") {
    const str = items.trim();
    if (!str) return null;

    if (str.includes("<li")) {
      return (
        <div
          className="pdpFeatureCards pdpFeatureCards--html"
          dangerouslySetInnerHTML={{ __html: str }}
        />
      );
    }

    list = str
      .replace(/\r/g, "")
      .split(/\n|•|- |\u2022/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (!list.length) return null;

  return (
    <div className="pdpFeatureCards">
      <div className="pdpFeatureCards__grid">
        {list.slice(0, 24).map((text, idx) => (
          <div className="pdpFeatureCards__card" key={`${idx}-${text}`}>
            <div className="pdpFeatureCards__icon" aria-hidden="true">
              ✓
            </div>
            <div className="pdpFeatureCards__text">{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopDetailsTab({ product, vehicles = [] }) {
  const descHtml = product?.Description || "";
  const lines = descHtml.split(/\r?\n/);
  const bulletIndex = lines.findIndex((line) => /^\s*[-•*]\s+/.test(line));
  let descPart = "";
  let featuresArr = [];
  if (bulletIndex !== -1) {
    descPart = lines.slice(0, bulletIndex).join(" ");
    featuresArr = lines
      .slice(bulletIndex)
      .filter((line) => /^\s*[-•*]\s+/.test(line))
      .map((line) => line.replace(/^\s*[-•*]\s+/, "").trim());
  } else {
    descPart = descHtml;
  }

  // Try to normalize features into an array (works for HTML <ul><li>, newline bullets, etc.)
  const normalizeFeatures = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter(Boolean);

    const str = String(input);

    // 1) If it's HTML, try to pull <li>...</li>
    if (/<li[\s>]/i.test(str)) {
      const liMatches = [...str.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      const cleaned = liMatches
        .map((m) =>
          m[1]
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean);
      if (cleaned.length) return cleaned;
    }

    // 2) Split by new lines and strip common bullet prefixes
    return str
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-•*]\s+/, "").trim())
      .filter(Boolean);
  };

  const featuresList =
    normalizeFeatures(product?.Features).length > 0
      ? normalizeFeatures(product?.Features)
      : normalizeFeatures(featuresArr);

  const hasFeatures = featuresList.length > 0;
  const hasPlatforms =
    Array.isArray(product?.platforms) && product.platforms.length > 0;
  const hasFitment =
    (Array.isArray(vehicles) && vehicles.length > 0) || hasPlatforms;
  const hasInstallation =
    product?.Instructions &&
    product?.Instructions !== "0" &&
    product?.Instructions !== 0;

  const tabs = [
    { id: "description", title: "Description" },
    ...(hasFeatures ? [{ id: "features", title: "Features" }] : []),
    ...(hasInstallation ? [{ id: "installation", title: "Installation" }] : []),
    ...(hasFitment ? [{ id: "fitment", title: "Fitment" }] : []),
  ];

  const [currentTab, setCurrentTab] = useState(tabs[0]?.id || "description");

  return (
    <section
      className="flat-spacing-17 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-has-border">
              <ul className="widget-menu-tab">
                {tabs.map((tab) => (
                  <li
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`item-title ${
                      currentTab === tab.id ? "active" : ""
                    }`}
                  >
                    <span className="inner">{tab.title}</span>
                  </li>
                ))}
              </ul>
              <div className="widget-content-tab">
                {currentTab === "description" && (
                  <div className="widget-content-inner active">
                    <div>
                      <div
                        dangerouslySetInnerHTML={{ __html: descPart }}
                        style={{
                          fontSize: "16px !important",
                          color: "black !important",
                          lineHeight: "25px !important",
                        }}
                      />
                      {hasFeatures && (
                        <>
                          <div className="pdpSectionDivider" />
                          <h4 className="pdpSectionTitle">Key Features</h4>
                          <FeatureCards items={featuresList} />
                        </>
                      )}
                    </div>
                  </div>
                )}
                {currentTab === "features" && hasFeatures && (
                  <div className="widget-content-inner active">
                    <div className="pdpFeatures">
                      <div className="pdpFeatures__header">
                        <h4 className="pdpFeatures__title">Key Features</h4>
                        <p className="pdpFeatures__subtitle">
                          Quick highlights for this part.
                        </p>
                      </div>

                      <div className="pdpFeatures__grid">
                        {featuresList.map((feature, idx) => (
                          <div key={idx} className="pdpFeatures__item">
                            <span className="pdpFeatures__icon" aria-hidden>
                              <i className="bi bi-check2" />
                            </span>
                            <span className="pdpFeatures__text">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {currentTab === "installation" && hasInstallation && (
                  <div className="widget-content-inner active">
                    <div className="pdpInstall">
                      <div className="pdpInstall__card">
                        <div className="pdpInstall__left">
                          <div className="pdpInstall__icon" aria-hidden>
                            <i className="bi bi-file-earmark-pdf" />
                          </div>
                          <div className="pdpInstall__text">
                            <h4 className="pdpInstall__title">
                              Installation Instructions
                            </h4>
                            <p className="pdpInstall__subtitle">
                              PDF instructions for{" "}
                              <strong>{product?.PartNumber}</strong>.
                            </p>
                          </div>
                        </div>

                        <a
                          href={getInstallUrl(product.Instructions)}
                          className="pdpInstall__btn text-decoration-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View / Download PDF{" "}
                          <i className="bi bi-arrow-up-right" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {currentTab === "fitment" && hasFitment && (
                  <div className="widget-content-inner active">
                    <div className="fitment-content">
                      {hasPlatforms && (
                        <div className="fitment-platforms mb-4">
                          <p className="fitment-platforms-title">
                            Fits these platforms:
                          </p>
                          <div className="fitment-pills">
                            {product.platforms.map((pl) => {
                              const slug =
                                pl.slug ||
                                (pl.name || "")
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/\//g, "-");
                              const appStart =
                                product?.StartAppYear &&
                                String(product.StartAppYear).trim() !== "" &&
                                parseInt(product.StartAppYear, 10) > 0
                                  ? product.StartAppYear
                                  : pl.startYear;
                              const appEnd =
                                product?.EndAppYear &&
                                String(product.EndAppYear).trim() !== "" &&
                                parseInt(product.EndAppYear, 10) > 0
                                  ? product.EndAppYear
                                  : pl.endYear;
                              const label =
                                appStart && appEnd && appStart !== "0"
                                  ? `${appStart}-${appEnd} ${pl.name || ""}`
                                  : pl.name || "";
                              return (
                                <Link
                                  key={pl.bodyId ?? pl.BodyID ?? pl.name}
                                  href={`/products/${slug}`}
                                  className="fitment-pill text-decoration-none"
                                >
                                  {label.trim() || slug}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {Array.isArray(vehicles) && vehicles.length > 0 && (
                        <div className="row">
                          <div className="col-12">
                            <div className="table-responsive fitment-table-wrap">
                              <table className="table fitment-table">
                                <thead>
                                  <tr>
                                    <th scope="col">Year Range</th>
                                    <th scope="col">Make</th>
                                    <th scope="col">Model</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {vehicles.map((vehicle, index) => {
                                    const startApp = product?.StartAppYear
                                      ? parseInt(
                                          String(product.StartAppYear).trim(),
                                          10,
                                        )
                                      : 0;
                                    const endApp = product?.EndAppYear
                                      ? parseInt(
                                          String(product.EndAppYear).trim(),
                                          10,
                                        )
                                      : 0;
                                    const useProductYears =
                                      Number.isFinite(startApp) &&
                                      Number.isFinite(endApp) &&
                                      startApp > 0 &&
                                      endApp > 0;
                                    const yearRange = useProductYears
                                      ? `${product.StartAppYear} - ${product.EndAppYear}`
                                      : `${vehicle.StartYear} - ${vehicle.EndYear}`;
                                    return (
                                      <tr key={vehicle.VehicleID ?? index}>
                                        <td>
                                          <strong>{yearRange}</strong>
                                        </td>
                                        <td>{vehicle.Make}</td>
                                        <td>{vehicle.Model}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
