import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const query = `
			SELECT
				BodyID as id,
				Name as name,
				StartYear as startYear,
				EndYear as endYear,
				slug
			FROM bodies
			ORDER BY Name, StartYear
		`

		const [platforms] = await pool.query(query)
		return NextResponse.json({ platforms })
	} catch (error) {
		console.error('Error fetching platforms:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch platforms' },
			{ status: 500 }
		)
	}
}
