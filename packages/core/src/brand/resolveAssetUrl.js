function hostnameOf(urlOrHost) {
  if (!urlOrHost || typeof urlOrHost !== "string") return "";
  const s = urlOrHost.trim();
  if (!s) return "";
  try {
    return new URL(s.startsWith("http") ? s : `https://${s}`).hostname;
  } catch {
    return "";
  }
}

function isVercelPreviewHost(hostname) {
  return typeof hostname === "string" && hostname.endsWith(".vercel.app");
}

/**
 * Brand DB `assets_base_url` is often left on an old `*.vercel.app` deploy origin.
 * When `NEXT_PUBLIC_SITE_URL` is a real domain (or localhost), that base must not
 * be used to prefix same-repo `/brands/*` paths — otherwise logos load via the wrong host.
 */
export function effectiveAssetsBaseUrl(assetsBaseUrl, siteUrl) {
  const base = (assetsBaseUrl && String(assetsBaseUrl).trim()) || "";
  if (!base) return "";
  const site = (siteUrl && String(siteUrl).trim()) || "";
  if (!site) return base;
  if (
    isVercelPreviewHost(hostnameOf(base)) &&
    !isVercelPreviewHost(hostnameOf(site))
  ) {
    return "";
  }
  return base;
}

/**
 * @param {{ assetsBaseUrl?: string, path?: string, siteUrl?: string }} opts
 */
export function resolveAssetUrl({ assetsBaseUrl, path, siteUrl } = {}) {
  if (!path) return "";
  const canonicalSite = siteUrl && String(siteUrl).trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const u = new URL(path);
      if (
        isVercelPreviewHost(u.hostname) &&
        canonicalSite &&
        !isVercelPreviewHost(hostnameOf(canonicalSite))
      ) {
        const rel = `${u.pathname}${u.search}`;
        return rel.startsWith("/") ? rel : `/${rel}`;
      }
    } catch {
      /* keep path */
    }
    return path;
  }

  const base = effectiveAssetsBaseUrl(assetsBaseUrl, canonicalSite);
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}
