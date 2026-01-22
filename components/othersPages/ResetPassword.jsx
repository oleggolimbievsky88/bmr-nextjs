"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordClient() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		const token = searchParams.get("token");

		if (!token) {
			setError("Invalid reset token");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Failed to reset password");
				setIsLoading(false);
				return;
			}

			setSuccess(true);

			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (error) {
			console.error("Password reset error:", error);
			setError("An error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<section className="flat-spacing-10">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-lg-6">
							<div className="text-center">
								<div
									className="alert alert-success mb_20"
									role="alert"
									style={{ color: "#28a745" }}
								>
									<i className="bi bi-check-circle" style={{ fontSize: "2rem" }}></i>
									<h5 className="mt-3">Password reset successfully!</h5>
									<p>Redirecting to login page...</p>
								</div>
								<Link href="/login" className="tf-btn btn-fill">
									Go to Login
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="flat-spacing-10">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-6">
						<div className="form-register-wrap">
							<h5 className="mb_24">Reset your password</h5>

							{error && (
								<div
									className="alert alert-danger mb_20"
									role="alert"
									style={{ color: "#dc3545" }}
								>
									{error}
								</div>
							)}

							<form onSubmit={handleSubmit}>
								<div className="tf-field style-1 mb_15">
									<input
										className="tf-field-input tf-input"
										placeholder=" "
										type="password"
										id="password"
										name="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={8}
										disabled={isLoading}
										suppressHydrationWarning
									/>
									<label
										className="tf-field-label fw-4 text_black-2"
										htmlFor="password"
									>
										New Password * (min 8 characters)
									</label>
								</div>
								<div className="tf-field style-1 mb_30">
									<input
										className="tf-field-input tf-input"
										placeholder=" "
										type="password"
										id="confirmPassword"
										name="confirmPassword"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										minLength={8}
										disabled={isLoading}
										suppressHydrationWarning
									/>
									<label
										className="tf-field-label fw-4 text_black-2"
										htmlFor="confirmPassword"
									>
										Confirm Password *
									</label>
								</div>
								<div className="mb_20">
									<button
										type="submit"
										className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
										disabled={isLoading}
									>
										{isLoading ? "Resetting..." : "Reset Password"}
									</button>
								</div>
								<div className="text-center">
									<Link href="/login" className="tf-btn btn-line">
										Back to Login
										<i className="icon icon-arrow1-top-left" />
									</Link>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
