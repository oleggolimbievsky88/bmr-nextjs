/**
 * Sales tax: 7% for orders outside Florida, 0% for Florida.
 * Taxable base = (subtotal - discount). Florida = 0% for now.
 * TODO: county-based rates (e.g. FL county, or by shipping zip).
 */

const RATE_OUTSIDE_FL = 0.07;
const RATE_FL = 0;

/**
 * @param {string} state - State code (e.g. "FL") or name ("Florida")
 * @returns {number} Tax rate (0 or 0.07)
 */
export function getTaxRateForState(state) {
  if (!state || typeof state !== "string") return RATE_OUTSIDE_FL;
  const s = state.toUpperCase().trim();
  if (s === "FL" || s === "FLORIDA") return RATE_FL;
  return RATE_OUTSIDE_FL;
}

/**
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} state - Shipping/destination state
 * @returns {number} Tax amount rounded to 2 decimals
 */
export function getTaxAmount(subtotal, discount, state) {
  const rate = getTaxRateForState(state);
  const taxable = Math.max(0, parseFloat(subtotal) - parseFloat(discount || 0));
  return Math.round(taxable * rate * 100) / 100;
}
