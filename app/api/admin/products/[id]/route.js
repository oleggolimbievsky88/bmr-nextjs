import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getProductByIdAdmin,
	updateProductAdmin,
	deleteProductAdmin,
} from '@/lib/queries'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request, context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await context.params
		const product = await getProductByIdAdmin(id)

		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		return NextResponse.json({ product })
	} catch (error) {
		console.error('Error fetching product:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch product' },
			{ status: 500 }
		)
	}
}

export async function PUT(request, context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await context.params
		const formData = await request.formData()
		const productData = {}

		// Extract all product fields
		const fields = [
			'PartNumber', 'ProductName', 'Description', 'Retail', 'Price',
			'ImageSmall', 'Qty', 'BodyID', 'CatID', 'ImageLarge', 'Features',
			'Instructions', 'Blength', 'Bheight', 'Bwidth', 'Bweight', 'Color',
			'Hardware', 'Grease', 'Images', 'NewPart', 'NewPartDate',
			'PackagePartnumbers', 'FreeShipping', 'Display', 'PackagePartnumbersQty',
			'Package', 'StartAppYear', 'EndAppYear', 'UsaMade', 'fproduct', 'CrossRef',
			'ManID', 'LowMargin', 'mbox', 'flatrate', 'AngleFinder', 'endproduct',
			'domhandling', 'hardwarepack', 'hardwarepacks', 'video', 'taxexempt',
			'couponexempt', 'BlemProduct'
		]

		fields.forEach(field => {
			const value = formData.get(field)
			if (value !== null) {
				if (['Qty', 'BodyID', 'NewPart', 'Display', 'Package', 'UsaMade',
					'fproduct', 'ManID', 'LowMargin', 'hardwarepack', 'taxexempt',
					'couponexempt', 'BlemProduct', 'Blength', 'Bheight', 'Bwidth', 'Bweight'].includes(field)) {
					productData[field] = value ? parseInt(value) : 0
				} else {
					productData[field] = value
				}
			}
		})

		// Handle main image upload
		const mainImageFile = formData.get('mainImage')
		if (mainImageFile && mainImageFile instanceof File && mainImageFile.size > 0) {
			const bytes = await mainImageFile.arrayBuffer()
			const buffer = Buffer.from(bytes)
			const filename = `product_${Date.now()}_${mainImageFile.name}`
			const uploadDir = join(process.cwd(), 'public', 'images', 'products')
			
			try {
				await mkdir(uploadDir, { recursive: true })
				const filepath = join(uploadDir, filename)
				await writeFile(filepath, buffer)
				productData.ImageLarge = `images/products/${filename}`
				productData.ImageSmall = `images/products/${filename}`
			} catch (error) {
				console.error('Error saving image:', error)
			}
		}

		// Handle additional images
		const additionalImages = formData.getAll('additionalImages')
		if (additionalImages && additionalImages.length > 0) {
			const imagePaths = []
			for (const imgFile of additionalImages) {
				if (imgFile instanceof File && imgFile.size > 0) {
					const bytes = await imgFile.arrayBuffer()
					const buffer = Buffer.from(bytes)
					const filename = `product_${Date.now()}_${Math.random().toString(36).substring(7)}_${imgFile.name}`
					const uploadDir = join(process.cwd(), 'public', 'images', 'products')
					
					try {
						await mkdir(uploadDir, { recursive: true })
						const filepath = join(uploadDir, filename)
						await writeFile(filepath, buffer)
						imagePaths.push(`images/products/${filename}`)
					} catch (error) {
						console.error('Error saving additional image:', error)
					}
				}
			}
			if (imagePaths.length > 0) {
				const existingImages = productData.Images || ''
				productData.Images = existingImages 
					? `${existingImages},${imagePaths.join(',')}`
					: imagePaths.join(',')
			}
		}

		const success = await updateProductAdmin(id, productData)
		if (!success) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error updating product:', error)
		return NextResponse.json(
			{ error: 'Failed to update product', details: error.message },
			{ status: 500 }
		)
	}
}

export async function DELETE(request, context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await context.params
		const success = await deleteProductAdmin(id)

		if (!success) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting product:', error)
		return NextResponse.json(
			{ error: 'Failed to delete product' },
			{ status: 500 }
		)
	}
}
