import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllManufacturersAdmin } from '@/lib/queries'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const manufacturers = await getAllManufacturersAdmin()
		return NextResponse.json({ manufacturers })
	} catch (error) {
		console.error('Error fetching manufacturers:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch manufacturers' },
			{ status: 500 }
		)
	}
}
