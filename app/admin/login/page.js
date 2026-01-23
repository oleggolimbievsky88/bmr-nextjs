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
				setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
			} else {
				await new Promise((resolve) => setTimeout(resolve, 100))
				window.location.href = '/admin'
			}
		} catch (err) {
			setError('An error occurred')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && <div className="text-red-500 text-center">{error}</div>}
					<div>
						<label htmlFor="email" className="sr-only">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autoComplete="email"
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							placeholder="Email"
						/>
					</div>
					<div>
						<label htmlFor="password" className="sr-only">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							placeholder="Password"
						/>
					</div>
					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Sign in
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
