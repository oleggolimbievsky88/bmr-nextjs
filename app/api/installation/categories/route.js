import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const platform = searchParams.get('platform')

		if (!platform) {
			return NextResponse.json(
				{ error: 'Platform is required' },
				{ status: 400 }
			)
		}

		// Get all categories that have products with installation instructions for this platform
		const query = `
			SELECT DISTINCT
				c.CatID as id,
				c.CatName as name,
				c.MainCatID as mainCategoryId
			FROM categories c
			INNER JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) > 0
			WHERE p.BodyID = ?
				AND p.Display = 1
				AND p.Instructions IS NOT NULL
				AND p.Instructions != ''
				AND p.Instructions != '0'
			ORDER BY c.CatName
		`

		const [rows] = await pool.query(query, [platform])
		return NextResponse.json({ categories: rows })
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}
