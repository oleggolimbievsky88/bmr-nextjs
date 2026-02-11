"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utlis/showToast";

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

  const handleDeleteGroup = async (id) => {
    if (!confirm("Delete this platform group?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/platform-groups/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
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

  const handleDeleteBody = async (id) => {
    if (!confirm("Delete this platform?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bodies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
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

  const handleDeleteVehicle = async (id) => {
    if (!confirm("Delete this vehicle?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Deleted.", "success");
      await fetchVehicles(selectedBodyId);
    } catch (err) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="admin-form-title mb-4">
        <h1>Platforms</h1>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="admin-form-title mb-4">
      <h1>Platforms</h1>
      <p className="text-muted mb-4">
        Manage platform groups, platforms (bodies), and vehicles for Search by
        Vehicle.
      </p>

      <section className="mb-5">
        <h2 className="h5 mb-3">Platform groups</h2>
        <form
          onSubmit={handleCreateGroup}
          className="d-flex flex-wrap gap-2 align-items-end mb-3"
        >
          <input
            type="text"
            name="name"
            placeholder="Group name"
            className="form-control form-control-sm"
            style={{ width: "180px" }}
          />
          <input
            type="number"
            name="position"
            placeholder="Position"
            className="form-control form-control-sm"
            style={{ width: "80px" }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving}
          >
            Add group
          </button>
        </form>
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  {editingGroup?.id === g.id ? (
                    <>
                      <td>{g.id}</td>
                      <td>
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
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
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
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingGroup(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{g.id}</td>
                      <td>{g.name}</td>
                      <td>{g.position}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setEditingGroup({ ...g })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteGroup(g.id)}
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
      </section>

      <section className="mb-5">
        <h2 className="h5 mb-3">Platforms (bodies)</h2>
        <div className="mb-2">
          <label className="me-2">Platform group:</label>
          <select
            className="form-select form-select-sm d-inline-block"
            style={{ width: "220px" }}
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
              className="d-flex flex-wrap gap-2 align-items-end mb-3"
            >
              <input
                type="text"
                name="bodyName"
                placeholder="Platform name"
                className="form-control form-control-sm"
                style={{ width: "160px" }}
              />
              <input
                type="text"
                name="startYear"
                placeholder="Start year"
                className="form-control form-control-sm"
                style={{ width: "80px" }}
              />
              <input
                type="text"
                name="endYear"
                placeholder="End year"
                className="form-control form-control-sm"
                style={{ width: "80px" }}
              />
              <input
                type="text"
                name="slug"
                placeholder="Slug"
                className="form-control form-control-sm"
                style={{ width: "160px" }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                Add platform
              </button>
            </form>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>BodyID</th>
                    <th>Name</th>
                    <th>Years</th>
                    <th>Slug</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bodies.map((b) => (
                    <tr key={b.BodyID}>
                      <td>{b.BodyID}</td>
                      <td>{b.Name}</td>
                      <td>
                        {b.StartYear}-{b.EndYear}
                      </td>
                      <td>{b.slug || "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setEditingBody(b)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteBody(b.BodyID)}
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
      </section>

      <section>
        <h2 className="h5 mb-3">Vehicles</h2>
        <div className="mb-2">
          <label className="me-2">Platform:</label>
          <select
            className="form-select form-select-sm d-inline-block"
            style={{ width: "280px" }}
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
        </div>
        {selectedBodyId && (
          <>
            <form
              onSubmit={handleCreateVehicle}
              className="d-flex flex-wrap gap-2 align-items-end mb-3"
            >
              <input
                type="text"
                name="make"
                placeholder="Make"
                className="form-control form-control-sm"
                style={{ width: "100px" }}
              />
              <input
                type="text"
                name="model"
                placeholder="Model"
                className="form-control form-control-sm"
                style={{ width: "120px" }}
              />
              <input
                type="text"
                name="startYear"
                placeholder="Start"
                className="form-control form-control-sm"
                style={{ width: "60px" }}
              />
              <input
                type="text"
                name="endYear"
                placeholder="End"
                className="form-control form-control-sm"
                style={{ width: "60px" }}
              />
              <input
                type="text"
                name="subModel"
                placeholder="SubModel"
                className="form-control form-control-sm"
                style={{ width: "100px" }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                Add vehicle
              </button>
            </form>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>VehicleID</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Years</th>
                    <th>SubModel</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.VehicleID}>
                      <td>{v.VehicleID}</td>
                      <td>{v.Make}</td>
                      <td>{v.Model}</td>
                      <td>
                        {v.StartYear}-{v.EndYear}
                      </td>
                      <td>{v.SubModel || "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setEditingVehicle(v)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteVehicle(v.VehicleID)}
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
      </section>

      {editingBody && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
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
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
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
    </div>
  );
}
