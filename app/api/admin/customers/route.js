// app/api/admin/customers/route.js
// Admin API for managing customers

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllCustomersAdmin } from '@/lib/queries'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '100')
		const offset = parseInt(searchParams.get('offset') || '0')
		const search = searchParams.get('search') || null

		const customers = await getAllCustomersAdmin(limit, offset, search)

		return NextResponse.json({
			success: true,
			customers,
		})
	} catch (error) {
		console.error('Error fetching customers:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch customers' },
			{ status: 500 }
		)
	}
}
