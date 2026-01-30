/**
 * Returns a modifier class for color badges (admin, print, confirmation, email).
 * Black/Hammertone/Dark → black label; Red → red label; else default gray.
 * @param {string} [colorName] - Display color name (e.g. "Black Hammertone", "Red")
 * @returns {'color-black'|'color-red'|'color-default'}
 */
export function getColorBadgeClass(colorName) {
  if (!colorName || typeof colorName !== "string") return "color-default";
  const c = colorName.toLowerCase();
  if (c.includes("black") || c.includes("hammertone") || c.includes("dark")) {
    return "color-black";
  }
  if (c.includes("red")) return "color-red";
  return "color-default";
}
