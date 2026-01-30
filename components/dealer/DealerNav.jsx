"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const dealerLinks = [
  { href: "/dealers-portal", label: "Dashboard" },
  { href: "/dealers-portal/products", label: "Products" },
  { href: "/dealers-portal/orders", label: "Orders" },
];

export default function DealerNav() {
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/signout?callbackUrl=/dealers-portal";
  };

  return (
    <ul className="my-account-nav">
      {dealerLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`my-account-nav-item ${
              pathname === link.href ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={handleLogout}
          className="my-account-nav-item"
          style={{
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </li>
    </ul>
  );
}
