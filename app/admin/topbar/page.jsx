"use client";

import { useState, useEffect } from "react";

export default function AdminTopbarPage() {
  const [messages, setMessages] = useState([{ content: "" }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/topbar-messages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const list =
        data.messages && data.messages.length > 0
          ? data.messages.map((m) => ({ content: m.content || "" }))
          : [{ content: "" }];
      setMessages(list);
      setError("");
    } catch (err) {
      setError(err.message);
      setMessages([{ content: "" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    setMessages((prev) => {
      const next = [...prev];
      next[index] = { content: value };
      return next;
    });
  };

  const handleAdd = () => {
    setMessages((prev) => [...prev, { content: "" }]);
  };

  const handleRemove = (index) => {
    if (messages.length <= 1) return;
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/topbar-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccess(
        "Topbar messages saved. The scrolling text will update on the site.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading topbar messages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Topbar Scrolling Text</h1>
      </div>

      <p className="text-muted mb-3">
        Edit the scrolling announcement text in the top bar. You can use HTML
        such as <code>&lt;a href=&quot;/path&quot;&gt;link&lt;/a&gt;</code>,{" "}
        <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>,{" "}
        <code>&lt;br&gt;</code>. Each block is one slide in the carousel.
      </p>

      {error && <div className="admin-alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-card mb-4">
          {messages.map((m, i) => (
            <div key={i} className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0 fw-6">Message {i + 1}</label>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  disabled={messages.length <= 1}
                  className="btn btn-outline-danger btn-sm"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={m.content}
                onChange={(e) => handleChange(i, e.target.value)}
                className="form-control font-monospace"
                rows={3}
                placeholder='e.g. FREE SHIPPING! Or: Sale now — &lt;a href="/products/2024-mustang/suspension"&gt;Shop here&lt;/a&gt;'
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-outline-secondary mb-3"
          >
            + Add another message
          </button>
        </div>

        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving..." : "Save topbar messages"}
        </button>
      </form>
    </div>
  );
}
