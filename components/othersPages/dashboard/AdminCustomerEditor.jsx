'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AccountProfileForm, {
	getDefaultProfileForm,
} from './AccountProfileForm'

const createFormFromCustomer = (customer) => ({
	...getDefaultProfileForm(),
	firstname: customer?.firstname || '',
	lastname: customer?.lastname || '',
	email: customer?.email || '',
	phonenumber: customer?.phonenumber || '',
	address1: customer?.address1 || '',
	address2: customer?.address2 || '',
	city: customer?.city || '',
	state: customer?.state || '',
	zip: customer?.zip || '',
	country: customer?.country || 'United States',
	shippingfirstname: customer?.shippingfirstname || '',
	shippinglastname: customer?.shippinglastname || '',
	shippingaddress1: customer?.shippingaddress1 || '',
	shippingaddress2: customer?.shippingaddress2 || '',
	shippingcity: customer?.shippingcity || '',
	shippingstate: customer?.shippingstate || '',
	shippingzip: customer?.shippingzip || '',
	shippingcountry: customer?.shippingcountry || 'United States',
})

export default function AdminCustomerEditor () {
	const [customers, setCustomers] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCustomer, setSelectedCustomer] = useState(null)
	const [formData, setFormData] = useState(() => getDefaultProfileForm())
	const [listMessage, setListMessage] = useState({
		type: '',
		text: '',
	})
	const [formMessage, setFormMessage] = useState({
		type: '',
		text: '',
	})
	const [isLoadingList, setIsLoadingList] = useState(false)
	const [isLoadingProfile, setIsLoadingProfile] = useState(false)
	const [isSavingProfile, setIsSavingProfile] = useState(false)

	const fetchCustomers = useCallback(async (searchValue = '') => {
		setIsLoadingList(true)
		setListMessage({ type: '', text: '' })

		try {
			const url = searchValue
				? `/api/admin/customers?search=${encodeURIComponent(searchValue)}`
				: '/api/admin/customers'
			const response = await fetch(url)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch customers')
			}

			setCustomers(data.customers || [])
		} catch (error) {
			setListMessage({
				type: 'error',
				text: error.message || 'Failed to load customers',
			})
		} finally {
			setIsLoadingList(false)
		}
	}, [])

	const fetchCustomerProfile = useCallback(async (customerId) => {
		if (!customerId) return

		setIsLoadingProfile(true)
		setFormMessage({ type: '', text: '' })

		try {
			const response = await fetch(
				`/api/admin/customers/${customerId}/profile`
			)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load customer profile')
			}

			setSelectedCustomer(data.customer)
			setFormData(createFormFromCustomer(data.customer))
		} catch (error) {
			setFormMessage({
				type: 'error',
				text: error.message || 'Unable to load customer profile',
			})
		} finally {
			setIsLoadingProfile(false)
		}
	}, [])

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchCustomers(searchTerm)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [fetchCustomers, searchTerm])

	const selectedCustomerId = selectedCustomer?.CustomerID

	const handleSearchChange = useCallback((event) => {
		setSearchTerm(event.target.value)
	}, [])

	const handleRefreshList = useCallback(() => {
		fetchCustomers(searchTerm)
	}, [fetchCustomers, searchTerm])

	const handleSelectCustomer = useCallback(
		(event) => {
			const customerId = Number.parseInt(
				event.currentTarget.dataset.customerId,
				10
			)
			if (Number.isNaN(customerId)) return
			fetchCustomerProfile(customerId)
		},
		[fetchCustomerProfile]
	)

	const handleClearSelection = useCallback(() => {
		setSelectedCustomer(null)
		setFormData(getDefaultProfileForm())
		setFormMessage({ type: '', text: '' })
	}, [])

	const handleFormChange = useCallback((event) => {
		const { name, value } = event.target
		setFormData((prevForm) => ({
			...prevForm,
			[name]: value,
		}))
		setFormMessage({ type: '', text: '' })
	}, [])

	const handleFormSubmit = useCallback(
		async (event) => {
			event.preventDefault()

			if (!selectedCustomerId) return

			setFormMessage({ type: '', text: '' })

			if (formData.password) {
				if (formData.password.length < 8) {
					setFormMessage({
						type: 'error',
						text: 'Password must be at least 8 characters long',
					})
					return
				}

				if (formData.password !== formData.confirmPassword) {
					setFormMessage({
						type: 'error',
						text: 'Passwords do not match',
					})
					return
				}
			}

			setIsSavingProfile(true)

			try {
				const payload = { ...formData }
				delete payload.confirmPassword

				if (!payload.password) {
					delete payload.password
				}

				const response = await fetch(
					`/api/admin/customers/${selectedCustomerId}/profile`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
					}
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(data.error || 'Failed to update customer')
				}

				setFormMessage({
					type: 'success',
					text: 'Customer profile updated successfully',
				})
				setFormData((prevForm) => ({
					...prevForm,
					password: '',
					confirmPassword: '',
				}))
				fetchCustomers(searchTerm)
				fetchCustomerProfile(selectedCustomerId)
			} catch (error) {
				setFormMessage({
					type: 'error',
					text: error.message || 'Failed to update customer profile',
				})
			} finally {
				setIsSavingProfile(false)
			}
		},
		[
			fetchCustomerProfile,
			fetchCustomers,
			formData,
			searchTerm,
			selectedCustomerId,
		]
	)

	const customerCountLabel = useMemo(() => {
		if (isLoadingList) return 'Loading customers...'
		if (!customers.length) return 'No customers found'
		const suffix = customers.length > 1 ? 's' : ''
		return `${customers.length} customer${suffix}`
	}, [customers.length, isLoadingList])

	const selectedCustomerName = selectedCustomer
		? `${selectedCustomer.firstname || ''} ${
				selectedCustomer.lastname || ''
		  }`.trim()
		: ''

	const renderCustomerItem = (customer) => (
		<li key={customer.CustomerID}>
			<button
				type='button'
				className={`dashboard-list-item ${
					customer.CustomerID === selectedCustomerId ? 'active' : ''
				}`}
				data-customer-id={customer.CustomerID}
				onClick={handleSelectCustomer}
			>
				<span className='dashboard-list-title'>
					{customer.firstname} {customer.lastname}
				</span>
				<span className='dashboard-list-subtitle'>{customer.email}</span>
			</button>
		</li>
	)

	return (
		<div className='dashboard-admin'>
			<div className='dashboard-admin-header'>
				<div>
					<h5 className='dashboard-admin-title'>Admin Customer Editor</h5>
					<p className='dashboard-admin-subtitle'>
						Search, select, and update customer profiles.
					</p>
				</div>
				<div className='dashboard-admin-controls'>
					<input
						type='text'
						className='form-control'
						placeholder='Search customers by name or email'
						value={searchTerm}
						onChange={handleSearchChange}
					/>
					<button
						type='button'
						className='tf-btn btn-line'
						onClick={handleRefreshList}
					>
						Refresh
					</button>
				</div>
			</div>

			{listMessage.text && (
				<div className='alert alert-danger' role='alert'>
					{listMessage.text}
				</div>
			)}

			<div className='row g-4'>
				<div className='col-lg-4'>
					<div className='dashboard-card h-100'>
						<div className='dashboard-card-header'>
							<h6 className='dashboard-card-title'>Customer List</h6>
							<span className='dashboard-card-meta'>
								{customerCountLabel}
							</span>
						</div>
						<div className='dashboard-card-body'>
							<ul className='dashboard-list'>
								{customers.map(renderCustomerItem)}
							</ul>
							{!customers.length && !isLoadingList && (
								<p className='text-secondary mb-0'>
									Try adjusting your search terms.
								</p>
							)}
							{isLoadingList && (
								<div className='dashboard-loading'>
									<div className='spinner-border' role='status'>
										<span className='visually-hidden'>Loading...</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				<div className='col-lg-8'>
					<div className='dashboard-card h-100'>
						<div className='dashboard-card-header'>
							<h6 className='dashboard-card-title'>Customer Profile</h6>
							{selectedCustomer && (
								<div className='dashboard-card-actions'>
									<span className='dashboard-card-meta'>
										ID: {selectedCustomer.CustomerID}
									</span>
									<button
										type='button'
										className='tf-btn btn-line'
										onClick={handleClearSelection}
									>
										Clear
									</button>
								</div>
							)}
						</div>
						<div className='dashboard-card-body'>
							{!selectedCustomer && (
								<div className='dashboard-placeholder'>
									<p className='text-secondary mb-0'>
										Select a customer from the list to view and edit
										their profile details.
									</p>
								</div>
							)}
							{selectedCustomer && (
								<>
									{isLoadingProfile ? (
										<div className='dashboard-loading'>
											<div className='spinner-border' role='status'>
												<span className='visually-hidden'>Loading...</span>
											</div>
										</div>
									) : (
										<AccountProfileForm
											idPrefix='admin-customer'
											title={selectedCustomerName}
											description='Update personal details and addresses.'
											formData={formData}
											onChange={handleFormChange}
											onSubmit={handleFormSubmit}
											isSubmitting={isSavingProfile}
											message={formMessage}
											submitLabel='Update Customer'
										/>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
