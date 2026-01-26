'use client'
import React from 'react'

export function getDefaultProfileForm () {
	return {
		firstname: '',
		lastname: '',
		email: '',
		phonenumber: '',
		password: '',
		confirmPassword: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		zip: '',
		country: 'United States',
		shippingfirstname: '',
		shippinglastname: '',
		shippingaddress1: '',
		shippingaddress2: '',
		shippingcity: '',
		shippingstate: '',
		shippingzip: '',
		shippingcountry: 'United States',
	}
}

export default function AccountProfileForm ({
	idPrefix = 'account',
	title,
	description,
	formData,
	onChange,
	onSubmit,
	isSubmitting = false,
	message,
	submitLabel = 'Save Changes',
}) {
	const getInputId = (name) => `${idPrefix}-${name}`
	const showMessage = message?.text
	const alertClass =
		message?.type === 'success' ? 'alert-success' : 'alert-danger'

	return (
		<form className='dashboard-form' onSubmit={onSubmit}>
			<div className='dashboard-form-header'>
				{title && <h5 className='dashboard-form-title'>{title}</h5>}
				{description && (
					<p className='dashboard-form-subtitle'>{description}</p>
				)}
			</div>

			{showMessage && (
				<div className={`alert ${alertClass}`} role='alert'>
					{message.text}
				</div>
			)}

			<div className='dashboard-form-section'>
				<h6 className='dashboard-form-heading'>Personal Information</h6>
				<div className='row g-3'>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('firstname')}
						>
							First Name *
						</label>
						<input
							id={getInputId('firstname')}
							name='firstname'
							type='text'
							className='form-control'
							value={formData.firstname}
							onChange={onChange}
							required
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('lastname')}
						>
							Last Name *
						</label>
						<input
							id={getInputId('lastname')}
							name='lastname'
							type='text'
							className='form-control'
							value={formData.lastname}
							onChange={onChange}
							required
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label className='form-label' htmlFor={getInputId('email')}>
							Email *
						</label>
						<input
							id={getInputId('email')}
							name='email'
							type='email'
							className='form-control'
							value={formData.email}
							onChange={onChange}
							required
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('phonenumber')}
						>
							Phone
						</label>
						<input
							id={getInputId('phonenumber')}
							name='phonenumber'
							type='tel'
							className='form-control'
							value={formData.phonenumber}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			<div className='dashboard-form-section'>
				<h6 className='dashboard-form-heading'>Change Password</h6>
				<p className='dashboard-form-hint'>
					Leave blank to keep your current password.
				</p>
				<div className='row g-3'>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('password')}
						>
							New Password
						</label>
						<input
							id={getInputId('password')}
							name='password'
							type='password'
							className='form-control'
							value={formData.password}
							onChange={onChange}
							minLength={8}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('confirmPassword')}
						>
							Confirm Password
						</label>
						<input
							id={getInputId('confirmPassword')}
							name='confirmPassword'
							type='password'
							className='form-control'
							value={formData.confirmPassword}
							onChange={onChange}
							minLength={8}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			<div className='dashboard-form-section'>
				<h6 className='dashboard-form-heading'>Billing Address</h6>
				<div className='row g-3'>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('address1')}
						>
							Address Line 1
						</label>
						<input
							id={getInputId('address1')}
							name='address1'
							type='text'
							className='form-control'
							value={formData.address1}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('address2')}
						>
							Address Line 2
						</label>
						<input
							id={getInputId('address2')}
							name='address2'
							type='text'
							className='form-control'
							value={formData.address2}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label className='form-label' htmlFor={getInputId('city')}>
							City
						</label>
						<input
							id={getInputId('city')}
							name='city'
							type='text'
							className='form-control'
							value={formData.city}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-3'>
						<label className='form-label' htmlFor={getInputId('state')}>
							State
						</label>
						<input
							id={getInputId('state')}
							name='state'
							type='text'
							className='form-control'
							value={formData.state}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-3'>
						<label className='form-label' htmlFor={getInputId('zip')}>
							ZIP
						</label>
						<input
							id={getInputId('zip')}
							name='zip'
							type='text'
							className='form-control'
							value={formData.zip}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('country')}
						>
							Country
						</label>
						<input
							id={getInputId('country')}
							name='country'
							type='text'
							className='form-control'
							value={formData.country}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			<div className='dashboard-form-section'>
				<h6 className='dashboard-form-heading'>Shipping Address</h6>
				<div className='row g-3'>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingfirstname')}
						>
							First Name
						</label>
						<input
							id={getInputId('shippingfirstname')}
							name='shippingfirstname'
							type='text'
							className='form-control'
							value={formData.shippingfirstname}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('shippinglastname')}
						>
							Last Name
						</label>
						<input
							id={getInputId('shippinglastname')}
							name='shippinglastname'
							type='text'
							className='form-control'
							value={formData.shippinglastname}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingaddress1')}
						>
							Address Line 1
						</label>
						<input
							id={getInputId('shippingaddress1')}
							name='shippingaddress1'
							type='text'
							className='form-control'
							value={formData.shippingaddress1}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingaddress2')}
						>
							Address Line 2
						</label>
						<input
							id={getInputId('shippingaddress2')}
							name='shippingaddress2'
							type='text'
							className='form-control'
							value={formData.shippingaddress2}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-6'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingcity')}
						>
							City
						</label>
						<input
							id={getInputId('shippingcity')}
							name='shippingcity'
							type='text'
							className='form-control'
							value={formData.shippingcity}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-3'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingstate')}
						>
							State
						</label>
						<input
							id={getInputId('shippingstate')}
							name='shippingstate'
							type='text'
							className='form-control'
							value={formData.shippingstate}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-md-3'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingzip')}
						>
							ZIP
						</label>
						<input
							id={getInputId('shippingzip')}
							name='shippingzip'
							type='text'
							className='form-control'
							value={formData.shippingzip}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
					<div className='col-12'>
						<label
							className='form-label'
							htmlFor={getInputId('shippingcountry')}
						>
							Country
						</label>
						<input
							id={getInputId('shippingcountry')}
							name='shippingcountry'
							type='text'
							className='form-control'
							value={formData.shippingcountry}
							onChange={onChange}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			<div className='dashboard-form-footer'>
				<button
					type='submit'
					className='tf-btn btn-fill animate-hover-btn'
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving...' : submitLabel}
				</button>
			</div>
		</form>
	)
}
