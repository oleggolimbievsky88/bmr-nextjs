"use client";

import { useState } from "react";

const DEFAULT_MAX_QTY = 10;

/**
 * Quantity selector. Use controlled mode by passing value + onChange to sync
 * with parent (e.g. for add-to-cart quantity). Omit both for uncontrolled.
 * @param {number} [value] - Controlled value (min 1, max = max prop or 10)
 * @param {function(number): void} [onChange] - Called when quantity changes
 * @param {number} [max] - Max allowed quantity (e.g. product.Qty). When > 0, caps quantity to this.
 */
export default function Quantity({ value, onChange, max }) {
  const effectiveMax =
    max != null && Number(max) > 0 ? Math.floor(Number(max)) : DEFAULT_MAX_QTY;
  const isControlled = value !== undefined && typeof onChange === "function";
  const [internalCount, setInternalCount] = useState(1);

  const count = isControlled
    ? Math.min(effectiveMax, Math.max(1, Number(value) || 1))
    : Math.min(effectiveMax, internalCount);

  const updateCount = (next) => {
    const num = Math.min(
      effectiveMax,
      Math.max(1, Math.floor(Number(next)) || 1),
    );
    if (isControlled) {
      onChange(num);
    } else {
      setInternalCount(num);
    }
  };

  return (
    <div className="wg-quantity">
      <span
        className="btn-quantity minus-btn"
        onClick={() => updateCount(count === 1 ? 1 : count - 1)}
      >
        -
      </span>
      <input
        min={1}
        max={effectiveMax}
        type="number"
        onChange={(e) => updateCount(e.target.value)}
        name="number"
        value={count}
      />
      <span
        className="btn-quantity plus-btn"
        onClick={() => updateCount(Math.min(effectiveMax, count + 1))}
      >
        +
      </span>
    </div>
  );
}
