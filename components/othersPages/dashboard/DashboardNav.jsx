"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const accountLinks = [
  { href: "/my-account", label: "Dashboard" },
  { href: "/my-account-orders", label: "Orders" },
  { href: "/my-account-address", label: "Addresses" },
  { href: "/my-account-edit", label: "Account Details" },
  { href: "/my-account-wishlist", label: "Wishlist" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <ul className="my-account-nav">
      {accountLinks.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className={`my-account-nav-item ${
              pathname == link.href ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <button
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
