// app/api/auth/reset-password/route.js
// Password reset endpoint

import { NextResponse } from 'next/server'
import {
	getVerificationToken,
	deleteVerificationToken,
	hashPassword,
} from '@/lib/auth'
import pool from '@/lib/db'

export async function POST(request) {
	try {
		const body = await request.json()
		const { token, password } = body

		if (!token || !password) {
			return NextResponse.json(
				{ error: 'Token and password are required' },
				{ status: 400 }
			)
		}

		if (password.length < 8) {
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			)
		}

		// Get verification token
		const verificationToken = await getVerificationToken(token)

		if (!verificationToken || verificationToken.type !== 'password_reset') {
			return NextResponse.json(
				{ error: 'Invalid or expired reset token' },
				{ status: 400 }
			)
		}

		// Hash new password
		const hashedPassword = await hashPassword(password)

		// Update password
		await pool.query(
			'UPDATE customers SET password = ? WHERE CustomerID = ?',
			[hashedPassword, verificationToken.customerId]
		)

		// Delete used token
		await deleteVerificationToken(token)

		return NextResponse.json({ message: 'Password reset successfully' })
	} catch (error) {
		console.error('Password reset error:', error)
		return NextResponse.json(
			{ error: 'An error occurred during password reset' },
			{ status: 500 }
		)
	}
}
