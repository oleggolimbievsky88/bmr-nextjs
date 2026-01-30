// app/api/auth/my-orders/route.js
// Get orders for authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || !session.user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const customerId = parseInt(session.user.id)

		// Get orders for this customer
		const [orders] = await pool.query(
			`SELECT 
				o.new_order_id,
				o.order_number,
				o.order_date,
				o.status,
				o.total,
				o.shipping_cost,
				o.tax,
				o.discount,
				o.tracking_number,
				o.payment_method,
				o.payment_status,
				COUNT(oi.new_order_item_id) as item_count
			FROM new_orders o
			LEFT JOIN new_order_items oi ON o.new_order_id = oi.new_order_id
			WHERE o.customer_id = ?
			GROUP BY o.new_order_id
			ORDER BY o.order_date DESC
			LIMIT 50`,
			[customerId]
		)

		return NextResponse.json({
			success: true,
			orders: orders || [],
		})
	} catch (error) {
		console.error('Error fetching user orders:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch orders' },
			{ status: 500 }
		)
	}
}
