/**
 * A/C delete panels use part numbers starting with FP. Base list price is for bare
 * finish; powder colors use colors.ColorPrice as an add-on (separate order line).
 */

export function isAcDeletePanelPartNumber(partNumber) {
  const p = String(partNumber ?? "")
    .trim()
    .toUpperCase();
  return p.startsWith("FP");
}

/** Per-unit powder coat add-on price, or 0 for bare / non-FP / missing color. */
export function getAcPanelPowderCoatUnitPrice(selectedColor, partNumber) {
  if (!isAcDeletePanelPartNumber(partNumber) || !selectedColor) return 0;
  const raw = selectedColor.ColorPrice ?? selectedColor.colorPrice;
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return 0;
  return n;
}

/**
 * PDP label suffix for FP products only, e.g. " (+$25.00)" when ColorPrice > 0.
 * Bare / no surcharge returns "".
 */
export function formatFpColorPriceSuffix(color, partNumber) {
  const n = getAcPanelPowderCoatUnitPrice(color, partNumber);
  if (n <= 0) return "";
  return ` (+$${n.toFixed(2)})`;
}
