"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserAccountMenu() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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
      <li className="nav-account tf-md-hidden">
        <Link
          href="/login"
          className="nav-icon-item align-items-center gap-10 text-decoration-none"
        >
          <i className="icon icon-account" />
          <span className="text" style={{ fontSize: "14px" }}>
            My Account
          </span>
        </Link>
      </li>
    );
  }

  // User is logged in - link to dashboard, dropdown with Dashboard/Orders/Addresses|Products/Logout
  const isAdmin = session.user?.role === "admin";
  const dashboardLink = isAdmin ? "/admin" : "/my-account";

  const closeDropdown = () => setShowDropdown(false);

  return (
    <li
      className="nav-account tf-md-hidden position-relative"
      ref={dropdownRef}
    >
      <div className="d-flex align-items-center gap-10">
        <Link
          href={dashboardLink}
          className="nav-icon-item align-items-center gap-10 text-decoration-none"
        >
          <i className="icon icon-account" />
          <span className="text" style={{ fontSize: "14px" }}>
            {session.user?.name || session.user?.email || "Account"}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="border-0 bg-transparent p-0 d-flex align-items-center"
          style={{ cursor: "pointer", color: "inherit" }}
          aria-label="Account menu"
        >
          <i
            className="icon icon-arrow-down ms-1"
            style={{
              transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              fontSize: "12px",
            }}
          />
        </button>
      </div>
      {showDropdown && (
        <div
          className="dropdown-menu user-account-dropdown show"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            minWidth: "200px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
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
