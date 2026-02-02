/**
 * Sales tax: 7% for Florida only; 0% for all other states.
 * Taxable base = (subtotal - discount). In Florida, shipping is always taxable
 * for all products, regardless of brand.
 * TODO: county-based rates (e.g. FL county, or by shipping zip).
 */

const RATE_FL = 0.07;
const RATE_OTHER = 0;

/**
 * @param {string} state - State code (e.g. "FL") or name ("Florida")
 * @returns {number} Tax rate (0 or 0.07)
 */
export function getTaxRateForState(state) {
  if (!state || typeof state !== "string") return RATE_OTHER;
  const s = state.toUpperCase().trim();
  if (s === "FL" || s === "FLORIDA") return RATE_FL;
  return RATE_OTHER;
}

/**
 * True when state is Florida (for shipping tax rules).
 * @param {string} state
 * @returns {boolean}
 */
export function isFlorida(state) {
  return getTaxRateForState(state) === RATE_FL;
}

/**
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} state - Shipping/destination state
 * @param {{ shippingCost?: number }} [options] - If state is FL and options.shippingCost is provided, shipping is added to taxable base.
 * @returns {number} Tax amount rounded to 2 decimals
 */
export function getTaxAmount(subtotal, discount, state, options) {
  const rate = getTaxRateForState(state);
  let taxable = Math.max(0, parseFloat(subtotal) - parseFloat(discount || 0));
  if (rate === RATE_FL && options?.shippingCost != null) {
    taxable += parseFloat(options.shippingCost);
  }
  return Math.round(taxable * rate * 100) / 100;
}
