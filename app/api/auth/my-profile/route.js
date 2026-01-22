// app/api/auth/my-profile/route.js
// Get current user profile

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

		// Get user data (excluding password)
		const [rows] = await pool.query(
			`SELECT 
				CustomerID,
				firstname,
				lastname,
				email,
				emailVerified,
				phonenumber,
				address1,
				address2,
				city,
				state,
				zip,
				country,
				shippingfirstname,
				shippinglastname,
				shippingaddress1,
				shippingaddress2,
				shippingcity,
				shippingstate,
				shippingzip,
				shippingcountry,
				role,
				dealerTier,
				dealerDiscount,
				createdAt
			FROM customers 
			WHERE CustomerID = ?`,
			[customerId]
		)

		if (rows.length === 0) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			user: rows[0],
		})
	} catch (error) {
		console.error('Error fetching user profile:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch profile' },
			{ status: 500 }
		)
	}
}
