'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav({ user }) {
	const pathname = usePathname()
	const navLinks = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/products', label: 'Products' },
		{ href: '/admin/categories', label: 'Categories' },
		{ href: '/admin/orders', label: 'Orders' },
		{ href: '/admin/coupons', label: 'Coupons' },
		{ href: '/admin/customers', label: 'Customers' },
		{ href: '/admin/import', label: 'Import ACES/PIES' },
	]

	const handleLogout = () => {
		window.location.href = '/api/auth/logout?callbackUrl=/'
	}

	return (
		<nav className="admin-nav bg_black">
			<div className="container">
				<div className="d-flex align-items-center justify-content-between flex-wrap admin-nav-inner">
					<ul className="admin-nav-links d-flex align-items-center gap-4 flex-wrap">
						{navLinks.map(({ href, label }) => {
							const isActive = href === '/admin'
								? pathname === '/admin'
								: pathname.startsWith(href)
							return (
								<li key={href}>
									<Link
										href={href}
										className={`admin-nav-link ${isActive ? 'active' : ''}`}
									>
										{label}
									</Link>
								</li>
							)
						})}
					</ul>
					<div className="admin-nav-user d-flex align-items-center gap-3">
						<span className="admin-nav-name text-white">
							{user?.name || user?.email}
						</span>
						<button
							type="button"
							onClick={handleLogout}
							className="tf-btn btn-primary btn-admin-logout"
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</nav>
	)
}
