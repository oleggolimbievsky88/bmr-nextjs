/**
 * Canonical site URL for metadata, sitemap, robots, and Open Graph.
 * Use NEXT_PUBLIC_SITE_URL in production (e.g. https://www.bmrsuspension.com).
 */
function getSiteUrl() {
	if (typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' && process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
	}
	const v = process.env.VERCEL_URL
	if (typeof v === 'string' && v) {
		return `https://${v}`
	}
	return 'https://www.bmrsuspension.com'
}

export const SITE_URL = getSiteUrl()
