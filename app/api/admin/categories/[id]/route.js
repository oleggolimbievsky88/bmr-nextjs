import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getCategoryByIdAdmin,
	updateCategoryAdmin,
	deleteCategoryAdmin,
} from '@/lib/queries'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request, context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await context.params
		const category = await getCategoryByIdAdmin(id)

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		return NextResponse.json({ category })
	} catch (error) {
		console.error('Error fetching category:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category' },
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

		const success = await updateCategoryAdmin(id, categoryData)
		if (!success) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error updating category:', error)
		return NextResponse.json(
			{ error: 'Failed to update category', details: error.message },
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
		const success = await deleteCategoryAdmin(id)

		if (!success) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete category' },
			{ status: 500 }
		)
	}
}
