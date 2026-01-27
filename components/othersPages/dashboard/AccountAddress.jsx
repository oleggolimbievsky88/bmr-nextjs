"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function buildAddressLines(profile, type) {
  if (!profile) return [];
  const isShipping = type === "shipping";
  const firstName = isShipping ? profile.shippingfirstname : profile.firstname;
  const lastName = isShipping ? profile.shippinglastname : profile.lastname;
  const address1 = isShipping ? profile.shippingaddress1 : profile.address1;
  const address2 = isShipping ? profile.shippingaddress2 : profile.address2;
  const city = isShipping ? profile.shippingcity : profile.city;
  const state = isShipping ? profile.shippingstate : profile.state;
  const zip = isShipping ? profile.shippingzip : profile.zip;
  const country = isShipping ? profile.shippingcountry : profile.country;

  const lines = [];
  const nameLine = [firstName, lastName].filter(Boolean).join(" ");
  if (nameLine) lines.push(nameLine);
  if (address1) lines.push(address1);
  if (address2) lines.push(address2);
  const cityStateZip = [city, state, zip].filter(Boolean).join(", ");
  if (cityStateZip) lines.push(cityStateZip);
  if (country) lines.push(country);
  return lines;
}

export default function AccountAddress() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'billing' | 'shipping' | null
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [billingForm, setBillingForm] = useState({
    firstname: "",
    lastname: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phonenumber: "",
  });

  const [shippingForm, setShippingForm] = useState({
    shippingfirstname: "",
    shippinglastname: "",
    shippingaddress1: "",
    shippingaddress2: "",
    shippingcity: "",
    shippingstate: "",
    shippingzip: "",
    shippingcountry: "United States",
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/my-profile", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        setProfile(u);
        setBillingForm({
          firstname: u.firstname || "",
          lastname: u.lastname || "",
          address1: u.address1 || "",
          address2: u.address2 || "",
          city: u.city || "",
          state: u.state || "",
          zip: u.zip || "",
          country: u.country || "United States",
          phonenumber: u.phonenumber || "",
        });
        setShippingForm({
          shippingfirstname: u.shippingfirstname || "",
          shippinglastname: u.shippinglastname || "",
          shippingaddress1: u.shippingaddress1 || "",
          shippingaddress2: u.shippingaddress2 || "",
          shippingcity: u.shippingcity || "",
          shippingstate: u.shippingstate || "",
          shippingzip: u.shippingzip || "",
          shippingcountry: u.shippingcountry || "United States",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage({ type: "error", text: "Failed to load addresses." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user) fetchProfile();
  }, [status, session, router, fetchProfile]);

  const syncFormsFromProfile = useCallback(() => {
    if (!profile) return;
    const u = profile;
    setBillingForm({
      firstname: u.firstname || "",
      lastname: u.lastname || "",
      address1: u.address1 || "",
      address2: u.address2 || "",
      city: u.city || "",
      state: u.state || "",
      zip: u.zip || "",
      country: u.country || "United States",
      phonenumber: u.phonenumber || "",
    });
    setShippingForm({
      shippingfirstname: u.shippingfirstname || "",
      shippinglastname: u.shippinglastname || "",
      shippingaddress1: u.shippingaddress1 || "",
      shippingaddress2: u.shippingaddress2 || "",
      shippingcity: u.shippingcity || "",
      shippingstate: u.shippingstate || "",
      shippingzip: u.shippingzip || "",
      shippingcountry: u.shippingcountry || "United States",
    });
  }, [profile]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((p) => ({ ...p, [name]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((p) => ({ ...p, [name]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setMessage({ type: "success", text: "Billing address updated." });
      setProfile((p) => (p ? { ...p, ...billingForm } : p));
      setEditing(null);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setMessage({ type: "success", text: "Shipping address updated." });
      setProfile((p) => (p ? { ...p, ...shippingForm } : p));
      setEditing(null);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    syncFormsFromProfile();
    setEditing(null);
    setMessage({ type: "", text: "" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="my-account-content account-address">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const billingLines = buildAddressLines(profile, "billing");
  const shippingLines = buildAddressLines(profile, "shipping");

  return (
    <div className="my-account-content account-address">
      {message.text && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card h-100">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h6 className="dashboard-card-title mb-0">Billing Address</h6>
              {editing !== "billing" && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-primary p-0"
                  onClick={() => setEditing("billing")}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="dashboard-card-body">
              {editing === "billing" ? (
                <form onSubmit={handleSaveBilling}>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">First Name</label>
                      <input
                        name="firstname"
                        type="text"
                        className="form-control form-control-sm"
                        value={billingForm.firstname}
                        onChange={handleBillingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Last Name</label>
                      <input
                        name="lastname"
                        type="text"
                        className="form-control form-control-sm"
                        value={billingForm.lastname}
                        onChange={handleBillingChange}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Address Line 1</label>
                    <input
                      name="address1"
                      type="text"
                      className="form-control form-control-sm"
                      value={billingForm.address1}
                      onChange={handleBillingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Address Line 2</label>
                    <input
                      name="address2"
                      type="text"
                      className="form-control form-control-sm"
                      value={billingForm.address2}
                      onChange={handleBillingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">City</label>
                      <input
                        name="city"
                        type="text"
                        className="form-control form-control-sm"
                        value={billingForm.city}
                        onChange={handleBillingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-3">
                      <label className="form-label">State</label>
                      <input
                        name="state"
                        type="text"
                        className="form-control form-control-sm"
                        value={billingForm.state}
                        onChange={handleBillingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-3">
                      <label className="form-label">ZIP</label>
                      <input
                        name="zip"
                        type="text"
                        className="form-control form-control-sm"
                        value={billingForm.zip}
                        onChange={handleBillingChange}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Country</label>
                    <input
                      name="country"
                      type="text"
                      className="form-control form-control-sm"
                      value={billingForm.country}
                      onChange={handleBillingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      name="phonenumber"
                      type="tel"
                      className="form-control form-control-sm"
                      value={billingForm.phonenumber}
                      onChange={handleBillingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="tf-btn btn-fill btn-sm"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="tf-btn btn-line btn-sm"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {billingLines.length ? (
                    <ul className="dashboard-address-list list-unstyled mb-0">
                      {billingLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary mb-0">
                      No billing address saved.
                    </p>
                  )}
                  {profile?.phonenumber && (
                    <p className="mt-2 mb-0">{profile.phonenumber}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="dashboard-card h-100">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h6 className="dashboard-card-title mb-0">Shipping Address</h6>
              {editing !== "shipping" && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-primary p-0"
                  onClick={() => setEditing("shipping")}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="dashboard-card-body">
              {editing === "shipping" ? (
                <form onSubmit={handleSaveShipping}>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">First Name</label>
                      <input
                        name="shippingfirstname"
                        type="text"
                        className="form-control form-control-sm"
                        value={shippingForm.shippingfirstname}
                        onChange={handleShippingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Last Name</label>
                      <input
                        name="shippinglastname"
                        type="text"
                        className="form-control form-control-sm"
                        value={shippingForm.shippinglastname}
                        onChange={handleShippingChange}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Address Line 1</label>
                    <input
                      name="shippingaddress1"
                      type="text"
                      className="form-control form-control-sm"
                      value={shippingForm.shippingaddress1}
                      onChange={handleShippingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Address Line 2</label>
                    <input
                      name="shippingaddress2"
                      type="text"
                      className="form-control form-control-sm"
                      value={shippingForm.shippingaddress2}
                      onChange={handleShippingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">City</label>
                      <input
                        name="shippingcity"
                        type="text"
                        className="form-control form-control-sm"
                        value={shippingForm.shippingcity}
                        onChange={handleShippingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-3">
                      <label className="form-label">State</label>
                      <input
                        name="shippingstate"
                        type="text"
                        className="form-control form-control-sm"
                        value={shippingForm.shippingstate}
                        onChange={handleShippingChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-3">
                      <label className="form-label">ZIP</label>
                      <input
                        name="shippingzip"
                        type="text"
                        className="form-control form-control-sm"
                        value={shippingForm.shippingzip}
                        onChange={handleShippingChange}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input
                      name="shippingcountry"
                      type="text"
                      className="form-control form-control-sm"
                      value={shippingForm.shippingcountry}
                      onChange={handleShippingChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="tf-btn btn-fill btn-sm"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="tf-btn btn-line btn-sm"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {shippingLines.length ? (
                    <ul className="dashboard-address-list list-unstyled mb-0">
                      {shippingLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary mb-0">
                      No shipping address saved.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
