/** Color name → hex mapping for badge backgrounds */
const COLOR_TO_HEX = {
  black: "#1a1a1a",
  hammertone: "#2c2c2c",
  dark: "#333333",
  red: "#dc3545",
  blue: "#2563eb",
  "light blue": "#60a5fa",
  white: "#f8f9fa",
  gray: "#6b7280",
  grey: "#6b7280",
  silver: "#9ca3af",
  green: "#16a34a",
  "light green": "#22c55e",
  brown: "#92400e",
  beige: "#d4b896",
  tan: "#d2b48c",
  orange: "#ea580c",
  yellow: "#eab308",
  gold: "#ca8a04",
  pink: "#db2777",
  purple: "#7c3aed",
  "light purple": "#a78bfa",
  burgundy: "#9f1239",
  bronze: "#b45309",
  charcoal: "#374151",
};

function parseColorToHex(colorName) {
  if (!colorName || typeof colorName !== "string") return null;
  const c = colorName.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_TO_HEX)) {
    if (c.includes(key)) return hex;
  }
  return null;
}

/** Relative luminance - for picking white vs black text on background */
function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const [rs, gs, bs] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Returns inline style for a color badge with background matching the color.
 * Uses white or black text for contrast. Unknown colors fall back to gray.
 * @param {string} [colorName] - Display color name (e.g. "Blue", "Black Hammertone")
 * @returns {{ backgroundColor: string, color: string, borderColor: string }}
 */
export function getColorBadgeStyle(colorName) {
  const hex = parseColorToHex(colorName) || "#6b7280";
  const luminance = getLuminance(hex);
  const textColor = luminance > 0.4 ? "#1a1a1a" : "#ffffff";
  return {
    backgroundColor: hex,
    color: textColor,
    borderColor: hex,
  };
}

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
