'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function UserAccountMenu() {
	const { data: session, status } = useSession()
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef(null)

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false)
			}
		}

		if (showDropdown) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showDropdown])

	const handleLogout = async () => {
		await signOut({ callbackUrl: '/' })
	}

	if (status === 'loading') {
		return (
			<li className="nav-account tf-md-hidden">
				<a
					href="#login"
					data-bs-toggle="modal"
					className="nav-icon-item align-items-center gap-10"
				>
					<i className="icon icon-account" />
					<span className="text" style={{ fontSize: '14px' }}>
						My Account
					</span>
				</a>
			</li>
		)
	}

	if (!session) {
		return (
			<li className="nav-account tf-md-hidden">
				<a
					href="#login"
					data-bs-toggle="modal"
					className="nav-icon-item align-items-center gap-10"
				>
					<i className="icon icon-account" />
					<span className="text" style={{ fontSize: '14px' }}>
						My Account
					</span>
				</a>
			</li>
		)
	}

	// User is logged in - show dropdown menu
	const dashboardLink = session.user?.role === 'admin' ? '/admin' : '/my-account'
	const dashboardLabel = session.user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'

	return (
		<li className="nav-account tf-md-hidden position-relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setShowDropdown(!showDropdown)}
				className="nav-icon-item align-items-center gap-10 border-0 bg-transparent p-0"
				style={{ cursor: 'pointer' }}
			>
				<i className="icon icon-account" />
				<span className="text" style={{ fontSize: '14px' }}>
					{session.user?.name || session.user?.email || 'Account'}
				</span>
				<i
					className={`icon icon-arrow-down ms-1`}
					style={{
						transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
						transition: 'transform 0.2s ease',
						fontSize: '12px',
					}}
				/>
			</button>
			{showDropdown && (
				<div
					className="dropdown-menu show"
					style={{
						position: 'absolute',
						right: 0,
						top: '100%',
						marginTop: '8px',
						minWidth: '200px',
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
						zIndex: 1000,
					}}
				>
					<Link
						href={dashboardLink}
						className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
						style={{
							color: '#333',
							borderBottom: '1px solid #eee',
							backgroundColor: 'transparent',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#f8f9fa'
							e.currentTarget.style.color = '#333'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent'
							e.currentTarget.style.color = '#333'
						}}
						onClick={() => setShowDropdown(false)}
					>
						<i className="icon icon-account" style={{ fontSize: '16px' }} />
						<span>{dashboardLabel}</span>
					</Link>
					{session.user?.role === 'admin' && (
						<Link
							href="/admin/orders"
							className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
							style={{
								color: '#333',
								borderBottom: '1px solid #eee',
								backgroundColor: 'transparent',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = '#f8f9fa'
								e.currentTarget.style.color = '#333'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent'
								e.currentTarget.style.color = '#333'
							}}
							onClick={() => setShowDropdown(false)}
						>
							<i className="icon icon-bag" style={{ fontSize: '16px' }} />
							<span>Orders</span>
						</Link>
					)}
					<button
						type="button"
						onClick={handleLogout}
						className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent w-100 text-start"
						style={{
							color: '#dc3545',
							cursor: 'pointer',
							backgroundColor: 'transparent',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#fff5f5'
							e.currentTarget.style.color = '#dc3545'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent'
							e.currentTarget.style.color = '#dc3545'
						}}
					>
						<i className="icon icon-logout" style={{ fontSize: '16px' }} />
						<span>Logout</span>
					</button>
				</div>
			)}
		</li>
	)
}
