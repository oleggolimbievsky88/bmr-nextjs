import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getAllMainCategoriesAdmin,
	createMainCategoryAdmin,
} from '@/lib/queries'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const mainCategories = await getAllMainCategoriesAdmin()
		return NextResponse.json({ mainCategories })
	} catch (error) {
		console.error('Error fetching main categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch main categories' },
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
		const mainCategoryData = {
			BodyID: formData.get('BodyID') || '0',
			MainCatImage: formData.get('MainCatImage') || '0',
			MainCatName: formData.get('MainCatName') || ''
		}

		// Handle image upload
		const imageFile = formData.get('image')
		if (imageFile && imageFile instanceof File && imageFile.size > 0) {
			const bytes = await imageFile.arrayBuffer()
			const buffer = Buffer.from(bytes)
			const filename = `maincategory_${Date.now()}_${imageFile.name}`
			const uploadDir = join(process.cwd(), 'public', 'images', 'categories')
			
			try {
				await mkdir(uploadDir, { recursive: true })
				const filepath = join(uploadDir, filename)
				await writeFile(filepath, buffer)
				mainCategoryData.MainCatImage = `images/categories/${filename}`
			} catch (error) {
				console.error('Error saving image:', error)
			}
		}

		const mainCatId = await createMainCategoryAdmin(mainCategoryData)
		return NextResponse.json({ success: true, mainCatId })
	} catch (error) {
		console.error('Error creating main category:', error)
		return NextResponse.json(
			{ error: 'Failed to create main category', details: error.message },
			{ status: 500 }
		)
	}
}
