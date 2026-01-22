'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [selectedOrder, setSelectedOrder] = useState(null)

	useEffect(() => {
		fetchOrders()
	}, [statusFilter])

	const fetchOrders = async () => {
		try {
			setLoading(true)
			const url = statusFilter === 'all' 
				? '/api/admin/orders'
				: `/api/admin/orders?status=${statusFilter}`
			const response = await fetch(url)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch orders')
			}

			setOrders(data.orders || [])
			setError('')
		} catch (err) {
			setError(err.message)
			console.error('Error fetching orders:', err)
		} finally {
			setLoading(false)
		}
	}

	const updateOrderStatus = async (orderId, newStatus, trackingNumber = null) => {
		try {
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					status: newStatus,
					tracking_number: trackingNumber || undefined
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to update order status')
			}

			// Refresh orders list
			fetchOrders()
			if (selectedOrder?.new_order_id === orderId) {
				setSelectedOrder({ 
					...selectedOrder, 
					status: newStatus,
					tracking_number: trackingNumber || selectedOrder.tracking_number
				})
			}
		} catch (err) {
			alert(err.message)
			console.error('Error updating order status:', err)
		}
	}

	const viewOrderDetails = async (orderId) => {
		try {
			const response = await fetch(`/api/admin/orders?orderId=${orderId}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch order details')
			}

			setSelectedOrder(data.order)
		} catch (err) {
			alert(err.message)
			console.error('Error fetching order details:', err)
		}
	}

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A'
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const getStatusBadgeClass = (status) => {
		const classes = {
			pending: 'bg-yellow-100 text-yellow-800',
			processed: 'bg-blue-100 text-blue-800',
			shipped: 'bg-green-100 text-green-800',
			delivered: 'bg-gray-100 text-gray-800',
			cancelled: 'bg-red-100 text-red-800',
		}
		return classes[status] || 'bg-gray-100 text-gray-800'
	}

	if (loading && orders.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading orders...</p>
			</div>
		)
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Orders Management</h1>
				<div className="flex gap-2">
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="border rounded px-3 py-2"
					>
						<option value="all">All Orders</option>
						<option value="pending">Pending</option>
						<option value="processed">Processed</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
						<option value="cancelled">Cancelled</option>
					</select>
					<button
						onClick={fetchOrders}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Refresh
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{selectedOrder && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-bold">
									Order: {selectedOrder.order_number}
								</h2>
								<button
									onClick={() => setSelectedOrder(null)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									×
								</button>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-6">
								<div>
									<h3 className="font-semibold mb-2">Billing Information</h3>
									<p>
										{selectedOrder.billing_first_name}{' '}
										{selectedOrder.billing_last_name}
									</p>
									<p>{selectedOrder.billing_address1}</p>
									{selectedOrder.billing_address2 && (
										<p>{selectedOrder.billing_address2}</p>
									)}
									<p>
										{selectedOrder.billing_city}, {selectedOrder.billing_state}{' '}
										{selectedOrder.billing_zip}
									</p>
									<p>{selectedOrder.billing_country}</p>
									<p>{selectedOrder.billing_email}</p>
									{selectedOrder.billing_phone && (
										<p>{selectedOrder.billing_phone}</p>
									)}
								</div>
								<div>
									<h3 className="font-semibold mb-2">Shipping Information</h3>
									<p>
										{selectedOrder.shipping_first_name}{' '}
										{selectedOrder.shipping_last_name}
									</p>
									<p>{selectedOrder.shipping_address1}</p>
									{selectedOrder.shipping_address2 && (
										<p>{selectedOrder.shipping_address2}</p>
									)}
									<p>
										{selectedOrder.shipping_city}, {selectedOrder.shipping_state}{' '}
										{selectedOrder.shipping_zip}
									</p>
									<p>{selectedOrder.shipping_country}</p>
									<p>
										<strong>Method:</strong> {selectedOrder.shipping_method}
									</p>
								</div>
							</div>

							<div className="mb-6">
								<h3 className="font-semibold mb-2">Order Items</h3>
								<table className="w-full border-collapse border border-gray-300">
									<thead>
										<tr className="bg-gray-100">
											<th className="border border-gray-300 px-4 py-2 text-left">
												Product
											</th>
											<th className="border border-gray-300 px-4 py-2 text-left">
												Part Number
											</th>
											<th className="border border-gray-300 px-4 py-2 text-center">
												Quantity
											</th>
											<th className="border border-gray-300 px-4 py-2 text-right">
												Price
											</th>
										</tr>
									</thead>
									<tbody>
										{selectedOrder.items?.map((item) => (
											<tr key={item.new_order_item_id}>
												<td className="border border-gray-300 px-4 py-2">
													{item.product_name}
												</td>
												<td className="border border-gray-300 px-4 py-2">
													{item.part_number}
												</td>
												<td className="border border-gray-300 px-4 py-2 text-center">
													{item.quantity}
												</td>
												<td className="border border-gray-300 px-4 py-2 text-right">
													{formatCurrency(item.price)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mb-6">
								<h3 className="font-semibold mb-2">Order Summary</h3>
								<div className="flex justify-end">
									<div className="w-64">
										<div className="flex justify-between mb-2">
											<span>Subtotal:</span>
											<span>
												{formatCurrency(
													selectedOrder.total -
														(parseFloat(selectedOrder.shipping_cost) || 0) -
														(parseFloat(selectedOrder.tax) || 0) +
														(parseFloat(selectedOrder.discount) || 0)
												)}
											</span>
										</div>
										{selectedOrder.discount > 0 && (
											<div className="flex justify-between mb-2 text-green-600">
												<span>Discount:</span>
												<span>-{formatCurrency(selectedOrder.discount)}</span>
											</div>
										)}
										<div className="flex justify-between mb-2">
											<span>Shipping:</span>
											<span>{formatCurrency(selectedOrder.shipping_cost)}</span>
										</div>
										<div className="flex justify-between mb-2">
											<span>Tax:</span>
											<span>{formatCurrency(selectedOrder.tax)}</span>
										</div>
										<div className="flex justify-between font-bold text-lg border-t pt-2">
											<span>Total:</span>
											<span>{formatCurrency(selectedOrder.total)}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="mb-4">
								<label className="block text-sm font-medium mb-2">
									Tracking Number (for shipped orders)
								</label>
								<input
									type="text"
									id="tracking-number"
									placeholder="Enter tracking number"
									className="w-full border rounded px-3 py-2 mb-2"
									defaultValue={selectedOrder.tracking_number || ''}
								/>
							</div>
							<div className="flex gap-2">
								{selectedOrder.status === 'pending' && (
									<button
										onClick={() =>
											updateOrderStatus(selectedOrder.new_order_id, 'processed')
										}
										className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
									>
										Mark as Processed
									</button>
								)}
								{selectedOrder.status === 'processed' && (
									<button
										onClick={() => {
											const trackingInput = document.getElementById('tracking-number')
											const trackingNumber = trackingInput?.value || ''
											updateOrderStatus(selectedOrder.new_order_id, 'shipped', trackingNumber)
										}}
										className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
									>
										Mark as Shipped
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Order Number
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Date
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Customer
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Items
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Total
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{orders.length === 0 ? (
							<tr>
								<td colSpan="7" className="px-6 py-4 text-center text-gray-500">
									No orders found
								</td>
							</tr>
						) : (
							orders.map((order) => (
								<tr key={order.new_order_id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<strong>{order.order_number}</strong>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{formatDate(order.order_date)}
									</td>
									<td className="px-6 py-4">
										{order.billing_first_name} {order.billing_last_name}
										<br />
										<small className="text-gray-500">{order.billing_email}</small>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{order.item_count || 0} items
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{formatCurrency(order.total)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
												order.status
											)}`}
										>
											{order.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button
											onClick={() => viewOrderDetails(order.new_order_id)}
											className="text-blue-600 hover:text-blue-900 mr-3"
										>
											View
										</button>
										{order.status === 'pending' && (
											<button
												onClick={() =>
													updateOrderStatus(order.new_order_id, 'processed')
												}
												className="text-blue-600 hover:text-blue-900 mr-3"
											>
												Process
											</button>
										)}
										{order.status === 'processed' && (
											<button
												onClick={() => {
													const tracking = prompt('Enter tracking number (optional):')
													updateOrderStatus(order.new_order_id, 'shipped', tracking || null)
												}}
												className="text-green-600 hover:text-green-900"
											>
												Ship
											</button>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
