'use client'

import { useState, useEffect } from 'react'

export default function AdminCustomersPage() {
	const [customers, setCustomers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [editingCustomer, setEditingCustomer] = useState(null)
	const [formData, setFormData] = useState({
		role: 'customer',
		dealerTier: 0,
		dealerDiscount: 0,
	})

	useEffect(() => {
		fetchCustomers()
	}, [searchTerm])

	const fetchCustomers = async () => {
		try {
			setLoading(true)
			const url = searchTerm
				? `/api/admin/customers?search=${encodeURIComponent(searchTerm)}`
				: '/api/admin/customers'
			const response = await fetch(url)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch customers')
			}

			setCustomers(data.customers || [])
			setError('')
		} catch (err) {
			setError(err.message)
			console.error('Error fetching customers:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (customer) => {
		setEditingCustomer(customer)
		setFormData({
			role: customer.role || 'customer',
			dealerTier: customer.dealerTier || 0,
			dealerDiscount: customer.dealerDiscount || 0,
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		try {
			const response = await fetch(`/api/admin/customers/${editingCustomer.CustomerID}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to update customer')
			}

			setEditingCustomer(null)
			fetchCustomers()
			alert('Customer updated successfully!')
		} catch (err) {
			setError(err.message)
			console.error('Error updating customer:', err)
		}
	}

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A'
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	if (loading && customers.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading customers...</p>
			</div>
		)
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Customer Management</h1>
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Search by name or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="border rounded px-3 py-2"
						style={{ minWidth: '300px' }}
					/>
					<button
						onClick={fetchCustomers}
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

			{editingCustomer && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-2xl font-bold mb-4">
						Edit Customer: {editingCustomer.firstname} {editingCustomer.lastname}
					</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Role *</label>
								<select
									name="role"
									value={formData.role}
									onChange={(e) =>
										setFormData({ ...formData, role: e.target.value })
									}
									required
									className="w-full border rounded px-3 py-2"
								>
									<option value="customer">Customer</option>
									<option value="admin">Admin</option>
									<option value="vendor">Vendor</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Dealer Tier (1-8)
								</label>
								<input
									type="number"
									name="dealerTier"
									value={formData.dealerTier}
									onChange={(e) =>
										setFormData({
											...formData,
											dealerTier: parseInt(e.target.value) || 0,
										})
									}
									min="0"
									max="8"
									className="w-full border rounded px-3 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Dealer Discount (%)
								</label>
								<input
									type="number"
									name="dealerDiscount"
									value={formData.dealerDiscount}
									onChange={(e) =>
										setFormData({
											...formData,
											dealerDiscount: parseFloat(e.target.value) || 0,
										})
									}
									min="0"
									max="100"
									step="0.01"
									className="w-full border rounded px-3 py-2"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								Update Customer
							</button>
							<button
								type="button"
								onClick={() => setEditingCustomer(null)}
								className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Customer
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Role
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Tier
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Discount
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Joined
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{customers.length === 0 ? (
							<tr>
								<td colSpan="7" className="px-6 py-4 text-center text-gray-500">
									No customers found
								</td>
							</tr>
						) : (
							customers.map((customer) => (
								<tr key={customer.CustomerID} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										{customer.firstname} {customer.lastname}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{customer.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												customer.role === 'admin'
													? 'bg-red-100 text-red-800'
													: customer.role === 'vendor'
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{customer.role || 'customer'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{customer.dealerTier || 0}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{customer.dealerDiscount || 0}%
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{formatDate(customer.datecreated)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button
											onClick={() => handleEdit(customer)}
											className="text-blue-600 hover:text-blue-900"
										>
											Edit
										</button>
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
