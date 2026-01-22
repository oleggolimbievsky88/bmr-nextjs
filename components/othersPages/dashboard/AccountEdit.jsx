"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountEdit() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [formData, setFormData] = useState({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		confirmPassword: "",
		phonenumber: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		zip: "",
		country: "United States",
		shippingfirstname: "",
		shippinglastname: "",
		shippingaddress1: "",
		shippingaddress2: "",
		shippingcity: "",
		shippingstate: "",
		shippingzip: "",
		shippingcountry: "United States",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.user) {
			fetchUserData();
		}
	}, [status, session, router]);

	const fetchUserData = async () => {
		try {
			const response = await fetch("/api/auth/my-profile");
			const data = await response.json();

			if (data.success && data.user) {
				setFormData({
					firstname: data.user.firstname || "",
					lastname: data.user.lastname || "",
					email: data.user.email || "",
					password: "",
					confirmPassword: "",
					phonenumber: data.user.phonenumber || "",
					address1: data.user.address1 || "",
					address2: data.user.address2 || "",
					city: data.user.city || "",
					state: data.user.state || "",
					zip: data.user.zip || "",
					country: data.user.country || "United States",
					shippingfirstname: data.user.shippingfirstname || "",
					shippinglastname: data.user.shippinglastname || "",
					shippingaddress1: data.user.shippingaddress1 || "",
					shippingaddress2: data.user.shippingaddress2 || "",
					shippingcity: data.user.shippingcity || "",
					shippingstate: data.user.shippingstate || "",
					shippingzip: data.user.shippingzip || "",
					shippingcountry: data.user.shippingcountry || "United States",
				});
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setIsLoadingData(false);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError("");
		setSuccess("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validate password if provided
		if (formData.password) {
			if (formData.password.length < 8) {
				setError("Password must be at least 8 characters long");
				return;
			}

			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match");
				return;
			}
		}

		setIsLoading(true);

		try {
			const updateData = { ...formData };
			delete updateData.confirmPassword;

			// Only include password if it's being changed
			if (!updateData.password) {
				delete updateData.password;
			}

			const response = await fetch("/api/auth/update-profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Failed to update profile");
				setIsLoading(false);
				return;
			}

			setSuccess("Profile updated successfully!");
			setFormData({
				...formData,
				password: "",
				confirmPassword: "",
			});

			// Refresh session to get updated data
			window.location.reload();
		} catch (error) {
			console.error("Update error:", error);
			setError("An error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	if (status === "loading" || isLoadingData) {
		return (
			<div className="my-account-content account-edit">
				<div className="text-center">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return null;
	}

	return (
		<div className="my-account-content account-edit">
			<h5 className="fw-5 mb_30">Account Details</h5>

			{error && (
				<div className="alert alert-danger mb_20" role="alert" style={{ color: "#dc3545" }}>
					{error}
				</div>
			)}

			{success && (
				<div className="alert alert-success mb_20" role="alert" style={{ color: "#28a745" }}>
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<h6 className="mb_20">Personal Information</h6>
				<div className="row mb_30">
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="firstname"
								value={formData.firstname}
								onChange={handleChange}
								required
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								First Name *
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="lastname"
								value={formData.lastname}
								onChange={handleChange}
								required
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Last Name *
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">Email *</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="tel"
								name="phonenumber"
								value={formData.phonenumber}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">Phone</label>
						</div>
					</div>
				</div>

				<h6 className="mb_20">Change Password</h6>
				<div className="row mb_30">
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								minLength={8}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								New Password (leave blank to keep current)
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								minLength={8}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Confirm Password
							</label>
						</div>
					</div>
				</div>

				<h6 className="mb_20">Billing Address</h6>
				<div className="row mb_30">
					<div className="col-md-12 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="address1"
								value={formData.address1}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Address Line 1
							</label>
						</div>
					</div>
					<div className="col-md-12 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="address2"
								value={formData.address2}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Address Line 2
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="city"
								value={formData.city}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">City</label>
						</div>
					</div>
					<div className="col-md-3 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="state"
								value={formData.state}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">State</label>
						</div>
					</div>
					<div className="col-md-3 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="zip"
								value={formData.zip}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">ZIP</label>
						</div>
					</div>
					<div className="col-md-12 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="country"
								value={formData.country}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">Country</label>
						</div>
					</div>
				</div>

				<h6 className="mb_20">Shipping Address</h6>
				<div className="row mb_30">
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingfirstname"
								value={formData.shippingfirstname}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								First Name
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippinglastname"
								value={formData.shippinglastname}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">Last Name</label>
						</div>
					</div>
					<div className="col-md-12 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingaddress1"
								value={formData.shippingaddress1}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Address Line 1
							</label>
						</div>
					</div>
					<div className="col-md-12 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingaddress2"
								value={formData.shippingaddress2}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">
								Address Line 2
							</label>
						</div>
					</div>
					<div className="col-md-6 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingcity"
								value={formData.shippingcity}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">City</label>
						</div>
					</div>
					<div className="col-md-3 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingstate"
								value={formData.shippingstate}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">State</label>
						</div>
					</div>
					<div className="col-md-3 mb_15">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingzip"
								value={formData.shippingzip}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">ZIP</label>
						</div>
					</div>
					<div className="col-md-12 mb_30">
						<div className="tf-field style-1">
							<input
								className="tf-field-input tf-input"
								placeholder=" "
								type="text"
								name="shippingcountry"
								value={formData.shippingcountry}
								onChange={handleChange}
								disabled={isLoading}
							/>
							<label className="tf-field-label fw-4 text_black-2">Country</label>
						</div>
					</div>
				</div>

				<button
					type="submit"
					className="tf-btn btn-fill animate-hover-btn"
					disabled={isLoading}
				>
					{isLoading ? "Saving..." : "Save Changes"}
				</button>
			</form>
		</div>
	);
}
