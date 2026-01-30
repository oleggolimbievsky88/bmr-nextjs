"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const dealerLinks = [
  { href: "/dealers-portal", label: "Dashboard" },
  { href: "/dealers-portal/products", label: "Products" },
  { href: "/dealers-portal/po", label: "Purchase Order" },
  { href: "/dealers-portal/orders", label: "Orders & Invoices" },
  { href: "/dealers-portal/resources", label: "Download Resources" },
  { href: "/dealers-portal/suggestions", label: "Suggestions" },
];

export default function DealerNav() {
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/signout?callbackUrl=/dealers-portal";
  };

  return (
    <div className="dealer-nav-top-inner d-flex align-items-center justify-content-between flex-wrap gap-3">
      <ul className="dealer-nav-links d-flex align-items-center flex-wrap gap-2 mb-0">
        {dealerLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`dealer-nav-link ${
                pathname === link.href ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="dealer-nav-actions">
        <button
          type="button"
          onClick={handleLogout}
          className="tf-btn btn-outline-secondary btn-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
