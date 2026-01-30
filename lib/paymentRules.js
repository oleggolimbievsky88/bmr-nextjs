/**
 * Payment rules by customer location:
 * - US & Canada: credit card OR PayPal
 * - Outside US & Canada: PayPal ONLY (required)
 */

const US_NAMES = ["United States", "United States of America", "USA"];
const CANADA_NAMES = ["Canada"];

/**
 * Whether the country is United States (any state/territory).
 * @param {string} country - Country name from address
 * @returns {boolean}
 */
export function isUnitedStates(country) {
  if (!country || typeof country !== "string") return false;
  const c = country.trim();
  return US_NAMES.some((name) => c === name);
}

/**
 * Whether the country is Canada.
 * @param {string} country - Country name from address
 * @returns {boolean}
 */
export function isCanada(country) {
  if (!country || typeof country !== "string") return false;
  return country.trim() === "Canada";
}

/**
 * Whether the customer is in US or Canada (can use credit card or PayPal).
 * @param {string} country - Country name from address
 * @returns {boolean}
 */
export function isUsOrCanada(country) {
  return isUnitedStates(country) || isCanada(country);
}

/**
 * Whether the customer must use PayPal (outside US and Canada).
 * @param {string} country - Country name from address
 * @returns {boolean}
 */
export function mustUsePayPal(country) {
  return !isUsOrCanada(country);
}

/**
 * Whether the customer can use credit card (US or Canada only).
 * @param {string} country - Country name from address
 * @returns {boolean}
 */
export function canUseCreditCard(country) {
  return isUsOrCanada(country);
}
