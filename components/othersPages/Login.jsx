"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; // Still needed for credentials login
import { useRouter } from "next/navigation";

export default function Login() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	})
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [showRecover, setShowRecover] = useState(false)
	const [recoverEmail, setRecoverEmail] = useState("")
	const [recoverMessage, setRecoverMessage] = useState("")

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
		setError("")
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			})

			if (result?.error) {
				setError("Invalid email or password")
				setIsLoading(false)
				return
			}

			// Success - redirect to account page
			router.push("/my-account")
			router.refresh()
		} catch (error) {
			console.error("Login error:", error)
			setError("An error occurred. Please try again.")
			setIsLoading(false)
		}
	}

	// OAuth sign-in disabled for now
	// const handleOAuthSignIn = async (provider) => {
	// 	try {
	// 		await signIn(provider, { callbackUrl: "/my-account" })
	// 	} catch (error) {
	// 		console.error(`OAuth ${provider} error:`, error)
	// 		setError(`Failed to sign in with ${provider}`)
	// 	}
	// }

	const handlePasswordReset = async (e) => {
		e.preventDefault()
		setRecoverMessage("")
		setIsLoading(true)

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: recoverEmail }),
			})

			const data = await response.json()

			if (!response.ok) {
				setRecoverMessage(data.error || "Failed to send reset email")
				setIsLoading(false)
				return
			}

			setRecoverMessage(
				"If an account with that email exists, a password reset link has been sent."
			)
			setRecoverEmail("")
		} catch (error) {
			console.error("Password reset error:", error)
			setRecoverMessage("An error occurred. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<section className="flat-spacing-10">
			<div className="container">
				<div className="tf-grid-layout lg-col-2 tf-login-wrap">
					<div className="tf-login-form">
						{showRecover ? (
							<div id="recover">
								<h5 className="mb_24">Reset your password</h5>
								<p className="mb_30">
									We will send you an email to reset your password
								</p>
								{recoverMessage && (
									<div
										className={`alert mb_20 ${
											recoverMessage.includes("error") ||
											recoverMessage.includes("Failed")
												? "alert-danger"
												: "alert-success"
										}`}
										role="alert"
									>
										{recoverMessage}
									</div>
								)}
								<div>
									<form onSubmit={handlePasswordReset} className="">
										<div className="tf-field style-1 mb_15">
											<input
												className="tf-field-input tf-input"
												placeholder=""
												required
												type="email"
												autoComplete="email"
												id="recover-email"
												name="email"
												value={recoverEmail}
												onChange={(e) => setRecoverEmail(e.target.value)}
												disabled={isLoading}
											/>
											<label
												className="tf-field-label fw-4 text_black-2"
												htmlFor="recover-email"
											>
												Email *
											</label>
										</div>
										<div className="mb_20">
											<button
												type="button"
												onClick={() => {
													setShowRecover(false)
													setRecoverMessage("")
												}}
												className="tf-btn btn-line"
											>
												Cancel
											</button>
										</div>
										<div className="">
											<button
												type="submit"
												className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
												disabled={isLoading}
											>
												{isLoading ? "Sending..." : "Reset password"}
											</button>
										</div>
									</form>
								</div>
							</div>
						) : (
							<div id="login">
								<h5 className="mb_36">Log in</h5>

								{error && (
									<div
										className="alert alert-danger mb_20"
										role="alert"
										style={{ color: "#dc3545" }}
									>
										{error}
									</div>
								)}

								<div>
									<form onSubmit={handleSubmit}>
										<div className="tf-field style-1 mb_15">
											<input
												required
												className="tf-field-input tf-input"
												placeholder=""
												type="email"
												autoComplete="email"
												id="login-email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												disabled={isLoading}
											/>
											<label
												className="tf-field-label fw-4 text_black-2"
												htmlFor="login-email"
											>
												Email *
											</label>
										</div>
										<div className="tf-field style-1 mb_30">
											<input
												required
												className="tf-field-input tf-input"
												placeholder=""
												type="password"
												id="login-password"
												name="password"
												value={formData.password}
												onChange={handleChange}
												autoComplete="current-password"
												disabled={isLoading}
											/>
											<label
												className="tf-field-label fw-4 text_black-2"
												htmlFor="login-password"
											>
												Password *
											</label>
										</div>
										<div className="mb_20">
											<button
												type="button"
												onClick={() => setShowRecover(true)}
												className="tf-btn btn-line"
											>
												Forgot your password?
											</button>
										</div>
										<div className="">
											<button
												type="submit"
												className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
												disabled={isLoading}
											>
												{isLoading ? "Logging in..." : "Log in"}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}
					</div>
					<div className="tf-login-content">
						<h5 className="mb_36">I'm new here</h5>
						<p className="mb_20">
							Sign up for early Sale access plus tailored new arrivals, trends
							and promotions. To opt out, click unsubscribe in our emails.
						</p>
						<Link href={`/register`} className="tf-btn btn-line">
							Register
							<i className="icon icon-arrow1-top-left" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
