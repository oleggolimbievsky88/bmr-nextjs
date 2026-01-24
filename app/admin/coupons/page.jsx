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
			<div className="text-center py-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-3 mb-0">Loading coupons...</p>
			</div>
		)
	}

	return (
		<div>
			<div className="admin-page-header">
				<h1 className="admin-page-title">Coupons Management</h1>
				<button
					type="button"
					onClick={() => {
						resetForm()
						setShowForm(true)
					}}
					className="admin-btn-primary"
				>
					+ Add New Coupon
				</button>
			</div>

			{error && <div className="admin-alert-error">{error}</div>}

			{showForm && (
				<div className="admin-card mb-4">
					<h2 className="h5 fw-6 mb-4">
						{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
					</h2>
					<form onSubmit={handleSubmit}>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Coupon Code *</label>
									<input
										type="text"
										name="code"
										value={formData.code}
										onChange={handleInputChange}
										required
										className="form-control"
										placeholder="SAVE20"
									/>
								</div>
							</div>
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Coupon Name *</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="form-control"
										placeholder="Save $20"
									/>
								</div>
							</div>
						</div>
						<div className="admin-form-group mb-3">
							<label>Description</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className="form-control"
								rows={3}
							/>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Discount Type *</label>
									<select
										name="discount_type"
										value={formData.discount_type}
										onChange={handleInputChange}
										required
										className="form-select"
									>
										<option value="percentage">Percentage</option>
										<option value="fixed_amount">Fixed Amount</option>
										<option value="free_shipping">Free Shipping</option>
									</select>
								</div>
							</div>
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Discount Value *</label>
									<input
										type="number"
										name="discount_value"
										value={formData.discount_value}
										onChange={handleInputChange}
										required
										step="0.01"
										min="0"
										className="form-control"
										placeholder="10 or 20.00"
									/>
								</div>
							</div>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Minimum Cart Amount</label>
									<input
										type="number"
										name="min_cart_amount"
										value={formData.min_cart_amount}
										onChange={handleInputChange}
										step="0.01"
										min="0"
										className="form-control"
										placeholder="0.00"
									/>
								</div>
							</div>
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Max Discount Amount</label>
									<input
										type="number"
										name="max_discount_amount"
										value={formData.max_discount_amount}
										onChange={handleInputChange}
										step="0.01"
										min="0"
										className="form-control"
										placeholder="Leave empty for no limit"
									/>
								</div>
							</div>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Start Date *</label>
									<input
										type="date"
										name="start_date"
										value={formData.start_date}
										onChange={handleInputChange}
										required
										className="form-control"
									/>
								</div>
							</div>
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>End Date *</label>
									<input
										type="date"
										name="end_date"
										value={formData.end_date}
										onChange={handleInputChange}
										required
										className="form-control"
									/>
								</div>
							</div>
						</div>
						<div className="row g-3 mb-3">
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Usage Limit</label>
									<input
										type="number"
										name="usage_limit"
										value={formData.usage_limit}
										onChange={handleInputChange}
										min="0"
										className="form-control"
										placeholder="Leave empty for unlimited"
									/>
								</div>
							</div>
							<div className="col-md-6">
								<div className="admin-form-group">
									<label>Usage Limit Per Customer</label>
									<input
										type="number"
										name="usage_limit_per_customer"
										value={formData.usage_limit_per_customer}
										onChange={handleInputChange}
										min="1"
										className="form-control"
									/>
								</div>
							</div>
						</div>
						<div className="d-flex flex-wrap gap-3 mb-4">
							<div className="form-check">
								<input
									type="checkbox"
									name="free_shipping"
									id="coupon-free-shipping"
									checked={formData.free_shipping}
									onChange={handleInputChange}
									className="form-check-input"
								/>
								<label
									htmlFor="coupon-free-shipping"
									className="form-check-label"
								>
									Free Shipping
								</label>
							</div>
							<div className="form-check">
								<input
									type="checkbox"
									name="is_active"
									id="coupon-is-active"
									checked={formData.is_active}
									onChange={handleInputChange}
									className="form-check-input"
								/>
								<label
									htmlFor="coupon-is-active"
									className="form-check-label"
								>
									Active
								</label>
							</div>
						</div>
						<div className="admin-toolbar">
							<button type="submit" className="admin-btn-primary">
								{editingCoupon ? 'Update Coupon' : 'Create Coupon'}
							</button>
							<button
								type="button"
								onClick={resetForm}
								className="admin-btn-secondary"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="admin-card">
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Code</th>
								<th>Name</th>
								<th>Discount</th>
								<th>Valid Period</th>
								<th>Usage</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{coupons.length === 0 ? (
								<tr>
									<td colSpan="7" className="text-center text-secondary py-4">
										No coupons found. Click &quot;Add New Coupon&quot; to create one.
									</td>
								</tr>
							) : (
								coupons.map((coupon) => (
									<tr key={coupon.id}>
										<td>
											<strong>{coupon.code}</strong>
										</td>
										<td>{coupon.name}</td>
										<td>
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
										<td>
											{formatDate(coupon.start_date)} -{' '}
											{formatDate(coupon.end_date)}
										</td>
										<td>
											{coupon.usage_limit
												? `${coupon.times_used || 0} / ${coupon.usage_limit}`
												: `${coupon.times_used || 0} / ∞`}
										</td>
										<td>
											<span
												className={`admin-status-badge ${
													coupon.is_active === 1 || coupon.is_active === true
														? 'badge-active'
														: 'badge-inactive'
												}`}
											>
												{coupon.is_active === 1 || coupon.is_active === true
													? 'Active'
													: 'Inactive'}
											</span>
										</td>
										<td>
											<button
												type="button"
												onClick={() => handleEdit(coupon)}
												className="admin-btn-secondary me-2"
												style={{ padding: '0.25rem 0.5rem', fontSize: '13px' }}
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => handleDelete(coupon.id)}
												className="admin-btn-danger"
												style={{ padding: '0.25rem 0.5rem', fontSize: '13px' }}
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
		</div>
	)
}
