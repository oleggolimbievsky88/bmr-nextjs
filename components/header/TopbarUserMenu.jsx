'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function TopbarUserMenu() {
	const { data: session, status } = useSession()
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef(null)

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

	if (status === 'loading' || !session) {
		return (
			<li>
				<Link href={`/login`} className="text-white nav-text">
					My Account
				</Link>
			</li>
		)
	}

	const dashboardLink = session.user?.role === 'admin' ? '/admin' : '/my-account'
	const dashboardLabel = session.user?.role === 'admin' ? 'Admin' : 'My Account'

	return (
		<li className="position-relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setShowDropdown(!showDropdown)}
				className="text-white nav-text border-0 bg-transparent p-0"
				style={{ cursor: 'pointer' }}
			>
				{dashboardLabel}
				<i
					className="icon icon-arrow-down ms-1"
					style={{
						transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
						transition: 'transform 0.2s ease',
						fontSize: '10px',
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
						marginTop: '4px',
						minWidth: '180px',
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
						zIndex: 1000,
					}}
				>
					<Link
						href={dashboardLink}
						className="dropdown-item px-3 py-2 text-decoration-none"
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
						{dashboardLabel}
					</Link>
					<button
						type="button"
						onClick={handleLogout}
						className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start"
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
						Logout
					</button>
				</div>
			)}
		</li>
	)
}
