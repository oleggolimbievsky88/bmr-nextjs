// 2-letter codes for non–lower-48 (Alaska, Hawaii, US territories)
const EXCLUDED_STATE_CODES = ["AK", "HI", "PR", "GU", "VI", "AS", "MP"];

// Full names for same (in case form or autocomplete uses these)
const EXCLUDED_STATE_NAMES = [
  "ALASKA",
  "HAWAII",
  "PUERTO RICO",
  "GUAM",
  "VIRGIN ISLANDS",
  "U.S. VIRGIN ISLANDS",
  "AMERICAN SAMOA",
  "NORTHERN MARIANA ISLANDS",
  "MARIANA ISLANDS",
];

/**
 * Returns true if the given state/territory is in the lower 48 US states
 * (excludes Alaska, Hawaii, and US territories).
 * @param {string} state - Two-letter code (e.g. "FL", "AK") or full name (e.g. "Florida", "Alaska").
 * @returns {boolean}
 */
export function isLower48UsState(state) {
  const s =
    state != null && typeof state.toString === "function"
      ? String(state).trim()
      : "";
  if (!s) return false;
  const upper = s.toUpperCase();
  if (EXCLUDED_STATE_CODES.includes(upper)) return false;
  if (EXCLUDED_STATE_NAMES.includes(upper)) return false;
  return true;
}
