"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailClient() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState("verifying");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			setStatus("error");
			setMessage("No verification token provided");
			return;
		}

		const verifyEmail = async () => {
			try {
				const response = await fetch(`/api/auth/verify-email?token=${token}`);
				const data = await response.json();

				if (!response.ok) {
					setStatus("error");
					setMessage(data.error || "Verification failed");
					return;
				}

				setStatus("success");
				setMessage("Email verified successfully! You can now log in.");

				// Redirect to login after 3 seconds
				setTimeout(() => {
					router.push("/login");
				}, 3000);
			} catch (error) {
				console.error("Verification error:", error);
				setStatus("error");
				setMessage("An error occurred during verification");
			}
		};

		verifyEmail();
	}, [searchParams, router]);

	return (
		<section className="flat-spacing-10">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-6">
						<div className="text-center">
							{status === "verifying" && (
								<>
									<div className="spinner-border mb_20" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
									<h5>Verifying your email...</h5>
								</>
							)}

							{status === "success" && (
								<>
									<div
										className="alert alert-success mb_20"
										role="alert"
										style={{ color: "#28a745" }}
									>
										<i className="bi bi-check-circle" style={{ fontSize: "2rem" }}></i>
										<h5 className="mt-3">{message}</h5>
										<p>Redirecting to login page...</p>
									</div>
									<Link href="/login" className="tf-btn btn-fill">
										Go to Login
									</Link>
								</>
							)}

							{status === "error" && (
								<>
									<div
										className="alert alert-danger mb_20"
										role="alert"
										style={{ color: "#dc3545" }}
									>
										<i className="bi bi-x-circle" style={{ fontSize: "2rem" }}></i>
										<h5 className="mt-3">{message}</h5>
									</div>
									<Link href="/register" className="tf-btn btn-line me-2">
										Register Again
									</Link>
									<Link href="/login" className="tf-btn btn-fill">
										Go to Login
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
