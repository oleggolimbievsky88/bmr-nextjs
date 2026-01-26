'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

/**
 * Checkout account step: login, register, or continue as guest.
 * @param {Object} props
 * @param {() => void} props.onAuthSuccess - Called after successful login or register
 * @param {() => void} props.onContinueAsGuest - Called when user chooses guest checkout
 */
export default function CheckoutAuthStep({ onAuthSuccess, onContinueAsGuest }) {
	const [isRegisterMode, setIsRegisterMode] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [agreeToTerms, setAgreeToTerms] = useState(false)
	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		email: '',
		password: '',
	})
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
		setError('')
	}

	const handleLogin = async (e) => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email: formData.email,
				password: formData.password,
				redirect: false,
			})

			if (result?.error) {
				const msg =
					result.error === 'CredentialsSignin'
						? 'Invalid email or password'
						: result.error
				setError(typeof msg === 'string' ? msg : 'Invalid email or password')
				setIsLoading(false)
				return
			}

			await new Promise((resolve) => setTimeout(resolve, 100))
			onAuthSuccess()
		} catch (err) {
			console.error('Login error:', err)
			setError('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		if (!agreeToTerms) {
			setError('Please agree to the Terms & Conditions')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstname: formData.firstname,
					lastname: formData.lastname,
					email: formData.email,
					password: formData.password,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				setError(data.error || 'Registration failed')
				setIsLoading(false)
				return
			}

			setSuccess(
				'Account created! Check your email to verify. You can log in ' +
					'below after verifying, or continue as guest.'
			)
			setFormData({ ...formData, firstname: '', lastname: '', password: '' })
			setAgreeToTerms(false)
			setIsRegisterMode(false)
		} catch (err) {
			console.error('Registration error:', err)
			setError('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	const switchMode = () => {
		setIsRegisterMode(!isRegisterMode)
		setError('')
		setSuccess('')
		setFormData({ firstname: '', lastname: '', email: '', password: '' })
		setAgreeToTerms(false)
	}

	return (
		<div className="checkout-auth-step">
			<div className="auth-switch mb-3">
				{isRegisterMode ? (
					<span>
						Already have an account?{' '}
						<button
							type="button"
							onClick={switchMode}
							className="btn btn-link p-0 text-danger"
						>
							Log in
						</button>
					</span>
				) : (
					<span>
						Don&apos;t have an account?{' '}
						<button
							type="button"
							onClick={switchMode}
							className="btn btn-link p-0 text-danger"
						>
							Create account
						</button>
					</span>
				)}
			</div>

			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}
			{success && (
				<div className="alert alert-success" role="alert">
					{success}
				</div>
			)}

			<div className="checkout-form">
				{isRegisterMode ? (
					<form onSubmit={handleRegister}>
						<div className="row">
							<div className="col-md-6">
								<div className="form-group">
									<label htmlFor="auth-firstname">First Name*</label>
									<input
										type="text"
										id="auth-firstname"
										name="firstname"
										value={formData.firstname}
										onChange={handleChange}
										placeholder="First name"
										required
										disabled={isLoading}
										autoComplete="given-name"
										suppressHydrationWarning
									/>
								</div>
							</div>
							<div className="col-md-6">
								<div className="form-group">
									<label htmlFor="auth-lastname">Last Name*</label>
									<input
										type="text"
										id="auth-lastname"
										name="lastname"
										value={formData.lastname}
										onChange={handleChange}
										placeholder="Last name"
										required
										disabled={isLoading}
										autoComplete="family-name"
										suppressHydrationWarning
									/>
								</div>
							</div>
						</div>
						<div className="form-group">
							<label htmlFor="auth-email">Email*</label>
							<input
								type="email"
								id="auth-email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Email"
								required
								disabled={isLoading}
								autoComplete="email"
								suppressHydrationWarning
							/>
						</div>
						<div className="form-group">
							<label htmlFor="auth-password">Password*</label>
							<div className="position-relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="auth-password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="At least 8 characters"
									required
									minLength={8}
									disabled={isLoading}
									autoComplete="new-password"
									suppressHydrationWarning
								/>
								<button
									type="button"
									className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									<i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
								</button>
							</div>
						</div>
						<div className="form-group checkbox-label">
							<label>
								<input
									type="checkbox"
									checked={agreeToTerms}
									onChange={(e) => setAgreeToTerms(e.target.checked)}
									disabled={isLoading}
									suppressHydrationWarning
								/>
								I agree to the{' '}
								<Link href="/terms-conditions" className="text-danger">
									Terms & Conditions
								</Link>
							</label>
						</div>
						<div className="text-center mt-4">
							<button
								type="submit"
								className="btn btn-danger btn-lg"
								disabled={isLoading}
							>
								{isLoading ? 'Creating account...' : 'Create account'}
							</button>
						</div>
					</form>
				) : (
					<form onSubmit={handleLogin}>
						<div className="form-group">
							<label htmlFor="auth-login-email">Email*</label>
							<input
								type="email"
								id="auth-login-email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Email"
								required
								disabled={isLoading}
								autoComplete="email"
								suppressHydrationWarning
							/>
						</div>
						<div className="form-group">
							<label htmlFor="auth-login-password">Password*</label>
							<div className="position-relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="auth-login-password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Password"
									required
									disabled={isLoading}
									autoComplete="current-password"
									suppressHydrationWarning
								/>
								<button
									type="button"
									className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									<i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
								</button>
							</div>
						</div>
						<div className="form-group">
							<Link
								href="/login?callbackUrl=/checkout"
								className="text-danger small"
							>
								Forgot your password?
							</Link>
						</div>
						<div className="text-center mt-4">
							<button
								type="submit"
								className="btn btn-danger btn-lg"
								disabled={isLoading}
							>
								{isLoading ? 'Logging in...' : 'Log in'}
							</button>
						</div>
					</form>
				)}
			</div>

			<div className="text-center mt-4 pt-3 border-top">
				<button
					type="button"
					onClick={onContinueAsGuest}
					className="btn btn-outline-secondary"
				>
					Continue as guest
				</button>
			</div>
		</div>
	)
}
