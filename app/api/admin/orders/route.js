// app/api/admin/orders/route.js
// Admin API for managing orders

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllOrdersAdmin, getOrderWithItemsAdmin } from '@/lib/queries'

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
		const status = searchParams.get('status') || null
		const orderId = searchParams.get('orderId')

		if (orderId) {
			// Get single order with items
			const order = await getOrderWithItemsAdmin(orderId)
			if (!order) {
				return NextResponse.json(
					{ error: 'Order not found' },
					{ status: 404 }
				)
			}
			return NextResponse.json({ success: true, order })
		}

		// Get all orders
		const orders = await getAllOrdersAdmin(limit, offset, status)

		return NextResponse.json({
			success: true,
			orders,
		})
	} catch (error) {
		console.error('Error fetching orders:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch orders' },
			{ status: 500 }
		)
	}
}
