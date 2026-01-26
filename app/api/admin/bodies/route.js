import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllBodiesAdmin } from '@/lib/queries'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const bodies = await getAllBodiesAdmin()
		return NextResponse.json({ bodies })
	} catch (error) {
		console.error('Error fetching bodies:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch bodies' },
			{ status: 500 }
		)
	}
}
