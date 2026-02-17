"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LanguageSelect from "../common/LanguageSelect";
import { usePathname } from "next/navigation";

export default function MobileMenu() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const offcanvasRef = useRef(null);
  const isLoggedIn = status !== "loading" && !!session;
  const accountHref = session?.user?.role === "admin" ? "/admin" : "/my-account";
  const [menuData, setMenuData] = useState({
    fordLinks: [],
    moparLinks: [],
    gmLateModelLinks: [],
    gmMidMuscleLinks: [],
    gmClassicMuscleLinks: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu");
        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
        // Set empty data on error to prevent component from breaking
        setMenuData({
          fordLinks: [],
          moparLinks: [],
          gmLateModelLinks: [],
          gmMidMuscleLinks: [],
          gmClassicMuscleLinks: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Close mobile menu when a navigation link is clicked (so menu doesn't stay open after navigation)
  useEffect(() => {
    const el = offcanvasRef.current;
    if (!el) return;

    const closeMobileMenu = () => {
      const offcanvasEl = document.getElementById("mobileMenu");
      if (!offcanvasEl) return;
      // 1) Prefer clicking the close button so Bootstrap handles it the same way as user close
      const closeBtn = offcanvasEl.querySelector(
        '[data-bs-dismiss="offcanvas"]'
      );
      if (closeBtn) {
        closeBtn.click();
        return;
      }
      // 2) Use Bootstrap API if available
      try {
        const bootstrap = require("bootstrap");
        const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (instance) {
          instance.hide();
          return;
        }
        const newInstance = new bootstrap.Offcanvas(offcanvasEl);
        newInstance.hide();
        return;
      } catch (_) {}
      // 3) DOM fallback
      offcanvasEl.classList.remove("show");
      offcanvasEl.setAttribute("aria-hidden", "true");
      offcanvasEl.removeAttribute("aria-modal");
      offcanvasEl.removeAttribute("role");
      const backdrop = document.querySelector(".offcanvas-backdrop");
      if (backdrop) backdrop.remove();
      document.body.classList.remove("offcanvas-backdrop");
    };

    const handleClick = (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = (link.getAttribute("href") || "").trim();
      // Only close for real navigation (path starting with /), not for collapse toggles (#id)
      if (href.startsWith("/")) {
        closeMobileMenu();
      }
    };

    el.addEventListener("click", handleClick, true);
    return () => el.removeEventListener("click", handleClick, true);
  }, []);

  const isMenuActive = (menuItem) => {
    let active = false;
    if (menuItem.href?.includes("/")) {
      if (menuItem.href?.split("/")[1] == pathname.split("/")[1]) {
        active = true;
      }
    }
    if (menuItem.links) {
      menuItem.links?.forEach((elm2) => {
        if (elm2.href?.includes("/")) {
          if (elm2.href?.split("/")[1] == pathname.split("/")[1]) {
            active = true;
          }
        }
        if (elm2.links) {
          elm2.links.forEach((elm3) => {
            if (elm3.href.split("/")[1] == pathname.split("/")[1]) {
              active = true;
            }
          });
        }
      });
    }

    return active;
  };
  // Create the main navigation items
  const mainNavItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      type: "link",
    },
    {
      id: "products",
      label: "Products",
      type: "dropdown",
      links: [
        {
          id: "ford",
          label: "Ford",
          type: "platform",
          platformData: menuData.fordLinks,
        },
        {
          id: "gm-late-model",
          label: "GM Late Model Cars",
          type: "platform",
          platformData: menuData.gmLateModelLinks,
        },
        {
          id: "gm-mid-muscle",
          label: "GM Mid Muscle Cars",
          type: "platform",
          platformData: menuData.gmMidMuscleLinks,
        },
        {
          id: "gm-classic-muscle",
          label: "GM Classic Muscle Cars",
          type: "platform",
          platformData: menuData.gmClassicMuscleLinks,
        },
        {
          id: "mopar",
          label: "Mopar",
          type: "platform",
          platformData: menuData.moparLinks,
        },
      ],
    },
    {
      id: "installation",
      label: "Installation",
      href: "/installation",
      type: "link",
    },
    {
      id: "about-us",
      label: "About Us",
      href: "/about-us",
      type: "link",
    },
    {
      id: "contact",
      label: "Contact Us",
      href: "/contact",
      type: "link",
    },
    {
      id: "view-cart",
      label: "View Cart",
      href: "/view-cart",
      type: "link",
    },
    {
      id: "my-account",
      label: "My Account",
      href: "/my-account",
      type: "link",
    },
    {
      id: "pages",
      label: "Pages",
      type: "dropdown",
      links: [
        { href: "/faq", label: "FAQ" },
        { href: "/terms-conditions", label: "Terms and conditions" },
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/shipping-delivery", label: "Shipping & Delivery" },
        { href: "/delivery-return", label: "Delivery & Return" },
        { href: "/checkout", label: "Check out" },
        { href: "/register", label: "Register" },
      ],
    },
    {
      id: "login",
      href: "/login",
      label: "Login",
      type: "link",
    },
  ];

  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-start canvas-mb"
      id="mobileMenu"
    >
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <ul className="nav-ul-mb" id="wrapper-menu-navigation">
            {mainNavItems.map((item, i) => (
              <li key={i} className="nav-mb-item">
                {item.type === "link" ? (
                  <Link
                    href={item.href}
                    className={`mb-menu-link ${
                      isMenuActive(item) ? "activeMenu" : ""
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <a
                      href={`#${item.id}`}
                      className={`collapsed mb-menu-link current ${
                        isMenuActive(item) ? "activeMenu" : ""
                      }`}
                      data-bs-toggle="collapse"
                      aria-expanded="true"
                      aria-controls={item.id}
                    >
                      <span>{item.label}</span>
                      <span className="btn-open-sub" />
                    </a>
                    <div id={item.id} className="collapse">
                      <ul className="sub-nav-menu">
                        {item.links.map((subItem, i2) => (
                          <li key={i2}>
                            {subItem.type === "platform" ? (
                              <>
                                <a
                                  href={`#${subItem.id}`}
                                  className={`sub-nav-link collapsed ${
                                    isMenuActive(subItem) ? "activeMenu" : ""
                                  }`}
                                  data-bs-toggle="collapse"
                                  aria-expanded="true"
                                  aria-controls={subItem.id}
                                >
                                  <span>{subItem.label}</span>
                                  <span className="btn-open-sub" />
                                </a>
                                <div id={subItem.id} className="collapse">
                                  <ul className="sub-nav-menu sub-menu-level-2">
                                    {isLoading ? (
                                      <li>
                                        <span className="sub-nav-link">
                                          Loading...
                                        </span>
                                      </li>
                                    ) : subItem.platformData &&
                                      subItem.platformData.length > 0 ? (
                                      subItem.platformData.map(
                                        (platform, i3) => (
                                          <li key={i3}>
                                            <Link
                                              href={`/products/${platform.slug}`}
                                              className={`sub-nav-link ${
                                                isMenuActive({
                                                  href: `/products/${platform.slug}`,
                                                })
                                                  ? "activeMenu"
                                                  : ""
                                              }`}
                                            >
                                              {platform.heading}
                                            </Link>
                                          </li>
                                        )
                                      )
                                    ) : (
                                      <li>
                                        <span className="sub-nav-link">
                                          No platforms available
                                        </span>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <Link
                                href={subItem.href}
                                className={`sub-nav-link ${
                                  isMenuActive(subItem) ? "activeMenu" : ""
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mb-other-content">
            {/* <div className="d-flex group-icon">
              <Link href={`/homes/home-search`} className="site-nav-icon">
                <i className="icon icon-search" />
                Search
              </Link>
            </div> */}
            <div className="mb-notice">
              <Link href={`/contact`} className="text-need">
                Need help ?
              </Link>
            </div>
            <ul className="mb-info">
              <li>
                Address: BMR Suspension <br />
                1033 Pine Chase Ave, Lakeland, FL 33815
              </li>
              <li>
                Email: <b>sales@bmrsuspension.com</b>
              </li>
              <li>
                Phone: <b>(813) 986-9302</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="mb-bottom">
          <Link
            href={isLoggedIn ? accountHref : "/login"}
            className="site-nav-icon"
          >
            <i className="icon icon-account" />
            {isLoggedIn ? "My Account" : "Login/Register"}
          </Link>
          <div className="bottom-bar-language">
            <div className="tf-currencies">
            </div>
            <div className="tf-languages">
              <LanguageSelect
                parentClassName={
                  "image-select center style-default type-languages"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
