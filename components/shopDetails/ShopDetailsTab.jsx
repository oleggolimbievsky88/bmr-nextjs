"use client";

import { useState } from "react";
import Link from "next/link";
import { getInstallUrl } from "@/lib/assets";

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

  const hasFeatures =
    featuresArr.length > 0 ||
    (product?.Features && String(product.Features).trim() !== "");
  const hasFitment = Array.isArray(vehicles) && vehicles.length > 0;
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

  const featuresContent = product?.Features?.trim()
    ? product.Features
    : featuresArr;

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
                      {featuresArr.length > 0 && (
                        <div className="tf-product-des-demo">
                          <div className="right">
                            <ul className="tf-product-features-list">
                              {featuresArr.map((feature, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    fontSize: "15px",
                                    lineHeight: "20px !important",
                                    color: "black !important",
                                  }}
                                >
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {currentTab === "features" && hasFeatures && (
                  <div className="widget-content-inner active">
                    {typeof featuresContent === "string" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: featuresContent }}
                        style={{
                          fontSize: "15px",
                          lineHeight: "20px",
                          color: "black",
                        }}
                      />
                    ) : (
                      Array.isArray(featuresContent) &&
                      featuresContent.length > 0 && (
                        <div className="tf-product-des-demo">
                          <div className="right">
                            <ul className="tf-product-features-list">
                              {featuresContent.map((feature, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    fontSize: "15px",
                                    color: "black !important",
                                    lineHeight: "20px !important",
                                  }}
                                >
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
                {currentTab === "installation" && hasInstallation && (
                  <div className="widget-content-inner active">
                    <div>
                      <Link
                        href={getInstallUrl(product.Instructions)}
                        className="btn btn-danger install-btn"
                        style={{
                          backgroundColor: "var(--primary) !important",
                          color: "white !important",
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View / Download {product?.PartNumber} Installation
                        Instructions
                      </Link>
                    </div>
                  </div>
                )}
                {currentTab === "fitment" && hasFitment && (
                  <div className="widget-content-inner active">
                    <div>
                      <div className="row">
                        <div className="col-12">
                          <div className="table-responsive">
                            <table className="table table-striped table-hover">
                              <thead className="table-dark">
                                <tr>
                                  <th scope="col">Make</th>
                                  <th scope="col">Model</th>
                                  <th scope="col">Year Range</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vehicles.map((vehicle, index) => (
                                  <tr key={index}>
                                    <td>
                                      <strong>{vehicle.Make}</strong>
                                    </td>
                                    <td>{vehicle.Model}</td>
                                    <td>
                                      {vehicle.StartYear} - {vehicle.EndYear}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
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
