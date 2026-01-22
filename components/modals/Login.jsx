"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
	const router = useRouter();
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [formData, setFormData] = useState({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError("");
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
				setIsLoading(false);
				return;
			}

			// Success - redirect to admin dashboard
			if (typeof window !== "undefined" && window.bootstrap) {
				const modalElement = document.getElementById("login");
				if (modalElement) {
					const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
					if (modalInstance) {
						modalInstance.hide();
					}
				}
			}
			router.push("/admin");
			router.refresh();
		} catch (error) {
			console.error("Login error:", error);
			setError("An error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!agreeToTerms) {
			setError("Please agree to the Terms & Conditions");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstname: formData.firstname,
					lastname: formData.lastname,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Registration failed");
				setIsLoading(false);
				return;
			}

			setSuccess("Account created successfully! Please check your email to verify your account.");
			
			// Store email/password for auto-login
			const registeredEmail = formData.email;
			const registeredPassword = formData.password;
			
			setFormData({
				firstname: "",
				lastname: "",
				email: "",
				password: "",
			});
			setAgreeToTerms(false);

			// Auto-login after registration
			setTimeout(async () => {
				const result = await signIn("credentials", {
					email: registeredEmail,
					password: registeredPassword,
					redirect: false,
				});

				if (!result?.error) {
					if (typeof window !== "undefined" && window.bootstrap) {
						const modalElement = document.getElementById("login");
						if (modalElement) {
							const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
							if (modalInstance) {
								modalInstance.hide();
							}
						}
					}
					router.push("/admin");
					router.refresh();
				}
			}, 2000);
		} catch (error) {
			console.error("Registration error:", error);
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider) => {
		try {
			await signIn(provider, { callbackUrl: "/admin" });
		} catch (error) {
			console.error(`OAuth ${provider} error:`, error);
			setError(`Failed to sign in with ${provider}`);
		}
	};

	const switchMode = () => {
		setIsRegisterMode(!isRegisterMode);
		setError("");
		setSuccess("");
		setFormData({
			firstname: "",
			lastname: "",
			email: "",
			password: "",
		});
		setAgreeToTerms(false);
	};

	return (
		<div
			className="modal modalCentered fade modern-auth-modal modal-part-content"
			id="login"
		>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content modern-auth-content">
					<div className="modern-auth-header">
						<div className="modern-auth-title">
							{isRegisterMode ? (
								<>
									<span className="modern-auth-icon">+</span>
									<h2>Create an account</h2>
								</>
							) : (
								<h2>Log in</h2>
							)}
						</div>
						<button
							type="button"
							className="modern-auth-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>

					<div className="modern-auth-switch">
						{isRegisterMode ? (
							<span>
								Already have an account?{" "}
								<button
									type="button"
									onClick={switchMode}
									className="modern-auth-link"
								>
									Log in
								</button>
							</span>
						) : (
							<span>
								Don't have an account?{" "}
								<button
									type="button"
									onClick={switchMode}
									className="modern-auth-link"
								>
									Create account
								</button>
							</span>
						)}
					</div>

					{error && (
						<div className="modern-auth-alert modern-auth-alert-error" role="alert">
							{error}
						</div>
					)}

					{success && (
						<div className="modern-auth-alert modern-auth-alert-success" role="alert">
							{success}
						</div>
					)}

					<div className="modern-auth-form">
						{isRegisterMode ? (
							<form onSubmit={handleRegister}>
								<div className="modern-auth-name-row">
									<div className="modern-input-group">
										<i className="bi bi-person modern-input-icon" />
										<input
											className="modern-input"
											placeholder="First name"
											type="text"
											required
											name="firstname"
											id="register-firstname"
											autoComplete="given-name"
											value={formData.firstname}
											onChange={handleChange}
											disabled={isLoading}
											suppressHydrationWarning
										/>
									</div>
									<div className="modern-input-group">
										<i className="bi bi-person modern-input-icon" />
										<input
											className="modern-input"
											placeholder="Last name"
											type="text"
											required
											name="lastname"
											id="register-lastname"
											autoComplete="family-name"
											value={formData.lastname}
											onChange={handleChange}
											disabled={isLoading}
											suppressHydrationWarning
										/>
									</div>
								</div>
								<div className="modern-input-group">
									<i className="bi bi-envelope modern-input-icon" />
									<input
										className="modern-input"
										placeholder="Email"
										type="email"
										autoComplete="email"
										required
										name="email"
										id="register-email"
										value={formData.email}
										onChange={handleChange}
										disabled={isLoading}
										suppressHydrationWarning
									/>
								</div>
								<div className="modern-input-group modern-input-password">
									<i className="bi bi-lock modern-input-icon" />
									<input
										className="modern-input"
										placeholder="Enter your password"
										type={showPassword ? "text" : "password"}
										required
										name="password"
										id="register-password"
										autoComplete="new-password"
										value={formData.password}
										onChange={handleChange}
										disabled={isLoading}
										suppressHydrationWarning
									/>
									<button
										type="button"
										className="modern-password-toggle"
										onClick={() => setShowPassword(!showPassword)}
									>
										<i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
									</button>
								</div>
								<div className="modern-auth-checkbox">
									<input
										type="checkbox"
										id="agree-terms"
										checked={agreeToTerms}
										onChange={(e) => setAgreeToTerms(e.target.checked)}
										disabled={isLoading}
									/>
									<label htmlFor="agree-terms">
										I agree to the{" "}
										<a href="/terms-conditions" className="modern-auth-link">
											Terms & Conditions
										</a>
									</label>
								</div>
								<button
									type="submit"
									className="modern-btn modern-btn-primary"
									disabled={isLoading}
								>
									{isLoading ? "Creating account..." : "Create account"}
								</button>
							</form>
						) : (
							<form onSubmit={handleLogin}>
								<div className="modern-input-group">
									<i className="bi bi-envelope modern-input-icon" />
									<input
										className="modern-input"
										placeholder="Email"
										type="email"
										autoComplete="email"
										required
										name="email"
										id="login-email"
										value={formData.email}
										onChange={handleChange}
										disabled={isLoading}
										suppressHydrationWarning
									/>
								</div>
								<div className="modern-input-group modern-input-password">
									<i className="bi bi-lock modern-input-icon" />
									<input
										className="modern-input"
										placeholder="Enter your password"
										type={showPassword ? "text" : "password"}
										required
										name="password"
										id="login-password"
										autoComplete="current-password"
										value={formData.password}
										onChange={handleChange}
										disabled={isLoading}
										suppressHydrationWarning
									/>
									<button
										type="button"
										className="modern-password-toggle"
										onClick={() => setShowPassword(!showPassword)}
									>
										<i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
									</button>
								</div>
								<button
									type="submit"
									className="modern-btn modern-btn-primary"
									disabled={isLoading}
								>
									{isLoading ? "Logging in..." : "Log in"}
								</button>
							</form>
						)}

						<div className="modern-social-divider">
							<span>Or {isRegisterMode ? "register" : "login"} with:</span>
						</div>
						<div className="modern-social-buttons">
							<button
								type="button"
								className="modern-btn modern-btn-google"
								onClick={() => handleOAuthSignIn("google")}
								disabled={isLoading}
							>
								<span className="modern-social-icon modern-social-icon-google">G</span>
								<span>Google</span>
							</button>
							<button
								type="button"
								className="modern-btn modern-btn-facebook"
								onClick={() => handleOAuthSignIn("facebook")}
								disabled={isLoading}
							>
								<span className="modern-social-icon modern-social-icon-facebook">f</span>
								<span>Facebook</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
