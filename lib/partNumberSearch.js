const COLOR_SUFFIXES = new Set(["R", "H"]); // Red / Black Hammertone (your convention)

function clean(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

/**
 * Expand a user-entered part number into search aliases.
 * Example: "UTCA019HR" => ["UTCA019HR", "UTCA019H"]
 * Example: "UTCA019H-R" => ["UTCA019H-R", "UTCA019H"]
 *
 * We keep the original term first (best relevance), then add stripped variants.
 */
export function expandPartNumberAliases(input) {
  const raw = clean(input);
  if (!raw) return [];

  const out = [raw];

  // Allow common separators before suffix
  const normalized = raw.replace(/[\s_]+/g, "");

  // If last char is a known color suffix, add the base without it
  const last = normalized.slice(-1);
  if (COLOR_SUFFIXES.has(last) && normalized.length >= 3) {
    out.push(normalized.slice(0, -1));
  }

  // If it ends with "-R" / "-H" / "_R" / "_H", strip that too
  const m = normalized.match(/^(.*?)[\-_]([RH])$/);
  if (m && m[1] && m[1].length >= 3) {
    out.push(m[1]);
  }

  // Dedupe while preserving order
  return out.filter((v, idx) => out.indexOf(v) === idx);
}
