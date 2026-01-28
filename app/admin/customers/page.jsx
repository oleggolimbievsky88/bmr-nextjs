"use client";

import { useState, useEffect } from "react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    role: "customer",
    dealerTier: 0,
    dealerDiscount: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/admin/customers?search=${encodeURIComponent(searchTerm)}`
        : "/api/admin/customers";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customers");
      }

      setCustomers(data.customers || []);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      role: customer.role || "customer",
      dealerTier: customer.dealerTier || 0,
      dealerDiscount: customer.dealerDiscount || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `/api/admin/customers/${editingCustomer.CustomerID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      setEditingCustomer(null);
      fetchCustomers();
      alert("Customer updated successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error updating customer:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Customer Management</h1>
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          />
          <button
            type="button"
            onClick={fetchCustomers}
            className="admin-btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {editingCustomer && (
        <div className="admin-card mb-4">
          <h2 className="h5 fw-6 mb-4">
            Edit Customer: {editingCustomer.firstname}{" "}
            {editingCustomer.lastname}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-role">Role *</label>
                  <select
                    id="edit-role"
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                    className="form-select"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-tier">Dealer Tier (1-8)</label>
                  <input
                    id="edit-tier"
                    type="number"
                    name="dealerTier"
                    value={formData.dealerTier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealerTier: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="8"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-discount">Dealer Discount (%)</label>
                  <input
                    id="edit-discount"
                    type="number"
                    name="dealerDiscount"
                    value={formData.dealerDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealerDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="admin-toolbar">
              <button type="submit" className="admin-btn-primary">
                Update Customer
              </button>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-center">Tier</th>
                <th className="text-center">Discount</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-4">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.CustomerID}>
                    <td>
                      {customer.firstname} {customer.lastname}
                    </td>
                    <td>{customer.email}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          customer.role === "admin"
                            ? "cancelled"
                            : customer.role === "vendor"
                              ? "processed"
                              : "pending"
                        }`}
                      >
                        {customer.role || "customer"}
                      </span>
                    </td>
                    <td className="text-center">{customer.dealerTier || 0}</td>
                    <td className="text-center">
                      {customer.dealerDiscount || 0}%
                    </td>
                    <td>{formatDate(customer.datecreated)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(customer)}
                        className="admin-btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
