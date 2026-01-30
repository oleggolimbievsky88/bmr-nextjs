"use client";

import { useState, useEffect } from "react";

const SUBJECT_OPTIONS = [
  { value: "", label: "Select area (optional)" },
  { value: "Dealer Portal", label: "Dealer Portal" },
  { value: "Website", label: "Website (general)" },
  { value: "Products / Catalog", label: "Products / Catalog" },
  { value: "Orders / Invoicing", label: "Orders / Invoicing" },
  { value: "Other", label: "Other" },
];

export default function DealersPortalSuggestionsPage() {
  const [subject, setSubject] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadSuggestions = () => {
    setLoadingList(true);
    fetch("/api/dealer/suggestions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.suggestions)) {
          setList(data.suggestions);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    if (!suggestion.trim()) {
      setMessage({ type: "error", text: "Please describe your suggestion." });
      return;
    }
    setSending(true);
    fetch("/api/dealer/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject.trim() || "General",
        suggestion: suggestion.trim(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMessage({ type: "success", text: data.message || "Submitted." });
          setSubject("");
          setSuggestion("");
          loadSuggestions();
        } else {
          setMessage({
            type: "error",
            text: data.error || "Failed to submit.",
          });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to submit." });
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="my-account-content">
      <h5 className="fw-bold mb_30">Suggestions</h5>
      <p className="text-muted mb-4">
        Share ideas for new features or improvements to the Dealer Portal or the
        website. We review all submissions.
      </p>

      <div className="dashboard-card mb-4">
        <h6 className="dashboard-card-title mb-3">Submit a suggestion</h6>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small">Area</label>
            <select
              className="form-select form-select-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small">Your suggestion</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe the feature or improvement you'd like to see..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              disabled={sending}
            />
          </div>
          {message && (
            <div
              className={`mb-3 alert ${
                message.type === "success" ? "alert-success" : "alert-danger"
              } py-2 small`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            className="tf-btn btn-fill animate-hover-btn btn-sm"
            disabled={sending}
          >
            {sending ? "Submitting…" : "Submit suggestion"}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h6 className="dashboard-card-title mb-3">Your submitted suggestions</h6>
        {loadingList ? (
          <p className="text-muted small mb-0">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-muted small mb-0">
            You haven&apos;t submitted any suggestions yet.
          </p>
        ) : (
          <ul className="list-unstyled mb-0">
            {list.map((item) => (
              <li key={item.id} className="border-bottom border-light pb-3 mb-3">
                <span className="badge bg-secondary me-2">{item.status}</span>
                {item.subject && (
                  <span className="text-muted small">{item.subject}</span>
                )}
                <p className="mb-0 mt-1 small">{item.suggestion}</p>
                <span className="text-muted small">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
