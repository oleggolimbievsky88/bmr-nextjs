'use client'

import { useState, useEffect } from 'react'

export default function AdminCouponsPage() {
	const [coupons, setCoupons] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [editingCoupon, setEditingCoupon] = useState(null)
	const [formData, setFormData] = useState({
		code: '',
		name: '',
		description: '',
		discount_type: 'percentage',
		discount_value: '',
		min_cart_amount: '',
		max_discount_amount: '',
		start_date: '',
		end_date: '',
		start_time: '00:00:00',
		end_time: '23:59:59',
		usage_limit: '',
		usage_limit_per_customer: '1',
		free_shipping: false,
		shipping_discount: '',
		is_active: true,
		is_public: true,
		min_products: '1',
	})

	useEffect(() => {
		fetchCoupons()
	}, [])

	const fetchCoupons = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/admin/coupons')
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch coupons')
			}

			setCoupons(data.coupons || [])
			setError('')
		} catch (err) {
			setError(err.message)
			console.error('Error fetching coupons:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const resetForm = () => {
		setFormData({
			code: '',
			name: '',
			description: '',
			discount_type: 'percentage',
			discount_value: '',
			min_cart_amount: '',
			max_discount_amount: '',
			start_date: '',
			end_date: '',
			start_time: '00:00:00',
			end_time: '23:59:59',
			usage_limit: '',
			usage_limit_per_customer: '1',
			free_shipping: false,
			shipping_discount: '',
			is_active: true,
			is_public: true,
			min_products: '1',
		})
		setEditingCoupon(null)
		setShowForm(false)
	}

	const handleEdit = (coupon) => {
		setEditingCoupon(coupon)
		setFormData({
			code: coupon.code || '',
			name: coupon.name || '',
			description: coupon.description || '',
			discount_type: coupon.discount_type || 'percentage',
			discount_value: coupon.discount_value || '',
			min_cart_amount: coupon.min_cart_amount || '',
			max_discount_amount: coupon.max_discount_amount || '',
			start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
			end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
			start_time: coupon.start_time || '00:00:00',
			end_time: coupon.end_time || '23:59:59',
			usage_limit: coupon.usage_limit || '',
			usage_limit_per_customer: coupon.usage_limit_per_customer || '1',
			free_shipping: coupon.free_shipping === 1 || coupon.free_shipping === true,
			shipping_discount: coupon.shipping_discount || '',
			is_active: coupon.is_active === 1 || coupon.is_active === true,
			is_public: coupon.is_public === 1 || coupon.is_public === true,
			min_products: coupon.min_products || '1',
		})
		setShowForm(true)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		try {
			const submitData = {
				...formData,
				discount_value: parseFloat(formData.discount_value),
				min_cart_amount: formData.min_cart_amount
					? parseFloat(formData.min_cart_amount)
					: 0,
				max_discount_amount: formData.max_discount_amount
					? parseFloat(formData.max_discount_amount)
					: null,
				usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
				usage_limit_per_customer: parseInt(formData.usage_limit_per_customer),
				shipping_discount: formData.shipping_discount
					? parseFloat(formData.shipping_discount)
					: 0,
				min_products: parseInt(formData.min_products),
			}

			let response
			if (editingCoupon) {
				response = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(submitData),
				})
			} else {
				response = await fetch('/api/admin/coupons', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(submitData),
				})
			}

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save coupon')
			}

			resetForm()
			fetchCoupons()
			alert(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!')
		} catch (err) {
			setError(err.message)
			console.error('Error saving coupon:', err)
		}
	}

	const handleDelete = async (couponId) => {
		if (!confirm('Are you sure you want to delete this coupon?')) {
			return
		}

		try {
			const response = await fetch(`/api/admin/coupons/${couponId}`, {
				method: 'DELETE',
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete coupon')
			}

			fetchCoupons()
			alert('Coupon deleted successfully!')
		} catch (err) {
			alert(err.message)
			console.error('Error deleting coupon:', err)
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

	if (loading && coupons.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading coupons...</p>
			</div>
		)
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Coupons Management</h1>
				<button
					onClick={() => {
						resetForm()
						setShowForm(true)
					}}
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					+ Add New Coupon
				</button>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{showForm && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-2xl font-bold mb-4">
						{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
					</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Coupon Code *
								</label>
								<input
									type="text"
									name="code"
									value={formData.code}
									onChange={handleInputChange}
									required
									className="w-full border rounded px-3 py-2"
									placeholder="SAVE20"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Coupon Name *
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									required
									className="w-full border rounded px-3 py-2"
									placeholder="Save $20"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								Description
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className="w-full border rounded px-3 py-2"
								rows="3"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Discount Type *
								</label>
								<select
									name="discount_type"
									value={formData.discount_type}
									onChange={handleInputChange}
									required
									className="w-full border rounded px-3 py-2"
								>
									<option value="percentage">Percentage</option>
									<option value="fixed_amount">Fixed Amount</option>
									<option value="free_shipping">Free Shipping</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Discount Value *
								</label>
								<input
									type="number"
									name="discount_value"
									value={formData.discount_value}
									onChange={handleInputChange}
									required
									step="0.01"
									min="0"
									className="w-full border rounded px-3 py-2"
									placeholder="10 or 20.00"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Minimum Cart Amount
								</label>
								<input
									type="number"
									name="min_cart_amount"
									value={formData.min_cart_amount}
									onChange={handleInputChange}
									step="0.01"
									min="0"
									className="w-full border rounded px-3 py-2"
									placeholder="0.00"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Max Discount Amount
								</label>
								<input
									type="number"
									name="max_discount_amount"
									value={formData.max_discount_amount}
									onChange={handleInputChange}
									step="0.01"
									min="0"
									className="w-full border rounded px-3 py-2"
									placeholder="Leave empty for no limit"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Start Date *
								</label>
								<input
									type="date"
									name="start_date"
									value={formData.start_date}
									onChange={handleInputChange}
									required
									className="w-full border rounded px-3 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									End Date *
								</label>
								<input
									type="date"
									name="end_date"
									value={formData.end_date}
									onChange={handleInputChange}
									required
									className="w-full border rounded px-3 py-2"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Usage Limit
								</label>
								<input
									type="number"
									name="usage_limit"
									value={formData.usage_limit}
									onChange={handleInputChange}
									min="0"
									className="w-full border rounded px-3 py-2"
									placeholder="Leave empty for unlimited"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Usage Limit Per Customer
								</label>
								<input
									type="number"
									name="usage_limit_per_customer"
									value={formData.usage_limit_per_customer}
									onChange={handleInputChange}
									min="1"
									className="w-full border rounded px-3 py-2"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									name="free_shipping"
									checked={formData.free_shipping}
									onChange={handleInputChange}
									className="mr-2"
								/>
								<label className="text-sm font-medium">Free Shipping</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									name="is_active"
									checked={formData.is_active}
									onChange={handleInputChange}
									className="mr-2"
								/>
								<label className="text-sm font-medium">Active</label>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								type="submit"
								className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								{editingCoupon ? 'Update Coupon' : 'Create Coupon'}
							</button>
							<button
								type="button"
								onClick={resetForm}
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
								Code
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Discount
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Valid Period
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Usage
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
						{coupons.length === 0 ? (
							<tr>
								<td colSpan="7" className="px-6 py-4 text-center text-gray-500">
									No coupons found. Click "Add New Coupon" to create one.
								</td>
							</tr>
						) : (
							coupons.map((coupon) => (
								<tr key={coupon.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<strong>{coupon.code}</strong>
									</td>
									<td className="px-6 py-4">{coupon.name}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{coupon.discount_type === 'percentage' && (
											<span>{coupon.discount_value}%</span>
										)}
										{coupon.discount_type === 'fixed_amount' && (
											<span>${coupon.discount_value}</span>
										)}
										{coupon.discount_type === 'free_shipping' && (
											<span>Free Shipping</span>
										)}
									</td>
									<td className="px-6 py-4">
										{formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{coupon.usage_limit
											? `${coupon.times_used || 0} / ${coupon.usage_limit}`
											: `${coupon.times_used || 0} / ∞`}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												coupon.is_active === 1 || coupon.is_active === true
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{coupon.is_active === 1 || coupon.is_active === true
												? 'Active'
												: 'Inactive'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button
											onClick={() => handleEdit(coupon)}
											className="text-blue-600 hover:text-blue-900 mr-3"
										>
											Edit
										</button>
										<button
											onClick={() => handleDelete(coupon.id)}
											className="text-red-600 hover:text-red-900"
										>
											Delete
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
