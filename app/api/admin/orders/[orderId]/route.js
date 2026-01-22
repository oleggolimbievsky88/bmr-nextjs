// app/api/admin/orders/[orderId]/route.js
// Admin API for updating order status

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateOrderStatus, getOrderWithItemsAdmin } from '@/lib/queries'

export async function GET(request, { params }) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const orderId = params.orderId
		const order = await getOrderWithItemsAdmin(orderId)

		if (!order) {
			return NextResponse.json(
				{ error: 'Order not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ success: true, order })
	} catch (error) {
		console.error('Error fetching order:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch order' },
			{ status: 500 }
		)
	}
}

export async function PATCH(request, { params }) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const orderId = params.orderId
		const body = await request.json()
		const { status, tracking_number } = body

		if (!status) {
			return NextResponse.json(
				{ error: 'Status is required' },
				{ status: 400 }
			)
		}

		// Valid statuses
		const validStatuses = ['pending', 'processed', 'shipped', 'delivered', 'cancelled']
		if (!validStatuses.includes(status)) {
			return NextResponse.json(
				{ error: 'Invalid status' },
				{ status: 400 }
			)
		}

		const updated = await updateOrderStatus(orderId, status, tracking_number || null)

		if (!updated) {
			return NextResponse.json(
				{ error: 'Order not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			message: 'Order status updated successfully',
		})
	} catch (error) {
		console.error('Error updating order status:', error)
		return NextResponse.json(
			{ error: 'Failed to update order status' },
			{ status: 500 }
		)
	}
}
