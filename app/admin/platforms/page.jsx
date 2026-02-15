"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { showToast } from "@/utlis/showToast";
import { getPlatformImageUrl, getPlatformBannerUrl } from "@/lib/assets";

function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}) {
  if (!show) return null;
  const handleConfirm = () => {
    onClose();
    onConfirm();
  };
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg overflow-hidden rounded-3">
          <div className="modal-header border-0 bg-danger text-white">
            <h5 className="modal-title fw-semibold">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-dark">{message}</p>
          </div>
          <div className="modal-footer border-0 bg-light gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger rounded-pill"
              onClick={handleConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlatformsPage() {
  const [groups, setGroups] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedBodyId, setSelectedBodyId] = useState("");

  const [editingGroup, setEditingGroup] = useState(null);
  const [editingBody, setEditingBody] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const thumbnailInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    data: null,
  });

  const fetchGroups = useCallback(async () => {
    const res = await fetch("/api/admin/platform-groups");
    if (res.ok) {
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    }
  }, []);

  const fetchBodies = useCallback(async (platformGroupId) => {
    if (!platformGroupId) {
      setBodies([]);
      return;
    }
    const res = await fetch(
      `/api/admin/bodies?platformGroupId=${platformGroupId}`,
    );
    if (res.ok) {
      const data = await res.json();
      setBodies(data.bodies || []);
    }
  }, []);

  const fetchVehicles = useCallback(async (bodyId) => {
    if (!bodyId) {
      setVehicles([]);
      return;
    }
    const res = await fetch(`/api/admin/vehicles?bodyId=${bodyId}`);
    if (res.ok) {
      const data = await res.json();
      setVehicles(data.vehicles || []);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await fetchGroups();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) fetchBodies(selectedGroupId);
    else setBodies([]);
  }, [selectedGroupId, fetchBodies]);

  useEffect(() => {
    if (selectedBodyId) fetchVehicles(selectedBodyId);
    else setVehicles([]);
  }, [selectedBodyId, fetchVehicles]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const name = e.target.name?.value?.trim() || "New Group";
    const position = parseInt(e.target.position?.value, 10) || 0;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Platform group created.", "success");
      e.target.reset();
      await fetchGroups();
    } catch (err) {
      showToast(err.message || "Failed to create", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async (id, name, position) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/platform-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      showToast("Updated.", "success");
      setEditingGroup(null);
      await fetchGroups();
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroupClick = (id, name) => {
    setConfirmModal({ show: true, type: "group", data: { id, name } });
  };
  const handleDeleteGroupConfirm = async () => {
    const { id } = confirmModal.data || {};
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/platform-groups/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
      setConfirmModal({ show: false, type: null, data: null });
      if (String(id) === selectedGroupId) setSelectedGroupId("");
      await fetchGroups();
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBody = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      showToast("Select a platform group first.", "error");
      return;
    }
    const name = e.target.bodyName?.value?.trim() || "New Platform";
    const startYear = e.target.startYear?.value?.trim() || "0";
    const endYear = e.target.endYear?.value?.trim() || "0";
    const slug = e.target.slug?.value?.trim() || null;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bodies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startYear,
          endYear,
          slug,
          platformGroupId: Number(selectedGroupId),
          bodyCatId: selectedGroupId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Platform created.", "success");
      e.target.reset();
      await fetchBodies(selectedGroupId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);
      const res = await fetch("/api/admin/platform-images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (type === "thumbnail") {
        setEditingBody((prev) => ({ ...prev, Image: data.filename }));
      } else {
        setEditingBody((prev) => ({ ...prev, HeaderImage: data.filename }));
      }
      showToast("Image ready. Click Save to apply.", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUpdateBody = async (bodyId, payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bodies/${bodyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      showToast("Updated.", "success");
      setEditingBody(null);
      await fetchBodies(selectedGroupId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBodyClick = (id, name) => {
    setConfirmModal({ show: true, type: "body", data: { id, name } });
  };
  const handleDeleteBodyConfirm = async () => {
    const { id } = confirmModal.data || {};
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bodies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
      setConfirmModal({ show: false, type: null, data: null });
      if (String(id) === selectedBodyId) setSelectedBodyId("");
      await fetchBodies(selectedGroupId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!selectedBodyId) {
      showToast("Select a platform first.", "error");
      return;
    }
    const make = e.target.make?.value?.trim() || "";
    const model = e.target.model?.value?.trim() || "";
    const startYear = e.target.startYear?.value?.trim() || "0";
    const endYear = e.target.endYear?.value?.trim() || startYear;
    const subModel = e.target.subModel?.value?.trim() || null;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyId: selectedBodyId,
          make,
          model,
          startYear,
          endYear,
          subModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Vehicle created.", "success");
      e.target.reset();
      await fetchVehicles(selectedBodyId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVehicle = async (vehicleId, payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      showToast("Updated.", "success");
      setEditingVehicle(null);
      await fetchVehicles(selectedBodyId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicleClick = (id, make, model) => {
    setConfirmModal({
      show: true,
      type: "vehicle",
      data: { id, make, model },
    });
  };
  const handleDeleteVehicleConfirm = async () => {
    const { id } = confirmModal.data || {};
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
      setConfirmModal({ show: false, type: null, data: null });
      await fetchVehicles(selectedBodyId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const closeConfirmModal = () =>
    setConfirmModal({ show: false, type: null, data: null });

  const getConfirmModalProps = () => {
    if (confirmModal.type === "group")
      return {
        title: "Delete platform group?",
        message: `Delete "${confirmModal.data?.name || ""}"? Platforms and vehicles in this group will need to be reassigned.`,
        onConfirm: handleDeleteGroupConfirm,
      };
    if (confirmModal.type === "body")
      return {
        title: "Delete platform?",
        message: `Delete "${confirmModal.data?.name || ""}"? Vehicles in this platform will be removed.`,
        onConfirm: handleDeleteBodyConfirm,
      };
    if (confirmModal.type === "vehicle")
      return {
        title: "Delete vehicle?",
        message: `Delete "${confirmModal.data?.make || ""} ${confirmModal.data?.model || ""}"?`,
        onConfirm: handleDeleteVehicleConfirm,
      };
    return null;
  };

  if (loading && groups.length === 0) {
    return (
      <div className="admin-platforms-page">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "2.5rem", height: "2.5rem" }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted mt-2">Loading platforms…</p>
        </div>
        {getConfirmModalProps() && confirmModal.show && (
          <ConfirmDeleteModal
            show={confirmModal.show}
            onClose={closeConfirmModal}
            {...getConfirmModalProps()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-platforms-page">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Platforms</h1>
        <p className="text-muted small mb-0">
          Manage platform groups, platforms (bodies), and vehicles for Search by
          Vehicle.
        </p>
      </div>

      <section className="mb-5">
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
            <h2 className="h5 fw-semibold mb-4">Platform groups</h2>
            <form
              onSubmit={handleCreateGroup}
              className="d-flex flex-wrap gap-2 align-items-end mb-4"
            >
              <div>
                <label className="form-label small mb-1">Group name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ford"
                  className="form-control form-control-sm"
                  style={{ width: "180px" }}
                />
              </div>
              <div>
                <label className="form-label small mb-1">Position</label>
                <input
                  type="number"
                  name="position"
                  placeholder="0"
                  className="form-control form-control-sm"
                  style={{ width: "80px" }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4"
                disabled={saving}
              >
                + Add group
              </button>
            </form>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 py-3 ps-4">Name</th>
                    <th className="border-0 py-3">Position</th>
                    <th className="border-0 py-3 pe-4 text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.id}>
                      {editingGroup?.id === g.id ? (
                        <>
                          <td className="ps-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editingGroup.name}
                              onChange={(e) =>
                                setEditingGroup((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={editingGroup.position ?? ""}
                              onChange={(e) =>
                                setEditingGroup((prev) => ({
                                  ...prev,
                                  position:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }))
                              }
                              style={{ width: "70px" }}
                            />
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-success me-1 rounded-pill"
                              onClick={() =>
                                handleUpdateGroup(
                                  g.id,
                                  editingGroup.name,
                                  editingGroup.position ?? 0,
                                )
                              }
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary rounded-pill"
                              onClick={() => setEditingGroup(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ps-4 fw-medium">{g.name}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {g.position}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1 rounded-pill"
                              onClick={() => setEditingGroup({ ...g })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() =>
                                handleDeleteGroupClick(g.id, g.name)
                              }
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
            <h2 className="h5 fw-semibold mb-4">Platforms (bodies)</h2>
            <div className="mb-4">
              <label className="form-label small mb-1">Platform group</label>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: "280px" }}
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="">— Select group —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedGroupId && (
              <>
                <form
                  onSubmit={handleCreateBody}
                  className="d-flex flex-wrap gap-3 align-items-end mb-4"
                >
                  <div>
                    <label className="form-label small mb-1">
                      Platform name
                    </label>
                    <input
                      type="text"
                      name="bodyName"
                      placeholder="e.g. S650 Mustang"
                      className="form-control form-control-sm"
                      style={{ width: "160px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">Start year</label>
                    <input
                      type="text"
                      name="startYear"
                      placeholder="2015"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">End year</label>
                    <input
                      type="text"
                      name="endYear"
                      placeholder="2025"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      placeholder="2015-2025-s650"
                      className="form-control form-control-sm"
                      style={{ width: "160px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={saving}
                  >
                    + Add platform
                  </button>
                </form>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 py-3 ps-4">Name</th>
                        <th className="border-0 py-3">Years</th>
                        <th className="border-0 py-3">Slug</th>
                        <th className="border-0 py-3">Thumbnail</th>
                        <th className="border-0 py-3">Banner</th>
                        <th className="border-0 py-3 pe-4 text-end"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bodies.map((b) => (
                        <tr key={b.BodyID}>
                          <td className="ps-4 fw-medium">{b.Name}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {b.StartYear}-{b.EndYear}
                            </span>
                          </td>
                          <td className="text-muted small">{b.slug || "—"}</td>
                          <td>
                            {b.Image && b.Image !== "0" ? (
                              <img
                                src={getPlatformImageUrl(b.Image)}
                                alt=""
                                className="rounded"
                                style={{
                                  width: 36,
                                  height: 36,
                                  objectFit: "contain",
                                  backgroundColor: "#f5f5f5",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td>
                            {b.HeaderImage && b.HeaderImage !== "0" ? (
                              <img
                                src={getPlatformBannerUrl(b.HeaderImage)}
                                alt=""
                                className="rounded"
                                style={{
                                  width: 48,
                                  height: 28,
                                  objectFit: "cover",
                                  backgroundColor: "#f5f5f5",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1 rounded-pill"
                              onClick={() => setEditingBody(b)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() =>
                                handleDeleteBodyClick(b.BodyID, b.Name)
                              }
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
            <h2 className="h5 fw-semibold mb-4">Vehicles</h2>
            <div className="mb-4">
              <label className="form-label small mb-1">Platform</label>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: "320px" }}
                value={selectedBodyId}
                onChange={(e) => setSelectedBodyId(e.target.value)}
              >
                <option value="">— Select platform —</option>
                {bodies.map((b) => (
                  <option key={b.BodyID} value={b.BodyID}>
                    {b.Name} ({b.slug || b.BodyID})
                  </option>
                ))}
              </select>
              {bodies.length === 0 && selectedGroupId && (
                <small className="text-muted d-block mt-1">
                  No platforms in this group yet. Add one above first.
                </small>
              )}
              {bodies.length === 0 && !selectedGroupId && (
                <small className="text-muted d-block mt-1">
                  Select a platform group above to see available platforms.
                </small>
              )}
            </div>
            {selectedBodyId && (
              <>
                <form
                  onSubmit={handleCreateVehicle}
                  className="d-flex flex-wrap gap-3 align-items-end mb-4"
                >
                  <div>
                    <label className="form-label small mb-1">Make</label>
                    <input
                      type="text"
                      name="make"
                      placeholder="e.g. Ford"
                      className="form-control form-control-sm"
                      style={{ width: "100px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">Model</label>
                    <input
                      type="text"
                      name="model"
                      placeholder="e.g. Mustang"
                      className="form-control form-control-sm"
                      style={{ width: "120px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">Start year</label>
                    <input
                      type="text"
                      name="startYear"
                      placeholder="2015"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">End year</label>
                    <input
                      type="text"
                      name="endYear"
                      placeholder="2025"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  </div>
                  <div>
                    <label className="form-label small mb-1">
                      SubModel (optional)
                    </label>
                    <input
                      type="text"
                      name="subModel"
                      placeholder="e.g. GT"
                      className="form-control form-control-sm"
                      style={{ width: "100px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={saving}
                  >
                    + Add vehicle
                  </button>
                </form>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 py-3 ps-4">Make</th>
                        <th className="border-0 py-3">Model</th>
                        <th className="border-0 py-3">Years</th>
                        <th className="border-0 py-3">SubModel</th>
                        <th className="border-0 py-3 pe-4 text-end"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center text-muted py-4"
                          >
                            No vehicles yet. Add one with the form above.
                          </td>
                        </tr>
                      ) : (
                        vehicles.map((v) => (
                          <tr key={v.VehicleID}>
                            <td className="ps-4 fw-medium">{v.Make}</td>
                            <td>{v.Model}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {v.StartYear}-{v.EndYear}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {v.SubModel || "—"}
                            </td>
                            <td className="pe-4 text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1 rounded-pill"
                                onClick={() => setEditingVehicle(v)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill"
                                onClick={() =>
                                  handleDeleteVehicleClick(
                                    v.VehicleID,
                                    v.Make,
                                    v.Model,
                                  )
                                }
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {editingBody && (
        <div
          className="modal show d-block admin-edit-modal"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) e.stopPropagation();
          }}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit platform</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingBody(null)}
                />
              </div>
              <div className="modal-body">
                <form
                  id="edit-body-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.target;
                    handleUpdateBody(editingBody.BodyID, {
                      name: f.name?.value,
                      startYear: f.startYear?.value,
                      endYear: f.endYear?.value,
                      slug: f.slug?.value || null,
                      platformGroupId: Number(selectedGroupId),
                      image: f.image?.value?.trim() || "0",
                      headerImage: f.headerImage?.value?.trim() || "0",
                    });
                  }}
                >
                  <div className="mb-2">
                    <label className="form-label small">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-sm"
                      defaultValue={editingBody.Name}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Start year</label>
                      <input
                        type="text"
                        name="startYear"
                        className="form-control form-control-sm"
                        defaultValue={editingBody.StartYear}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">End year</label>
                      <input
                        type="text"
                        name="endYear"
                        className="form-control form-control-sm"
                        defaultValue={editingBody.EndYear}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      className="form-control form-control-sm"
                      defaultValue={editingBody.slug || ""}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">
                      Platform image (megamenu thumbnail)
                    </label>
                    <div className="d-flex align-items-start gap-2 flex-wrap">
                      {editingBody.Image && editingBody.Image !== "0" && (
                        <div
                          className="border rounded overflow-hidden flex-shrink-0"
                          style={{ width: 80, height: 60 }}
                        >
                          <img
                            src={getPlatformImageUrl(editingBody.Image)}
                            alt="Thumbnail"
                            className="w-100 h-100 object-fit-contain bg-light"
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <div className="flex-grow-1 min-w-0">
                        <input
                          type="text"
                          name="image"
                          className="form-control form-control-sm mb-1"
                          placeholder="Filename or path (e.g. 2024-mustang.png)"
                          value={
                            editingBody.Image && editingBody.Image !== "0"
                              ? editingBody.Image
                              : ""
                          }
                          onChange={(e) =>
                            setEditingBody((prev) => ({
                              ...prev,
                              Image: e.target.value || "0",
                            }))
                          }
                        />
                        <div className="d-flex gap-1 flex-wrap">
                          <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={(e) =>
                              handlePlatformImageUpload(e, "thumbnail")
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? "Uploading…" : "Browse"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setEditingBody((prev) => ({
                                ...prev,
                                Image: "0",
                              }))
                            }
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">
                      Platform banner (hero image)
                    </label>
                    <div className="d-flex align-items-start gap-2 flex-wrap">
                      {editingBody.HeaderImage &&
                        editingBody.HeaderImage !== "0" && (
                          <div
                            className="border rounded overflow-hidden flex-shrink-0"
                            style={{ width: 120, height: 60 }}
                          >
                            <img
                              src={getPlatformBannerUrl(
                                editingBody.HeaderImage,
                              )}
                              alt="Banner"
                              className="w-100 h-100 object-fit-cover bg-light"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        )}
                      <div className="flex-grow-1 min-w-0">
                        <input
                          type="text"
                          name="headerImage"
                          className="form-control form-control-sm mb-1"
                          placeholder="Filename (e.g. 2024-mustang_Banner.jpg)"
                          value={
                            editingBody.HeaderImage &&
                            editingBody.HeaderImage !== "0"
                              ? editingBody.HeaderImage
                              : ""
                          }
                          onChange={(e) =>
                            setEditingBody((prev) => ({
                              ...prev,
                              HeaderImage: e.target.value || "0",
                            }))
                          }
                        />
                        <div className="d-flex gap-1 flex-wrap">
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={(e) =>
                              handlePlatformImageUpload(e, "banner")
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? "Uploading…" : "Browse"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setEditingBody((prev) => ({
                                ...prev,
                                HeaderImage: "0",
                              }))
                            }
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingBody(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-body-form"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingVehicle && (
        <div
          className="modal show d-block admin-edit-modal"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) e.stopPropagation();
          }}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit vehicle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingVehicle(null)}
                />
              </div>
              <div className="modal-body">
                <form
                  id="edit-vehicle-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.target;
                    handleUpdateVehicle(editingVehicle.VehicleID, {
                      make: f.make?.value,
                      model: f.model?.value,
                      startYear: f.startYear?.value,
                      endYear: f.endYear?.value,
                      subModel: f.subModel?.value || null,
                      bodyId: selectedBodyId,
                    });
                  }}
                >
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Make</label>
                      <input
                        type="text"
                        name="make"
                        className="form-control form-control-sm"
                        defaultValue={editingVehicle.Make}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Model</label>
                      <input
                        type="text"
                        name="model"
                        className="form-control form-control-sm"
                        defaultValue={editingVehicle.Model}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Start year</label>
                      <input
                        type="text"
                        name="startYear"
                        className="form-control form-control-sm"
                        defaultValue={editingVehicle.StartYear}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">End year</label>
                      <input
                        type="text"
                        name="endYear"
                        className="form-control form-control-sm"
                        defaultValue={editingVehicle.EndYear}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">SubModel</label>
                    <input
                      type="text"
                      name="subModel"
                      className="form-control form-control-sm"
                      defaultValue={editingVehicle.SubModel || ""}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingVehicle(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-vehicle-form"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {getConfirmModalProps() && confirmModal.show && (
        <ConfirmDeleteModal
          show={confirmModal.show}
          onClose={closeConfirmModal}
          {...getConfirmModalProps()}
        />
      )}
    </div>
  );
}
