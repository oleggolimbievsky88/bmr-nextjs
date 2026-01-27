"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { asBlank } from "@/lib/display";
import AccountProfileForm, {
  getDefaultProfileForm,
} from "./AccountProfileForm";
import AdminCustomerEditor from "./AdminCustomerEditor";

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const createFormFromProfile = (profile) => ({
  ...getDefaultProfileForm(),
  firstname: asBlank(profile?.firstname),
  lastname: asBlank(profile?.lastname),
  email: asBlank(profile?.email),
  phonenumber: asBlank(profile?.phonenumber),
  address1: asBlank(profile?.address1),
  address2: asBlank(profile?.address2),
  city: asBlank(profile?.city),
  state: asBlank(profile?.state),
  zip: asBlank(profile?.zip),
  country: asBlank(profile?.country) || "United States",
  shippingfirstname: asBlank(profile?.shippingfirstname),
  shippinglastname: asBlank(profile?.shippinglastname),
  shippingaddress1: asBlank(profile?.shippingaddress1),
  shippingaddress2: asBlank(profile?.shippingaddress2),
  shippingcity: asBlank(profile?.shippingcity),
  shippingstate: asBlank(profile?.shippingstate),
  shippingzip: asBlank(profile?.shippingzip),
  shippingcountry: asBlank(profile?.shippingcountry) || "United States",
});

const buildAddressLines = (profile, type) => {
  if (!profile) return [];

  const lines = [];
  const isShipping = type === "shipping";
  const firstName = asBlank(
    isShipping ? profile.shippingfirstname : profile.firstname,
  );
  const lastName = asBlank(
    isShipping ? profile.shippinglastname : profile.lastname,
  );
  const address1 = asBlank(
    isShipping ? profile.shippingaddress1 : profile.address1,
  );
  const address2 = asBlank(
    isShipping ? profile.shippingaddress2 : profile.address2,
  );
  const city = asBlank(isShipping ? profile.shippingcity : profile.city);
  const state = asBlank(isShipping ? profile.shippingstate : profile.state);
  const zip = asBlank(isShipping ? profile.shippingzip : profile.zip);
  const country = asBlank(
    isShipping ? profile.shippingcountry : profile.country,
  );

  const nameLine = [firstName, lastName].filter(Boolean).join(" ");
  if (nameLine) lines.push(nameLine);
  if (address1) lines.push(address1);
  if (address2) lines.push(address2);

  const cityStateZip = [city, state, zip].filter(Boolean).join(", ");
  if (cityStateZip) lines.push(cityStateZip);
  if (country) lines.push(country);

  return lines;
};

const formatCurrency = (value) => {
  const parsed = Number.parseFloat(value || 0);
  if (Number.isNaN(parsed)) return "$0.00";
  return `$${parsed.toFixed(2)}`;
};

