'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Topbar4 from '@/components/header/Topbar4'
import Header18 from '@/components/header/Header18'
import AdminNav from '@/components/admin/AdminNav'
import Footer1 from '@/components/footer/Footer'

export default function AdminLayout({ children }) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const isLoginPage = pathname === '/admin/login'

	useEffect(() => {
		if (isLoginPage) return
		if (status === 'loading') return

		if (!session) {
			router.push('/admin/login')
			return
		}

		if (session.user?.role !== 'admin') {
			router.push('/')
			return
		}
	}, [session, status, router, isLoginPage])

	if (isLoginPage) {
		return (
			<>
				<Topbar4 />
				<Header18 showVehicleSearch={false} />
				<main className="admin-page">
					<div className="container">{children}</div>
				</main>
				<Footer1 />
			</>
		)
	}

	if (status === 'loading') {
		return (
			<div className="min-vh-100 d-flex align-items-center justify-content-center">
				<div className="text-center">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3 mb-0">Loading...</p>
				</div>
			</div>
		)
	}

	if (!session || session.user?.role !== 'admin') {
		return null
	}

	return (
		<>
			<Topbar4 />
			<Header18 showVehicleSearch={false} />
			<AdminNav user={session.user} />
			<main className="admin-page">
				<div className="container">{children}</div>
			</main>
			<Footer1 />
		</>
	)
}
