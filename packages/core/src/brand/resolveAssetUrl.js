export function resolveAssetUrl({ assetsBaseUrl, path }) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!assetsBaseUrl) return path.startsWith("/") ? path : `/${path}`;
  const base = assetsBaseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
