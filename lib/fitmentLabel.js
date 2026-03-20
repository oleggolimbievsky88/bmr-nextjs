/**
 * Range text for "Fits: …" badges (product cards, PDP title).
 * Prefers product application years; then platforms / YearRange; then SQL join platform years.
 */
export function getProductFitmentRangeText(product) {
  const p = product || {};
  const hasProductYears =
    p.StartAppYear &&
    String(p.StartAppYear).trim() !== "" &&
    parseInt(p.StartAppYear, 10) > 0 &&
    p.EndAppYear &&
    String(p.EndAppYear).trim() !== "" &&
    parseInt(p.EndAppYear, 10) > 0;

  const platformStart =
    p.PlatformStartYear || p.platformStartYear || p.platform_start_year;
  const platformEnd =
    p.PlatformEndYear || p.platformEndYear || p.platform_end_year;

  const startYear = hasProductYears
    ? String(p.StartAppYear).trim()
    : (Array.isArray(p.platforms) && p.platforms[0]
        ? String(p.platforms[0].startYear || "").trim()
        : null) ||
      (p.YearRange ? String(p.YearRange).split("-")[0]?.trim() : null) ||
      (platformStart != null && String(platformStart).trim() !== ""
        ? String(platformStart).trim()
        : null);

  const endYear = hasProductYears
    ? String(p.EndAppYear).trim()
    : (Array.isArray(p.platforms) && p.platforms[0]
        ? String(p.platforms[0].endYear || "").trim()
        : null) ||
      (p.YearRange ? String(p.YearRange).split("-")[1]?.trim() : null) ||
      (platformEnd != null && String(platformEnd).trim() !== ""
        ? String(platformEnd).trim()
        : null);

  if (!startYear && !endYear) return null;
  if (startYear && endYear) {
    return startYear === endYear ? startYear : `${startYear} – ${endYear}`;
  }
  return startYear || endYear;
}
