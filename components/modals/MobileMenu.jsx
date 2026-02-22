"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LanguageSelect from "../common/LanguageSelect";
import { usePathname } from "next/navigation";
import { useBrand } from "@bmr/ui/brand";
import { footerLinks, aboutLinks } from "@/data/footerLinks";

// Match MainMenu: defaults and fallbacks for brand-driven nav (Mega menu labels & URLs from platform brands page)
const defaultNavLabels = {
  ford: "Ford",
  gmLateModel: "GM Late Model Cars",
  gmMidMuscle: "GM Mid Muscle Cars",
  gmClassicMuscle: "GM Classic Muscle Cars",
  mopar: "Mopar",
  installation: "Installation",
  cart: "Cart",
};
const defaultNavUrls = {
  ford: "/products/ford",
  gmLateModel: "/products/gm/late-model",
  gmMidMuscle: "/products/gm/mid-muscle",
  gmClassicMuscle: "/products/gm/classic-muscle",
  mopar: "/products/mopar",
  installation: "/installation",
  cart: "/view-cart",
};
const FALLBACK_SIMPLE_NAV_IDS = ["installation", "cart"];
const DEFAULT_NAV_ORDER = Object.keys(defaultNavLabels);

function normUrl(url, fallback) {
  const s = (url || fallback || "").trim();
  return s ? (s.startsWith("/") ? s : `/${s}`) : fallback || "#";
}

export default function MobileMenu() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const brand = useBrand();
  const navLabels = { ...defaultNavLabels, ...(brand?.navLabels || {}) };
  const navUrls = { ...defaultNavUrls, ...(brand?.navUrls || {}) };
  const navOrder =
    Array.isArray(brand?.navOrder) && brand.navOrder.length > 0
      ? brand.navOrder
      : DEFAULT_NAV_ORDER;
  const platformIds =
    Array.isArray(brand?.navPlatformIds) && brand.navPlatformIds.length > 0
      ? brand.navPlatformIds
      : navOrder.filter((id) => !FALLBACK_SIMPLE_NAV_IDS.includes(id));
  const offcanvasRef = useRef(null);
  const isLoggedIn = status !== "loading" && !!session;
  const accountHref =
    session?.user?.role === "admin" ? "/admin" : "/my-account";
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
        '[data-bs-dismiss="offcanvas"]',
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
  // Products dropdown: brand-specific Mega menu items from navOrder / navPlatformIds (same as desktop MainMenu)
  const productsLinks = platformIds.map((id) => ({
    id: id.replace(/\s+/g, "-").toLowerCase(),
    label: navLabels[id] ?? id,
    type: "platform",
    platformData: menuData[`${id}Links`] || [],
    href: normUrl(navUrls[id], "#"),
  }));

  // Create the main navigation items (Products uses Mega menu labels & URLs from platform brands page)
  const mainNavItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      type: "link",
    },
    ...(productsLinks.length > 0
      ? [
          {
            id: "products",
            label: "Products",
            type: "dropdown",
            links: productsLinks,
          },
        ]
      : []),
    {
      id: "installation",
      label: navLabels.installation ?? "Installation",
      href: normUrl(navUrls.installation, "/installation"),
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
      label: navLabels.cart ?? "Cart",
      href: normUrl(navUrls.cart, "/view-cart"),
      type: "link",
    },
    {
      id: "my-account",
      label: "My Account",
      href: "/my-account",
      type: "link",
    },
    {
      id: "customer-resources",
      label: "Customer Resources",
      type: "dropdown",
      links: footerLinks.map((link) => ({
        href: link.href,
        label: link.text,
      })),
    },
    {
      id: "company-dealers",
      label: "Company & Dealers",
      type: "dropdown",
      links: aboutLinks.map((link) => ({
        href: link.href,
        label:
          link.href === "/about-us"
            ? `About ${brand.companyNameShort ?? brand.companyName ?? ""}`.trim() ||
              link.text
            : link.text,
      })),
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
                                        ),
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
              <Link href="/contact" className="text-need">
                Need help?
              </Link>
            </div>
            <ul className="mb-info">
              {(brand.contact?.addressLines?.length > 0 ||
                brand.companyName ||
                brand.companyNameShort) && (
                <li>
                  Address:{" "}
                  {brand.companyNameShort || brand.companyName ? (
                    <>
                      {brand.companyNameShort || brand.companyName}
                      {brand.contact?.addressLines?.length > 0 && <br />}
                    </>
                  ) : null}
                  {brand.contact?.addressLines?.length > 0 &&
                    brand.contact.addressLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < brand.contact.addressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                </li>
              )}
              {brand.contact?.email && (
                <li>
                  Email: <b>{brand.contact.email}</b>
                </li>
              )}
              {(brand.contact?.phoneDisplay || brand.contact?.phoneTel) && (
                <li>
                  Phone:{" "}
                  <b>{brand.contact.phoneDisplay || brand.contact.phoneTel}</b>
                </li>
              )}
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
            <div className="tf-currencies"></div>
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
