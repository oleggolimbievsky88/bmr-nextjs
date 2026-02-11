"use client";

import { useState, useEffect } from "react";

const DEFAULT_DURATION_SEC = 3;

function toSeconds(ms) {
  if (ms == null || !Number.isFinite(ms)) return DEFAULT_DURATION_SEC;
  return Math.max(1, Math.min(60, Math.round(ms / 1000)));
}

export default function AdminTopbarPage() {
  const [messages, setMessages] = useState([
    { content: "", duration: DEFAULT_DURATION_SEC, is_active: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const parseJsonOrThrow = async (res) => {
    const text = await res.text();
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      throw new Error(
        res.ok
          ? "Invalid response format"
          : "Server error. Please try again or check that the topbar_messages table exists.",
      );
    }
    return text ? JSON.parse(text) : {};
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/topbar-messages");
      const data = await parseJsonOrThrow(res);
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const list =
        data.messages && data.messages.length > 0
          ? data.messages.map((m) => ({
              content: m.content || "",
              duration: toSeconds(m.duration),
              is_active: m.is_active !== false && m.is_active !== 0,
            }))
          : [
              {
                content: "",
                duration: DEFAULT_DURATION_SEC,
                is_active: true,
              },
            ];
      setMessages(list);
      setError("");
    } catch (err) {
      setError(err.message);
      setMessages([
        { content: "", duration: DEFAULT_DURATION_SEC, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    setMessages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAdd = () => {
    setMessages((prev) => [
      ...prev,
      { content: "", duration: DEFAULT_DURATION_SEC, is_active: true },
    ]);
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
          messages: messages.map((m) => ({
            content: m.content,
            duration: Math.max(1, Math.min(60, Number(m.duration) || 3)),
            is_active: m.is_active !== false,
          })),
        }),
      });
      const data = await parseJsonOrThrow(res);
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccess(
        "Topbar saved. The scrolling strip will update across the site.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="topbar-admin-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0 text-muted">Loading topbar messages…</p>
      </div>
    );
  }

  return (
    <div className="topbar-admin-page">
      <div className="topbar-admin-header">
        <span>
          <span className="topbar-admin-header-icon">
            <i className="bi bi-megaphone-fill" aria-hidden />
          </span>
          <span className="topbar-admin-title">Topbar Announcements</span>
        </span>
        <div>
          <p className="topbar-admin-desc">
            Control the scrolling text in the strip above the main navigation.
            You can use HTML like{" "}
            <code>&lt;a href=&quot;/path&quot;&gt;link&lt;/a&gt;</code>,{" "}
            <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>,{" "}
            <code>&lt;br&gt;</code>.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </div>
      )}
      {success && (
        <div
          className="alert alert-success d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="topbar-admin-list">
          {messages.map((m, i) => (
            <article key={i} className="topbar-message-card">
              <div className="topbar-message-card-head">
                <span className="topbar-message-card-badge">
                  Message {i + 1}
                </span>
                <div className="topbar-message-card-meta">
                  <label className="topbar-duration-label">
                    <span className="d-none d-sm-inline">Display</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={m.duration}
                      onChange={(e) =>
                        handleChange(i, "duration", e.target.value)
                      }
                      className="form-control form-control-sm topbar-duration-input"
                    />
                    <span>sec</span>
                  </label>
                  <div className="form-check form-switch topbar-active-switch">
                    <input
                      type="checkbox"
                      id={`active-${i}`}
                      checked={m.is_active !== false}
                      onChange={(e) =>
                        handleChange(i, "is_active", e.target.checked)
                      }
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor={`active-${i}`}>
                      Active
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    disabled={messages.length <= 1}
                    className="btn btn-sm btn-outline-danger topbar-remove-btn"
                    title="Remove message"
                  >
                    <i className="bi bi-trash" aria-hidden />
                  </button>
                </div>
              </div>
              <textarea
                value={m.content}
                onChange={(e) => handleChange(i, "content", e.target.value)}
                className="form-control topbar-content-input"
                rows={2}
                placeholder='e.g. FREE SHIPPING! Or: Sale — <a href="/products/2024-mustang/suspension">Shop here</a>'
              />
            </article>
          ))}
        </div>

        <div className="topbar-admin-actions">
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-outline-primary topbar-add-btn"
          >
            <i className="bi bi-plus-lg me-1" aria-hidden />
            Add message
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary topbar-save-btn"
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              <>
                <i className="bi bi-check2 me-1" aria-hidden />
                Save topbar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
