'use client'
import { useState, useEffect } from 'react'

/**
 * ViewToggle component
 * Allows users to switch between desktop (CF site) and mobile (NextJS) views
 */
export default function ViewToggle() {
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	if (!isClient) {
		return null
	}

	// Get the ColdFusion site URL
	const cfUrl = process.env.NEXT_PUBLIC_CF_SITE_URL || 'https://www.bmrsuspension.com'
	const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'

	// Build the desktop URL - convert NextJS paths to CF paths if needed
	let desktopPath = currentPath
	if (desktopPath === '/' || desktopPath.startsWith('/?')) {
		desktopPath = '/index.cfm' + (desktopPath.includes('?') ? desktopPath.substring(1) : '')
	} else if (desktopPath.startsWith('/product/')) {
		// Convert NextJS product path to CF format
		const productId = desktopPath.match(/\/product\/(\d+)/)?.[1]
		if (productId) {
			desktopPath = '/index.cfm?page=products&productid=' + productId
		}
	} else {
		// For other paths, try to convert to CF format
		desktopPath = '/index.cfm' + desktopPath
	}

	// Remove existing view parameter if present
	if (desktopPath.includes('?')) {
		desktopPath = desktopPath.replace(/[&?]view=[^&]*/g, '')
		if (!desktopPath.includes('?')) {
			desktopPath = desktopPath.replace('&', '?')
		}
	}

	// Add view=desktop parameter
	const separator = desktopPath.includes('?') ? '&' : '?'
	const desktopUrl = `${cfUrl}${desktopPath}${separator}view=desktop`

	return (
		<li>
			<a
				href={desktopUrl}
				className="text-white nav-text"
				title="Switch to Desktop View"
			>
				Desktop View
			</a>
		</li>
	)
}
