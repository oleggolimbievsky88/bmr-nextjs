import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getAllCategoriesAdmin,
	createCategoryAdmin,
} from '@/lib/queries'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const categories = await getAllCategoriesAdmin()
		return NextResponse.json({ categories })
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
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
		const categoryData = {
			CatName: formData.get('CatName') || '',
			CatImage: formData.get('CatImage') || '0',
			MainCatID: formData.get('MainCatID') || '0',
			ParentID: parseInt(formData.get('ParentID') || '0')
		}

		// Handle image upload
		const imageFile = formData.get('image')
		if (imageFile && imageFile instanceof File && imageFile.size > 0) {
			const bytes = await imageFile.arrayBuffer()
			const buffer = Buffer.from(bytes)
			const filename = `category_${Date.now()}_${imageFile.name}`
			const uploadDir = join(process.cwd(), 'public', 'images', 'categories')
			
			try {
				await mkdir(uploadDir, { recursive: true })
				const filepath = join(uploadDir, filename)
				await writeFile(filepath, buffer)
				categoryData.CatImage = `images/categories/${filename}`
			} catch (error) {
				console.error('Error saving image:', error)
			}
		}

		const catId = await createCategoryAdmin(categoryData)
		return NextResponse.json({ success: true, catId })
	} catch (error) {
		console.error('Error creating category:', error)
		return NextResponse.json(
			{ error: 'Failed to create category', details: error.message },
			{ status: 500 }
		)
	}
}
