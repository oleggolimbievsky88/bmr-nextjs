"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function TopbarUserMenu() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout?callbackUrl=/";
  };

  if (status === "loading" || !session) {
    return (
      <li>
        <Link href={`/login`} className="text-white nav-text">
          My Account
        </Link>
      </li>
    );
  }

  const isAdmin = session.user?.role === "admin";
  const dashboardLink = isAdmin ? "/admin" : "/my-account";
  const dashboardLabel = isAdmin ? "Admin" : "My Account";

  const closeDropdown = () => setShowDropdown(false);

  return (
    <li
      className="position-relative d-flex align-items-center"
      ref={dropdownRef}
    >
      <Link
        href={dashboardLink}
        className="text-white nav-text text-decoration-none"
      >
        {dashboardLabel}
      </Link>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-white nav-text border-0 bg-transparent p-0 ms-1"
        style={{ cursor: "pointer" }}
        aria-label="Account menu"
      >
        <i
          className="icon icon-arrow-down"
          style={{
            transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: "10px",
          }}
        />
      </button>
      {showDropdown && (
        <div
          className="dropdown-menu user-account-dropdown show"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "4px",
            minWidth: "200px",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
            opacity: 1,
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
            zIndex: 9999,
          }}
        >
          <Link
            href={dashboardLink}
            className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
            onClick={closeDropdown}
          >
            <i className="icon icon-home" style={{ fontSize: "16px" }} />
            <span>Dashboard</span>
          </Link>
          <Link
            href={isAdmin ? "/admin/orders" : "/my-account-orders"}
            className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
            onClick={closeDropdown}
          >
            <i className="icon icon-bag" style={{ fontSize: "16px" }} />
            <span>Orders</span>
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/products"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
              onClick={closeDropdown}
            >
              <i className="icon icon-grid" style={{ fontSize: "16px" }} />
              <span>Products</span>
            </Link>
          ) : (
            <Link
              href="/my-account-address"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
              onClick={closeDropdown}
            >
              <i className="icon icon-place" style={{ fontSize: "16px" }} />
              <span>Addresses</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="dropdown-item dropdown-item-logout d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent w-100 text-start"
          >
            <i className="icon icon-logout" style={{ fontSize: "16px" }} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </li>
  );
}
