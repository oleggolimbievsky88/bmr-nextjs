"use client";

import { useState } from "react";

const MAX_QTY = 10;

/**
 * Quantity selector. Use controlled mode by passing value + onChange to sync
 * with parent (e.g. for add-to-cart quantity). Omit both for uncontrolled.
 * @param {number} [value] - Controlled value (min 1, max 10)
 * @param {function(number): void} [onChange] - Called when quantity changes
 */
export default function Quantity({ value, onChange }) {
  const isControlled = value !== undefined && typeof onChange === "function";
  const [internalCount, setInternalCount] = useState(1);

  const count = isControlled
    ? Math.min(MAX_QTY, Math.max(1, Number(value) || 1))
    : internalCount;

  const updateCount = (next) => {
    const num = Math.min(
      MAX_QTY,
      Math.max(1, Math.floor(Number(next)) || 1)
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
        max={MAX_QTY}
        type="number"
        onChange={(e) => updateCount(e.target.value)}
        name="number"
        value={count}
      />
      <span
        className="btn-quantity plus-btn"
        onClick={() => updateCount(Math.min(MAX_QTY, count + 1))}
      >
        +
      </span>
    </div>
  );
}
