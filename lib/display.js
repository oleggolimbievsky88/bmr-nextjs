/**
 * Treats null, undefined, "", and the DB placeholder "0" (default for empty
 * in customers and similar tables) as blank. Returns trimmed string otherwise.
 * Use for display and form pre-fill to avoid showing "0" for empty fields.
 *
 * @param {*} v - Raw value from DB or API
 * @returns {string} Empty string when "empty", otherwise trimmed string
 */
export function asBlank(v) {
  if (v == null || v === "") return "";
  const s = String(v).trim();
  return s === "0" ? "" : s;
}

/**
 * Parse a price value that may include commas (e.g. "4,999.95").
 * Strips commas and other non-numeric characters except digits, one minus, and one decimal point.
 *
 * @param {*} val - Price from DB or form (string or number)
 * @returns {number} Numeric value, or 0 if invalid
 */
export function parsePrice(val) {
  if (val === null || val === undefined) return 0;
  const n = parseFloat(String(val).replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}
