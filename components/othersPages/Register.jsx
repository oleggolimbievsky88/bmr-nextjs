"use client";
import React, { useState } from "react";
import Link from "next/link";
// import { signIn } from "next-auth/react"; // OAuth disabled for now
import { useRouter } from "next/navigation";

export default function Register() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
	})
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const [isLoading, setIsLoading] = useState(false)

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
		setSuccess("")
		setIsLoading(true)

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			})

			const data = await response.json()

			if (!response.ok) {
				setError(data.error || "Registration failed")
				setIsLoading(false)
				return
			}

			setSuccess(
				"Account created successfully! Please check your email to verify your account."
			)
			setFormData({
				firstname: "",
				lastname: "",
				email: "",
				password: "",
			})

			// Optionally redirect to login after a delay
			setTimeout(() => {
				router.push("/login")
			}, 3000)
		} catch (error) {
			console.error("Registration error:", error)
			setError("An error occurred. Please try again.")
		} finally {
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

	return (
		<section className="flat-spacing-10">
			<div className="container">
				<div className="form-register-wrap">
					<div className="flat-title align-items-start gap-0 mb_30 px-0">
						<h5 className="mb_18">Register</h5>
						<p className="text_black-2">
							Sign up for early Sale access plus tailored new arrivals, trends
							and promotions. To opt out, click unsubscribe in our emails
						</p>
					</div>

					{error && (
						<div
							className="alert alert-danger mb_20"
							role="alert"
							style={{ color: "#dc3545" }}
						>
							{error}
						</div>
					)}

					{success && (
						<div
							className="alert alert-success mb_20"
							role="alert"
							style={{ color: "#28a745" }}
						>
							{success}
						</div>
					)}

					<div>
						<form
							onSubmit={handleSubmit}
							className=""
							id="register-form"
							action="#"
							method="post"
							acceptCharset="utf-8"
						>
							<div className="tf-field style-1 mb_15">
								<input
									className="tf-field-input tf-input"
									placeholder=" "
									type="text"
									id="firstname"
									name="firstname"
									value={formData.firstname}
									onChange={handleChange}
									required
									disabled={isLoading}
								/>
								<label
									className="tf-field-label fw-4 text_black-2"
									htmlFor="firstname"
								>
									First name *
								</label>
							</div>
							<div className="tf-field style-1 mb_15">
								<input
									className="tf-field-input tf-input"
									placeholder=" "
									type="text"
									id="lastname"
									name="lastname"
									value={formData.lastname}
									onChange={handleChange}
									required
									disabled={isLoading}
								/>
								<label
									className="tf-field-label fw-4 text_black-2"
									htmlFor="lastname"
								>
									Last name *
								</label>
							</div>
							<div className="tf-field style-1 mb_15">
								<input
									className="tf-field-input tf-input"
									placeholder=" "
									type="email"
									autoComplete="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									disabled={isLoading}
								/>
								<label
									className="tf-field-label fw-4 text_black-2"
									htmlFor="email"
								>
									Email *
								</label>
							</div>
							<div className="tf-field style-1 mb_30">
								<input
									className="tf-field-input tf-input"
									placeholder=" "
									type="password"
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									autoComplete="new-password"
									required
									minLength={8}
									disabled={isLoading}
								/>
								<label
									className="tf-field-label fw-4 text_black-2"
									htmlFor="password"
								>
									Password * (min 8 characters)
								</label>
							</div>
							<div className="mb_20">
								<button
									type="submit"
									className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
									disabled={isLoading}
								>
									{isLoading ? "Creating Account..." : "Register"}
								</button>
							</div>
							<div className="text-center">
								<Link href={`/login`} className="tf-btn btn-line">
									Already have an account? Log in here
									<i className="icon icon-arrow1-top-left" />
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	)
}
