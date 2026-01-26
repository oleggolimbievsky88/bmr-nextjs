/**
 * Device detection utility
 * Detects if the user agent is a mobile or tablet device
 */

/**
 * Check if user agent is mobile device
 * @param {string} userAgent - The user agent string
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice(userAgent) {
	if (!userAgent) return false
	const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i
	return mobileRegex.test(userAgent)
}

/**
 * Check if user agent is tablet device
 * @param {string} userAgent - The user agent string
 * @returns {boolean} True if tablet device
 */
export function isTabletDevice(userAgent) {
	if (!userAgent) return false
	const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i
	return tabletRegex.test(userAgent)
}

/**
 * Check if user agent is mobile or tablet
 * @param {string} userAgent - The user agent string
 * @returns {boolean} True if mobile or tablet device
 */
export function isMobileOrTablet(userAgent) {
	return isMobileDevice(userAgent) || isTabletDevice(userAgent)
}

/**
 * Check if user agent is desktop
 * @param {string} userAgent - The user agent string
 * @returns {boolean} True if desktop device
 */
export function isDesktop(userAgent) {
	return !isMobileOrTablet(userAgent)
}
