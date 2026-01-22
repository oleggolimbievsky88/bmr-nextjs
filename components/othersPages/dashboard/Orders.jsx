"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Orders() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated") {
			fetchOrders();
		}
	}, [status, router]);

	const fetchOrders = async () => {
		try {
			const response = await fetch("/api/auth/my-orders");
			const data = await response.json();

			if (data.success) {
				setOrders(data.orders);
			}
		} catch (error) {
			console.error("Error fetching orders:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="my-account-content account-order">
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
		<div className="my-account-content account-order">
			<h5 className="fw-5 mb_30">My Orders</h5>
			{orders.length === 0 ? (
				<div className="text-center py-5">
					<p>You haven't placed any orders yet.</p>
					<Link href="/products" className="tf-btn btn-fill mt-3">
						Start Shopping
					</Link>
				</div>
			) : (
				<div className="wrap-account-order">
					<div className="table-responsive">
						<table>
							<thead>
								<tr>
									<th className="fw-6">Order</th>
									<th className="fw-6">Date</th>
									<th className="fw-6">Status</th>
									<th className="fw-6">Total</th>
									<th className="fw-6">Items</th>
									<th className="fw-6">Actions</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => (
									<tr key={order.new_order_id} className="tf-order-item">
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
														: order.status === "shipped"
														? "bg-info"
														: "bg-secondary"
												}`}
											>
												{order.status}
											</span>
										</td>
										<td>${parseFloat(order.total).toFixed(2)}</td>
										<td>{order.item_count} items</td>
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
				</div>
			)}
		</div>
	);
}
