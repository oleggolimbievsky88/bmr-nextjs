/**
 * Map platform group name (from DB) to the nav id used in brand navOrder / navPlatformIds.
 * Used so menu and admin sort order stay in sync without hardcoding group names in both places.
 * @param {string} name - platform_groups.name
 * @returns {string|null} nav id (e.g. 'ford', 'amc') or null if no match
 */
export function navIdFromPlatformGroupName(name) {
  const n = String(name || "")
    .trim()
    .toLowerCase();
  if (!n) return null;
  if (n.includes("ford")) return "ford";
  if (n.includes("mopar")) return "mopar";
  if (n.includes("amc")) return "amc";
  if (n.includes("gm") && n.includes("late")) return "gmLateModel";
  if (n.includes("gm") && n.includes("mid")) return "gmMidMuscle";
  if (n.includes("gm") && n.includes("classic")) return "gmClassicMuscle";
  return null;
}
