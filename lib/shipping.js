/**
 * Returns true if the given state/territory is in the lower 48 US states
 * (excludes Alaska, Hawaii, and US territories).
 * @param {string} state - Two-letter state or territory code (e.g. "FL", "AK").
 * @returns {boolean}
 */
export function isLower48UsState(state) {
  if (!state || typeof state !== "string") return false;
  const upper = state.toUpperCase().trim();
  const excluded = ["AK", "HI", "PR", "GU", "VI", "AS", "MP"];
  return !excluded.includes(upper);
}
