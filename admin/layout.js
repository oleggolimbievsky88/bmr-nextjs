'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }) {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'loading') return

		if (!session) {
			router.push('/admin/login')
			return
		}

		// Check if user is admin
		if (session.user?.role !== 'admin') {
			router.push('/')
			return
		}
	}, [session, status, router])

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-2">Loading...</p>
				</div>
			</div>
		)
	}

	if (!session || session.user?.role !== 'admin') {
		return null
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<nav className="bg-gray-800 text-white shadow-lg">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-8">
							<Link href="/admin" className="text-xl font-bold">
								Admin Dashboard
							</Link>
							<ul className="flex space-x-4">
								<li>
									<Link
										href="/admin"
										className="hover:text-gray-300 transition"
									>
										Dashboard
									</Link>
								</li>
								<li>
									<Link
										href="/admin/orders"
										className="hover:text-gray-300 transition"
									>
										Orders
									</Link>
								</li>
								<li>
									<Link
										href="/admin/coupons"
										className="hover:text-gray-300 transition"
									>
										Coupons
									</Link>
								</li>
								<li>
									<Link
										href="/admin/customers"
										className="hover:text-gray-300 transition"
									>
										Customers
									</Link>
								</li>
								<li>
									<Link
										href="/admin/import"
										className="hover:text-gray-300 transition"
									>
										Import ACES/PIES
									</Link>
								</li>
							</ul>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-sm">
								{session.user?.name || session.user?.email}
							</span>
							<Link
								href="/api/auth/signout"
								className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
							>
								Logout
							</Link>
						</div>
					</div>
				</div>
			</nav>
			<main className="container mx-auto px-4 py-8">{children}</main>
		</div>
	)
} 