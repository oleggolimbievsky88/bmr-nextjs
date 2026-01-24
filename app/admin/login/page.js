'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function AdminLoginPage() {
	const [error, setError] = useState('')

	const handleSubmit = async (e) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)

		try {
			const res = await signIn('credentials', {
				email: formData.get('email'),
				password: formData.get('password'),
				redirect: false,
			})

			if (res.error) {
				setError(
					res.error === 'CredentialsSignin'
						? 'Invalid email or password'
						: res.error
				)
			} else {
				await new Promise((resolve) => setTimeout(resolve, 100))
				const sessionRes = await fetch('/api/auth/session', {
					cache: 'no-store',
				})
				const session = await sessionRes.json()
				window.location.href =
					session?.user?.role === 'admin' ? '/admin' : '/my-account'
			}
		} catch (err) {
			setError('An error occurred')
		}
	}

	return (
		<div className="d-flex align-items-center justify-content-center py-5">
			<div className="admin-card" style={{ maxWidth: '400px', width: '100%' }}>
				<h2 className="h4 fw-6 text-center mb-4">Admin Login</h2>
				<form onSubmit={handleSubmit}>
					{error && (
						<div className="admin-alert-error mb-3" role="alert">
							{error}
						</div>
					)}
					<div className="admin-form-group mb-3">
						<label htmlFor="admin-login-email">Email</label>
						<input
							id="admin-login-email"
							name="email"
							type="email"
							required
							autoComplete="email"
							className="form-control"
							placeholder="Email"
						/>
					</div>
					<div className="admin-form-group mb-4">
						<label htmlFor="admin-login-password">Password</label>
						<input
							id="admin-login-password"
							name="password"
							type="password"
							required
							autoComplete="current-password"
							className="form-control"
							placeholder="Password"
						/>
					</div>
					<button type="submit" className="admin-btn-primary w-100">
						Sign in
					</button>
				</form>
			</div>
		</div>
	)
}
