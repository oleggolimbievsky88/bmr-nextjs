"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyAccount() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.user) {
			fetchOrders();
		}
	}, [status, session, router]);

	const fetchOrders = async () => {
		try {
			const response = await fetch("/api/auth/my-orders");
			const data = await response.json();

			if (data.success) {
				setOrders(data.orders.slice(0, 5)); // Show last 5 orders
			}
		} catch (error) {
			console.error("Error fetching orders:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="my-account-content account-dashboard">
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

	const userName = session.user.name || "User";
	const userEmail = session.user.email;

	return (
		<div className="my-account-content account-dashboard">
			<div className="mb_60">
				<h5 className="fw-5 mb_20">Hello {userName}</h5>
				<p className="mb_20">
					From your account dashboard you can view your{" "}
					<Link className="text_primary" href={`/my-account-orders`}>
						recent orders
					</Link>
					, manage your{" "}
					<Link className="text_primary" href={`/my-account-edit`}>
						shipping and billing addresses
					</Link>
					, and{" "}
					<Link className="text_primary" href={`/my-account-edit`}>
						edit your password and account details
					</Link>
					.
				</p>

				{session.user.role === "dealer" && (
					<div className="alert alert-info mb_20" role="alert">
						<strong>Dealer Account:</strong> You have a{" "}
						{session.user.dealerTier > 0
							? `Tier ${session.user.dealerTier}`
							: ""}{" "}
						account with{" "}
						{session.user.dealerDiscount > 0
							? `${session.user.dealerDiscount}%`
							: "special"}{" "}
						discount pricing.
					</div>
				)}
			</div>

			{orders.length > 0 && (
				<div className="mb_60">
					<h5 className="fw-5 mb_20">Recent Orders</h5>
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th>Order</th>
									<th>Date</th>
									<th>Status</th>
									<th>Total</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => (
									<tr key={order.new_order_id}>
										<td>#{order.order_number}</td>
										<td>
											{new Date(order.order_date).toLocaleDateString()}
										</td>
										<td>
											<span
												className={`badge ${
													order.status === "completed"
														? "bg-success"
														: order.status === "processing"
														? "bg-warning"
														: "bg-secondary"
												}`}
											>
												{order.status}
											</span>
										</td>
										<td>${parseFloat(order.total).toFixed(2)}</td>
										<td>
											<Link
												href={`/my-account-orders/${order.order_number}`}
												className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
											>
												<span>View</span>
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Link href="/my-account-orders" className="tf-btn btn-line mt-3">
						View All Orders
					</Link>
				</div>
			)}
		</div>
	);
}
