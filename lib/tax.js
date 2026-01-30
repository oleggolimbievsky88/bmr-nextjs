/**
 * Sales tax: 7% for Florida only; 0% for all other states.
 * Taxable base = (subtotal - discount). In Florida, shipping is also taxable
 * when the order contains any non-BMR product, BMR Package, or BMR Low Margin.
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
 * Whether any item in the order triggers FL shipping tax: non-BMR, or BMR
 * Package, or BMR Low Margin. BMR = manufacturer name contains "BMR".
 * @param {Array<{ Package?: number, LowMargin?: number, ManufacturerName?: string }>} items
 * @returns {boolean}
 */
export function shouldTaxShippingInFlorida(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  const isBmr = (name) =>
    name &&
    typeof name === "string" &&
    (name.toUpperCase().includes("BMR") || name.toUpperCase().includes("B.M.R."));
  for (const item of items) {
    const pkg = Number(item.Package ?? item.package ?? 0);
    const lowMargin = Number(item.LowMargin ?? item.lowMargin ?? 0);
    const manName = item.ManufacturerName ?? item.manufacturerName ?? "";
    if (pkg === 1 || lowMargin === 1 || !isBmr(manName)) return true;
  }
  return false;
}

/**
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} state - Shipping/destination state
 * @param {{ shippingCost?: number, items?: Array<{ Package?, LowMargin?, ManufacturerName? }> }} [options] - If state is FL and options.shippingCost and options.items trigger shipping tax, shipping is added to taxable base.
 * @returns {number} Tax amount rounded to 2 decimals
 */
export function getTaxAmount(subtotal, discount, state, options) {
  const rate = getTaxRateForState(state);
  let taxable = Math.max(0, parseFloat(subtotal) - parseFloat(discount || 0));
  if (
    rate === RATE_FL &&
    options?.shippingCost != null &&
    options?.items &&
    shouldTaxShippingInFlorida(options.items)
  ) {
    taxable += parseFloat(options.shippingCost);
  }
  return Math.round(taxable * rate * 100) / 100;
}
