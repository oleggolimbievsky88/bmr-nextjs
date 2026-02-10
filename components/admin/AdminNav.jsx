"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";

export default function AdminNav({ user }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/topbar", label: "Topbar" },
    { href: "/admin/banner", label: "Banners" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/dealer-pos", label: "Dealer POs" },
    { href: "/admin/coupons", label: "Coupons" },
    { href: "/admin/dealer-tiers", label: "Dealer Tiers" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/import", label: "Import ACES/PIES" },
  ];

  const handleLogout = () => {
    window.location.href = "/api/auth/logout?callbackUrl=/";
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const displayName = user?.name || user?.email || "Admin";

  return (
    <header className="admin-header">
      {/* Welcome bar + user + logout */}
      <div className="admin-header-top">
        <div className="container-wide">
          <div className="admin-header-top-inner">
            <div className="admin-welcome">
              <span className="admin-welcome-icon" aria-hidden="true">
                👋
              </span>
              <span className="admin-welcome-text">
                Welcome, <strong>{displayName}</strong>
              </span>
            </div>
            <div className="admin-header-actions">
              <button
                type="button"
                onClick={handleLogout}
                className="admin-btn-logout"
                aria-label="Log out"
              >
                Logout
              </button>
              <button
                type="button"
                className="admin-nav-toggle"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-nav-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <span className="admin-nav-toggle-bar" />
                <span className="admin-nav-toggle-bar" />
                <span className="admin-nav-toggle-bar" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`admin-nav ${mobileMenuOpen ? "admin-nav-open" : ""}`}
        aria-label="Admin section"
      >
        <div className="container-wide">
          <div className="admin-nav-inner">
            <ul id="admin-nav-menu" className="admin-nav-links" role="list">
              {navLinks.map(({ href, label }) => {
                const isActive =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`admin-nav-link ${isActive ? "active" : ""}`}
                      onClick={closeMobileMenu}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
