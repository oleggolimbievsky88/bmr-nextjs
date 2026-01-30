"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function DealersPortalPOViewPage() {
  const params = useParams();
  const poId = params?.poId;
  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!poId) return;
    fetch(`/api/dealer/po/${poId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPo(data.po);
          setItems(data.items || []);
        } else setError(data.error || "Failed to load");
      })
      .catch((err) => {
        setError(err.message);
        setPo(null);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [poId]);

  if (loading) {
    return (
      <div className="my-account-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="my-account-content">
        <div className="alert alert-danger">{error || "PO not found"}</div>
        <Link
          href="/dealers-portal/orders"
          className="btn btn-outline-primary btn-sm"
        >
          Back to Orders & POs
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, i) => sum + (parseFloat(i.unit_price) || 0) * (i.quantity || 1),
    0
  );

  return (
    <div className="my-account-content">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h5 className="fw-5 mb-0">PO #{po.id}</h5>
        <Link
          href="/dealers-portal/orders"
          className="btn btn-outline-primary btn-sm"
        >
          Back to Orders & POs
        </Link>
      </div>

      <p className="small text-muted mb-3">
        Status: <strong>{po.status}</strong>
        {po.sent_at && ` · Sent: ${new Date(po.sent_at).toLocaleString()}`}
      </p>

      {po.notes && (
        <div className="mb-3">
          <strong>Notes:</strong> {po.notes}
        </div>
      )}

      <div className="table-responsive mb-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Part #</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Color</th>
              <th>Add-ons</th>
              <th className="text-end">Unit price</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const addons = [
                i.grease_name,
                i.anglefinder_name,
                i.hardware_name,
              ].filter(Boolean);
              return (
                <tr key={i.id}>
                  <td className="small">{i.part_number}</td>
                  <td>{i.product_name}</td>
                  <td>{i.quantity}</td>
                  <td>{i.color_name || "—"}</td>
                  <td className="small">
                    {addons.length ? addons.join(", ") : "—"}
                  </td>
                  <td className="text-end">{formatPrice(i.unit_price)}</td>
                  <td className="text-end">
                    {formatPrice(
                      (parseFloat(i.unit_price) || 0) * (i.quantity || 1)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-4 fw-6">Subtotal: {formatPrice(subtotal)}</div>

      {po.status === "sent" && (
        <div className="d-flex gap-2 flex-wrap">
          <a href={`/checkout?po=${po.id}`} className="btn btn-primary btn-sm">
            Pay with Credit Card
          </a>
          <a
            href={`/checkout?po=${po.id}&pay=paypal`}
            className="btn btn-outline-secondary btn-sm"
          >
            Pay with PayPal
          </a>
        </div>
      )}
    </div>
  );
}
