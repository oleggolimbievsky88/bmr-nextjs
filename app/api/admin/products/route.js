import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getAllProductsAdmin,
	createProductAdmin,
} from '@/lib/queries'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '100')
		const offset = parseInt(searchParams.get('offset') || '0')
		const search = searchParams.get('search') || null

		const products = await getAllProductsAdmin(limit, offset, search)
		return NextResponse.json({ products })
	} catch (error) {
		console.error('Error fetching products:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		)
	}
}

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

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

		// Handle image uploads
		const mainImageFile = formData.get('mainImage')
		if (mainImageFile && mainImageFile instanceof File) {
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
				if (imgFile instanceof File) {
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
				productData.Images = imagePaths.join(',')
			}
		}

		const productId = await createProductAdmin(productData)
		return NextResponse.json({ success: true, productId })
	} catch (error) {
		console.error('Error creating product:', error)
		return NextResponse.json(
			{ error: 'Failed to create product', details: error.message },
			{ status: 500 }
		)
	}
}
