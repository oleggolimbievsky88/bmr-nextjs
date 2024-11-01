"use client";

import { useEffect, useState } from "react";

const tabs = [
  { title: "Description", active: true },
  { title: "Product Specifications", active: false },
  { title: "Vehicle Compatibility", active: false },
  { title: "Installation", active: false },
  // { title: "Reviews", active: false },
];

export default function ShopDetailsTab({ product }) {
  const [currentTab, setCurrentTab] = useState(1);
  console.log("Product:", product);
  const description = product?.Description || "No description available";
  const [vehicleCompatibility, setVehicleCompatibility] = useState([]);

  // Construct the installation PDF URL only if Instructions are available
  const installSrc = product?.Instructions
    ? `https://bmrsuspension.com/siteart/install/${product.Instructions}`
    : null;

  // Fetch vehicle compatibility data for the product's platform
  useEffect(() => {
    async function fetchVehicleCompatibility() {
      try {
        const res = await fetch(`/api/platform/${product.BodyID}/vehicles`);
        if (!res.ok) throw new Error("Failed to fetch vehicle compatibility");

        const data = await res.json();
        setVehicleCompatibility(data); // Store the vehicle compatibility data
      } catch (error) {
        console.error("Error fetching vehicle compatibility:", error);
      }
    }

    // Only fetch if product.PlatformID is defined
    if (product.BodyID) {
      fetchVehicleCompatibility();
    }
  }, [product.BodyID]);
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
                  <div className="">
                    <p className="mb_30">
                      {description ? description : "Product Description"}
                    </p>
                    <div className="tf-product-des-demo">
                      <div className="right">
                        <h3 className="fs-16 fw-5">Features</h3>
                        <ul>
                          <li>Strengthens steering components</li>
                          <li>Adjustable</li>
                          <li>Manufactured from heavy-duty, lightweight 6061 aluminum</li>
                          <li>Strengthens steering components</li>
                          <li>Adjustable</li>
                        </ul>
                      </div>
                      {/* <div className="left">
                        <h3 className="fs-16 fw-5">Materials Care</h3>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-machine" />
                          </div>
                          <span>Machine wash max. 30ºC. Short spin.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-iron" />
                          </div>
                          <span>Iron maximum 110ºC.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-bleach" />
                          </div>
                          <span>Do not bleach/bleach.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-dry-clean" />
                          </div>
                          <span>Do not dry clean.</span>
                        </div>
                        <div className="d-flex gap-10 align-items-center">
                          <div className="icon">
                            <i className="icon-tumble-dry" />
                          </div>
                          <span>Tumble dry, medium hear.</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 2 ? "active" : ""
                  } `}
                >
                  <table className="tf-pr-attrs">
                    <tbody>
                      <tr className="tf-attr-pa-color">
                        <th className="tf-attr-label">Available Colors</th>
                        <td className="tf-attr-value">
                          <p>Red, Black Hammertone</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Bushing Included</th>
                        <td className="tf-attr-value">
                          <p>Yes</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Control Arm Style</th>
                        <td className="tf-attr-value">
                          <p>Tubular</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Control Arm Material</th>
                        <td className="tf-attr-value">
                          <p>DOM chromoly steel</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Adjustable</th>
                        <td className="tf-attr-value">
                          <p>No</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Bushing Material</th>
                        <td className="tf-attr-value">
                          <p>Polyurethane</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Quantity</th>
                        <td className="tf-attr-value">
                          <p>Sold as a pair</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 3 ? "active" : ""
                  } `}
                >
                  <table className="tf-pr-attrs">
                    <thead>
                      <tr>
                        <th>Year Range</th>
                        <th>Make</th>
                        <th>Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleCompatibility.length > 0 ? (
                        vehicleCompatibility.map((vehicle) => (
                          <tr key={vehicle.VehicleID}>
                            <td>{`${vehicle.StartYear} - ${vehicle.EndYear}`}</td>
                            <td>{vehicle.Make}</td>
                            <td>{vehicle.Model}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">
                            No vehicle compatibility information available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Installation Tab */}
                <div className={`widget-content-inner ${currentTab === 4 ? "active" : ""}`}>
                  <div className="installation-section">
                    {installSrc ? (
                      <>
                        {/* Thumbnail for PDF */}
                        <div className="installation-thumbnail">
                          <a href={installSrc} target="_blank" rel="noopener noreferrer">
                            <img
                              src={`https://bmrsuspension.com/siteart/products/${product.ImageLarge}` || "/default-thumbnail.jpg"}
                              alt="Installation Manual Thumbnail"
                            />
                          </a>
                        </div>

                        {/* Download Link for PDF */}
                        <div className="installation-download">
                          <a
                            href={installSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-btn"
                          >
                            View Installation Manual (PDF)
                          </a>
                        </div>
                      </>
                    ) : (
                      <p>No installation instructions available</p>
                    )}
                  </div>
                </div>

                {/* <div
                  className={`widget-content-inner ${
                    currentTab == 5 ? "active" : ""
                  } `}
                >
                  <ul className="d-flex justify-content-center mb_18">
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M8.7 30.7h22.7c.3 0 .6-.2.7-.6l4-25.3c-.1-.4-.3-.7-.7-.8s-.7.2-.8.6L34 8.9l-3-1.1c-2.4-.9-5.1-.5-7.2 1-2.3 1.6-5.3 1.6-7.6 0-2.1-1.5-4.8-1.9-7.2-1L6 8.9l-.7-4.3c0-.4-.4-.7-.7-.6-.4.1-.6.4-.6.8l4 25.3c.1.3.3.6.7.6zm.8-21.6c2-.7 4.2-.4 6 .8 1.4 1 3 1.5 4.6 1.5s3.2-.5 4.6-1.5c1.7-1.2 4-1.6 6-.8l3.3 1.2-3 19.1H9.2l-3-19.1 3.3-1.2zM32 32H8c-.4 0-.7.3-.7.7s.3.7.7.7h24c.4 0 .7-.3.7-.7s-.3-.7-.7-.7zm0 2.7H8c-.4 0-.7.3-.7.7s.3.6.7.6h24c.4 0 .7-.3.7-.7s-.3-.6-.7-.6zm-17.9-8.9c-1 0-1.8-.3-2.4-.6l.1-2.1c.6.4 1.4.6 2 .6.8 0 1.2-.4 1.2-1.3s-.4-1.3-1.3-1.3h-1.3l.2-1.9h1.1c.6 0 1-.3 1-1.3 0-.8-.4-1.2-1.1-1.2s-1.2.2-1.9.4l-.2-1.9c.7-.4 1.5-.6 2.3-.6 2 0 3 1.3 3 2.9 0 1.2-.4 1.9-1.1 2.3 1 .4 1.3 1.4 1.3 2.5.3 1.8-.6 3.5-2.9 3.5zm4-5.5c0-3.9 1.2-5.5 3.2-5.5s3.2 1.6 3.2 5.5-1.2 5.5-3.2 5.5-3.2-1.6-3.2-5.5zm4.1 0c0-2-.1-3.5-.9-3.5s-1 1.5-1 3.5.1 3.5 1 3.5c.8 0 .9-1.5.9-3.5zm4.5-1.4c-.9 0-1.5-.8-1.5-2.1s.6-2.1 1.5-2.1 1.5.8 1.5 2.1-.5 2.1-1.5 2.1zm0-.8c.4 0 .7-.5.7-1.2s-.2-1.2-.7-1.2-.7.5-.7 1.2.3 1.2.7 1.2z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M36.7 31.1l-2.8-1.3-4.7-9.1 7.5-3.5c.4-.2.6-.6.4-1s-.6-.5-1-.4l-7.5 3.5-7.8-15c-.3-.5-1.1-.5-1.4 0l-7.8 15L4 15.9c-.4-.2-.8 0-1 .4s0 .8.4 1l7.5 3.5-4.7 9.1-2.8 1.3c-.4.2-.6.6-.4 1 .1.3.4.4.7.4.1 0 .2 0 .3-.1l1-.4-1.5 2.8c-.1.2-.1.5 0 .8.1.2.4.3.7.3h31.7c.3 0 .5-.1.7-.4.1-.2.1-.5 0-.8L35.1 32l1 .4c.1 0 .2.1.3.1.3 0 .6-.2.7-.4.1-.3 0-.8-.4-1zm-5.1-2.3l-9.8-4.6 6-2.8 3.8 7.4zM20 6.4L27.1 20 20 23.3 12.9 20 20 6.4zm-7.8 15l6 2.8-9.8 4.6 3.8-7.4zm22.4 13.1H5.4L7.2 31 20 25l12.8 6 1.8 3.5z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M5.9 5.9v28.2h28.2V5.9H5.9zM19.1 20l-8.3 8.3c-2-2.2-3.2-5.1-3.2-8.3s1.2-6.1 3.2-8.3l8.3 8.3zm-7.4-9.3c2.2-2 5.1-3.2 8.3-3.2s6.1 1.2 8.3 3.2L20 19.1l-8.3-8.4zM20 20.9l8.3 8.3c-2.2 2-5.1 3.2-8.3 3.2s-6.1-1.2-8.3-3.2l8.3-8.3zm.9-.9l8.3-8.3c2 2.2 3.2 5.1 3.2 8.3s-1.2 6.1-3.2 8.3L20.9 20zm8.4-10.2c-1.2-1.1-2.6-2-4.1-2.6h6.6l-2.5 2.6zm-18.6 0L8.2 7.2h6.6c-1.5.6-2.9 1.5-4.1 2.6zm-.9.9c-1.1 1.2-2 2.6-2.6 4.1V8.2l2.6 2.5zM7.2 25.2c.6 1.5 1.5 2.9 2.6 4.1l-2.6 2.6v-6.7zm3.5 5c1.2 1.1 2.6 2 4.1 2.6H8.2l2.5-2.6zm18.6 0l2.6 2.6h-6.6c1.4-.6 2.8-1.5 4-2.6zm.9-.9c1.1-1.2 2-2.6 2.6-4.1v6.6l-2.6-2.5zm2.6-14.5c-.6-1.5-1.5-2.9-2.6-4.1l2.6-2.6v6.7z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M35.1 33.6L33.2 6.2c0-.4-.3-.7-.7-.7H13.9c-.4 0-.7.3-.7.7s.3.7.7.7h18l.7 10.5H20.8c-8.8.2-15.9 7.5-15.9 16.4 0 .4.3.7.7.7h28.9c.2 0 .4-.1.5-.2s.2-.3.2-.5v-.2h-.1zm-28.8-.5C6.7 25.3 13 19 20.8 18.9h11.9l1 14.2H6.3zm11.2-6.8c0 1.2-1 2.1-2.1 2.1s-2.1-1-2.1-2.1 1-2.1 2.1-2.1 2.1 1 2.1 2.1zm6.3 0c0 1.2-1 2.1-2.1 2.1-1.2 0-2.1-1-2.1-2.1s1-2.1 2.1-2.1 2.1 1 2.1 2.1z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M20 33.8c7.6 0 13.8-6.2 13.8-13.8S27.6 6.2 20 6.2 6.2 12.4 6.2 20 12.4 33.8 20 33.8zm0-26.3c6.9 0 12.5 5.6 12.5 12.5S26.9 32.5 20 32.5 7.5 26.9 7.5 20 13.1 7.5 20 7.5zm-.4 15h.5c1.8 0 3-1.1 3-3.7 0-2.2-1.1-3.6-3.1-3.6h-2.6v10.6h2.2v-3.3zm0-5.2h.4c.6 0 .9.5.9 1.7 0 1.1-.3 1.7-.9 1.7h-.4v-3.4z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M30.2 29.3c2.2-2.5 3.6-5.7 3.6-9.3s-1.4-6.8-3.6-9.3l3.6-3.6c.3-.3.3-.7 0-.9-.3-.3-.7-.3-.9 0l-3.6 3.6c-2.5-2.2-5.7-3.6-9.3-3.6s-6.8 1.4-9.3 3.6L7.1 6.2c-.3-.3-.7-.3-.9 0-.3.3-.3.7 0 .9l3.6 3.6c-2.2 2.5-3.6 5.7-3.6 9.3s1.4 6.8 3.6 9.3l-3.6 3.6c-.3.3-.3.7 0 .9.1.1.3.2.5.2s.3-.1.5-.2l3.6-3.6c2.5 2.2 5.7 3.6 9.3 3.6s6.8-1.4 9.3-3.6l3.6 3.6c.1.1.3.2.5.2s.3-.1.5-.2c.3-.3.3-.7 0-.9l-3.8-3.6z"
                        />
                      </svg>
                    </li>
                    <li className="">
                      <svg
                        viewBox="0 0 40 40"
                        width="35px"
                        height="35px"
                        color="#222"
                        margin="5px"
                      >
                        <path
                          fill="currentColor"
                          d="M34.1 34.1H5.9V5.9h28.2v28.2zM7.2 32.8h25.6V7.2H7.2v25.6zm13.5-18.3a.68.68 0 0 0-.7-.7.68.68 0 0 0-.7.7v10.9a.68.68 0 0 0 .7.7.68.68 0 0 0 .7-.7V14.5z"
                        />
                      </svg>
                    </li>
                  </ul>
                  <p className="text-center text-paragraph">
                    LT01: 70% wool, 15% polyester, 10% polyamide, 5% acrylic 900
                    Grms/mt
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