export default function MyAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(() => getDefaultProfileForm());
  const [profileMessage, setProfileMessage] = useState({
    type: "",
    text: "",
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch("/api/auth/my-orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch("/api/auth/my-profile");
      const data = await response.json();

      if (data.success && data.user) {
        setProfile(data.user);
        setFormData(createFormFromProfile(data.user));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchOrders();
      fetchProfile();
    }
  }, [fetchOrders, fetchProfile, router, session, status]);

  const handleProfileChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setProfileMessage({ type: "", text: "" });
  }, []);

  const handleProfileSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setProfileMessage({ type: "", text: "" });

      if (formData.password) {
        if (formData.password.length < 8) {
          setProfileMessage({
            type: "error",
            text: "Password must be at least 8 characters long",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setProfileMessage({
            type: "error",
            text: "Passwords do not match",
          });
          return;
        }
      }

      setIsSavingProfile(true);

      try {
        const updateData = { ...formData };
        delete updateData.confirmPassword;

        if (!updateData.password) {
          delete updateData.password;
        }

        const response = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        setProfileMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setFormData((prevForm) => ({
          ...prevForm,
          password: "",
          confirmPassword: "",
        }));
        setProfile((prevProfile) => ({
          ...prevProfile,
          ...updateData,
        }));
      } catch (error) {
        console.error("Update error:", error);
        setProfileMessage({
          type: "error",
          text: error.message || "An error occurred. Please try again.",
        });
      } finally {
        setIsSavingProfile(false);
      }
    },
    [formData],
  );

  const handleToggleProfile = useCallback(() => {
    setIsEditingProfile((prev) => !prev);
  }, []);

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="my-account-content account-dashboard">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name || "User";
  const userEmail = session.user.email;
  const userRole = session.user.role || "customer";
  const isAdmin = userRole === "admin";
  const isDealer = userRole === "dealer";
  const recentOrders = orders.slice(0, 5);
  const ordersCount = orders.length;
  const memberSince = formatDate(profile?.createdAt || profile?.datecreated);
  const billingLines = buildAddressLines(profile, "billing");
  const shippingLines = buildAddressLines(profile, "shipping");

  const renderAddressLine = (line, index) => (
    <li key={`${line}-${index}`}>{line}</li>
  );

  const renderOrderRow = (order) => {
    const statusClass =
      order.status === "completed"
        ? "bg-success"
        : order.status === "processing"
          ? "bg-warning"
          : "bg-secondary";

    return (
      <tr key={order.new_order_id}>
        <td>#{order.order_number}</td>
        <td>{formatDate(order.order_date)}</td>
        <td>
          <span className={`badge ${statusClass}`}>{order.status}</span>
        </td>
        <td>{formatCurrency(order.total)}</td>
        <td>
          <Link
            href={`/my-account-orders/${order.order_number}`}
            className="tf-btn btn-fill animate-hover-btn rounded-0"
          >
            <span>View</span>
          </Link>
        </td>
      </tr>
    );
  };

  return (
    <div className="my-account-content account-dashboard">
      <div className="dashboard-hero mb_40">
        <div className="row align-items-center g-3">
          <div className="col-lg-7">
            <h4 className="dashboard-title">Welcome back, {userName}</h4>
            <p className="dashboard-subtitle">
              Manage your profile details, addresses, and recent orders from one
              place.
            </p>
            <div className="dashboard-meta">
              <span className="badge bg-light text-dark">{userEmail}</span>
              <span className="badge bg-dark ms-2">
                {userRole.toUpperCase()}
              </span>
            </div>
            {isDealer && (
              <div className="dashboard-alert alert alert-info mt-3">
                <strong>Dealer Account:</strong> Tier{" "}
                {session.user.dealerTier || 0} with{" "}
                {session.user.dealerDiscount || 0}% pricing.
              </div>
            )}
          </div>
          <div className="col-lg-5">
            <div className="dashboard-actions">
              <Link
                className="tf-btn btn-fill animate-hover-btn"
                href="/my-account-orders"
              >
                View Orders
              </Link>
              <button
                type="button"
                className="tf-btn btn-line"
                onClick={handleToggleProfile}
              >
                {isEditingProfile ? "Hide Editor" : "Edit Details"}
              </button>
              {isAdmin && (
                <a className="tf-btn btn-line" href="#admin-tools">
                  Admin Tools
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats mb_40">
        <div className="dashboard-card">
          <span className="dashboard-card-label">Account Type</span>
          <h3 className="dashboard-card-value">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </h3>
          <p className="dashboard-card-note">
            Manage permissions and pricing in your account settings.
          </p>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">Member Since</span>
          <h3 className="dashboard-card-value">{memberSince}</h3>
          <p className="dashboard-card-note">
            Thanks for being part of the BMR Suspension community.
          </p>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">Recent Orders</span>
          <h3 className="dashboard-card-value">
            {ordersCount > 0 ? ordersCount : "No orders"}
          </h3>
          <p className="dashboard-card-note">
            View and track your latest purchases.
          </p>
        </div>
      </div>

      <div className="row g-4 mb_40">
        <div className="col-lg-6">
          <div className="dashboard-card h-100">
            <div className="dashboard-card-header">
              <h6 className="dashboard-card-title">Profile Snapshot</h6>
              <Link className="text_primary" href="/my-account-edit">
                Full Account Details
              </Link>
            </div>
            <ul className="dashboard-details">
              <li>
                <span>Name</span>
                <strong>
                  {[asBlank(profile?.firstname), asBlank(profile?.lastname)]
                    .filter(Boolean)
                    .join(" ") || "\u2014"}
                </strong>
              </li>
              <li>
                <span>Email</span>
                <strong>{asBlank(profile?.email) || userEmail}</strong>
              </li>
              <li>
                <span>Phone</span>
                <strong>{asBlank(profile?.phonenumber) || "—"}</strong>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="dashboard-card h-100">
            <div className="dashboard-card-header">
              <h6 className="dashboard-card-title">Address Book</h6>
              <Link className="text_primary" href="/my-account-address">
                Edit Addresses
              </Link>
            </div>
            <div className="dashboard-address">
              <h6>Billing Address</h6>
              {billingLines.length ? (
                <ul className="dashboard-address-list">
                  {billingLines.map(renderAddressLine)}
                </ul>
              ) : (
                <p className="text-secondary mb-0">
                  No billing address saved yet.
                </p>
              )}
            </div>
            <div className="dashboard-address">
              <h6>Shipping Address</h6>
              {shippingLines.length ? (
                <ul className="dashboard-address-list">
                  {shippingLines.map(renderAddressLine)}
                </ul>
              ) : (
                <p className="text-secondary mb-0">
                  No shipping address saved yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditingProfile && (
        <div id="account-details" className="dashboard-card mb_40">
          <AccountProfileForm
            idPrefix="my-account"
            title="Account Details"
            description="Update your personal details and addresses."
            formData={formData}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
            isSubmitting={isSavingProfile}
            message={profileMessage}
            submitLabel="Save Changes"
          />
        </div>
      )}

      <div className="dashboard-card mb_40">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">Recent Orders</h5>
          <Link href="/my-account-orders" className="text_primary">
            View All Orders
          </Link>
        </div>
        <div className="dashboard-card-body">
          {isLoadingOrders ? (
            <div className="dashboard-loading">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {recentOrders.length ? (
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>{recentOrders.map(renderOrderRow)}</tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary mb-0">No recent orders yet.</p>
              )}
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <div id="admin-tools" className="dashboard-section">
          <AdminCustomerEditor />
        </div>
      )}
    </div>
  );
}
