import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const partNumber = searchParams.get('partNumber')

		if (!partNumber) {
			return NextResponse.json(
				{ error: 'Part number is required' },
				{ status: 400 }
			)
		}

		const query = `
			SELECT DISTINCT
				p.ProductID,
				p.PartNumber,
				p.ProductName,
				p.Instructions,
				p.ImageSmall,
				p.BodyID,
				p.CatID,
				GROUP_CONCAT(DISTINCT c.CatName ORDER BY c.CatName SEPARATOR ', ') as CategoryNames,
				GROUP_CONCAT(DISTINCT CONCAT(m.MainCatName, ' - ', c.CatName) ORDER BY m.MainCatName, c.CatName SEPARATOR ', ') as FullCategoryNames,
				b.Name as PlatformName,
				b.StartYear as PlatformStartYear,
				b.EndYear as PlatformEndYear
			FROM products p
			LEFT JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID) > 0
			LEFT JOIN maincategories m ON c.MainCatID = m.MainCatID
			LEFT JOIN bodies b ON p.BodyID = b.BodyID
			WHERE p.PartNumber LIKE ?
				AND p.Display = 1
				AND p.Instructions IS NOT NULL
				AND p.Instructions != ''
				AND p.Instructions != '0'
			GROUP BY p.ProductID
			ORDER BY p.PartNumber
		`

		const [rows] = await pool.query(query, [`%${partNumber}%`])

		// Format platform name with years
		const products = rows.map(product => ({
			...product,
			PlatformName: product.PlatformName
				? `${product.PlatformStartYear && product.PlatformStartYear !== '0' && product.PlatformEndYear && product.PlatformEndYear !== '0'
					? `${product.PlatformStartYear}-${product.PlatformEndYear} `
					: ''}${product.PlatformName}`
				: null,
		}))

		return NextResponse.json({ products, searchType: 'partNumber', searchTerm: partNumber })
	} catch (error) {
		console.error('Error searching for product:', error)
		return NextResponse.json(
			{ error: 'Failed to search for product' },
			{ status: 500 }
		)
	}
}
