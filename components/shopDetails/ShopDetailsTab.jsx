"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShopDetailsTab({ product, vehicles = [] }) {
  const tabs = [
    { title: "Description", active: true },
    { title: "Features", active: false },
    ...(product?.Instructions &&
    product?.Instructions !== "0" &&
    product?.Instructions !== 0
      ? [{ title: "Installation", active: false }]
      : []),
    { title: "Fitment", active: false },
  ];

  const [currentTab, setCurrentTab] = useState(1);
  console.log("product", product);
  console.log("vehicles data:", vehicles);
  console.log("vehicles length:", vehicles.length);

  // Calculate the fitment tab number dynamically
  const fitmentTabNumber =
    product?.Instructions &&
    product?.Instructions !== "0" &&
    product?.Instructions !== 0
      ? 4
      : 3;
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
                {tabs.map((elm, i) => (
                  <li
                    key={i}
                    onClick={() => setCurrentTab(i + 1)}
                    className={`item-title ${
                      currentTab == i + 1 ? "active" : ""
                    } `}
                  >
                    <span className="inner">{elm.title}</span>
                  </li>
                ))}
              </ul>
              <div className="widget-content-tab">
                <div
                  className={`widget-content-inner ${
                    currentTab == 1 ? "active" : ""
                  } `}
                >
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
                          <h2
                            className="fs-16 fw-5"
                            style={{
                              fontFamily: "impact",
                              color: "black !important",
                              letterSpacing: "1px",
                              fontSize: "16px !important",
                            }}
                          ></h2>
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
                <div
                  className={`widget-content-inner ${
                    currentTab == 2 ? "active" : ""
                  } `}
                >
                  {featuresArr.length > 0 && (
                    <div className="tf-product-des-demo">
                      <div className="right">
                        <h2 className="fs-16 fw-5"></h2>
                        <ul className="tf-product-features-list">
                          {featuresArr.map((feature, idx) => (
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
                  )}
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 3 ? "active" : ""
                  } `}
                >
                  <div>
                    {product?.Instructions &&
                      product?.Instructions !== "0" &&
                      product?.Instructions !== 0 && (
                        <Link
                          href={
                            product.Instructions.startsWith("inst_")
                              ? `/instructions/${product.Instructions}`
                              : `https://www.bmrsuspension.com/siteart/install/${product.Instructions}`
                          }
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
                      )}
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == fitmentTabNumber ? "active" : ""
                  } `}
                >
                  <div>
                    <div className="row">
                      {vehicles.length > 0 ? (
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
                      ) : (
                        <div className="col-12">
                          <p>
                            No vehicle fitment data available for this product.
                          </p>
                          <p>Debug: vehicles array is empty or undefined</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
