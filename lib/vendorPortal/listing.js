export function mapR2ListToExplorer({ data, basePrefix, relPath }) {
  const fullPrefix = relPath
    ? `${basePrefix}${relPath.replace(/\/+$/, "")}/`
    : basePrefix;

  const folders = (data.CommonPrefixes || [])
    .map((cp) => cp.Prefix)
    .filter(Boolean)
    .map((p) => {
      const name = p.endsWith("/") ? p.slice(0, -1).split("/").pop() : p;
      const rel = p.startsWith(basePrefix) ? p.slice(basePrefix.length) : p;
      return { name, path: rel.replace(/\/$/, "") };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const files = (data.Contents || [])
    .map((o) => ({
      key: o.Key,
      size: o.Size || 0,
      lastModified: o.LastModified
        ? new Date(o.LastModified).toISOString()
        : null,
    }))
    .filter(
      (o) => o.key && o.key !== fullPrefix && !String(o.key).endsWith("/"),
    )
    .map((o) => {
      const relKey = o.key.startsWith(basePrefix)
        ? o.key.slice(basePrefix.length)
        : o.key;
      return {
        name: o.key.split("/").pop(),
        key: relKey,
        size: o.size,
        lastModified: o.lastModified,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return { folders, files, fullPrefix };
}
