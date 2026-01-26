'use client'

import { useState, useEffect } from 'react'

export default function AdminProductsPage() {
	const [products, setProducts] = useState([])
	const [bodies, setBodies] = useState([])
	const [categories, setCategories] = useState([])
	const [availableCategories, setAvailableCategories] = useState([]) // Categories for selected platform
	const [mainCategories, setMainCategories] = useState([])
	const [manufacturers, setManufacturers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [editingProduct, setEditingProduct] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		PartNumber: '',
		ProductName: '',
		Description: '',
		Retail: '',
		Price: '',
		ImageSmall: '',
		Qty: 0,
		BodyID: '',
		CatID: '',
		ImageLarge: '',
		Features: '',
		Instructions: '',
		Blength: 0,
		Bheight: 0,
		Bwidth: 0,
		Bweight: 0,
		Color: '',
		Hardware: '',
		Grease: '',
		Images: '',
		NewPart: 0,
		NewPartDate: '',
		PackagePartnumbers: '',
		FreeShipping: '',
		Display: 1,
		PackagePartnumbersQty: '',
		Package: 0,
		StartAppYear: '',
		EndAppYear: '',
		UsaMade: 1,
		fproduct: 0,
		CrossRef: '',
		ManID: '',
		LowMargin: 0,
		mbox: '',
		flatrate: '',
		AngleFinder: '',
		endproduct: '',
		domhandling: '',
		hardwarepack: 0,
		hardwarepacks: '',
		video: '',
		taxexempt: 0,
		couponexempt: 0,
		BlemProduct: 0
	})
	const [mainImage, setMainImage] = useState(null)
	const [additionalImages, setAdditionalImages] = useState([])

	// Helper function to get correct image URL
	const getImageUrl = (imagePath) => {
		if (!imagePath || imagePath === '0') return ''
		// If it's already a full URL, return as is
		if (imagePath.startsWith('http')) return imagePath
		// If it starts with /, it's already a local path
		if (imagePath.startsWith('/')) return imagePath
		// If it contains /, it's a relative path from public
		if (imagePath.includes('/')) return `/${imagePath}`
		// Otherwise, it's just a filename - use the external CDN path
		return `https://bmrsuspension.com/siteart/products/${imagePath}`
	}

	useEffect(() => {
		fetchProducts()
		fetchBodies()
		fetchCategories()
		fetchMainCategories()
		fetchManufacturers()
	}, [])

	const fetchProducts = async () => {
		try {
			setLoading(true)
			const response = await fetch(`/api/admin/products?limit=100&offset=0${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch products')
			}

			setProducts(data.products || [])
			setError('')
		} catch (err) {
			setError(err.message)
			console.error('Error fetching products:', err)
		} finally {
			setLoading(false)
		}
	}

	const fetchBodies = async () => {
		try {
			const response = await fetch('/api/admin/bodies')
			const data = await response.json()
			if (response.ok) {
				setBodies(data.bodies || [])
			}
		} catch (err) {
			console.error('Error fetching bodies:', err)
		}
	}

	const fetchCategories = async () => {
		try {
			const response = await fetch('/api/admin/categories')
			const data = await response.json()
			if (response.ok) {
				setCategories(data.categories || [])
			}
		} catch (err) {
			console.error('Error fetching categories:', err)
		}
	}

	const fetchMainCategories = async () => {
		try {
			const response = await fetch('/api/admin/maincategories')
			const data = await response.json()
			if (response.ok) {
				setMainCategories(data.mainCategories || [])
			}
		} catch (err) {
			console.error('Error fetching main categories:', err)
		}
	}

	const fetchManufacturers = async () => {
		try {
			const response = await fetch('/api/admin/manufacturers')
			const data = await response.json()
			if (response.ok) {
				setManufacturers(data.manufacturers || [])
			}
		} catch (err) {
			console.error('Error fetching manufacturers:', err)
		}
	}

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (searchTerm !== undefined) {
				fetchProducts()
			}
		}, 500)
		return () => clearTimeout(timeoutId)
	}, [searchTerm])

	const fetchCategoriesByBody = async (bodyId) => {
		if (!bodyId) {
			setAvailableCategories([])
			return
		}
		try {
			const response = await fetch(`/api/admin/categories/by-body/${bodyId}`)
			const data = await response.json()
			if (response.ok) {
				setAvailableCategories(data.categories || [])
			}
		} catch (err) {
			console.error('Error fetching categories by body:', err)
			setAvailableCategories([])
		}
	}

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target
		const newFormData = {
			...formData,
			[name]: type === 'checkbox' ? (checked ? 1 : 0) : type === 'number' ? (value === '' ? 0 : parseInt(value)) : value,
		}
		
		// If BodyID changes, fetch categories for that platform
		if (name === 'BodyID') {
			fetchCategoriesByBody(value)
			// Reset CatID when platform changes
			newFormData.CatID = ''
		}
		
		setFormData(newFormData)
	}

	const handleMainImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setMainImage(e.target.files[0])
		}
	}

	const handleAdditionalImagesChange = (e) => {
		if (e.target.files) {
			setAdditionalImages(Array.from(e.target.files))
		}
	}

	const resetForm = () => {
		setFormData({
			PartNumber: '',
			ProductName: '',
			Description: '',
			Retail: '',
			Price: '',
			ImageSmall: '',
			Qty: 0,
			BodyID: '',
			CatID: '',
			ImageLarge: '',
			Features: '',
			Instructions: '',
			Blength: 0,
			Bheight: 0,
			Bwidth: 0,
			Bweight: 0,
			Color: '',
			Hardware: '',
			Grease: '',
			Images: '',
			NewPart: 0,
			NewPartDate: '',
			PackagePartnumbers: '',
			FreeShipping: '',
			Display: 1,
			PackagePartnumbersQty: '',
			Package: 0,
			StartAppYear: '',
			EndAppYear: '',
			UsaMade: 1,
			fproduct: 0,
			CrossRef: '',
			ManID: '',
			LowMargin: 0,
			mbox: '',
			flatrate: '',
			AngleFinder: '',
			endproduct: '',
			domhandling: '',
			hardwarepack: 0,
			hardwarepacks: '',
			video: '',
			taxexempt: 0,
			couponexempt: 0,
			BlemProduct: 0
		})
		setMainImage(null)
		setAdditionalImages([])
		setEditingProduct(null)
		setAvailableCategories([])
		setShowForm(false)
	}

	const handleEdit = async (product) => {
		try {
			const response = await fetch(`/api/admin/products/${product.ProductID}`)
			const data = await response.json()
			if (response.ok) {
				setEditingProduct(product)
				const bodyId = data.product.BodyID || ''
				const catId = data.product.CatID || ''
				
				// Fetch categories for this platform
				if (bodyId) {
					await fetchCategoriesByBody(bodyId)
				}
				
				setFormData({
					PartNumber: data.product.PartNumber || '',
					ProductName: data.product.ProductName || '',
					Description: data.product.Description || '',
					Retail: data.product.Retail || '',
					Price: data.product.Price || '',
					ImageSmall: data.product.ImageSmall || '',
					Qty: data.product.Qty || 0,
					BodyID: bodyId,
					CatID: catId,
					ImageLarge: data.product.ImageLarge || '',
					Features: data.product.Features || '',
					Instructions: data.product.Instructions || '',
					Blength: data.product.Blength || 0,
					Bheight: data.product.Bheight || 0,
					Bwidth: data.product.Bwidth || 0,
					Bweight: data.product.Bweight || 0,
					Color: data.product.Color || '',
					Hardware: data.product.Hardware || '',
					Grease: data.product.Grease || '',
					Images: data.product.Images || '',
					NewPart: data.product.NewPart || 0,
					NewPartDate: data.product.NewPartDate || '',
					PackagePartnumbers: data.product.PackagePartnumbers || '',
					FreeShipping: data.product.FreeShipping || '',
					Display: data.product.Display !== undefined ? data.product.Display : 1,
					PackagePartnumbersQty: data.product.PackagePartnumbersQty || '',
					Package: data.product.Package || 0,
					StartAppYear: data.product.StartAppYear || '',
					EndAppYear: data.product.EndAppYear || '',
					UsaMade: data.product.UsaMade !== undefined ? data.product.UsaMade : 1,
					fproduct: data.product.fproduct || 0,
					CrossRef: data.product.CrossRef || '',
					ManID: data.product.ManID || '',
					LowMargin: data.product.LowMargin || 0,
					mbox: data.product.mbox || '',
					flatrate: data.product.flatrate || '',
					AngleFinder: data.product.AngleFinder || '',
					endproduct: data.product.endproduct || '',
					domhandling: data.product.domhandling || '',
					hardwarepack: data.product.hardwarepack || 0,
					hardwarepacks: data.product.hardwarepacks || '',
					video: data.product.video || '',
					taxexempt: data.product.taxexempt || 0,
					couponexempt: data.product.couponexempt || 0,
					BlemProduct: data.product.BlemProduct || 0
				})
				setMainImage(null)
				setAdditionalImages([])
				setShowForm(true)
			}
		} catch (err) {
			setError('Failed to load product: ' + err.message)
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		try {
			const submitFormData = new FormData()
			
			// Add all form fields
			Object.keys(formData).forEach(key => {
				submitFormData.append(key, formData[key])
			})

			// Add main image if selected
			if (mainImage) {
				submitFormData.append('mainImage', mainImage)
			}

			// Add additional images
			additionalImages.forEach((img, index) => {
				submitFormData.append('additionalImages', img)
			})

			const url = editingProduct 
				? `/api/admin/products/${editingProduct.ProductID}`
				: '/api/admin/products'
			const method = editingProduct ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				body: submitFormData
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save product')
			}

			setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
			resetForm()
			fetchProducts()
			
			setTimeout(() => setSuccess(''), 3000)
		} catch (err) {
			setError(err.message)
		}
	}

	const handleDelete = async (productId) => {
		if (!confirm('Are you sure you want to delete this product?')) {
			return
		}

		try {
			const response = await fetch(`/api/admin/products/${productId}`, {
				method: 'DELETE'
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete product')
			}

			setSuccess('Product deleted successfully!')
			fetchProducts()
			setTimeout(() => setSuccess(''), 3000)
		} catch (err) {
			setError(err.message)
		}
	}

	if (loading && products.length === 0) {
		return (
			<div className="text-center py-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		)
	}

	return (
		<div className="admin-products-page">
			<div className="admin-page-header">
				<h1 className="admin-page-title">Product Management</h1>
				<div className="admin-toolbar">
					<input
						type="text"
						className="form-control"
						placeholder="Search products..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{ width: '250px' }}
					/>
					<button
						className="admin-btn-primary"
						onClick={() => {
							resetForm()
							setShowForm(true)
						}}
					>
						+ Add New Product
					</button>
				</div>
			</div>

			{error && <div className="admin-alert-error">{error}</div>}
			{success && <div className="alert alert-success">{success}</div>}

			{showForm && (
				<div className="admin-card">
					<h2 className="mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
					<form onSubmit={handleSubmit} className="admin-product-form">
						{/* Basic Information */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Basic Information</h3>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Part Number *</label>
										<input
											type="text"
											name="PartNumber"
											className="form-control"
											value={formData.PartNumber}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Product Name *</label>
										<input
											type="text"
											name="ProductName"
											className="form-control"
											value={formData.ProductName}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
							</div>
							<div className="admin-form-group">
								<label>Description</label>
								<textarea
									name="Description"
									className="form-control"
									rows="4"
									value={formData.Description}
									onChange={handleInputChange}
								/>
							</div>
							<div className="row">
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Retail Price</label>
										<input
											type="text"
											name="Retail"
											className="form-control"
											value={formData.Retail}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Price *</label>
										<input
											type="text"
											name="Price"
											className="form-control"
											value={formData.Price}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Quantity</label>
										<input
											type="number"
											name="Qty"
											className="form-control"
											value={formData.Qty}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Images */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Images</h3>
							<div className="admin-form-group">
								<label>Main Image (Always Red if product comes in both red and black)</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleMainImageChange}
									className="form-control"
								/>
								{formData.ImageLarge && formData.ImageLarge !== '0' && !mainImage && (
									<div className="mt-2">
										<img 
											src={getImageUrl(formData.ImageLarge)} 
											alt="Current main image" 
											style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
											onError={(e) => {
												e.target.style.display = 'none'
											}}
										/>
									</div>
								)}
							</div>
							<div className="admin-form-group">
								<label>Additional Images</label>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleAdditionalImagesChange}
									className="form-control"
								/>
								{formData.Images && formData.Images !== '0' && (
									<div className="mt-2 d-flex flex-wrap gap-2">
										{formData.Images.split(',').filter(img => img && img !== '0').map((img, idx) => {
											const imgSrc = img.trim()
											return (
												<img 
													key={idx}
													src={getImageUrl(imgSrc)} 
													alt={`Additional ${idx + 1}`} 
													style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
													onError={(e) => {
														e.target.style.display = 'none'
													}}
												/>
											)
										})}
									</div>
								)}
							</div>
						</div>

						{/* Category & Platform */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Category & Platform</h3>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Platform (Body) *</label>
										<select
											name="BodyID"
											className="form-select"
											value={formData.BodyID}
											onChange={handleInputChange}
											required
										>
											<option value="">Select Platform</option>
											{bodies.map(body => (
												<option key={body.BodyID} value={body.BodyID}>
													{body.StartYear}-{body.EndYear} {body.Name}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Category *</label>
										<select
											name="CatID"
											className="form-select"
											value={formData.CatID}
											onChange={handleInputChange}
											required
											disabled={!formData.BodyID}
										>
											<option value="">{formData.BodyID ? 'Select Category' : 'Select Platform First'}</option>
											{availableCategories.map(cat => (
												<option key={cat.CatID} value={cat.CatID}>
													{cat.CatName} {cat.MainCatName ? `(${cat.MainCatName})` : ''}
												</option>
											))}
										</select>
										{!formData.BodyID && (
											<small className="text-muted">Please select a platform first</small>
										)}
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Manufacturer</label>
										<select
											name="ManID"
											className="form-select"
											value={formData.ManID}
											onChange={handleInputChange}
										>
											<option value="">Select Manufacturer</option>
											{manufacturers.map(man => (
												<option key={man.ManID} value={man.ManID}>
													{man.ManName}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Display</label>
										<select
											name="Display"
											className="form-select"
											value={formData.Display}
											onChange={handleInputChange}
										>
											<option value={1}>Yes</option>
											<option value={0}>No</option>
										</select>
									</div>
								</div>
							</div>
						</div>

						{/* Dimensions & Weight */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Dimensions & Weight</h3>
							<div className="row">
								<div className="col-md-3">
									<div className="admin-form-group">
										<label>Length</label>
										<input
											type="number"
											name="Blength"
											className="form-control"
											value={formData.Blength}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-3">
									<div className="admin-form-group">
										<label>Height</label>
										<input
											type="number"
											name="Bheight"
											className="form-control"
											value={formData.Bheight}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-3">
									<div className="admin-form-group">
										<label>Width</label>
										<input
											type="number"
											name="Bwidth"
											className="form-control"
											value={formData.Bwidth}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-3">
									<div className="admin-form-group">
										<label>Weight</label>
										<input
											type="number"
											name="Bweight"
											className="form-control"
											value={formData.Bweight}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Options */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Options</h3>
							<div className="row">
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Color</label>
										<input
											type="text"
											name="Color"
											className="form-control"
											value={formData.Color}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Hardware</label>
										<input
											type="text"
											name="Hardware"
											className="form-control"
											value={formData.Hardware}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Grease</label>
										<input
											type="text"
											name="Grease"
											className="form-control"
											value={formData.Grease}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Angle Finder</label>
										<input
											type="text"
											name="AngleFinder"
											className="form-control"
											value={formData.AngleFinder}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Free Shipping</label>
										<input
											type="text"
											name="FreeShipping"
											className="form-control"
											value={formData.FreeShipping}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Domestic Handling</label>
										<input
											type="text"
											name="domhandling"
											className="form-control"
											value={formData.domhandling}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Additional Information</h3>
							<div className="admin-form-group">
								<label>Features</label>
								<textarea
									name="Features"
									className="form-control"
									rows="4"
									value={formData.Features}
									onChange={handleInputChange}
								/>
							</div>
							<div className="admin-form-group">
								<label>Instructions</label>
								<input
									type="text"
									name="Instructions"
									className="form-control"
									value={formData.Instructions}
									onChange={handleInputChange}
								/>
							</div>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Start Application Year</label>
										<input
											type="text"
											name="StartAppYear"
											className="form-control"
											value={formData.StartAppYear}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>End Application Year</label>
										<input
											type="text"
											name="EndAppYear"
											className="form-control"
											value={formData.EndAppYear}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Package Part Numbers</label>
										<input
											type="text"
											name="PackagePartnumbers"
											className="form-control"
											value={formData.PackagePartnumbers}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Package Part Numbers Qty</label>
										<input
											type="text"
											name="PackagePartnumbersQty"
											className="form-control"
											value={formData.PackagePartnumbersQty}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Cross Reference</label>
										<input
											type="text"
											name="CrossRef"
											className="form-control"
											value={formData.CrossRef}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>Video URL</label>
										<input
											type="text"
											name="video"
											className="form-control"
											value={formData.video}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>M Box</label>
										<input
											type="text"
											name="mbox"
											className="form-control"
											value={formData.mbox}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Flat Rate</label>
										<input
											type="text"
											name="flatrate"
											className="form-control"
											value={formData.flatrate}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="col-md-4">
									<div className="admin-form-group">
										<label>Hardware Packs</label>
										<input
											type="text"
											name="hardwarepacks"
											className="form-control"
											value={formData.hardwarepacks}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Flags */}
						<div className="admin-form-section">
							<h3 className="admin-form-section-title">Flags</h3>
							<div className="row">
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="NewPart"
											className="form-check-input"
											checked={formData.NewPart === 1}
											onChange={(e) => setFormData({...formData, NewPart: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">New Part</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="Package"
											className="form-check-input"
											checked={formData.Package === 1}
											onChange={(e) => setFormData({...formData, Package: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Package</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="UsaMade"
											className="form-check-input"
											checked={formData.UsaMade === 1}
											onChange={(e) => setFormData({...formData, UsaMade: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">USA Made</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="fproduct"
											className="form-check-input"
											checked={formData.fproduct === 1}
											onChange={(e) => setFormData({...formData, fproduct: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Featured Product</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="LowMargin"
											className="form-check-input"
											checked={formData.LowMargin === 1}
											onChange={(e) => setFormData({...formData, LowMargin: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Low Margin</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="hardwarepack"
											className="form-check-input"
											checked={formData.hardwarepack === 1}
											onChange={(e) => setFormData({...formData, hardwarepack: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Hardware Pack</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="taxexempt"
											className="form-check-input"
											checked={formData.taxexempt === 1}
											onChange={(e) => setFormData({...formData, taxexempt: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Tax Exempt</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="couponexempt"
											className="form-check-input"
											checked={formData.couponexempt === 1}
											onChange={(e) => setFormData({...formData, couponexempt: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Coupon Exempt</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="BlemProduct"
											className="form-check-input"
											checked={formData.BlemProduct === 1}
											onChange={(e) => setFormData({...formData, BlemProduct: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">Blem Product</label>
									</div>
								</div>
								<div className="col-md-3">
									<div className="form-check">
										<input
											type="checkbox"
											name="endproduct"
											className="form-check-input"
											checked={formData.endproduct === 1}
											onChange={(e) => setFormData({...formData, endproduct: e.target.checked ? 1 : 0})}
										/>
										<label className="form-check-label">End Product</label>
									</div>
								</div>
							</div>
							<div className="row mt-3">
								<div className="col-md-6">
									<div className="admin-form-group">
										<label>New Part Date</label>
										<input
											type="date"
											name="NewPartDate"
											className="form-control"
											value={formData.NewPartDate}
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="admin-form-actions">
							<button type="submit" className="admin-btn-primary">
								{editingProduct ? 'Update Product' : 'Create Product'}
							</button>
							<button type="button" className="admin-btn-secondary" onClick={resetForm}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{!showForm && (
				<div className="admin-card">
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Image</th>
									<th>Part Number</th>
									<th>Product Name</th>
									<th>Price</th>
									<th>Qty</th>
									<th>Display</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{products.length === 0 ? (
									<tr>
										<td colSpan="8" className="text-center py-4">
											No products found
										</td>
									</tr>
								) : (
									products.map((product) => (
										<tr key={product.ProductID}>
											<td>{product.ProductID}</td>
											<td>
												{product.ImageLarge && product.ImageLarge !== '0' ? (
													<img 
														src={getImageUrl(product.ImageLarge)} 
														alt={product.ProductName}
														style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }}
														onError={(e) => {
															e.target.src = '/images/placeholder.jpg'
														}}
													/>
												) : product.ImageSmall && product.ImageSmall !== '0' ? (
													<img 
														src={getImageUrl(product.ImageSmall)} 
														alt={product.ProductName}
														style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }}
														onError={(e) => {
															e.target.src = '/images/placeholder.jpg'
														}}
													/>
												) : (
													<span className="text-muted">No image</span>
												)}
											</td>
											<td>{product.PartNumber}</td>
											<td>{product.ProductName}</td>
											<td>${product.Price}</td>
											<td>{product.Qty}</td>
											<td>
												<span className={`admin-status-badge ${product.Display === 1 ? 'badge-active' : 'badge-inactive'}`}>
													{product.Display === 1 ? 'Yes' : 'No'}
												</span>
											</td>
											<td>
												<button
													className="admin-btn-secondary me-2"
													onClick={() => handleEdit(product)}
												>
													Edit
												</button>
												<button
													className="admin-btn-danger"
													onClick={() => handleDelete(product.ProductID)}
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
			)}
		</div>
	)
}
