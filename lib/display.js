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
