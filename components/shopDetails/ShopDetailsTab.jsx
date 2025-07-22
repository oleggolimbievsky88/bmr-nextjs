"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const tabs = [
  { title: "Description", active: true },
  { title: "Features", active: false },
  { title: "Installation", active: false },
  { title: "Fitment", active: false },
];

export default function ShopDetailsTab({ product }) {
  const [currentTab, setCurrentTab] = useState(1);
  console.log("product", product);
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
                          <div className="row">
                            <ul>
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
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 2 ? "active" : ""
                  } `}
                >
                  <div className="row">
                    <ul>
                      {featuresArr.length > 0 && (
                        <div className="tf-product-des-demo">
                          <div className="right">
                            <h2 className="fs-16 fw-5"></h2>
                            <div className="row">
                              <ul>
                                {featuresArr.map((feature, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      fontSize: "15px",
                                      color: "black !important",
                                      lineHeight: "15px",
                                    }}
                                  >
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 3 ? "active" : ""
                  } `}
                >
                  <div>
                    <Link
                      href={`https://www.bmrsuspension.com/siteart/install/${product?.Instructions}`}
                      className="btn btn-danger install-btn"
                      style={{ backgroundColor: "var(--primary) !important" }}
                    >
                      View / Download {product?.PartNumber} Installation
                      Instructions
                    </Link>
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 4 ? "active" : ""
                  } `}
                >
                  Platform ID: {product?.BodyID}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
